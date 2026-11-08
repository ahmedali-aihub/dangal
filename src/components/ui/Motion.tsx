import { clsx } from "clsx";
import type { CSSProperties, ReactNode } from "react";

/**
 * Motion primitives — zero-JS where possible for Lighthouse 95+:
 *  - Reveal / Parallax use native CSS scroll-driven animations (animation-timeline: view()).
 *    Browsers without support simply show content (progressive enhancement), and nothing is ever
 *    hidden waiting for hydration, so LCP isn't delayed.
 *  - Counter / Magnetic are tiny client components (re-exported below).
 */
export { Counter, Magnetic } from "./MotionClient";
export { SplitText } from "./SplitText";

type RevealTag = "div" | "li" | "section" | "article";

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
  variant = "fade",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: RevealTag;
  /** "image": curtain clip-path reveal with the inner image settling from a slight zoom. */
  variant?: "fade" | "image";
}) {
  return (
    <Tag className={clsx(variant === "image" ? "reveal-img" : "reveal", className)} style={{ "--d": delay } as CSSProperties}>
      {children}
    </Tag>
  );
}

export function Parallax({ children, className }: { children: ReactNode; speed?: number; className?: string }) {
  return (
    <div className={clsx("parallax", className)}>
      <div className="absolute inset-x-0 -top-[8%] h-[116%]">{children}</div>
    </div>
  );
}
