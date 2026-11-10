"use client";

import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BLUR, img } from "@/lib/images";
import type { GalleryItem } from "@/lib/types";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const swipeX = useRef<number | null>(null);
  const shown = cat === "All" ? items : items.filter((i) => i.category === cat);

  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus();
  }, []);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + shown.length) % shown.length)), [shown.length]);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  return (
    <>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter gallery">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            onClick={() => setCat(c)}
            className={clsx("h-10 rounded-full px-4 text-sm transition-colors", cat === c ? "bg-ink text-titanium" : "border border-ink/15 hover:border-ink/40")}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="mt-10 columns-1 gap-3 sm:columns-2 lg:columns-3 [&>li]:mb-3">
        {shown.map((g, i) => (
          <li key={g.id} className="break-inside-avoid">
            <button
              type="button"
              onClick={(e) => {
                lastFocus.current = e.currentTarget;
                setOpen(i);
              }}
              className={clsx("group relative block w-full overflow-hidden rounded-[18px] bg-ink/10", i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-[4/3]" : "aspect-square")}
            >
              <Image src={img(g.image_url, 900)} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" placeholder="blur" blurDataURL={BLUR} className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              <span className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-full bg-titanium/90 px-4 py-2 text-left text-[13px] text-ink opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {g.title}
                <span className="opacity-70">{g.category}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null && shown[open] && createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={shown[open].title}
            className="fade-in fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/95 p-4 backdrop-blur"
            onClick={(e) => e.target === e.currentTarget && close()}
            onPointerDown={(e) => {
              swipeX.current = e.clientX;
            }}
            onPointerUp={(e) => {
              if (swipeX.current === null) return;
              const dx = e.clientX - swipeX.current;
              swipeX.current = null;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            }}
          >
            <div className="relative h-[80vh] w-full max-w-5xl">
              <Image src={img(shown[open].image_url, 2000, 80)} alt={shown[open].title} fill sizes="100vw" className="object-contain" />
            </div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-titanium/80">
              {shown[open].title} · {open + 1}/{shown.length}
            </p>
            <button ref={closeRef} type="button" onClick={close} className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-titanium text-ink">
              <X className="h-5 w-5" aria-hidden />
              <span className="sr-only">Close</span>
            </button>
            <button type="button" onClick={() => step(-1)} className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-titanium/30 text-titanium">
              <ChevronLeft className="h-5 w-5" aria-hidden />
              <span className="sr-only">Previous image</span>
            </button>
            <button type="button" onClick={() => step(1)} className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-titanium/30 text-titanium">
              <ChevronRight className="h-5 w-5" aria-hidden />
              <span className="sr-only">Next image</span>
            </button>
          </div>
        , document.body)}
    </>
  );
}
