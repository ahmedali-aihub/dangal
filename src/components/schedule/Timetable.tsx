"use client";

import { clsx } from "clsx";
import { useEffect, useMemo, useState } from "react";
import { SCHEDULE } from "@/content/data";
import { nowIST, slotStates, type SlotState } from "@/lib/time";

const FILTERS = ["ALL", "MAN", "WOMAN", "ELDER", "KID"] as const;
const LABEL: Record<string, string> = { ALL: "All programs", MAN: "Men", WOMAN: "Women", ELDER: "40+", KID: "Kids" };

export function Timetable() {
  const [day, setDay] = useState("Mon");
  const [today, setToday] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(0);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");

  // Open on today's tab and keep "Live now" / "Up next" fresh every minute.
  useEffect(() => {
    const tick = (first = false) => {
      const n = nowIST();
      setToday(n.day);
      setMinutes(n.minutes);
      if (first && SCHEDULE.some((d) => d.day === n.day)) setDay(n.day);
    };
    tick(true);
    const t = setInterval(() => tick(), 60_000);
    return () => clearInterval(t);
  }, []);

  const daySlots = SCHEDULE.find((d) => d.day === day)?.slots ?? [];
  const states = useMemo<SlotState[]>(
    () => (day === today ? slotStates(daySlots.map((s) => s.time), minutes) : daySlots.map(() => "later")),
    [day, today, minutes, daySlots],
  );
  const rows = daySlots
    .map((s, i) => ({ ...s, state: states[i] }))
    .filter((s) => filter === "ALL" || s.program === filter || s.program === "ALL");

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Day of week" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {SCHEDULE.map((d) => (
            <button
              key={d.day}
              role="tab"
              type="button"
              aria-selected={day === d.day}
              aria-controls="timetable-panel"
              onClick={() => setDay(d.day)}
              className={clsx(
                "relative h-11 min-w-[60px] shrink-0 rounded-full px-4 text-sm transition-all duration-300",
                day === d.day ? "bg-ink text-titanium" : "border border-ink/15 hover:border-ink/40",
              )}
            >
              {d.day}
              {d.day === today && (
                <span aria-label="(today)" className={clsx("absolute right-2 top-2 h-1.5 w-1.5 rounded-full", day === d.day ? "bg-titanium" : "bg-ink")} />
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by program">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={clsx("h-9 rounded-full px-3.5 text-[13px] transition-colors", filter === f ? "bg-ink/10" : "opacity-70 hover:opacity-100")}
            >
              {LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <div id="timetable-panel" role="tabpanel" aria-live="polite" className="mt-8 overflow-hidden rounded-[22px] bg-titanium-50">
        {rows.length ? (
          <ul key={day + filter}>
            {rows.map((s, i) => (
              <li
                key={s.time + s.name}
                className={clsx(
                  "fade-up grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 transition-colors sm:grid-cols-[180px_1fr_160px_120px] sm:px-8",
                  i > 0 && "border-t border-ink/10",
                  s.state === "live" && "bg-ink text-titanium",
                  s.state === "past" && "opacity-70",
                )}
                style={{ ["--delay" as string]: `${i * 0.04}s` }}
              >
                <span className={clsx("order-2 text-sm tabular-nums sm:order-none sm:text-[15px]", s.state !== "live" && "opacity-80 sm:opacity-100")}>{s.time}</span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg tracking-[-0.015em]">
                  {s.name}
                  {s.state === "live" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ember px-2.5 py-0.5 text-[11px] font-semibold text-ink">
                      <span className="relative flex h-1.5 w-1.5" aria-hidden>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink" />
                      </span>
                      Live now
                    </span>
                  )}
                  {s.state === "next" && <span className="rounded-full border border-ink/25 px-2.5 py-0.5 text-[11px] font-medium">Up next</span>}
                </span>
                <span className={clsx("hidden text-sm sm:block", s.state === "live" ? "text-titanium/80" : "opacity-70")}>{s.coach}</span>
                <span className={clsx("hidden justify-self-end rounded-full border px-3 py-1 text-xs sm:block", s.state === "live" ? "border-titanium/30" : "border-ink/15")}>
                  {LABEL[s.program] ?? s.program}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-8 opacity-70">No classes for this filter on {day}. Open floor is available all day.</p>
        )}
      </div>
    </div>
  );
}
