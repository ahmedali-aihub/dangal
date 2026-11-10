"use client";

import { clsx } from "clsx";
import { Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV, SITE } from "@/lib/site";
import { Logo } from "./Logo";
import { PrimaryNav } from "./PrimaryNav";
import { ThemeButton, ThemeSwatches } from "./ThemeSwitcher";


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
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 text-titanium">
      <div
        className={clsx(
          "container-x pointer-events-auto transition-[padding] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
          scrolled ? "pt-2 sm:pt-3" : "pt-3 sm:pt-5",
        )}
      >
        {/* One capsule: logo · navigation · actions */}
        <div className="glass-strong flex items-center gap-1 rounded-full p-1 sm:gap-3 sm:p-1.5">
          <Link href="/" aria-label="Dangal Gym — home" className="shrink-0 rounded-full pl-0.5 pr-1 sm:pl-2 sm:pr-3">
            <Logo responsive />
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-center">
            <PrimaryNav />
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeButton className="hidden lg:block" />
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="hidden h-11 items-center gap-2 rounded-full bg-titanium px-5 text-[13px] font-medium text-ink transition-colors duration-300 hover:bg-white xl:inline-flex"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {SITE.phone}
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-titanium/15 bg-titanium/[0.08] transition-colors duration-300 hover:bg-titanium/15 sm:h-11 sm:w-11"
            >
              {/* Scroll progress ring traced around the button (CSS scroll-driven) */}
              <svg aria-hidden viewBox="0 0 44 44" className="pointer-events-none absolute inset-0 h-full w-full -rotate-90 overflow-visible">
                <circle className="scroll-ring" cx="22" cy="22" r="21" pathLength={100} fill="none" stroke="#ECECF1" strokeWidth="1.5" />
              </svg>
              <Menu className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden />
              <span className="sr-only">Open menu</span>
            </button>
          </div>
        </div>
      </div>

      {open && (
          <div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fade-in pointer-events-auto fixed inset-0 z-50 overflow-y-auto bg-ink-950 text-titanium"
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
                      <li key={n.href} className="fade-up border-b border-titanium/10" style={{ ["--delay" as string]: `${0.04 + i * 0.04}s` }}>
                        <Link
                          href={n.href}
                          aria-current={current ? "page" : undefined}
                          className="group flex items-center justify-between py-[clamp(0.45rem,1.7vh,1rem)] text-[clamp(1.5rem,min(4.2vw,6.8vh),2.75rem)] font-light leading-tight tracking-[-0.035em] text-titanium/80 transition-colors duration-300 hover:text-titanium"
                        >
                          <span className="inline-flex items-center gap-3 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-x-2">
                            {current && <span aria-hidden className="h-2 w-2 rounded-full bg-ember" />}
                            {n.label}
                          </span>
                          <span className="text-xs tabular-nums text-titanium/65 transition-colors group-hover:text-ember">{String(i + 1).padStart(2, "0")}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <div className="space-y-8 text-sm text-titanium/70 lg:col-span-4">
                  <div>
                    <p className="eyebrow text-titanium/65">Visit</p>
                    <address className="mt-3 not-italic leading-relaxed">
                      {SITE.address.line1}
                      <br />
                      {SITE.address.line2}
                      <br />
                      {SITE.address.city} – {SITE.address.postalCode}
                    </address>
                  </div>
                  <div>
                    <p className="eyebrow text-titanium/65">Hours</p>
                    <ul className="mt-3 space-y-1">
                      {SITE.hours.map((h) => (
                        <li key={h.days}>
                          {h.days} · {h.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ThemeSwatches />
                  <Link
                    href="/contact#trial"
                    className="inline-flex h-12 items-center rounded-full bg-ember px-6 text-sm font-semibold text-ink"
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
