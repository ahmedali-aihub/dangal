"use client";

import { clsx } from "clsx";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/lib/types";

const DURATION = 7000;

/**
 * Story-style testimonial carousel: progress segments, autoplay that pauses on hover/focus/off-screen,
 * swipe on touch, arrow keys, and respectful of reduced motion.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduce, setReduce] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const n = items.length;

  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = visible && !paused && !reduce && n > 1;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => go(1), DURATION);
    return () => clearTimeout(t);
  }, [running, i, go]);

  if (!n) return null;
  const t = items[i];

  return (
    <div
      ref={root}
      className={clsx("grid gap-10 outline-none lg:grid-cols-12", !running && "is-paused")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") startX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
      }}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Member testimonials — use arrow keys to browse"
    >
      <div className="touch-pan-y lg:col-span-9">
        {/* Story progress */}
        <div className="mb-10 flex gap-1.5" aria-hidden>
          {items.map((x, k) => (
            <button key={x.id} tabIndex={-1} onClick={() => setI(k)} className="h-[3px] flex-1 overflow-hidden rounded-full bg-navy/15">
              {k < i && <span className="block h-full w-full bg-navy" />}
              {k === i && <span key={i} className={clsx("block h-full w-full bg-navy", n > 1 && !reduce && "grow-x")} style={{ ["--dur" as string]: `${DURATION}ms` }} />}
            </button>
          ))}
        </div>

        <div aria-live="polite">
          <figure key={t.id}>
            <blockquote className="text-[clamp(1.5rem,3.2vw,2.6rem)] font-light leading-[1.18] tracking-[-0.03em] text-balance">
              {t.quote.split(" ").map((w, k) => (
                <Fragment key={k}>
                  <span className="w fade-up" style={{ ["--delay" as string]: `${k * 18}ms` }}>
                    {w}
                  </span>{" "}
                </Fragment>
              ))}
            </blockquote>
            <figcaption className="fade-up mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm" style={{ ["--delay" as string]: "0.25s" }}>
              <span aria-hidden className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy text-[13px] font-medium text-cream">
                {t.name
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")}
              </span>
              <span>
                <span className="block font-medium">{t.name}</span>
                {t.program && <span className="block opacity-70">{t.program}</span>}
              </span>
              <span className="ml-1 flex gap-0.5" role="img" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className={`h-3.5 w-3.5 ${k < t.rating ? "fill-current" : "opacity-25"}`} aria-hidden />
                ))}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="flex items-end justify-between gap-6 lg:col-span-3 lg:flex-col lg:items-end">
        {t.result && (
          <div key={t.id} className="fade-up text-left lg:text-right" style={{ ["--delay" as string]: "0.15s" }}>
            <p className="eyebrow opacity-70">Result</p>
            <p className="mt-2 text-2xl font-light tracking-[-0.03em]">{t.result}</p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="text-sm tabular-nums opacity-70">
            {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => go(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/20 transition-all duration-300 hover:bg-navy hover:text-cream active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span className="sr-only">Previous testimonial</span>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/20 transition-all duration-300 hover:bg-navy hover:text-cream active:scale-95"
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
            <span className="sr-only">Next testimonial</span>
          </button>
        </div>
      </div>
    </div>
  );
}
