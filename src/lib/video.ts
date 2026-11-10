import type { PlayerVideo, VideoRow, VideoSlot } from "@/lib/types";

const toPlayer = (v: VideoRow): PlayerVideo => ({
  id: v.id,
  title: v.title,
  source: v.source,
  src: v.src,
  poster_url: v.poster_url,
  headline: v.headline,
  subline: v.subline,
});

/** The site has ONE video: the home-page hero. It's the newest published video marked live (or none → the built-in film). */
export function pickHeroVideo(rows: VideoRow[]): VideoSlot {
  const live = rows
    .filter((v) => v.is_published && v.is_active)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  return { videos: live ? [toPlayer(live)] : [], rotateSeconds: 20 };
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
