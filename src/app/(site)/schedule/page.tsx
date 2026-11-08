import type { Metadata } from "next";
import { FinalCta } from "@/components/sections/FinalCta";
import { PageHero } from "@/components/sections/PageHero";
import { Timetable } from "@/components/schedule/Timetable";
import { Section } from "@/components/ui/Section";
import { NEXT_BATCH_NOTE } from "@/content/data";
import { IMG } from "@/lib/images";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Class Schedule & Timetable",
  description: "Weekly class timetable at Dangal Gym, Mehdipatnam — men's, women-only, 40+ and kids' batches. Open 6 AM to 10 PM.",
  alternates: { canonical: "/schedule" },
};

export default function SchedulePage() {
  return (
    <>
      <PageHero
        eyebrow="Schedule"
        title={<>Find your <span className="serif-accent">batch.</span></>}
        intro="Coached batches run through the day. The floor is open for members during all opening hours."
        image={IMG.studio}
        crumbs={[{ name: "Schedule", path: "/schedule" }]}
      >
        <ul className="space-y-1 text-sm text-cream/80 lg:text-right">
          {SITE.hours.map((h) => (
            <li key={h.days}>
              {h.days} · {h.label}
            </li>
          ))}
        </ul>
      </PageHero>
      <Section tone="cream" label="Weekly timetable">
        <div className="container-x">
          <Timetable />
          <p className="mt-6 text-sm opacity-70">{NEXT_BATCH_NOTE} Timings may change on public holidays — we post updates on Instagram.</p>
        </div>
      </Section>
      <FinalCta />
      <div className="h-3 bg-cream" aria-hidden />
    </>
  );
}
