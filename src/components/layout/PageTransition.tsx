"use client";

import { useEffect } from "react";
import { LogoBadge } from "./Logo";

// Module-level flag: false during SSR + first hydration (so the first paint/LCP is never delayed),
// true for every client-side navigation afterwards.
let hasMounted = false;

/**
 * Premium route transition: a ink curtain with the Dangal mark sweeps up over the incoming page,
 * which rises into place. Plays only on in-app navigation, never on first load or for reduced-motion users.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const animate = hasMounted;
  useEffect(() => {
    hasMounted = true;
  }, []);

  return (
    <>
      {animate && (
        <div aria-hidden className="page-curtain motion-reduce:hidden">
          <span>
            <LogoBadge className="h-16 w-16" />
          </span>
        </div>
      )}
      <div className={animate ? "page-enter motion-reduce:animate-none" : undefined}>{children}</div>
    </>
  );
}
