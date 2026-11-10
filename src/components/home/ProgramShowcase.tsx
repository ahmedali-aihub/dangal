"use client";

import { clsx } from "clsx";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { PROGRAMS } from "@/content/programs";
import { BLUR, img } from "@/lib/images";

const short = (s: string) => (s === "ELDER 40+" ? "Elder 40+" : s.charAt(0) + s.slice(1).toLowerCase());

/**
 * Desktop: four panels; the active one expands (hover, focus or tap) to reveal the program.
 * Mobile/tablet: swipeable snap carousel with position dots.
 */
export function ProgramShowcase() {
  const [active, setActive] = useState(0);
  const [slide, setSlide] = useState(0);
  const track = useRef<HTMLUListElement>(null);

  return (
    <>
      {/* Desktop expanding panels */}
      <ul className="hidden h-[620px] gap-3 lg:flex" aria-label="Signature programs">
        {PROGRAMS.map((p, i) => {
          const on = i === active;
          return (
            <li
              key={p.slug}
              onMouseEnter={() => setActive(i)}
              className={clsx(
                "reveal relative min-w-0 overflow-hidden rounded-[22px] bg-ink-700 transition-[flex-grow] duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]",
                on ? "grow-[3.4]" : "grow",
              )}
              style={{ flexBasis: 0, ["--d" as string]: i * 0.06 }}
            >
              <Link href={`/programs/${p.slug}`} onFocus={() => setActive(i)} className="group absolute inset-0 block text-titanium">
                <Image
                  src={img(p.image, 1200)}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 55vw, 1px"
                  placeholder="blur"
                  blurDataURL={BLUR}
                  className={clsx("object-cover transition-transform duration-[1.6s] ease-out", on ? "scale-100" : "scale-110")}
                />
                <div aria-hidden className={clsx("absolute inset-0 transition-colors duration-700", on ? "bg-ink/25" : "bg-ink/55")} />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/25 to-transparent" />

                {/* Collapsed: vertical label */}
                <div aria-hidden className={clsx("absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-500", on ? "opacity-0" : "opacity-100 delay-200")}>
                  <span className="text-xs tabular-nums text-titanium/75">0{i + 1}</span>
                  <span className="whitespace-nowrap text-[2rem] font-light tracking-[-0.04em] [writing-mode:vertical-rl] rotate-180">
                    Fittest <span className="serif-accent">{short(p.short)}</span>
                  </span>
                </div>

                {/* Expanded: full program teaser (fixed width so text never reflows while the panel grows) */}
                <div
                  className={clsx(
                    "absolute bottom-0 left-0 w-[560px] max-w-full p-9 transition-all duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
                    on ? "translate-y-0 opacity-100 delay-300" : "pointer-events-none translate-y-8 opacity-0",
                  )}
                >
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-eyebrow text-titanium/80">
                    <span className="tabular-nums">0{i + 1}</span>
                    <span className="h-px w-6 bg-titanium/50" />
                    {p.audience}
                  </div>
                  <h3 className="mt-5 text-[3.25rem] font-light leading-[0.95] tracking-[-0.045em]">
                    <span className="block text-[0.42em] uppercase tracking-[0.18em] text-titanium/75">I am the fittest</span>
                    {short(p.short)}
                  </h3>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed text-titanium/85">{p.tagline}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {p.workouts.slice(0, 3).map((w) => (
                      <li key={w.title} className="rounded-full border border-titanium/25 px-3 py-1.5 text-xs text-titanium/90 backdrop-blur-sm">
                        {w.title}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-8 inline-flex items-center gap-3 text-sm">
                    <span className="inline-flex h-11 items-center gap-2 rounded-full bg-ember px-5 font-semibold text-ink transition-colors group-hover:bg-ember-400">
                      Explore program <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" aria-hidden />
                    </span>
                  </span>
                </div>
                <span className="sr-only">{p.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Mobile / tablet: snap carousel */}
      <div className="lg:hidden">
        <ul
          ref={track}
          aria-label="Signature programs"
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 sm:-mx-6 sm:px-6"
          onScroll={(e) => {
            const el = e.currentTarget;
            const card = el.firstElementChild as HTMLElement | null;
            if (card) setSlide(Math.round(el.scrollLeft / (card.offsetWidth + 12)));
          }}
        >
          {PROGRAMS.map((p, i) => (
            <li key={p.slug} className="w-[84%] shrink-0 snap-center sm:w-[46%]">
              <Link href={`/programs/${p.slug}`} className="group relative flex aspect-[3/4.2] flex-col justify-end overflow-hidden rounded-[20px] bg-ink-700 p-6 text-titanium">
                <Image src={img(p.image, 800)} alt="" fill sizes="(min-width:640px) 46vw, 84vw" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
                <div aria-hidden className="absolute inset-0 bg-ink/35" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/30 to-transparent" />
                <div className="absolute left-6 right-6 top-6 flex justify-between text-[11px] uppercase tracking-eyebrow text-titanium/80">
                  <span className="tabular-nums">0{i + 1}</span>
                  <span>{p.audience}</span>
                </div>
                <div className="relative">
                  <p className="text-[11px] uppercase tracking-eyebrow text-titanium/75">I am the fittest</p>
                  <h3 className="mt-2 text-[2.4rem] font-light leading-none tracking-[-0.04em]">{short(p.short)}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-titanium/85">{p.tagline}</p>
                  <span className="mt-6 flex items-center justify-between border-t border-titanium/20 pt-4 text-[13px]">
                    Explore program
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-titanium text-ink">
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </span>
                  </span>
                </div>
                <span className="sr-only">{p.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-center gap-2" aria-hidden>
          {PROGRAMS.map((p, i) => (
            <button
              key={p.slug}
              tabIndex={-1}
              onClick={() => {
                const el = track.current;
                const card = el?.children[i] as HTMLElement | undefined;
                if (el && card) el.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
              }}
              className={clsx("h-1.5 rounded-full bg-titanium transition-all duration-500", i === slide ? "w-8" : "w-1.5 opacity-40")}
            />
          ))}
        </div>
      </div>
    </>
  );
}
