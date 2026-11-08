"use client";

import { clsx } from "clsx";
import { ArrowLeft, ArrowUpRight, Check, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SocialIcon } from "@/components/layout/SocialIcon";
import { DIET_PLANS, SCHEDULE } from "@/content/data";
import { PROGRAMS } from "@/content/programs";
import { BLUR, img } from "@/lib/images";
import { whatsappLink } from "@/lib/site";
import { bucketOf, type TimeBucket } from "@/lib/time";

type Who = "man" | "woman" | "elder" | "kid";
type Goal = "fat" | "muscle" | "fitness" | "health";
type Level = "new" | "some" | "pro";
type Answers = { who?: Who; goal?: Goal; level?: Level; time?: TimeBucket };

const STEPS = [
  {
    key: "who",
    q: "Who's training?",
    options: [
      { v: "man", l: "Me — a man, 16–40" },
      { v: "woman", l: "Me — a woman, 16–45" },
      { v: "elder", l: "Me — 40 or older" },
      { v: "kid", l: "My child, 7–15" },
    ],
  },
  {
    key: "goal",
    q: "What matters most right now?",
    options: [
      { v: "fat", l: "Lose fat" },
      { v: "muscle", l: "Build muscle & strength" },
      { v: "fitness", l: "Get fit & energetic" },
      { v: "health", l: "Mobility & long-term health" },
    ],
  },
  {
    key: "level",
    q: "How much training experience?",
    options: [
      { v: "new", l: "Brand new / returning after years" },
      { v: "some", l: "Some — I've trained before" },
      { v: "pro", l: "Experienced — I want to push" },
    ],
  },
  {
    key: "time",
    q: "When can you usually train?",
    options: [
      { v: "early", l: "Early morning, before 8" },
      { v: "morning", l: "Late morning / afternoon" },
      { v: "evening", l: "Evening, after work or school" },
    ],
  },
] as const;

const PROGRAM_FOR: Record<Who, { slug: string; code: string }> = {
  man: { slug: "fittest-man", code: "MAN" },
  woman: { slug: "fittest-woman", code: "WOMAN" },
  elder: { slug: "fittest-elder", code: "ELDER" },
  kid: { slug: "fittest-kid", code: "KID" },
};
const PLAN_FOR: Record<Level, { name: string; why: string }> = {
  new: { name: "Quarterly · ₹8,000", why: "Three months is the sweet spot to build the habit and see real change — and you save ₹4,000 vs monthly." },
  some: { name: "Half Yearly · ₹12,000", why: "Long enough for a proper strength block. Works out to ₹2,000 a month — half the monthly rate." },
  pro: { name: "Yearly · ₹18,000", why: "Our best choice: just ₹1,500 a month, a full year of progress and ₹30,000 saved vs monthly." },
};
const DIET_FOR: Record<Goal, string> = { fat: "Lean & Shred", muscle: "Lean Mass", fitness: "Balanced Vegetarian", health: "40+ Heart-Smart" };

function recommend(a: Required<Answers>) {
  const prog = PROGRAMS.find((p) => p.slug === PROGRAM_FOR[a.who].slug)!;
  const code = PROGRAM_FOR[a.who].code;
  const all = SCHEDULE.flatMap((d) => d.slots.filter((s) => s.program === code).map((s) => ({ ...s, day: d.day })));
  // Group the same class across days: "Mon · Wed · Fri — 7:00 – 8:30 PM"
  const grouped = new Map<string, { name: string; time: string; coach: string; days: string[] }>();
  for (const s of all) {
    const k = s.name + s.time;
    const g = grouped.get(k) ?? { name: s.name, time: s.time, coach: s.coach, days: [] };
    g.days.push(s.day);
    grouped.set(k, g);
  }
  const batches = [...grouped.values()];
  const matching = batches.filter((b) => bucketOf(b.time) === a.time);
  return {
    prog,
    plan: PLAN_FOR[a.level],
    diet: DIET_PLANS.find((d) => d.name === DIET_FOR[a.goal]) ?? DIET_PLANS[0],
    batches: (matching.length ? matching : batches).slice(0, 3),
    exactTime: matching.length > 0,
  };
}

export function ProgramFinder() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const done = step >= STEPS.length;
  const result = done ? recommend(a as Required<Answers>) : null;

  const choose = (key: string, v: string) => {
    setA((prev) => ({ ...prev, [key]: v }));
    setStep((s) => s + 1);
  };

  return (
    <div className="grid overflow-hidden rounded-[26px] bg-navy text-cream lg:grid-cols-12">
      {/* Left rail: title + progress */}
      <div className="relative flex flex-col justify-between gap-10 overflow-hidden p-7 sm:p-10 lg:col-span-5">
        <div aria-hidden className="fluted absolute inset-0 opacity-50" />
        <div className="relative">
          <p className="eyebrow text-cream/75">Program finder</p>
          <h2 className="display-md mt-5">
            Not sure where to start? <span className="serif-accent">Ask the coach.</span>
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-cream/75">Four quick questions. We&apos;ll match your program, plan, diet and best batch timings.</p>
        </div>
        <ol className="relative space-y-3" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s.key} className={clsx("flex items-center gap-3 text-sm transition-opacity duration-300", i <= step ? "opacity-100" : "opacity-70")}>
              <span
                className={clsx(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums transition-all duration-500",
                  i < step ? "border-coral bg-coral text-navy" : i === step ? "border-cream" : "border-cream/30",
                )}
              >
                {i < step ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
              </span>
              <span className={clsx(i === step && "font-medium")}>{s.q}</span>
              {i < step && <span className="sr-only">(answered)</span>}
            </li>
          ))}
        </ol>
      </div>

      {/* Right: question or result */}
      <div className="bg-cream-50 p-5 text-navy sm:p-8 lg:col-span-7 lg:p-10" aria-live="polite">
        {!done ? (
          <div key={step} className="fade-up flex h-full flex-col">
            <div className="flex items-center justify-between text-sm">
              <span className="tabular-nums opacity-70">
                Question {step + 1} of {STEPS.length}
              </span>
              {step > 0 && (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 opacity-75 hover:bg-navy/5 hover:opacity-100">
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Back
                </button>
              )}
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-navy/10">
              <div className="h-full rounded-full bg-coral transition-[width] duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]" style={{ width: `${(step / STEPS.length) * 100}%` }} />
            </div>
            <h3 className="mt-8 text-[clamp(1.6rem,3vw,2.4rem)] font-light leading-[1.1] tracking-[-0.035em]">{STEPS[step].q}</h3>
            <div role="radiogroup" aria-label={STEPS[step].q} className="mt-8 grid gap-3 sm:grid-cols-2">
              {STEPS[step].options.map((o, i) => {
                const selected = a[STEPS[step].key as keyof Answers] === o.v;
                return (
                  <button
                    key={o.v}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => choose(STEPS[step].key, o.v)}
                    className={clsx(
                      "fade-up group flex min-h-[64px] items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left text-[15px] transition-all duration-300 hover:-translate-y-0.5 hover:border-navy hover:shadow-soft",
                      selected ? "border-navy bg-navy text-cream" : "border-navy/15 bg-white",
                    )}
                    style={{ ["--delay" as string]: `${0.05 + i * 0.05}s` }}
                  >
                    {o.l}
                    <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 transition-all duration-300 group-hover:rotate-45 group-hover:opacity-70" aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          result && (
            <div className="fade-up">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-70">Your match</span>
                <button
                  type="button"
                  onClick={() => {
                    setA({});
                    setStep(0);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 opacity-75 hover:bg-navy/5 hover:opacity-100"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden /> Start over
                </button>
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-[180px_1fr]">
                <div className="reveal-img relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy sm:aspect-[4/5]">
                  <Image src={img(result.prog.image, 500)} alt="" fill sizes="180px" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-eyebrow opacity-70">{result.prog.audience}</p>
                  <h3 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-light leading-[1.05] tracking-[-0.035em]">{result.prog.name}</h3>
                  <p className="mt-2 text-[15px] opacity-80">{result.prog.tagline}</p>
                </div>
              </div>

              <dl className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-navy/10 text-sm sm:grid-cols-2">
                <div className="bg-white p-4">
                  <dt className="text-xs uppercase tracking-[0.08em] opacity-70">Recommended plan</dt>
                  <dd className="mt-1 font-medium">{result.plan.name}</dd>
                  <dd className="mt-1 opacity-75">{result.plan.why}</dd>
                </div>
                <div className="bg-white p-4">
                  <dt className="text-xs uppercase tracking-[0.08em] opacity-70">Nutrition starting point</dt>
                  <dd className="mt-1 font-medium">{result.diet.name}</dd>
                  <dd className="mt-1 opacity-75">
                    {result.diet.kcal} kcal · {result.diet.goal}
                  </dd>
                </div>
                <div className="bg-white p-4 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.08em] opacity-70">{result.exactTime ? "Batches at your time" : "Closest batches"}</dt>
                  <dd>
                    <ul className="mt-2 space-y-1.5">
                      {result.batches.map((b) => (
                        <li key={b.name + b.time} className="flex flex-wrap justify-between gap-x-4">
                          <span>
                            {b.name} <span className="opacity-70">· {b.coach}</span>
                          </span>
                          <span className="tabular-nums opacity-80">
                            {b.days.join(" · ")} · {b.time}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/contact?program=${result.prog.slug}#trial`}
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-coral px-6 text-sm font-semibold text-navy shadow-[0_10px_30px_-10px_rgba(255,107,91,0.8)] transition-colors hover:bg-coral-400"
                >
                  <span className="roll" data-text="Book my free trial">
                    <span>Book my free trial</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </Link>
                <a
                  href={whatsappLink(`Hi Dangal Gym! The program finder matched me with ${result.prog.name} (${result.plan.name} plan). I'd like to book a free trial.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-navy/20 px-5 text-sm transition-colors hover:border-navy"
                >
                  <SocialIcon name="whatsapp" /> Send to WhatsApp
                </a>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
