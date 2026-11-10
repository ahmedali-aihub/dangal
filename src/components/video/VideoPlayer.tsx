"use client";

import { clsx } from "clsx";
import { Play, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { BLUR, img } from "@/lib/images";
import type { PlayerVideo, VideoSlot } from "@/lib/types";
import { posterFor } from "@/lib/video";

type Props = {
  slot: VideoSlot;
  fallbackImage: string;
  fallbackAlt: string;
  /** Hero: true (poster is the LCP image). Below-the-fold sections: false → lazy mount. */
  priority?: boolean;
  controls?: "bottom-right" | "bottom-left" | "none";
  className?: string;
  /** Override control placement classes (e.g. hero moves them above the fold row on mobile). */
  controlsClassName?: string;
  /** Extra classes on the media layer (poster + video), e.g. a soft blur for low-res background footage. */
  mediaClassName?: string;
  /** Overlays (tint, gradients…) drawn above the media but BELOW the controls, so controls stay bright and clickable. */
  children?: React.ReactNode;
  onVideoChange?: (v: PlayerVideo | null) => void;
};

type NetInfo = { saveData?: boolean; effectiveType?: string };

function useConstrained() {
  const [state, setState] = useState<{ constrained: boolean; reason: "data" | "motion" | null }>({
    constrained: false,
    reason: null,
  });
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
    if (conn?.saveData || (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType))) {
      setState({ constrained: true, reason: "data" });
    } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState({ constrained: true, reason: "motion" });
    }
  }, []);
  return state;
}

const YT_ORIGIN = "https://www.youtube-nocookie.com";

export function VideoPlayer({
  slot,
  fallbackImage,
  fallbackAlt,
  priority,
  controls = "bottom-right",
  className,
  controlsClassName,
  mediaClassName,
  children,
  onVideoChange,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const { constrained, reason } = useConstrained();
  const [optIn, setOptIn] = useState(false); // user chose to play despite data-saver / reduced motion
  const [near, setNear] = useState(!!priority); // lazy-mount when close to viewport
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);

  // Never server-render the <video>: it would start downloading before the page (and the LCP poster)
  // finish loading, and before we know about data-saver. Mount only once the page has loaded and is idle.
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    const ric = (cb: () => void) =>
      typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 300);
    const go = () => ric(() => setPageLoaded(true));
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);

  const videos = slot.videos;
  const current = videos.length ? videos[index % videos.length] : null;
  const isPlaylist = videos.length > 1;
  const canPlay = !!current && !failed && (!constrained || optIn);
  const shouldMount = canPlay && near && pageLoaded;

  const poster = current ? posterFor(current) ?? fallbackImage : fallbackImage;

  useEffect(() => onVideoChange?.(canPlay ? current : null), [current, canPlay, onVideoChange]);

  // Lazy mount + pause when offscreen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
        setVisible(e.isIntersecting);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const next = useCallback(() => {
    if (!isPlaylist) return;
    setReady(false);
    setIndex((i) => (i + 1) % videos.length);
  }, [isPlaylist, videos.length]);

  // Embeds can't tell us when they end reliably — rotate playlists on a timer
  useEffect(() => {
    if (!isPlaylist || !current || current.source === "upload" || current.source === "mux") return;
    const t = setTimeout(next, Math.max(5, slot.rotateSeconds) * 1000);
    return () => clearTimeout(t);
  }, [isPlaylist, current, next, slot.rotateSeconds]);

  // HLS (Mux) — native on Safari/iOS, hls.js elsewhere (lazy-loaded)
  useEffect(() => {
    const v = videoRef.current;
    if (!shouldMount || !v || current?.source !== "mux") return;
    const url = `https://stream.mux.com/${current.src}.m3u8`;
    let hls: { destroy(): void } | null = null;
    if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = url;
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) return setFailed(true);
        const h = new Hls({ capLevelToPlayerSize: true, startLevel: -1 });
        h.on(Hls.Events.ERROR, (_e, data) => data.fatal && setFailed(true));
        h.loadSource(url);
        h.attachMedia(v);
        hls = h;
      });
    }
    return () => hls?.destroy();
  }, [shouldMount, current]);

  // Pause/resume with visibility & user intent
  const post = useCallback(
    (msg: object) => {
      const w = frameRef.current?.contentWindow;
      if (!w || !current) return;
      w.postMessage(JSON.stringify(msg), current.source === "youtube" ? YT_ORIGIN : "https://player.vimeo.com");
    },
    [current],
  );

  useEffect(() => {
    const shouldPlay = visible; // plays while on screen, pauses off-screen to save battery/data
    const v = videoRef.current;
    if (v) {
      if (shouldPlay) v.play().catch(() => {});
      else v.pause();
    }
    if (current?.source === "youtube") post({ event: "command", func: shouldPlay ? "playVideo" : "pauseVideo", args: [] });
    if (current?.source === "vimeo") post({ method: shouldPlay ? "play" : "pause" });
  }, [visible, current, post, ready]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = muted;
      if (!muted) {
        v.volume = 1;
        v.play().catch(() => {});
      }
    }
    if (current?.source === "youtube") post({ event: "command", func: muted ? "mute" : "unMute", args: [] });
    if (current?.source === "vimeo") post({ method: "setVolume", value: muted ? 0 : 1 });
  }, [muted, current, post, ready]);

  const embedSrc = (v: PlayerVideo) =>
    v.source === "youtube"
      ? `${YT_ORIGIN}/embed/${v.src}?autoplay=1&mute=1&controls=0&loop=${isPlaylist ? 0 : 1}&playlist=${v.src}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1`
      : `https://player.vimeo.com/video/${v.src}?background=1&autoplay=1&muted=1&loop=${isPlaylist ? 0 : 1}&autopause=0&dnt=1`;

  return (
    <div ref={rootRef} className={clsx("absolute inset-0 overflow-hidden bg-ink-900 [container-type:size]", className)}>
      {/* Poster / fallback (also the LCP image) */}
      <Image
        src={img(poster, 1920, 72)}
        alt={fallbackAlt}
        fill
        priority={priority}
        // ≥ ~1000px even on phones: the poster must be at least as "large" as the video's first frame,
        // otherwise the browser re-counts the video as the LCP element seconds later.
        sizes="(max-width: 640px) 1000px, 100vw"
        placeholder="blur"
        blurDataURL={BLUR}
        className={clsx(
          "object-cover transition-opacity duration-1000",
          mediaClassName,
          ready && canPlay ? "opacity-0" : "opacity-100",
          !canPlay && "lg:animate-kenburns",
        )}
      />

      {shouldMount && current && (current.source === "upload" || current.source === "mux") && (
        <video
          key={current.id}
          ref={videoRef}
          className={clsx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
            mediaClassName,
            ready ? "opacity-100" : "opacity-0",
          )}
          src={current.source === "upload" ? current.src : undefined}
          poster={poster}
          autoPlay
          muted
          loop={!isPlaylist}
          playsInline
          preload="metadata"
          disablePictureInPicture
          onPlaying={() => setReady(true)}
          onEnded={next}
          onError={() => setFailed(true)}
          aria-label={current.title}
        />
      )}

      {shouldMount && current && (current.source === "youtube" || current.source === "vimeo") && (
        <iframe
          key={current.id}
          ref={frameRef}
          src={embedSrc(current)}
          title={current.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          loading={priority ? "eager" : "lazy"}
          tabIndex={-1}
          onLoad={() => setTimeout(() => setReady(true), 900)}
          className={clsx(
            "pointer-events-none absolute left-1/2 top-1/2 h-[max(100cqh,56.25cqw)] w-[max(100cqw,177.78cqh)] -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-1000",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      )}

      {children}

      {controls !== "none" && current && !failed && (
        <div
          className={clsx(
            "absolute z-30 flex items-center gap-2",
            controlsClassName ??
              clsx("bottom-5 sm:bottom-8", controls === "bottom-right" ? "right-4 sm:right-8" : "left-4 sm:left-8"),
          )}
        >
          {constrained && !optIn ? (
            <button
              type="button"
              onClick={() => setOptIn(true)}
              className="glass inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] text-titanium"
            >
              <Play className="h-3.5 w-3.5" aria-hidden /> {reason === "data" ? "Play video (uses data)" : "Play video"}
            </button>
          ) : (
            <>
              {isPlaylist && (
                <div className="glass mr-1 hidden h-10 items-center gap-1.5 rounded-full px-3 sm:flex" aria-hidden>
                  {videos.map((v, i) => (
                    <span
                      key={v.id}
                      className={clsx("h-1 rounded-full bg-titanium transition-all", i === index % videos.length ? "w-5" : "w-1.5 opacity-70")}
                    />
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-pressed={!muted}
                className={clsx(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors duration-300 sm:h-11 sm:gap-2 sm:px-4 sm:text-[13px]",
                  muted ? "glass text-titanium hover:bg-titanium/20" : "bg-silver text-ink shadow-[0_8px_24px_-8px_rgba(255,255,255,0.3)]",
                )}
              >
                {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
                <span>{muted ? "Sound off" : "Sound on"}</span>
                <span className="sr-only">{muted ? " — press to unmute the video" : " — press to mute the video"}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
