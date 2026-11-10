"use client";

import { clsx } from "clsx";
import { ExternalLink, Loader2, RotateCcw, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { publishHeroVideo, requestVideoUpload, resetHeroVideo, updateHeroText } from "@/app/admin/actions/videos";
import { posterFor } from "@/lib/video";
import type { VideoRow } from "@/lib/types";
import { capturePoster, putToSignedUrl, uploadImage } from "./upload-client";
import { btn, Card, field, labelText } from "./ui";

type Result = { ok: true } | { ok: false; error: string };

/**
 * The website's single video lives in the home-page hero. This screen does three things:
 * show what's playing, replace it, and edit the words on top of it.
 */
export function VideoManager({ current, maxMb }: { current: VideoRow | null; maxMb: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);

  const say = (msg: string, err?: boolean) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 4500);
  };
  const act = (fn: () => Promise<Result>, ok: string) =>
    start(async () => {
      const r = await fn();
      if (r.ok) {
        say(ok);
        router.refresh();
      } else say(r.error, true);
    });

  const poster = current ? posterFor(current) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── What's playing ── */}
      <Card className="overflow-hidden !p-0">
        <div className="relative aspect-video bg-navy">
          {current?.source === "upload" ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video key={current.id} src={current.src} poster={poster ?? undefined} controls muted playsInline preload="metadata" className="h-full w-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster ?? "/videos/dangal-film-poster.jpg"} alt="" className="h-full w-full object-cover" />
          )}
          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-navy/85 px-3 py-1 text-xs font-medium text-cream">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" aria-hidden /> Live on the home page
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6">
          <div className="min-w-0">
            <p className="truncate font-medium">{current ? current.title : "The Dangal film (built-in)"}</p>
            <p className="text-sm opacity-65">{current ? (current.source === "upload" ? "Uploaded video" : current.source === "youtube" ? "YouTube link" : "Vimeo link") : "Plays until you upload your own video."}</p>
          </div>
          <div className="flex gap-1">
            <a href="/" target="_blank" rel="noopener" className={btn.ghost}>
              <ExternalLink className="h-4 w-4" aria-hidden /> View site
            </a>
            {current && (
              <button
                className={btn.ghost}
                disabled={pending}
                onClick={() => confirm("Remove your video and go back to the built-in Dangal film?") && act(resetHeroVideo, "Done — the built-in film is playing again.")}
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> Use built-in film
              </button>
            )}
          </div>
        </div>
      </Card>

      <Replace current={current} maxMb={maxMb} onDone={say} />

      {current && (
        <Card>
          <h2 className="text-lg tracking-[-0.02em]">Words on the video</h2>
          <p className="mt-1 text-sm opacity-65">Optional. Leave blank to keep the standard headline.</p>
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              act(() => updateHeroText({ headline: String(fd.get("headline") ?? ""), subline: String(fd.get("subline") ?? "") }), "Saved — the website is updated.");
            }}
          >
            <label className="block">
              <span className={labelText}>Headline</span>
              <input name="headline" defaultValue={current.headline ?? ""} maxLength={90} className={field} placeholder="Diwali offer / 30% off annual plans" />
              <span className="mt-1 block text-xs opacity-70">Use “ / ” to start a new line.</span>
            </label>
            <label className="block">
              <span className={labelText}>Sub-line</span>
              <textarea name="subline" defaultValue={current.subline ?? ""} maxLength={220} rows={2} className={clsx(field, "h-auto py-2.5")} />
            </label>
            <button className={btn.primary} disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save words
            </button>
          </form>
        </Card>
      )}

      {toast && (
        <div role="status" className={clsx("fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full px-5 py-3 text-sm shadow-soft", toast.err ? "bg-red-800 text-white" : "bg-navy text-cream")}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Replace the video ───────────────────────── */

function Replace({ current, maxMb, onDone }: { current: VideoRow | null; maxMb: number; onDone: (msg: string, err?: boolean) => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<"upload" | "link">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [stage, setStage] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const pick = (f: File | undefined | null) => {
    if (!f) return;
    if (!["video/mp4", "video/webm"].includes(f.type)) return onDone("Only MP4 or WebM files are allowed.", true);
    if (f.size > maxMb * 1024 * 1024) return onDone(`That file is over ${maxMb} MB. Compress it (e.g. HandBrake, 1080p) and try again.`, true);
    setFile(f);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = { headline: current?.headline ?? null, subline: current?.subline ?? null };
    setBusy(true);
    try {
      if (tab === "upload") {
        if (!file) throw new Error("Choose a video file first.");
        setStage("Preparing…");
        const req = await requestVideoUpload(file.type, file.size);
        if (!req.ok) throw new Error(req.error);
        abort.current = new AbortController();
        setStage("Uploading…");
        setProgress(0);
        await putToSignedUrl(req.data!.signedUrl, file, setProgress, abort.current.signal);
        setStage("Creating thumbnail…");
        const thumb = await capturePoster(file);
        const posterUrl = thumb ? await uploadImage(thumb).catch(() => null) : null;
        setStage("Publishing…");
        const r = await publishHeroVideo({ kind: "upload", path: req.data!.path, posterUrl, title: file.name.replace(/\.[^.]+$/, ""), ...text });
        if (!r.ok) throw new Error(r.error);
        setFile(null);
      } else {
        setStage("Publishing…");
        const r = await publishHeroVideo({ kind: "link", url: link, ...text });
        if (!r.ok) throw new Error(r.error);
        setLink("");
      }
      onDone("Published — your video is now on the home page.");
      router.refresh();
    } catch (err) {
      onDone(err instanceof Error ? err.message : "Something went wrong.", true);
    } finally {
      setBusy(false);
      setProgress(null);
      setStage("");
    }
  }

  return (
    <Card>
      <h2 className="text-lg tracking-[-0.02em]">{current ? "Replace the video" : "Upload your video"}</h2>
      <p className="mt-1 text-sm opacity-65">It goes live on the home page straight away{current ? " and replaces the current one" : ""}.</p>

      <div role="tablist" className="mt-4 inline-flex rounded-full bg-navy/[0.06] p-1">
        {(
          [
            ["upload", "Upload a file"],
            ["link", "YouTube / Vimeo link"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)} className={clsx("h-9 rounded-full px-4 text-sm transition-colors", tab === k ? "bg-navy text-cream" : "opacity-70")}>
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
            <span className="mt-3 text-sm font-medium">{file ? file.name : "Drop a video here, or click to choose"}</span>
            <span className="mt-1 text-xs opacity-70">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `MP4 or WebM · up to ${maxMb} MB · 1080p works best`}</span>
            <input type="file" accept="video/mp4,video/webm" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
        ) : (
          <label className="block">
            <span className={labelText}>YouTube or Vimeo link</span>
            <input value={link} onChange={(e) => setLink(e.target.value)} required className={field} placeholder="https://www.youtube.com/watch?v=…" />
          </label>
        )}

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
          <button className={btn.primary} disabled={busy || (tab === "upload" ? !file : !link.trim())}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {busy ? stage || "Working…" : "Publish to home page"}
          </button>
          {busy && tab === "upload" && progress !== null && (
            <button type="button" className={btn.secondary} onClick={() => abort.current?.abort()}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}
