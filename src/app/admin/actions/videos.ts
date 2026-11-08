"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { run } from "@/lib/admin/run";
import { createSignedUpload, removeObject, verifyUploaded } from "@/lib/admin/uploads";
import { requireRole } from "@/lib/auth";
import { TAGS } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Placement, VideoRow } from "@/lib/types";
import { clean } from "@/lib/validation";
import { parseEmbedUrl } from "@/lib/video";

const placement = z.enum(["hero", "section", "both"]);
const uuid = z.string().uuid();
const tags = z.array(z.string().max(30).transform(clean)).max(12).default([]);
const meta = z.object({
  title: z.string().max(100).transform(clean).pipe(z.string().min(1, "Title is required")),
  tags,
  placement: placement.default("hero"),
});

/** Push changes live: bust the cached video state so the next request re-resolves. */
function publish() {
  revalidateTag(TAGS.videos);
  revalidatePath("/");
}

async function log(actor: string, action: string, id?: string) {
  await createAdminClient().from("audit_log").insert({ actor, action, entity: "videos", entity_id: id ?? null });
}

/* ───────── Upload flow ───────── */

export async function requestVideoUpload(type: string, size: number) {
  return run(async () => {
    await requireRole("videos");
    return createSignedUpload("video", type, size);
  });
}

export async function registerUploadedVideo(input: { path: string; posterUrl?: string | null; title: string; tags: string[]; placement: Placement }) {
  return run(async () => {
    const s = await requireRole("videos");
    const m = meta.parse(input);
    const src = await verifyUploaded("video", input.path); // validates real bytes & size, deletes on failure
    const poster = input.posterUrl && input.posterUrl.startsWith("https://") ? input.posterUrl : null;
    const { data, error } = await createAdminClient()
      .from("videos")
      .insert({ ...m, source: "upload", src, storage_path: input.path, poster_url: poster, created_by: s.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await log(s.userId, "upload", data.id);
    return { id: data.id as string };
  });
}

/* ───────── Embeds (YouTube / Vimeo / Mux) ───────── */

async function vimeoThumb(id: string) {
  try {
    const r = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}&width=1280`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { thumbnail_url?: string };
    return j.thumbnail_url ?? null;
  } catch {
    return null;
  }
}

export async function addEmbedVideo(input: { url: string; kind: "link" | "mux"; title: string; tags: string[]; placement: Placement }) {
  return run(async () => {
    const s = await requireRole("videos");
    const m = meta.parse(input);
    let row: Pick<VideoRow, "source" | "src" | "poster_url">;
    if (input.kind === "mux") {
      const id = input.url.trim();
      if (!/^[A-Za-z0-9]{10,80}$/.test(id)) throw new Error("Enter a valid Mux playback ID.");
      row = { source: "mux", src: id, poster_url: `https://image.mux.com/${id}/thumbnail.webp?width=1280` };
    } else {
      const parsed = parseEmbedUrl(input.url);
      if (!parsed) throw new Error("Paste a valid YouTube or Vimeo link.");
      row =
        parsed.source === "youtube"
          ? { source: "youtube", src: parsed.id, poster_url: `https://i.ytimg.com/vi/${parsed.id}/maxresdefault.jpg` }
          : { source: "vimeo", src: parsed.id, poster_url: await vimeoThumb(parsed.id) };
    }
    const { data, error } = await createAdminClient()
      .from("videos")
      .insert({ ...m, ...row, created_by: s.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await log(s.userId, "add-embed", data.id);
    return { id: data.id as string };
  });
}

/* ───────── Edit / schedule / playlist ───────── */

const patchSchema = z
  .object({
    title: z.string().max(100).transform(clean).pipe(z.string().min(1)),
    tags,
    placement,
    headline: z.string().max(90).transform(clean).nullable(),
    subline: z.string().max(220).transform(clean).nullable(),
    poster_url: z.string().url().startsWith("https://").max(600).nullable(),
    in_playlist: z.boolean(),
    playlist_order: z.coerce.number().int().min(0).max(999),
    is_published: z.boolean(),
    starts_at: z.string().datetime({ offset: true }).nullable(),
    ends_at: z.string().datetime({ offset: true }).nullable(),
    schedule_label: z.string().max(60).transform(clean).nullable(),
  })
  .partial()
  .refine((v) => !(v.starts_at && v.ends_at) || new Date(v.ends_at) > new Date(v.starts_at), "End time must be after start time");

export async function updateVideo(id: string, patch: Record<string, unknown>) {
  return run(async () => {
    const s = await requireRole("videos");
    uuid.parse(id);
    const parsed = patchSchema.safeParse(patch);
    if (!parsed.success) throw new Error(parsed.error.issues[0].message);
    const data = Object.fromEntries(Object.entries(parsed.data).map(([k, v]) => [k, v === "" ? null : v]));
    const { error } = await createAdminClient().from("videos").update(data).eq("id", id);
    if (error) throw new Error(error.message);
    await log(s.userId, "update", id);
    publish();
  });
}

export async function updateVideoSettings(input: { playlist_enabled: boolean; rotate_seconds: number }) {
  return run(async () => {
    const s = await requireRole("videos");
    const v = z.object({ playlist_enabled: z.boolean(), rotate_seconds: z.coerce.number().int().min(5).max(600) }).parse(input);
    const { error } = await createAdminClient().from("video_settings").upsert({ id: 1, ...v });
    if (error) throw new Error(error.message);
    await log(s.userId, "settings");
    publish();
  });
}

/* ───────── Activation & revert ───────── */

const slotsOf = (p: Placement): Set<"hero" | "section"> => new Set(p === "both" ? ["hero", "section"] : [p]);
const toPlacement = (s: Set<"hero" | "section">): Placement | null => (s.size === 2 ? "both" : s.size === 1 ? [...s][0] : null);

async function activate(actor: string, id: string, where: Placement) {
  const sb = createAdminClient();
  const target = slotsOf(where);
  const { data: actives } = await sb.from("videos").select("id, placement").eq("is_active", true).neq("id", id);

  // Free up the slots this video is taking over; keep other videos active in slots they still own.
  for (const v of (actives ?? []) as { id: string; placement: Placement }[]) {
    const remaining = new Set([...slotsOf(v.placement)].filter((x) => !target.has(x)));
    const next = toPlacement(remaining);
    await sb.from("videos").update(next ? { placement: next } : { is_active: false }).eq("id", v.id);
  }
  const { error } = await sb.from("videos").update({ is_active: true, is_published: true, placement: where }).eq("id", id);
  if (error) throw new Error(error.message);
  await sb.from("video_activations").insert({ video_id: id, placement: where, activated_by: actor === "demo" ? null : actor });
}

export async function setActiveVideo(id: string, where: Placement) {
  return run(async () => {
    const s = await requireRole("videos");
    uuid.parse(id);
    placement.parse(where);
    await activate(s.userId, id, where);
    await log(s.userId, `activate:${where}`, id);
    publish();
  });
}

export async function deactivateVideo(id: string) {
  return run(async () => {
    const s = await requireRole("videos");
    uuid.parse(id);
    const { error } = await createAdminClient().from("videos").update({ is_active: false }).eq("id", id);
    if (error) throw new Error(error.message);
    await log(s.userId, "deactivate", id);
    publish();
  });
}

/** One-click revert: re-activate the video that was live before the current one. */
export async function revertToPrevious() {
  return run(async () => {
    const s = await requireRole("videos");
    const sb = createAdminClient();
    const { data } = await sb.from("video_activations").select("video_id, placement").order("created_at", { ascending: false }).limit(30);
    const history = (data ?? []) as { video_id: string | null; placement: Placement }[];
    const current = history[0]?.video_id;
    const prev = history.find((h) => h.video_id && h.video_id !== current);
    if (!prev?.video_id) throw new Error("There is no previous video to revert to.");
    await activate(s.userId, prev.video_id, prev.placement);
    await log(s.userId, "revert", prev.video_id);
    publish();
    return { id: prev.video_id };
  });
}

export async function deleteVideo(id: string) {
  return run(async () => {
    const s = await requireRole("videos");
    uuid.parse(id);
    const sb = createAdminClient();
    const { data } = await sb.from("videos").select("storage_path").eq("id", id).single();
    const { error } = await sb.from("videos").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await removeObject(data?.storage_path);
    await log(s.userId, "delete", id);
    publish();
  });
}
