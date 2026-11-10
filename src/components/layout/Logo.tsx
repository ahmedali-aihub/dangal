import { clsx } from "clsx";

/**
 * Official Dangal Gym badge, redrawn as a crisp vector from the gym's logo (original PNG kept in
 * /public/brand/dangal-logo-original.png): silver ring, black disc, "DANGAL" arched on top, "GYM" below,
 * dumbbell in the centre. Gradients are defined once in <LogoDefs/> (root layout) so ids never duplicate.
 */
export function LogoBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={clsx("shrink-0", className)}>
      <circle cx="60" cy="60" r="59" fill="url(#dg-ring)" />
      <circle cx="60" cy="60" r="51.5" fill="url(#dg-disc)" stroke="#2b2b2b" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="48.5" fill="none" stroke="#3a3a3a" strokeWidth="0.6" />
      <text fill="#f5f5f5" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="15.5" letterSpacing="3.2">
        <textPath href="#dg-arc-top" startOffset="50%" textAnchor="middle">
          DANGAL
        </textPath>
      </text>
      <text fill="#f5f5f5" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="15.5" letterSpacing="4">
        <textPath href="#dg-arc-bottom" startOffset="50%" textAnchor="middle">
          GYM
        </textPath>
      </text>
      {/* dumbbell */}
      <g fill="#f5f5f5">
        <rect x="38" y="56.6" width="44" height="6.8" rx="1.2" />
        <rect x="41" y="44" width="9" height="32" rx="2.2" />
        <rect x="33.5" y="49" width="6" height="22" rx="1.8" />
        <rect x="70" y="44" width="9" height="32" rx="2.2" />
        <rect x="80.5" y="49" width="6" height="22" rx="1.8" />
      </g>
    </svg>
  );
}

/** Shared SVG definitions for every LogoBadge on the page. Render once in the root layout. */
export function LogoDefs() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <linearGradient id="dg-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfbfb" />
          <stop offset="0.35" stopColor="#b9b9b9" />
          <stop offset="0.55" stopColor="#ececec" />
          <stop offset="1" stopColor="#6f6f6f" />
        </linearGradient>
        <radialGradient id="dg-disc" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#262626" />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>
        <path id="dg-arc-top" d="M 23 60 A 37 37 0 0 1 97 60" />
        <path id="dg-arc-bottom" d="M 18.5 60 A 41.5 41.5 0 0 0 101.5 60" />
      </defs>
    </svg>
  );
}

export function Logo({ className, compact = false, responsive = false }: { className?: string; compact?: boolean; responsive?: boolean }) {
  return (
    <span className={clsx("inline-flex items-center gap-3", className)}>
      <LogoBadge className={clsx("drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]", responsive ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10")} />
      {!compact && (
        <span className={clsx("flex-col leading-none", responsive ? "hidden sm:flex" : "flex")}>
          <span className="text-[17px] font-semibold tracking-[0.14em]">DANGAL</span>
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.32em] opacity-70">Gym · Hyderabad</span>
        </span>
      )}
      {(compact || responsive) && <span className="sr-only">Dangal Gym</span>}
    </span>
  );
}
