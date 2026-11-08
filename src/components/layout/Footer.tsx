import { ArrowUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PROGRAMS } from "@/content/programs";
import { NAV, SITE, whatsappLink } from "@/lib/site";
import { Logo } from "./Logo";
import { SocialIcon } from "./SocialIcon";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-cream [contain-intrinsic-size:auto_800px] [content-visibility:auto]">
      <div className="container-x pb-28 pt-20 sm:pb-24 lg:pt-28">
        {/* Closing CTA */}
        <div className="mb-20 flex flex-col gap-8 border-b border-cream/10 pb-16 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-3xl text-[clamp(2.25rem,5.5vw,4.75rem)] font-light leading-[0.98] tracking-[-0.045em]">
            Ready to step into <span className="serif-accent">the akhara?</span>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact#trial"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-coral px-7 text-[15px] font-semibold text-navy shadow-[0_12px_32px_-12px_rgba(255,107,91,0.8)] transition-colors hover:bg-coral-400"
            >
              <span className="roll" data-text="Book a free trial">
                <span>Book a free trial</span>
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" aria-hidden />
            </Link>
            <a href={`tel:${SITE.phoneRaw}`} className="inline-flex h-14 items-center rounded-full border border-cream/20 px-6 text-[15px] transition-colors hover:border-cream/60">
              {SITE.phone}
            </a>
          </div>
        </div>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-cream/65">
              A professional fitness training centre in Mehdipatnam, built on the discipline of the akhara and the
              precision of modern coaching.
            </p>
            <div className="mt-8 flex gap-2">
              {(
                [
                  ["instagram", SITE.socials.instagram, "Instagram"],
                  ["youtube", SITE.socials.youtube, "YouTube"],
                  ["facebook", SITE.socials.facebook, "Facebook"],
                  ["x", SITE.socials.x, "X (Twitter)"],
                ] as const
              ).map(([k, href, label]) => (
                <a
                  key={k}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Dangal Gym on ${label}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream/75 transition-colors hover:border-cream/50 hover:text-cream"
                >
                  <SocialIcon name={k} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="eyebrow text-cream/65">Programs</p>
              <ul className="mt-5 space-y-3 text-sm">
                {PROGRAMS.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/programs/${p.slug}`} className="link-underline text-cream/75 hover:text-cream">
                      Fittest {p.short.charAt(0) + p.short.slice(1).toLowerCase()}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-cream/65">Explore</p>
              <ul className="mt-5 space-y-3 text-sm">
                {NAV.filter((n) => n.href !== "/programs").map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="link-underline text-cream/75 hover:text-cream">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="eyebrow text-cream/65">Contact</p>
              <address className="mt-5 space-y-3 text-sm not-italic text-cream/75">
                <p>
                  {SITE.address.line1}, {SITE.address.line2}, {SITE.address.city} – {SITE.address.postalCode}
                </p>
                <p>
                  <a href={`tel:${SITE.phoneRaw}`} className="link-underline hover:text-cream">
                    {SITE.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${SITE.email}`} className="link-underline hover:text-cream">
                    {SITE.email}
                  </a>
                </p>
                <p>
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-cream">
                    WhatsApp us
                  </a>
                </p>
              </address>
            </div>
          </div>
        </div>

        {/* Decorative watermark via pseudo-element (not text content, so not read or contrast-checked) */}
        <div
          aria-hidden
          data-word="DANGAL"
          className="pointer-events-none mt-20 select-none text-center text-[clamp(4.5rem,21vw,19rem)] font-light leading-[0.8] tracking-[-0.06em] text-cream/[0.06] before:content-[attr(data-word)]"
        />

        <div className="mt-10 flex flex-col gap-4 border-t border-cream/10 pt-8 text-xs text-cream/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Dangal Gym, Hyderabad. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-6">
            <li>
              <a href="#main" className="group inline-flex items-center gap-2 hover:text-cream">
                Back to top
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-cream/20 transition-transform duration-300 group-hover:-translate-y-0.5">
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                </span>
              </a>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-cream">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-cream">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <a href={SITE.googleBusinessUrl} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                Find us on Google
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
