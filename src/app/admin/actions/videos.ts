"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { run } from "@/lib/admin/run";
import { createSignedUpload, removeObject, verifyUploaded } from "@/lib/admin/uploads";
import { requireRole } from "@/lib/auth";
import { TAGS } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { clean } from "@/lib/validation";
import { parseEmbedUrl } from "@/lib/video";

/**
 * The website has exactly ONE video — the home-page hero. Publishing a new one replaces the old one
 * (and deletes its file), so there is never a library to manage.
 */

const text = (max: number) =>
  z
    .string()
    .max(max)
    .transform(clean)
    .transform((v) => v || null)
    .nullable()
    .optional();

const textSchema = z.object({ headline: text(90), subline: text(220) });

function publish() {
  revalidateTag(TAGS.videos);
  revalidatePath("/");
}

async function log(actor: string, action: string, id?: string) {
  await createAdminClient().from("audit_log").insert({ actor, action, entity: "videos", entity_id: id ?? null });
}

/** Step 1 of an upload: a short-lived signed URL so the file goes browser → storage, never through the server. */
export async function requestVideoUpload(type: string, size: number) {
  return run(async () => {
    await requireRole("videos");
    return createSignedUpload("video", type, size);
  });
}

/** Remove every video row except `keepId`, plus their files. */
async function clearOthers(keepId?: string) {
  const sb = createAdminClient();
  const { data } = await sb.from("videos").select("id, storage_path");
  for (const v of (data ?? []) as { id: string; storage_path: string | null }[]) {
    if (v.id === keepId) continue;
    await sb.from("videos").delete().eq("id", v.id);
    await removeObject(v.storage_path);
  }
}

async function vimeoThumb(id: string) {
  try {
    const r = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}&width=1280`, { cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (!r.ok) return null;
    return ((await r.json()) as { thumbnail_url?: string }).thumbnail_url ?? null;
  } catch {
    return null;
  }
}

type Publish =
  | { kind: "upload"; path: string; posterUrl?: string | null; title?: string; headline?: string | null; subline?: string | null }
  | { kind: "link"; url: string; headline?: string | null; subline?: string | null };

/** Make a video the home-page hero (replacing whatever was there). */
export async function publishHeroVideo(input: Publish) {
  return run(async () => {
    const s = await requireRole("videos");
    const t = textSchema.parse({ headline: input.headline, subline: input.subline });
    const base = { headline: t.headline ?? null, subline: t.subline ?? null, placement: "hero" as const, is_active: true, is_published: true, in_playlist: false, created_by: s.userId };

    let row: Record<string, unknown>;
    if (input.kind === "upload") {
      const src = await verifyUploaded("video", input.path); // validates the real bytes & size, deletes on failure
      const poster = input.posterUrl && input.posterUrl.startsWith("https://") ? input.posterUrl : null;
      const title = clean(input.title ?? "") || "Home video";
      row = { ...base, title, source: "upload", src, storage_path: input.path, poster_url: poster };
    } else {
      const parsed = parseEmbedUrl(input.url);
      if (!parsed) throw new Error("Paste a valid YouTube or Vimeo link.");
      row =
        parsed.source === "youtube"
          ? { ...base, title: "Home video (YouTube)", source: "youtube", src: parsed.id, poster_url: `https://i.ytimg.com/vi/${parsed.id}/maxresdefault.jpg` }
          : { ...base, title: "Home video (Vimeo)", source: "vimeo", src: parsed.id, poster_url: await vimeoThumb(parsed.id) };
    }

    const { data, error } = await createAdminClient().from("videos").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    await clearOthers(data.id as string);
    await log(s.userId, "publish", data.id as string);
    publish();
  });
}

/** Edit only the text shown over the video. */
export async function updateHeroText(input: { headline: string | null; subline: string | null }) {
  return run(async () => {
    const s = await requireRole("videos");
    const t = textSchema.parse(input);
    const sb = createAdminClient();
    const { data } = await sb.from("videos").select("id").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!data) throw new Error("Upload a video first — the built-in film's text can't be changed.");
    const { error } = await sb.from("videos").update({ headline: t.headline ?? null, subline: t.subline ?? null }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await log(s.userId, "text", data.id as string);
    publish();
  });
}

/** Remove the custom video: the built-in Dangal film plays again. */
export async function resetHeroVideo() {
  return run(async () => {
    const s = await requireRole("videos");
    await clearOthers();
    await log(s.userId, "reset");
    publish();
  });
}
