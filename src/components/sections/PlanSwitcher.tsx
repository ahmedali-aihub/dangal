"use client";

import { clsx } from "clsx";
import { useState, type ReactNode } from "react";

/**
 * Total ↔ per-month price toggle. Both values are server-rendered; this only flips a data attribute,
 * so switching is instant and costs no re-render of the cards.
 */
export function PlanSwitcher({ children, tone = "navy" }: { children: ReactNode; tone?: "navy" | "cream" }) {
  const [view, setView] = useState<"total" | "month">("total");
  const dark = tone === "navy";
  return (
    <div data-view={view} className="group/plans">
      <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
        <p className={clsx("text-sm", dark ? "text-cream/75" : "opacity-70")}>All prices in INR. No joining fee.</p>
        <div
          role="radiogroup"
          aria-label="Show prices as"
          className={clsx("relative grid grid-cols-2 rounded-full p-1 text-sm", dark ? "bg-cream/10 text-cream" : "bg-navy/[0.06] text-navy")}
        >
          <span
            aria-hidden
            className={clsx(
              "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
              dark ? "bg-cream" : "bg-navy",
              view === "month" && "translate-x-full",
            )}
          />
          {(
            [
              ["total", "Total price"],
              ["month", "Per month"],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={view === v}
              onClick={() => setView(v)}
              className={clsx(
                "relative z-10 h-9 rounded-full px-4 transition-colors duration-300",
                view === v ? (dark ? "text-navy" : "text-cream") : "opacity-80 hover:opacity-100",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
