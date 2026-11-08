"use client";

import { clsx } from "clsx";
import { CalendarClock, Eye, Film, ListVideo, Loader2, MonitorPlay, Pencil, Radio, Smartphone, Trash2, Undo2, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  addEmbedVideo,
  deactivateVideo,
  deleteVideo,
  registerUploadedVideo,
  requestVideoUpload,
  revertToPrevious,
  setActiveVideo,
  updateVideo,
  updateVideoSettings,
} from "@/app/admin/actions/videos";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { DEFAULT_FILM } from "@/content/data";
import { IMG } from "@/lib/images";
import type { Placement, PlayerVideo, VideoRow, VideoSettings } from "@/lib/types";
import { posterFor, resolveSlot } from "@/lib/video";
import { capturePoster, putToSignedUrl, uploadImage } from "./upload-client";
import { Badge, btn, Card, field, labelText } from "./ui";

type Result = { ok: true } | { ok: false; error: string };

/* IST <-> datetime-local helpers: the owner schedules in Hyderabad time regardless of device timezone. */
const toISTInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 5.5 * 36e5);
  return d.toISOString().slice(0, 16);
};
const fromISTInput = (v: string) => (v ? new Date(`${v}:00+05:30`).toISOString() : null);
const fmtIST = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

const PLACEMENTS: { v: Placement; l: string }[] = [
  { v: "hero", l: "Home hero" },
  { v: "section", l: "Now Showing section" },
  { v: "both", l: "Both" },
];

export function VideoManager({ rows, settings, canRevert, maxMb }: { rows: VideoRow[]; settings: VideoSettings; canRevert: boolean; maxMb: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);
  const [preview, setPreview] = useState<{ title: string; videos: PlayerVideo[] } | null>(null);
  const [editing, setEditing] = useState<VideoRow | null>(null);

  const hero = useMemo(() => resolveSlot(rows, settings, "hero"), [rows, settings]);
  const section = useMemo(() => resolveSlot(rows, settings, "section"), [rows, settings]);

  const act = (fn: () => Promise<Result>, success: string) =>
    start(async () => {
      const r = await fn();
      setToast(r.ok ? { msg: success } : { msg: r.error, err: true });
      if (r.ok) router.refresh();
      setTimeout(() => setToast(null), 4500);
    });

  const playlist = rows.filter((r) => r.in_playlist).sort((a, b) => a.playlist_order - b.playlist_order);

  return (
    <div className="space-y-6">
      {/* ── Live now ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Home hero", slot: hero },
          { label: "Now Showing section", slot: section },
        ].map(({ label, slot }) => {
          const v = slot.videos[0];
          const mode = !v ? "Default — plays until you set a video" : slot.videos.length > 1 ? `Playlist · ${slot.videos.length} videos` : rows.find((r) => r.id === v.id)?.starts_at ? "Scheduled" : "Active";
          return (
            <Card key={label} className="flex gap-4">
              <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-navy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v ? posterFor(v) ?? "/videos/dangal-film-poster.jpg" : "/videos/dangal-film-poster.jpg"} alt="" className="h-full w-full object-cover opacity-90" />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-navy/80 px-2 py-0.5 text-[10px] text-cream">
                  <Radio className="h-3 w-3" aria-hidden /> LIVE
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.08em] opacity-70">{label}</p>
                <p className="mt-1 truncate font-medium">{v ? (slot.videos.length > 1 ? slot.videos.map((x) => x.title).join(" → ") : v.title) : "The Dangal film (built-in)"}</p>
                <p className="mt-1 text-xs opacity-70">{mode}</p>
                <button className={clsx(btn.ghost, "-ml-3 mt-2")} onClick={() => setPreview({ title: label, videos: slot.videos.length ? slot.videos : [DEFAULT_FILM] })}>
                  <Eye className="h-4 w-4" aria-hidden /> Preview live
                </button>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className={btn.secondary} disabled={!canRevert || pending} onClick={() => confirm("Revert to the previously live video?") && act(revertToPrevious, "Reverted to the previous video — it's live now.")}>
          <Undo2 className="h-4 w-4" aria-hidden /> Revert to previous video
        </button>
        <p className="text-xs opacity-70">Changes go live on the website instantly. Scheduled videos switch on/off within a minute of their time.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <AddVideo maxMb={maxMb} onDone={(msg, err) => { setToast({ msg, err }); if (!err) router.refresh(); setTimeout(() => setToast(null), 4500); }} />

        {/* ── Playlist settings ── */}
        <Card className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg tracking-[-0.02em]">
            <ListVideo className="h-5 w-5" strokeWidth={1.5} aria-hidden /> Playlist rotation
          </h2>
          <p className="mt-1 text-sm opacity-65">Rotate several videos instead of one. Add videos to the playlist from the library below.</p>
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              act(() => updateVideoSettings({ playlist_enabled: fd.get("enabled") === "on", rotate_seconds: Number(fd.get("seconds")) }), "Playlist settings saved.");
            }}
          >
            <label className="flex items-center justify-between gap-4 rounded-xl bg-cream-100 p-4">
              <span className="text-sm">
                <span className="block font-medium">Use playlist instead of single active video</span>
                <span className="opacity-70">{playlist.length} video(s) in playlist</span>
              </span>
              <input type="checkbox" name="enabled" defaultChecked={settings.playlist_enabled} className="h-5 w-5 accent-navy" />
            </label>
            <label className="block">
              <span className={labelText}>Seconds per YouTube/Vimeo video</span>
              <input type="number" name="seconds" min={5} max={600} defaultValue={settings.rotate_seconds} className={field} />
              <span className="mt-1 block text-xs opacity-70">Uploaded videos rotate when they finish playing.</span>
            </label>
            <button className={btn.primary} disabled={pending}>Save</button>
          </form>
        </Card>
      </div>

      {/* ── Library ── */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg tracking-[-0.02em]">
            <Film className="h-5 w-5" strokeWidth={1.5} aria-hidden /> Video library
          </h2>
          <span className="text-sm opacity-70">{rows.length} videos</span>
        </div>
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm opacity-70">No videos yet. Upload one or paste a YouTube/Vimeo link above.</p>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((v) => {
              const liveHero = hero.videos.some((x) => x.id === v.id);
              const liveSection = section.videos.some((x) => x.id === v.id);
              const poster = posterFor(v);
              return (
                <li key={v.id} className="overflow-hidden rounded-2xl border border-navy/10">
                  <button className="group relative block aspect-video w-full bg-navy" onClick={() => setPreview({ title: v.title, videos: [v] })}>
                    {poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={poster} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-cream/65">
                        <Film className="h-8 w-8" aria-hidden />
                      </span>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-navy/0 text-sm text-cream opacity-0 transition group-hover:bg-navy/50 group-hover:opacity-100">
                      <Eye className="mr-2 h-4 w-4" aria-hidden /> Preview
                    </span>
                    <span className="absolute left-2 top-2 flex flex-wrap gap-1">
                      {(liveHero || liveSection) && (
                        <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-medium text-navy">
                          LIVE · {liveHero && liveSection ? "Hero + Section" : liveHero ? "Hero" : "Section"}
                        </span>
                      )}
                    </span>
                  </button>
                  <div className="p-4">
                    <p className="truncate font-medium">{v.title}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge>{v.source === "upload" ? "Uploaded" : v.source === "youtube" ? "YouTube" : v.source === "vimeo" ? "Vimeo" : "Mux"}</Badge>
                      <Badge tone="outline">{PLACEMENTS.find((p) => p.v === v.placement)?.l}</Badge>
                      {v.is_active && <Badge tone="solid">Active</Badge>}
                      {v.in_playlist && <Badge>Playlist #{v.playlist_order}</Badge>}
                      {(v.starts_at || v.ends_at) && (
                        <Badge tone="outline">
                          <CalendarClock className="h-3 w-3" aria-hidden /> {v.schedule_label || "Scheduled"}
                        </Badge>
                      )}
                      {v.tags.map((t) => (
                        <Badge key={t}>#{t}</Badge>
                      ))}
                    </div>
                    {(v.starts_at || v.ends_at) && (
                      <p className="mt-2 text-xs opacity-70">
                        {v.starts_at ? fmtIST(v.starts_at) : "Now"} → {v.ends_at ? fmtIST(v.ends_at) : "no end"}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-navy/10 pt-3">
                      <select
                        aria-label={`Go live with ${v.title}`}
                        className="h-9 rounded-full border border-navy/15 bg-white px-3 text-sm"
                        value=""
                        disabled={pending}
                        onChange={(e) => {
                          const where = e.target.value as Placement;
                          if (where) act(() => setActiveVideo(v.id, where), `“${v.title}” is now live.`);
                        }}
                      >
                        <option value="">Go live…</option>
                        {PLACEMENTS.map((p) => (
                          <option key={p.v} value={p.v}>
                            {p.l}
                          </option>
                        ))}
                      </select>
                      <button className={btn.ghost} onClick={() => setEditing(v)}>
                        <Pencil className="h-4 w-4" aria-hidden /> Edit
                      </button>
                      {v.is_active && (
                        <button className={btn.ghost} disabled={pending} onClick={() => act(() => deactivateVideo(v.id), "Video taken off air.")}>
                          Off air
                        </button>
                      )}
                      <button
                        className={clsx(btn.danger, "ml-auto")}
                        disabled={pending}
                        onClick={() => confirm(`Delete “${v.title}” permanently?`) && act(() => deleteVideo(v.id), "Video deleted.")}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {preview && <PreviewModal {...preview} onClose={() => setPreview(null)} />}
      {editing && (
        <EditDrawer
          video={editing}
          pending={pending}
          onClose={() => setEditing(null)}
          onSave={(patch) =>
            act(async () => {
              const r = await updateVideo(editing.id, patch);
              if (r.ok) setEditing(null);
              return r;
            }, "Video updated.")
          }
        />
      )}
      {toast && (
        <div role="status" className={clsx("fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full px-5 py-3 text-sm shadow-soft", toast.err ? "bg-red-800 text-white" : "bg-navy text-cream")}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Add video ───────────────────────── */

function AddVideo({ maxMb, onDone }: { maxMb: number; onDone: (msg: string, err?: boolean) => void }) {
  const [tab, setTab] = useState<"upload" | "link" | "mux">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [stage, setStage] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const pick = (f: File | undefined | null) => {
    if (!f) return;
    if (!["video/mp4", "video/webm"].includes(f.type)) return onDone("Only MP4 or WebM files are allowed.", true);
    if (f.size > maxMb * 1024 * 1024) return onDone(`File is larger than ${maxMb} MB. Compress it (e.g. HandBrake, 1080p, ~5 Mbps) and try again.`, true);
    setFile(f);
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const meta = {
      title: String(fd.get("title") || ""),
      tags: String(fd.get("tags") || "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      placement: String(fd.get("placement") || "hero") as Placement,
    };
    setBusy(true);
    try {
      if (tab === "upload") {
        if (!file) throw new Error("Choose a video file first.");
        if (!meta.title) meta.title = file.name.replace(/\.[^.]+$/, "");
        setStage("Preparing…");
        const req = await requestVideoUpload(file.type, file.size);
        if (!req.ok) throw new Error(req.error);
        abort.current = new AbortController();
        setStage("Uploading video…");
        setProgress(0);
        await putToSignedUrl(req.data!.signedUrl, file, setProgress, abort.current.signal);
        setStage("Creating thumbnail…");
        let posterUrl: string | null = null;
        const poster = await capturePoster(file);
        if (poster) posterUrl = await uploadImage(poster).catch(() => null);
        setStage("Verifying file…");
        const reg = await registerUploadedVideo({ path: req.data!.path, posterUrl, ...meta });
        if (!reg.ok) throw new Error(reg.error);
        setFile(null);
      } else {
        const r = await addEmbedVideo({ url: String(fd.get("url") || ""), kind: tab === "mux" ? "mux" : "link", ...meta });
        if (!r.ok) throw new Error(r.error);
      }
      (e.target as HTMLFormElement).reset();
      onDone("Added to the library. Use “Go live” to put it on screen.");
    } catch (err) {
      onDone(err instanceof Error ? err.message : "Something went wrong.", true);
    } finally {
      setBusy(false);
      setProgress(null);
      setStage("");
    }
  }

  return (
    <Card className="lg:col-span-3">
      <h2 className="text-lg tracking-[-0.02em]">Add a video</h2>
      <div role="tablist" className="mt-4 inline-flex rounded-full bg-navy/[0.06] p-1">
        {(
          [
            ["upload", "Upload file"],
            ["link", "YouTube / Vimeo"],
            ["mux", "Mux"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)} className={clsx("h-9 rounded-full px-4 text-sm", tab === k ? "bg-navy text-cream" : "opacity-70")}>
            {l}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4">
        {tab === "upload" ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              pick(e.dataTransfer.files?.[0]);
            }}
            className={clsx("flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition", drag ? "border-navy bg-navy/5" : "border-navy/15 hover:border-navy/35")}
          >
            <UploadCloud className="h-8 w-8 opacity-70" strokeWidth={1.25} aria-hidden />
            <span className="mt-3 text-sm font-medium">{file ? file.name : "Drop a video here or click to choose"}</span>
            <span className="mt-1 text-xs opacity-70">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `MP4 or WebM · up to ${maxMb} MB · 1080p recommended`}</span>
            <input type="file" accept="video/mp4,video/webm" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
        ) : (
          <label className="block">
            <span className={labelText}>{tab === "mux" ? "Mux playback ID" : "YouTube or Vimeo link"}</span>
            <input name="url" required className={field} placeholder={tab === "mux" ? "e.g. a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF8RdsNyk8M" : "https://www.youtube.com/watch?v=…"} />
            {tab === "mux" && <span className="mt-1 block text-xs opacity-70">Mux gives adaptive streaming (best quality on every connection). Paste the public playback ID.</span>}
          </label>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelText}>Title</span>
            <input name="title" maxLength={100} className={field} placeholder="e.g. Diwali offer 2026" required={tab !== "upload"} />
          </label>
          <label className="block">
            <span className={labelText}>Show in</span>
            <select name="placement" className={field} defaultValue="hero">
              {PLACEMENTS.map((p) => (
                <option key={p.v} value={p.v}>
                  {p.l}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className={labelText}>Tags (comma separated)</span>
          <input name="tags" className={field} placeholder="festival, offer, batch-launch" />
        </label>

        {progress !== null && (
          <div aria-live="polite">
            <div className="flex justify-between text-xs opacity-70">
              <span>{stage}</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-navy/10" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-navy transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button className={btn.primary} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {busy ? stage || "Saving…" : "Add to library"}
          </button>
          {busy && tab === "upload" && (
            <button type="button" className={btn.secondary} onClick={() => abort.current?.abort()}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}

/* ───────────────────────── Preview ───────────────────────── */

function PreviewModal({ title, videos, onClose }: { title: string; videos: PlayerVideo[]; onClose: () => void }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const v = videos[0];
  return (
    <div role="dialog" aria-modal="true" aria-label={`Preview: ${title}`} className="fixed inset-0 z-[70] flex flex-col bg-navy-950/95 p-4 text-cream backdrop-blur sm:p-8" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="truncate text-sm">
          Preview · <span className="opacity-70">{title}</span>
        </p>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full bg-cream/10 p-1">
            {(
              [
                ["desktop", MonitorPlay],
                ["mobile", Smartphone],
              ] as const
            ).map(([d, Icon]) => (
              <button key={d} onClick={() => setDevice(d)} aria-pressed={device === d} className={clsx("inline-flex h-8 w-10 items-center justify-center rounded-full", device === d && "bg-cream text-navy")}>
                <Icon className="h-4 w-4" aria-hidden />
                <span className="sr-only">{d}</span>
              </button>
            ))}
          </div>
          <button onClick={onClose} autoFocus className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream text-navy">
            <X className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close preview</span>
          </button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <div className={clsx("relative isolate overflow-hidden rounded-[22px] bg-navy shadow-glass transition-all duration-500", device === "desktop" ? "aspect-video w-full max-w-5xl" : "aspect-[9/19] h-full max-h-[760px]")}>
          <VideoPlayer slot={{ videos, rotateSeconds: 8 }} fallbackImage={IMG.hero} fallbackAlt="" priority />
          <div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-navy-600/40" />
          <div aria-hidden className="fluted pointer-events-none absolute inset-0 z-10 opacity-50" />
          <div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(10,18,38,0.5)_0%,rgba(10,18,38,0)_30%,rgba(10,18,38,0.9)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-6 sm:p-10">
            <p className={clsx("font-light leading-[0.95] tracking-[-0.045em]", device === "desktop" ? "text-5xl sm:text-6xl" : "text-4xl")}>
              {v?.headline || (
                <>
                  Strength, earned
                  <br />
                  the <span className="serif-accent">Dangal</span> way.
                </>
              )}
            </p>
            <p className="mt-4 max-w-md text-sm text-cream/80">{v?.subline || "Text stays readable over any footage thanks to the navy grade and gradient."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Edit drawer ───────────────────────── */

function EditDrawer({ video, pending, onClose, onSave }: { video: VideoRow; pending: boolean; onClose: () => void; onSave: (patch: Record<string, unknown>) => void }) {
  const [posterUrl, setPosterUrl] = useState(video.poster_url);
  const [posterBusy, setPosterBusy] = useState(false);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Edit ${video.title}`} className="fixed inset-0 z-[70] flex justify-end bg-navy-950/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="h-full w-full max-w-lg overflow-y-auto bg-cream-50 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const s = (k: string) => String(fd.get(k) ?? "").trim();
          onSave({
            title: s("title"),
            tags: s("tags")
              .split(",")
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean),
            placement: s("placement"),
            headline: s("headline") || null,
            subline: s("subline") || null,
            poster_url: posterUrl || null,
            in_playlist: fd.get("in_playlist") === "on",
            playlist_order: Number(s("playlist_order") || 0),
            starts_at: fromISTInput(s("starts_at")),
            ends_at: fromISTInput(s("ends_at")),
            schedule_label: s("schedule_label") || null,
          });
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-light tracking-[-0.03em]">Edit video</h2>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-navy/5">
            <X className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <fieldset className="mt-6 space-y-4">
          <label className="block">
            <span className={labelText}>Title</span>
            <input name="title" defaultValue={video.title} required maxLength={100} className={field} />
          </label>
          <label className="block">
            <span className={labelText}>Tags</span>
            <input name="tags" defaultValue={video.tags.join(", ")} className={field} />
          </label>
          <label className="block">
            <span className={labelText}>Placement</span>
            <select name="placement" defaultValue={video.placement} className={field}>
              {PLACEMENTS.map((p) => (
                <option key={p.v} value={p.v}>
                  {p.l}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className={labelText}>Thumbnail / poster</span>
            <div className="flex items-center gap-3">
              {posterUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={posterUrl} alt="" className="h-16 w-28 rounded-lg object-cover" />
              )}
              <label className={clsx(btn.secondary, "cursor-pointer")}>
                {posterBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {posterUrl ? "Replace" : "Upload image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setPosterBusy(true);
                    try {
                      setPosterUrl(await uploadImage(f));
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setPosterBusy(false);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-8 space-y-4 border-t border-navy/10 pt-6">
          <legend className="text-sm font-medium">Text over the video (optional)</legend>
          <label className="block">
            <span className={labelText}>Headline · use “ / ” for a line break</span>
            <input name="headline" defaultValue={video.headline ?? ""} maxLength={90} className={field} placeholder="Diwali offer / 30% off annual plans" />
          </label>
          <label className="block">
            <span className={labelText}>Sub-line</span>
            <textarea name="subline" defaultValue={video.subline ?? ""} maxLength={220} rows={2} className={clsx(field, "h-auto py-2.5")} />
          </label>
        </fieldset>

        <fieldset className="mt-8 space-y-4 border-t border-navy/10 pt-6">
          <legend className="text-sm font-medium">Schedule (Hyderabad time)</legend>
          <p className="text-xs opacity-70">A scheduled video automatically takes over its placement during this window, then the regular video returns. Leave blank for no schedule.</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelText}>Starts</span>
              <input type="datetime-local" name="starts_at" defaultValue={toISTInput(video.starts_at)} className={field} />
            </label>
            <label className="block">
              <span className={labelText}>Ends</span>
              <input type="datetime-local" name="ends_at" defaultValue={toISTInput(video.ends_at)} className={field} />
            </label>
          </div>
          <label className="block">
            <span className={labelText}>Label</span>
            <input name="schedule_label" defaultValue={video.schedule_label ?? ""} maxLength={60} className={field} placeholder="New batch launch" />
          </label>
        </fieldset>

        <fieldset className="mt-8 space-y-4 border-t border-navy/10 pt-6">
          <legend className="text-sm font-medium">Playlist</legend>
          <label className="flex items-center justify-between rounded-xl bg-white p-4 text-sm">
            Include in rotating playlist
            <input type="checkbox" name="in_playlist" defaultChecked={video.in_playlist} className="h-5 w-5 accent-navy" />
          </label>
          <label className="block">
            <span className={labelText}>Order (lower plays first)</span>
            <input type="number" name="playlist_order" min={0} max={999} defaultValue={video.playlist_order} className={field} />
          </label>
        </fieldset>

        <div className="sticky bottom-0 -mx-6 mt-8 flex gap-2 border-t border-navy/10 bg-cream-50 px-6 py-4 sm:-mx-8 sm:px-8">
          <button className={btn.primary} disabled={pending || posterBusy}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save changes
          </button>
          <button type="button" className={btn.secondary} onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
