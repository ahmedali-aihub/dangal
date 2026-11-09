"use client";

import { clsx } from "clsx";
import { Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, SITE } from "@/lib/site";
import { Logo } from "./Logo";
import { PrimaryNav } from "./PrimaryNav";


export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Always pinned to the top of the screen; just tightens (and gets a glass backing) once you scroll.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);


  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 text-cream">
      <div
        className={clsx(
          "container-x pointer-events-auto flex flex-wrap items-center justify-between gap-y-3 transition-[padding] lg:flex-nowrap lg:gap-y-0 duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
          scrolled ? "pt-3" : "pt-5 sm:pt-7",
        )}
      >
        <Link
          href="/"
          className={clsx(
            "rounded-full transition-all duration-500",
            scrolled && "glass-strong px-4 py-2",
          )}
        >
          <Logo />
        </Link>

        <PrimaryNav />

        <div className="flex items-center gap-2">
          <a
            href={`tel:${SITE.phoneRaw}`}
            className={clsx(
              "hidden h-11 items-center gap-2 rounded-full px-5 text-[13px] font-medium transition-colors duration-300 sm:inline-flex",
              // Cream on the dark hero; solid navy once scrolled so it never dissolves into cream sections.
              scrolled ? "border border-cream/15 bg-navy-900/[0.93] text-cream shadow-glass hover:bg-navy-700" : "bg-cream text-navy hover:bg-white",
            )}
          >
            <Phone className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {SITE.phone}
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="glass-strong relative inline-flex h-11 w-14 items-center justify-center rounded-full transition-transform duration-300 hover:scale-105"
          >
            {/* Scroll progress ring traced around the button (CSS scroll-driven) */}
            <svg aria-hidden viewBox="0 0 56 44" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
              <rect className="scroll-ring" x="0.75" y="0.75" width="54.5" height="42.5" rx="21.25" pathLength={100} fill="none" stroke="#FF6B5B" strokeWidth="1.5" />
            </svg>
            <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
      </div>

      {open && (
          <div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fade-in pointer-events-auto fixed inset-0 z-50 overflow-y-auto bg-navy-950 text-cream"
          >
            <div className="fluted pointer-events-none absolute inset-0 opacity-50" aria-hidden />
            <div className="container-x relative flex min-h-full flex-col pb-6 pt-5 sm:pt-7">
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="glass inline-flex h-11 w-14 items-center justify-center rounded-full"
                  autoFocus
                >
                  <X className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                  <span className="sr-only">Close menu</span>
                </button>
              </div>

              <nav aria-label="Site" className="grid flex-1 content-center gap-10 py-8 lg:grid-cols-12 lg:gap-12">
                {/* Two columns on wider screens so all ten links always fit without scrolling; type scales with screen height */}
                <ul className="grid grid-flow-col grid-rows-5 gap-x-6 sm:gap-x-12 lg:col-span-8">
                  {[{ href: "/", label: "Home" }, ...NAV].map((n, i) => {
                    const current = n.href === "/" ? pathname === "/" : pathname === n.href || pathname.startsWith(`${n.href}/`);
                    return (
                      <li key={n.href} className="fade-up border-b border-cream/10" style={{ ["--delay" as string]: `${0.04 + i * 0.04}s` }}>
                        <Link
                          href={n.href}
                          aria-current={current ? "page" : undefined}
                          className="group flex items-center justify-between py-[clamp(0.45rem,1.7vh,1rem)] text-[clamp(1.5rem,min(4.2vw,6.8vh),2.75rem)] font-light leading-tight tracking-[-0.035em] text-cream/80 transition-colors duration-300 hover:text-cream"
                        >
                          <span className="inline-flex items-center gap-3 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-x-2">
                            {current && <span aria-hidden className="h-2 w-2 rounded-full bg-coral" />}
                            {n.label}
                          </span>
                          <span className="text-xs tabular-nums text-cream/65 transition-colors group-hover:text-coral">{String(i + 1).padStart(2, "0")}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="space-y-8 text-sm text-cream/70 lg:col-span-4">
                  <div>
                    <p className="eyebrow text-cream/65">Visit</p>
                    <address className="mt-3 not-italic leading-relaxed">
                      {SITE.address.line1}
                      <br />
                      {SITE.address.line2}
                      <br />
                      {SITE.address.city} – {SITE.address.postalCode}
                    </address>
                  </div>
                  <div>
                    <p className="eyebrow text-cream/65">Hours</p>
                    <ul className="mt-3 space-y-1">
                      {SITE.hours.map((h) => (
                        <li key={h.days}>
                          {h.days} · {h.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/contact#trial"
                    className="inline-flex h-12 items-center rounded-full bg-coral px-6 text-sm font-semibold text-navy"
                  >
                    Book a free trial
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        )}
    </header>
  );
}
