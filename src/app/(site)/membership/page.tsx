import type { Metadata } from "next";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { PageHero } from "@/components/sections/PageHero";
import { PlanCards } from "@/components/sections/PlanCards";
import { Section, SectionHeading } from "@/components/ui/Section";
import { FAQS, NEXT_BATCH_NOTE } from "@/content/data";
import { getPlans } from "@/lib/data";
import { IMG } from "@/lib/images";

export const metadata: Metadata = {
  title: "Membership & Pricing — Gym Fees in Mehdipatnam",
  description:
    "Transparent gym membership fees at Dangal Gym, Mehdipatnam, Hyderabad. Monthly, quarterly, half-yearly and annual plans with group classes and assessments included.",
  alternates: { canonical: "/membership" },
};

export const revalidate = 300;

const INCLUDED = [
  "Full access to the strength & conditioning floor",
  "Group classes in your program",
  "Onboarding assessment & orientation",
  "Locker room & showers",
  "Coach on the floor during all batches",
  "Member WhatsApp community & challenges",
];

const ADDONS = [
  ["Personal training (12 sessions)", "On request"],
  ["Personalised diet plan", "On request"],
  ["Body composition analysis", "On request"],
  ["Couple / family membership", "Ask at front desk"],
];

export default async function MembershipPage() {
  const plans = await getPlans();
  return (
    <>
      <PageHero
        eyebrow="Membership"
        title={<>Invest in the <span className="serif-accent">strongest</span> version of you.</>}
        intro="Clear, honest pricing. No joining-fee surprises. Choose a plan, book a free trial first if you'd like."
        image={IMG.racks}
        crumbs={[{ name: "Membership", path: "/membership" }]}
      >
        <p className="text-sm text-cream/70 lg:text-right">{NEXT_BATCH_NOTE}</p>
      </PageHero>

      <Section tone="cream" label="Plans" className="pb-8 sm:pb-12 lg:pb-12">
        <div className="container-x">
          <h2 className="sr-only">Membership plans</h2>
          <div className="rounded-[26px] bg-navy p-4 sm:p-6">
            <PlanCards plans={plans} reveal={false} />
          </div>
          <p className="mt-4 text-xs opacity-70">Prices in INR, inclusive of applicable taxes unless stated at the front desk.</p>
        </div>
      </Section>

      <Section tone="cream" label="What's included">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading index="01" eyebrow="Every plan includes" title="The essentials, done properly." className="!block" />
          </div>
          <ul className="grid gap-px overflow-hidden rounded-[22px] bg-navy/10 sm:grid-cols-2 lg:col-span-7">
            {INCLUDED.map((x) => (
              <li key={x} className="bg-cream p-6 text-[15px]">
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="container-x mt-20 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading index="02" eyebrow="Add-ons" title="Go further." className="!block" />
          </div>
          <ul className="border-t border-navy/10 lg:col-span-7">
            {ADDONS.map(([k, v]) => (
              <li key={k} className="flex justify-between gap-6 border-b border-navy/10 py-5 text-[15px]">
                <span>{k}</span>
                <span className="opacity-70">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="sand" label="Membership FAQ">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow opacity-70">FAQ</p>
            <h2 className="display-md mt-5">Before you join.</h2>
          </div>
          <div className="lg:col-span-8">
            <Faq items={FAQS.slice(1)} />
          </div>
        </div>
      </Section>

      <div className="h-3 bg-cream" aria-hidden />
      <FinalCta />
      <div className="h-3 bg-cream" aria-hidden />
    </>
  );
}
