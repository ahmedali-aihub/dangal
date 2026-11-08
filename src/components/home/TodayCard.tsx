"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SCHEDULE } from "@/content/data";
import { SITE } from "@/lib/site";

type Slot = (typeof SCHEDULE)[number]["slots"][number];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Current time in Hyderabad (IST) regardless of the visitor's device timezone. */
function nowIST() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: get("weekday"), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (s: string) => {
  const [hm, ap] = s.trim().split(" ");
  const [h, m] = hm.split(":").map(Number);
  return ((h % 12) + (ap === "PM" ? 12 : 0)) * 60 + (m || 0);
};

/** "5:30 – 6:30 AM" → start minutes (AM/PM taken from the end if missing on the start). */
const startOf = (time: string) => {
  const [a, b] = time.split("–").map((s) => s.trim());
  const ap = b.split(" ")[1];
  return toMin(a.includes(" ") ? a : `${a} ${ap}`);
};

export function TodayCard() {
  const [state, setState] = useState<{ open: boolean; day: string; upcoming: Slot[] } | null>(null);

  useEffect(() => {
    const tick = () => {
      const { day, minutes } = nowIST();
      const isSun = day === "Sun";
      const open = isSun ? minutes >= 360 && minutes < 720 : minutes >= 360 && minutes < 1320;
      const today = SCHEDULE.find((d) => d.day === day)?.slots ?? [];
      let upcoming = today.filter((s) => startOf(s.time) >= minutes).slice(0, 2);
      let label = "Today";
      if (!upcoming.length) {
        const next = DAYS[(DAYS.indexOf(day) + 1) % 7];
        upcoming = (SCHEDULE.find((d) => d.day === next)?.slots ?? []).slice(0, 2);
        label = "Tomorrow";
      }
      setState({ open, day: label, upcoming });
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="glass w-[330px] rounded-[22px] p-3 text-cream" aria-live="polite">
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-cream/40" aria-hidden />
      <div className="flex items-center justify-between px-2 pb-3 text-[12px] text-cream/75">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" aria-hidden /> Mehdipatnam, Hyderabad
        </span>
        {state && (
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${state.open ? "bg-coral shadow-[0_0_0_3px_rgba(255,107,91,0.25)]" : "bg-cream/40"}`} aria-hidden />
            {state.open ? "Open now" : "Closed"}
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {(state?.upcoming ?? []).map((s) => (
          <li key={s.time + s.name} className="rounded-2xl border border-cream/10 bg-cream/[0.07] px-4 py-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium">{s.name}</span>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <p className="text-[11px] text-cream/60">{state?.day}</p>
                <p className="text-xl tracking-tight">{s.time.split("–")[0].trim()}</p>
              </div>
              <span className="rounded-full bg-cream/15 px-2.5 py-1 text-[11px]">{s.program === "ALL" ? "Open" : s.program}</span>
              <div className="text-right">
                <p className="text-[11px] text-cream/60">Coach</p>
                <p className="text-[13px]">{s.coach.replace("Coach ", "")}</p>
              </div>
            </div>
          </li>
        ))}
        {!state && <li className="h-[172px] rounded-2xl bg-cream/[0.05]" aria-hidden />}
      </ul>
      <Link href="/schedule" className="mt-3 block px-2 pb-1 text-[12px] text-cream/75 hover:text-cream">
        Full timetable · {SITE.hours[0].label} →
      </Link>
    </div>
  );
}
