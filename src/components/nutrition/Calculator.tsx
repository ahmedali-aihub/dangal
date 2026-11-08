"use client";

import { clsx } from "clsx";
import { useMemo, useState } from "react";

const ACTIVITY = [
  { k: 1.2, label: "Sedentary", hint: "Desk job, little exercise" },
  { k: 1.375, label: "Light", hint: "1–3 workouts / week" },
  { k: 1.55, label: "Moderate", hint: "3–5 workouts / week" },
  { k: 1.725, label: "Very active", hint: "6–7 hard sessions / week" },
];

const GOALS = [
  { k: -500, label: "Lose fat" },
  { k: 0, label: "Maintain" },
  { k: 300, label: "Build muscle" },
];

/** BMI uses Asian cut-offs (WHO expert consultation) which suit Indian body composition better. */
function bmiBand(bmi: number) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 23) return "Healthy range";
  if (bmi < 25) return "Overweight (Asian cut-off)";
  return "Obese range (Asian cut-off)";
}

const field =
  "h-12 w-full rounded-xl border border-navy/15 bg-cream-50 px-4 text-[15px] text-navy outline-none transition focus:border-navy";

export function Calculator() {
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState("28");
  const [height, setHeight] = useState("172");
  const [weight, setWeight] = useState("75");
  const [act, setAct] = useState(1.55);
  const [goal, setGoal] = useState(0);

  const r = useMemo(() => {
    const a = Number(age), h = Number(height), w = Number(weight);
    if (!(a >= 10 && a <= 100 && h >= 100 && h <= 230 && w >= 25 && w <= 250)) return null;
    const bmi = w / (h / 100) ** 2;
    // Mifflin–St Jeor
    const bmr = 10 * w + 6.25 * h - 5 * a + (sex === "male" ? 5 : -161);
    const tdee = bmr * act;
    const target = Math.max(sex === "male" ? 1500 : 1200, tdee + goal);
    const protein = Math.round(w * (goal > 0 ? 1.8 : 1.6));
    const fat = Math.round((target * 0.25) / 9);
    const carbs = Math.max(0, Math.round((target - protein * 4 - fat * 9) / 4));
    return { bmi, bmr: Math.round(bmr), tdee: Math.round(tdee), target: Math.round(target), protein, fat, carbs };
  }, [sex, age, height, weight, act, goal]);

  return (
    <div className="grid overflow-hidden rounded-[24px] bg-cream text-navy shadow-soft lg:grid-cols-2">
      <form className="space-y-6 p-6 sm:p-10" onSubmit={(e) => e.preventDefault()} aria-label="BMI and calorie calculator">
        <fieldset>
          <legend className="text-sm font-medium">Sex</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["male", "female"] as const).map((s) => (
              <label key={s} className={clsx("flex h-12 cursor-pointer items-center justify-center rounded-xl border text-sm capitalize transition", sex === s ? "border-navy bg-navy text-cream" : "border-navy/15 hover:border-navy/40")}>
                <input type="radio" name="sex" value={s} checked={sex === s} onChange={() => setSex(s)} className="sr-only" />
                {s}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-3 gap-3">
          {[
            ["Age", age, setAge, "yrs"],
            ["Height", height, setHeight, "cm"],
            ["Weight", weight, setWeight, "kg"],
          ].map(([label, val, set, unit]) => (
            <label key={label as string} className="block">
              <span className="text-sm font-medium">{label as string}</span>
              <span className="relative mt-2 block">
                <input
                  type="number"
                  inputMode="decimal"
                  value={val as string}
                  onChange={(e) => (set as (v: string) => void)(e.target.value)}
                  className={clsx(field, "pr-10")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-70">{unit as string}</span>
              </span>
            </label>
          ))}
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Activity</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {ACTIVITY.map((a) => (
              <label key={a.k} className={clsx("cursor-pointer rounded-xl border px-4 py-3 transition", act === a.k ? "border-navy bg-navy text-cream" : "border-navy/15 hover:border-navy/40")}>
                <input type="radio" name="activity" checked={act === a.k} onChange={() => setAct(a.k)} className="sr-only" />
                <span className="block text-sm">{a.label}</span>
                <span className="block text-xs opacity-65">{a.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium">Goal</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {GOALS.map((g) => (
              <label key={g.k} className={clsx("flex h-12 cursor-pointer items-center justify-center rounded-xl border text-sm transition", goal === g.k ? "border-navy bg-navy text-cream" : "border-navy/15 hover:border-navy/40")}>
                <input type="radio" name="goal" checked={goal === g.k} onChange={() => setGoal(g.k)} className="sr-only" />
                {g.label}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      <div className="flex flex-col bg-navy p-6 text-cream sm:p-10" aria-live="polite">
        {r ? (
          <>
            <div className="grid grid-cols-2 gap-6 border-b border-cream/15 pb-8">
              <div>
                <p className="text-sm text-cream/60">BMI</p>
                <p className="mt-2 text-5xl font-light tracking-[-0.05em]">{r.bmi.toFixed(1)}</p>
                <p className="mt-2 text-sm text-cream/80">{bmiBand(r.bmi)}</p>
              </div>
              <div>
                <p className="text-sm text-cream/60">Daily target</p>
                <p className="mt-2 text-5xl font-light tracking-[-0.05em]">{r.target.toLocaleString("en-IN")}</p>
                <p className="mt-2 text-sm text-cream/80">kcal / day</p>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-4 py-8">
              {[
                ["Protein", r.protein],
                ["Carbs", r.carbs],
                ["Fat", r.fat],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-sm text-cream/60">{k}</dt>
                  <dd className="mt-1 text-2xl font-light tracking-[-0.03em]">
                    {v}
                    <span className="text-sm text-cream/60"> g</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-cream/60">
              Maintenance ≈ {r.tdee.toLocaleString("en-IN")} kcal · BMR ≈ {r.bmr.toLocaleString("en-IN")} kcal
            </p>
          </>
        ) : (
          <p className="text-cream/75">Enter a valid age (10–100), height (100–230 cm) and weight (25–250 kg).</p>
        )}
        <p className="mt-auto pt-10 text-xs leading-relaxed text-cream/65">
          Estimates only (Mifflin–St Jeor equation, Asian BMI cut-offs). Not medical advice — consult a doctor or registered
          dietitian for a personalised plan, especially if you are pregnant or have a medical condition.
        </p>
      </div>
    </div>
  );
}
