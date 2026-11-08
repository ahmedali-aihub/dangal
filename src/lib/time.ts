/** Time helpers for the class timetable. All gym times are Hyderabad time (IST). */

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Current weekday + minutes since midnight in IST, independent of the visitor's device timezone. */
export function nowIST(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: get("weekday"), minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

const toMin = (s: string) => {
  const [hm, ap] = s.trim().split(/\s+/);
  const [h, m] = hm.split(":").map(Number);
  return ((h % 12) + (ap === "PM" ? 12 : 0)) * 60 + (m || 0);
};

/** "5:30 – 6:30 AM" / "11:00 AM – 12:00 PM" → [startMin, endMin]. A missing AM/PM on the start borrows the end's. */
export function parseRange(range: string): [number, number] {
  const [a, b] = range.split(/[–-]/).map((s) => s.trim());
  const endAp = b.split(/\s+/)[1];
  let start = toMin(/\s(AM|PM)$/.test(a) ? a : `${a} ${endAp}`);
  const end = toMin(b);
  if (start > end) start -= 12 * 60; // e.g. "11:00 – 12:30 PM"
  return [start, end];
}

export type SlotState = "live" | "next" | "past" | "later";

/** Classify a day's slots relative to now: which is live, which is up next. */
export function slotStates(times: string[], minutes: number): SlotState[] {
  let nextFound = false;
  return times.map((t) => {
    const [s, e] = parseRange(t);
    if (minutes >= s && minutes < e) return "live";
    if (minutes >= e) return "past";
    if (!nextFound) {
      nextFound = true;
      return "next";
    }
    return "later";
  });
}

export type TimeBucket = "early" | "morning" | "evening";
export const bucketOf = (range: string): TimeBucket => {
  const [s] = parseRange(range);
  return s < 8 * 60 ? "early" : s < 14 * 60 ? "morning" : "evening";
};
