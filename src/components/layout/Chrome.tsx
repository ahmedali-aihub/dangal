"use client";

import { CalendarCheck, Phone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE, whatsappLink } from "@/lib/site";
import type { Banner } from "@/lib/types";
import { SocialIcon } from "./SocialIcon";

/** Lenis smooth scroll — disabled for reduced-motion users and touch devices (native feels better there). */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let lenis: { raf(t: number): void; destroy(): void } | null = null;
    let cancelled = false;
    // Loaded on demand (desktop only) so phones never download it.
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ duration: 0.85, smoothWheel: true, anchors: { offset: -24 } });
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);
  return null;
}

/** Thin announcement bar pinned to the bottom of the viewport on desktop; dismissible. */
export function OfferBanner({ banner }: { banner: Banner | null }) {
  const [hidden, setHidden] = useState(true);
  const [pastHero, setPastHero] = useState(false);
  const key = banner ? `dg-banner-${banner.id}-${banner.message.length}` : "";

  useEffect(() => {
    if (!banner) return;
    try {
      setHidden(sessionStorage.getItem(key) === "1");
    } catch {
      setHidden(false);
    }
  }, [banner, key]);

  // Appear only once the visitor scrolls past the first screen, so it never covers the hero.
  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!banner || hidden || !pastHero) return null;
  return (
    <div
      role="region"
      aria-label="Current offer"
      className="fixed bottom-4 left-1/2 z-40 hidden w-[min(720px,calc(100%-2rem))] -translate-x-1/2 items-center gap-4 rounded-full border border-titanium/15 bg-ink/90 py-2 pl-5 pr-2 text-sm text-titanium shadow-glass backdrop-blur-xl sm:flex"
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
      <p className="flex-1 truncate">{banner.message}</p>
      {banner.cta_href && banner.cta_label && (
        <Link
          href={banner.cta_href}
          className="shrink-0 rounded-full bg-ember px-4 py-2 text-[13px] font-semibold text-ink hover:bg-ember-400"
        >
          {banner.cta_label}
        </Link>
      )}
      <button
        type="button"
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem(key, "1");
          } catch {}
        }}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-titanium/60 hover:text-titanium"
      >
        <X className="h-4 w-4" aria-hidden />
        <span className="sr-only">Dismiss offer</span>
      </button>
    </div>
  );
}

/** Mobile action dock: Call · WhatsApp · Free trial — the three things mobile visitors actually want. */
export function MobileDock() {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 gap-1 rounded-full border border-titanium/15 bg-ink/90 p-1.5 text-titanium shadow-glass backdrop-blur-xl sm:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <a href={`tel:${SITE.phoneRaw}`} className="flex h-11 items-center justify-center gap-2 rounded-full text-[13px]">
        <Phone className="h-4 w-4" strokeWidth={1.75} aria-hidden /> Call
      </a>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-11 items-center justify-center gap-2 rounded-full text-[13px]"
      >
        <SocialIcon name="whatsapp" /> WhatsApp
      </a>
      <Link
        href="/contact#trial"
        className="flex h-11 items-center justify-center gap-2 rounded-full bg-ember text-[13px] font-semibold text-ink"
      >
        <CalendarCheck className="h-4 w-4" strokeWidth={1.75} aria-hidden /> Free trial
      </Link>
    </nav>
  );
}
