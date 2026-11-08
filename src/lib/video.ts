import type { Placement, PlayerVideo, VideoRow, VideoSettings, VideoSlot } from "@/lib/types";

export type Slot = "hero" | "section";

const inSlot = (p: Placement, slot: Slot) => p === "both" || p === slot;

const toPlayer = (v: VideoRow): PlayerVideo => ({
  id: v.id,
  title: v.title,
  source: v.source,
  src: v.src,
  poster_url: v.poster_url,
  headline: v.headline,
  subline: v.subline,
});

/**
 * Decide what plays in a slot at a given moment. Precedence:
 *   1. A SCHEDULED video whose window contains `now` (latest start wins) — festival offers, batch launches.
 *   2. The PLAYLIST (if enabled) — rotates through playlist videos in order.
 *   3. The ACTIVE video.
 * Videos with a schedule never appear outside their window.
 */
export function resolveSlot(rows: VideoRow[], settings: VideoSettings | null, slot: Slot, now = new Date()): VideoSlot {
  const t = now.getTime();
  const rotateSeconds = settings?.rotate_seconds ?? 20;
  const eligible = rows.filter((v) => inSlot(v.placement, slot));

  const isScheduled = (v: VideoRow) => Boolean(v.starts_at || v.ends_at);
  const inWindow = (v: VideoRow) =>
    (!v.starts_at || new Date(v.starts_at).getTime() <= t) && (!v.ends_at || new Date(v.ends_at).getTime() > t);

  const scheduled = eligible
    .filter((v) => isScheduled(v) && inWindow(v))
    .sort((a, b) => new Date(b.starts_at ?? 0).getTime() - new Date(a.starts_at ?? 0).getTime());
  if (scheduled.length) return { videos: [toPlayer(scheduled[0])], rotateSeconds };

  const unscheduled = eligible.filter((v) => !isScheduled(v));

  if (settings?.playlist_enabled) {
    const list = unscheduled.filter((v) => v.in_playlist).sort((a, b) => a.playlist_order - b.playlist_order);
    if (list.length) return { videos: list.map(toPlayer), rotateSeconds };
  }

  const active = unscheduled.find((v) => v.is_active);
  return { videos: active ? [toPlayer(active)] : [], rotateSeconds };
}

/** Parse a pasted YouTube/Vimeo URL (or bare ID) into a source + id. */
export function parseEmbedUrl(input: string): { source: "youtube" | "vimeo"; id: string } | null {
  const s = input.trim();
  const yt =
    s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/) ??
    (/^[A-Za-z0-9_-]{11}$/.test(s) ? [s, s] : null);
  if (yt) return { source: "youtube", id: yt[1] };
  const vm = s.match(/vimeo\.com\/(?:video\/|channels\/[\w-]+\/|groups\/[\w-]+\/videos\/)?(\d{6,12})/);
  if (vm) return { source: "vimeo", id: vm[1] };
  return null;
}

export function posterFor(v: Pick<VideoRow, "source" | "src" | "poster_url">): string | null {
  if (v.poster_url) return v.poster_url;
  if (v.source === "youtube") return `https://i.ytimg.com/vi/${v.src}/maxresdefault.jpg`;
  if (v.source === "mux") return `https://image.mux.com/${v.src}/thumbnail.webp?width=1600`;
  return null;
}
