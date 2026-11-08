import type { Metadata } from "next";
import { FinalCta } from "@/components/sections/FinalCta";
import { PageHero } from "@/components/sections/PageHero";
import { TrainerGrid } from "@/components/sections/TrainerGrid";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getTrainers } from "@/lib/data";
import { IMG } from "@/lib/images";

export const metadata: Metadata = {
  title: "Trainers — Certified Coaches in Mehdipatnam",
  description: "Meet the certified strength, bodybuilding, women's fitness, kids and senior fitness coaches at Dangal Gym, Hyderabad.",
  alternates: { canonical: "/trainers" },
};

export const revalidate = 300;

export default async function TrainersPage() {
  const trainers = await getTrainers();
  return (
    <>
      <PageHero
        eyebrow="The coaches"
        title={<>Coaching is the <span className="serif-accent">difference.</span></>}
        intro="Equipment is everywhere. Great coaching isn't. Our trainers teach technique first, program with intent and hold you accountable."
        image={IMG.monochrome}
        crumbs={[{ name: "Trainers", path: "/trainers" }]}
      />
      <Section tone="cream" label="Trainers" className="pt-16 sm:pt-20 lg:pt-24">
        <div className="container-x">
          <SectionHeading
            index="01"
            eyebrow="The team"
            title={<>Specialists for every <span className="serif-accent">stage of life.</span></>}
            lede="Strength, hypertrophy, women's fitness, kids and 40+ — every coach is certified, and every program has a dedicated lead."
          />
          <div className="mt-14">
            <TrainerGrid trainers={trainers} detailed />
          </div>
        </div>
      </Section>
      <FinalCta title={<>Train with a coach <span className="serif-accent">this week.</span></>} />
      <div className="h-3 bg-cream" aria-hidden />
    </>
  );
}
