import { Fragment } from "react";

const WORDS = ["Discipline", "Strength", "Respect", "Grit", "Consistency", "Akhara spirit"];

/** Brand ribbon: slow, pausable on hover, decorative (hidden from screen readers), stops for reduced motion. */
export function Marquee() {
  const row = (
    <span className="flex shrink-0 items-center">
      {WORDS.map((w, i) => (
        <Fragment key={w}>
          <span className={i % 2 ? "serif-accent px-6 sm:px-10" : "px-6 font-light sm:px-10"}>{w}</span>
          {/* dumbbell from the Dangal badge */}
          <svg viewBox="0 0 60 32" className="h-5 w-9 shrink-0 text-coral sm:h-7 sm:w-12" aria-hidden fill="currentColor">
            <rect x="8" y="13.5" width="44" height="5" rx="1" />
            <rect x="10" y="3" width="8" height="26" rx="2" />
            <rect x="3" y="8" width="5" height="16" rx="1.5" />
            <rect x="42" y="3" width="8" height="26" rx="2" />
            <rect x="52" y="8" width="5" height="16" rx="1.5" />
          </svg>
        </Fragment>
      ))}
    </span>
  );
  return (
    <div aria-hidden className="marquee overflow-hidden border-y border-navy/10 bg-cream py-6 text-navy sm:py-8">
      <div className="marquee-track flex w-max text-[clamp(2rem,5.5vw,4.5rem)] leading-none tracking-[-0.04em] motion-reduce:animate-none">
        {row}
        {row}
      </div>
    </div>
  );
}
