"use client";

import { useEffect } from "react";

// Module-level flag: false during SSR + first hydration (so the first paint/LCP is never delayed),
// true for every client-side navigation afterwards.
let hasMounted = false;

/**
 * Route transition: the incoming page fades in over ~0.18s. (It used to be a full-screen curtain that took
 * about a second, which made every link feel slow.) Plays only on in-app navigation, never on first load.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const animate = hasMounted;
  useEffect(() => {
    hasMounted = true;
  }, []);

  return <div className={animate ? "page-enter motion-reduce:animate-none" : undefined}>{children}</div>;
}
