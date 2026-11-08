"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Ambient light behind the projection screen: a heavily blurred copy of the film, so the picture's own
 * colours spill around the frame (like a TV ambilight). Desktop only, only while on screen, never on
 * data-saver or reduced motion — elsewhere it falls back to the blurred poster.
 */
export function Ambilight({ src, poster }: { src: string | null; poster: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const ok =
      !!src &&
      window.matchMedia("(min-width: 1024px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !conn?.saveData;
    setLive(ok);
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (visible) v.play().catch(() => {});
    else v.pause();
  }, [visible, live]);

  return (
    <div ref={wrap} aria-hidden className="pointer-events-none absolute -inset-6 -z-10 sm:-inset-10">
      {/* Tiny (it's blurred 60px anyway) and lazy, so it never competes with the hero image */}
      <Image src={poster} alt="" fill sizes="96px" quality={40} loading="lazy" className="scale-110 object-cover opacity-50 blur-[60px] saturate-150" />
      {live && visible && src && (
        <video ref={vid} src={src} muted loop playsInline autoPlay preload="none" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-[70px] saturate-150" />
      )}
      <div className="absolute inset-x-[10%] -bottom-10 h-1/2 rounded-full bg-coral/30 blur-[90px]" />
    </div>
  );
}
