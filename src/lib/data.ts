import "server-only";
import { unstable_cache } from "next/cache";
import { BANNER, DEFAULT_FILM, GALLERY, PLANS, TESTIMONIALS, TRAINERS } from "@/content/data";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { Banner, GalleryItem, Plan, Testimonial, Trainer, VideoRow, VideoSlot } from "@/lib/types";
import { pickHeroVideo } from "@/lib/video";

/**
 * Public read layer. Every query is cached and tagged; admin mutations call revalidateTag(tag)
 * so changes go live on the next request — no redeploy. Falls back to built-in content in demo mode
 * or if the database is unreachable (the site never goes blank).
 */
export const TAGS = {
  plans: "plans",
  trainers: "trainers",
  testimonials: "testimonials",
  gallery: "gallery",
  banner: "banner",
  videos: "videos",
} as const;

/**
 * Read pattern used for every public query:
 *  1. the DB read THROWS on any error (so a failure is never cached),
 *  2. successful results are cached + tag-revalidated,
 *  3. on failure the caller gets built-in content immediately — the site never errors or goes blank.
 */
function resilient<T>(key: string, tag: string, read: () => Promise<T>, fallback: T, revalidate = 3600): () => Promise<T> {
  if (!isSupabaseConfigured) return async () => fallback;
  const cachedRead = unstable_cache(read, [key], { tags: [tag], revalidate });
  // After a failure, skip the database for 30s so an outage (or a not-yet-created schema) costs nothing per request.
  let retryAfter = 0;
  return async () => {
    if (Date.now() < retryAfter) return fallback;
    try {
      return await cachedRead();
    } catch (e) {
      retryAfter = Date.now() + 30_000;
      console.warn(`[data] ${key}: database unavailable, using built-in content for 30s (${e instanceof Error ? e.message : e})`);
      return fallback;
    }
  };
}

async function selectActive<T>(table: string): Promise<T[]> {
  const { data, error } = await createPublicClient().from(table).select("*").eq("is_active", true).order("sort_order", { ascending: true });
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data as T[]) ?? [];
}

export const getPlans = resilient<Plan[]>("plans", TAGS.plans, () => selectActive<Plan>("plans"), PLANS);
export const getTrainers = resilient<Trainer[]>("trainers", TAGS.trainers, () => selectActive<Trainer>("trainers"), TRAINERS);
export const getTestimonials = resilient<Testimonial[]>("testimonials", TAGS.testimonials, () => selectActive<Testimonial>("testimonials"), TESTIMONIALS);
export const getGallery = resilient<GalleryItem[]>("gallery", TAGS.gallery, () => selectActive<GalleryItem>("gallery"), GALLERY);

export const getBanner = resilient<Banner | null>(
  "banner",
  TAGS.banner,
  async () => {
    const { data, error } = await createPublicClient().from("banners").select("*").eq("is_active", true).limit(5);
    if (error) throw new Error(`banners: ${error.message}`);
    const now = Date.now();
    return (
      (data as Banner[] | null)?.find(
        (b) => (!b.starts_at || new Date(b.starts_at).getTime() <= now) && (!b.ends_at || new Date(b.ends_at).getTime() > now),
      ) ?? null
    );
  },
  BANNER,
  300,
);

/** The live hero video row (if the owner set one), cached; admin changes revalidate the tag instantly. */
const getVideoRows = resilient<VideoRow[]>(
  "hero-video",
  TAGS.videos,
  async () => {
    const { data, error } = await createPublicClient()
      .from("videos")
      .select("*")
      .eq("is_published", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(`videos: ${error.message}`);
    return (data as VideoRow[]) ?? [];
  },
  [],
  300,
);

/** The home-page hero video. Falls back to the gym's own film when nothing is set in the admin panel. */
export async function getHeroVideo(): Promise<VideoSlot & { isDefault: boolean }> {
  const resolved = pickHeroVideo(await getVideoRows());
  if (resolved.videos.length) return { ...resolved, isDefault: false };
  const { id, title, source, src, poster_url, headline, subline } = DEFAULT_FILM;
  return { videos: [{ id, title, source, src, poster_url, headline, subline }], rotateSeconds: resolved.rotateSeconds, isDefault: true };
}

/** Optional Instagram feed (Graph API long-lived token). Returns [] → UI shows styled fallback. Cached by fetch for 1h. */
export async function getInstagram(): Promise<{ id: string; url: string; permalink: string; caption: string }[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];
  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&limit=8&access_token=${token}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data: { id: string; caption?: string; media_type: string; media_url: string; thumbnail_url?: string; permalink: string }[];
    };
    return json.data.map((m) => ({
      id: m.id,
      url: m.media_type === "VIDEO" ? (m.thumbnail_url ?? m.media_url) : m.media_url,
      permalink: m.permalink,
      caption: m.caption?.slice(0, 120) ?? "",
    }));
  } catch {
    return [];
  }
}
