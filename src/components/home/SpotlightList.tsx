"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";

/** Cursor-following soft light on each card (CSS vars on the hovered child; one listener for the whole list). */
export function SpotlightList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ol
      className={clsx("spotlight", className)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const item = (e.target as HTMLElement).closest<HTMLElement>(".spotlight > *");
        if (!item) return;
        const r = item.getBoundingClientRect();
        item.style.setProperty("--x", `${e.clientX - r.left}px`);
        item.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </ol>
  );
}
