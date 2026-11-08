import type { Metadata } from "next";
import { Calculator } from "@/components/nutrition/Calculator";
import { FinalCta } from "@/components/sections/FinalCta";
import { PageHero } from "@/components/sections/PageHero";
import { Reveal } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { DIET_PLANS, SUPPLEMENT_GUIDE } from "@/content/data";
import { IMG } from "@/lib/images";

export const metadata: Metadata = {
  title: "Nutrition — Indian Diet Plans, Supplements & BMI Calculator",
  description:
    "Indian-diet-friendly meal plans for fat loss and muscle gain, honest supplement guidance and a free BMI & calorie calculator from Dangal Gym, Hyderabad.",
  alternates: { canonical: "/nutrition" },
};

export default function NutritionPage() {
  return (
    <>
      <PageHero
        eyebrow="Nutrition"
        title={<>You can&apos;t out-train <span className="serif-accent">your plate.</span></>}
        intro="Real food, Indian kitchens, sustainable habits. Start with the calculator, then explore sample plans our coaches use as a starting point."
        image={IMG.floor}
        crumbs={[{ name: "Nutrition", path: "/nutrition" }]}
      />

      <Section tone="sand" id="calculator" label="BMI and calorie calculator">
        <div className="container-x">
          <SectionHeading
            index="01"
            eyebrow="Calculator"
            title="Know your numbers."
            lede="Get your BMI, daily calorie target and a macro split in seconds. Your data never leaves your device."
          />
          <div className="mt-12">
            <Calculator />
          </div>
        </div>
      </Section>

      <Section tone="cream" label="Diet plans">
        <div className="container-x">
          <SectionHeading index="02" eyebrow="Sample plans" title={<>Built for <span className="serif-accent">Indian</span> kitchens.</>} />
          <ul className="mt-14 grid gap-3 md:grid-cols-2">
            {DIET_PLANS.map((d, i) => (
              <Reveal as="li" key={d.name} delay={(i % 2) * 0.06} className="rounded-[22px] border border-navy/10 bg-cream-50 p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-eyebrow opacity-70">{d.goal}</p>
                    <h3 className="mt-2 text-2xl font-light tracking-[-0.03em]">{d.name}</h3>
                  </div>
                  <p className="rounded-full bg-navy px-3 py-1 text-xs text-cream">{d.kcal} kcal</p>
                </div>
                <p className="mt-4 text-sm opacity-65">{d.macros}</p>
                <ul className="mt-6 space-y-2.5 border-t border-navy/10 pt-6 text-[15px]">
                  {d.meals.map((m) => {
                    const [k, v] = m.split(": ");
                    return (
                      <li key={m} className="grid grid-cols-[110px_1fr] gap-3">
                        <span className="opacity-70">{k}</span>
                        <span>{v}</span>
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            ))}
          </ul>
          <p className="mt-6 text-xs opacity-70">
            Sample plans for healthy adults. Members get a personalised plan from our coaches after assessment.
          </p>
        </div>
      </Section>

      <Section tone="navy" label="Supplement guidance" className="mx-2 rounded-[22px] sm:mx-3 sm:rounded-[28px]">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading index="03" eyebrow="Supplements" title={<>Food first. <span className="serif-accent">Then</span> supplements.</>} className="!block" />
            <p className="lede mt-8 text-cream/75">
              Supplements fill gaps — they don&apos;t replace meals, sleep or training. We never pressure members to buy anything.
            </p>
          </div>
          <ul className="border-t border-cream/15 lg:col-span-6 lg:col-start-7">
            {SUPPLEMENT_GUIDE.map((s) => (
              <li key={s.name} className="grid gap-2 border-b border-cream/15 py-6 sm:grid-cols-[200px_1fr]">
                <span className="text-lg tracking-[-0.015em]">{s.name}</span>
                <span className="text-[15px] leading-relaxed text-cream/70">{s.note}</span>
              </li>
            ))}
            <li className="pt-6 text-xs text-cream/65">
              General information, not medical advice. Check with your doctor before taking supplements, particularly if you are
              under 18, pregnant, or on medication.
            </li>
          </ul>
        </div>
      </Section>

      <div className="h-20 bg-cream" aria-hidden />
      <FinalCta title={<>Get a plan made <span className="serif-accent">for you.</span></>} body="Book a free session and our coaches will assess you and build a personalised training and nutrition plan." />
      <div className="h-3 bg-cream" aria-hidden />
    </>
  );
}
