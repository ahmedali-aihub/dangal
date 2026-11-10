"use client";

import { clsx } from "clsx";
import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PlayerVideo } from "@/lib/types";

/**
 * "Watch the film" — opens a full-screen theatre with sound and native controls.
 * The click is a user gesture, so browsers allow playback with audio.
 */
export function WatchFilm({
  video,
  label = "Watch the film",
  duration,
  variant = "glass",
  className,
}: {
  video: PlayerVideo;
  label?: string;
  duration?: string;
  /** "cover": invisible full-size button laid over a video; a play prompt appears on hover/focus. */
  variant?: "glass" | "ember" | "titanium" | "cover";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  if (variant === "cover") {
    return (
      <>
        <button ref={trigger} type="button" onClick={() => setOpen(true)} className={clsx("group absolute inset-0 z-20 flex cursor-pointer items-center justify-center", className)}>
          <span className="inline-flex scale-90 items-center gap-3 rounded-full bg-ink-950/70 py-2 pl-2 pr-5 text-sm font-medium text-titanium opacity-0 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ember text-ink">
              <Play className="h-4 w-4 translate-x-px fill-current" aria-hidden />
            </span>
            {label}
          </span>
        </button>
        {open && createPortal(<Theater video={video} onClose={close} />, document.body)}
      </>
    );
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "group inline-flex h-12 items-center gap-3 rounded-full pl-1.5 pr-5 text-sm font-medium transition-all duration-300",
          variant === "ember"
            ? "bg-ember text-ink shadow-[0_10px_30px_-10px_rgb(var(--ember-500)_/_0.6)] hover:bg-ember-400"
            : variant === "titanium"
              ? "bg-titanium text-ink shadow-[0_14px_40px_-12px_rgba(0,0,0,0.6)] hover:bg-white"
              : "glass text-titanium hover:bg-titanium/15",
          className,
        )}
      >
        <span
          className={clsx(
            "relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-110",
            variant === "ember" ? "bg-ink text-ember" : "bg-ember text-ink",
          )}
        >
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-ember/40 motion-reduce:hidden" />
          <Play className="relative h-3.5 w-3.5 translate-x-px fill-current" aria-hidden />
        </span>
        {label}
        {duration && <span className="font-normal opacity-70">{duration}</span>}
      </button>
      {open && createPortal(<Theater video={video} onClose={close} />, document.body)}
    </>
  );
}

function Theater({ video, onClose }: { video: PlayerVideo; onClose: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [needsTap, setNeedsTap] = useState(false);

  // Start immediately with sound. If a browser's autoplay policy refuses audio, play muted and offer
  // a one-tap unmute instead of leaving a frozen first frame.
  useEffect(() => {
    const v = ref.current;
    if (!v || video.source === "youtube" || video.source === "vimeo") return;
    v.muted = false;
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => {});
      setNeedsTap(true);
    });
  }, [video]);

  useEffect(() => {
    closeRef.current?.focus();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Mux HLS outside Safari
  useEffect(() => {
    const v = ref.current;
    if (!v || video.source !== "mux") return;
    const url = `https://stream.mux.com/${video.src}.m3u8`;
    if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = url;
      return;
    }
    let hls: { destroy(): void } | null = null;
    import("hls.js").then(({ default: Hls }) => {
      if (!Hls.isSupported()) return;
      const h = new Hls();
      h.loadSource(url);
      h.attachMedia(v);
      hls = h;
    });
    return () => hls?.destroy();
  }, [video]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="fade-in fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ink-950/95 p-4 backdrop-blur-md sm:p-10"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mb-4 flex w-full max-w-6xl items-center justify-between text-titanium">
        <p className="flex items-center gap-2 text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden />
          {video.title}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-titanium text-ink transition-transform hover:rotate-90">
          <X className="h-5 w-5" aria-hidden />
          <span className="sr-only">Close video</span>
        </button>
      </div>
      <div className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-[18px] bg-black shadow-[0_40px_140px_-30px_rgba(255,255,255,0.14)] ring-1 ring-titanium/10">
        {video.source === "youtube" || video.source === "vimeo" ? (
          <iframe
            src={
              video.source === "youtube"
                ? `https://www.youtube-nocookie.com/embed/${video.src}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
                : `https://player.vimeo.com/video/${video.src}?autoplay=1&dnt=1`
            }
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <video
            ref={ref}
            src={video.source === "upload" ? video.src : undefined}
            poster={video.poster_url ?? undefined}
            controls
            playsInline
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}
        {needsTap && (
          <button
            type="button"
            onClick={() => {
              const v = ref.current;
              if (!v) return;
              v.muted = false;
              v.play().catch(() => {});
              setNeedsTap(false);
            }}
            className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full bg-ember py-3 pl-3 pr-6 text-sm font-semibold text-ink shadow-[0_10px_30px_-10px_rgba(236,236,241,0.9)]"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-ember">
              <Play className="h-4 w-4 translate-x-px fill-current" aria-hidden />
            </span>
            Tap for sound
          </button>
        )}
      </div>
      <p className="mt-4 text-xs text-titanium/65">Press Esc or click outside to close</p>
    </div>
  );
}
