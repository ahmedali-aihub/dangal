import type { Metadata } from "next";
import Image from "next/image";
import { FinalCta } from "@/components/sections/FinalCta";
import { PageHero } from "@/components/sections/PageHero";
import { Reveal } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { TRAINING_TYPES } from "@/content/data";
import { BLUR, IMG, img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Training — Strength, Bodybuilding, Conditioning & Personal Training",
  description:
    "Strength & powerlifting, bodybuilding, Dangal conditioning, HIIT, personal training and mobility at Dangal Gym, Mehdipatnam, Hyderabad.",
  alternates: { canonical: "/training" },
};

const PROCESS = [
  { t: "Assess", d: "Movement screen, posture check, body composition and a conversation about goals, injuries and lifestyle." },
  { t: "Plan", d: "A written program matched to your level, schedule and the equipment you'll actually use." },
  { t: "Coach", d: "Technique-first coaching on the floor. Every new lift is taught before it is loaded." },
  { t: "Measure", d: "Monthly check-ins on strength, measurements and photos — then we adjust the plan." },
];

export default function TrainingPage() {
  return (
    <>
      <PageHero
        eyebrow="Training"
        title={<>Train with <span className="serif-accent">purpose.</span></>}
        intro="From your first deadlift to a contest prep, every style of training at Dangal is coached, programmed and measured."
        image={IMG.squat}
        crumbs={[{ name: "Training", path: "/training" }]}
      />

      <Section tone="cream" label="Training styles">
        <div className="container-x">
          <SectionHeading index="01" eyebrow="Disciplines" title="Six ways to get stronger." />
          <ul className="mt-14 grid gap-x-4 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {TRAINING_TYPES.map((t, i) => (
              <Reveal as="li" key={t.title} delay={(i % 3) * 0.06}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-navy">
                  <Image src={img(t.image, 900)} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" placeholder="blur" blurDataURL={BLUR} className="object-cover transition-transform duration-1000 hover:scale-105" />
                </div>
                <div className="mt-5 flex items-baseline gap-4">
                  <span className="text-xs tabular-nums opacity-70">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="text-xl font-normal tracking-[-0.02em]">{t.title}</h2>
                    <p className="mt-2 text-[15px] leading-relaxed opacity-70">{t.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="navy" label="Our coaching process" className="mx-2 rounded-[22px] sm:mx-3 sm:rounded-[28px]">
        <div className="container-x">
          <SectionHeading
            index="02"
            eyebrow="The method"
            title={<>Assess. Plan. Coach. <span className="serif-accent">Measure.</span></>}
            lede="Every member, every program, the same four steps. It's how we make sure effort becomes results."
          />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[22px] bg-cream/10 md:grid-cols-4">
            {PROCESS.map((s, i) => (
              <Reveal as="li" key={s.t} delay={i * 0.06} className="bg-navy p-8">
                <span className="text-[3.5rem] font-light leading-none tracking-[-0.05em] text-cream/45">{i + 1}</span>
                <h3 className="mt-10 text-xl tracking-[-0.02em]">{s.t}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-cream/70">{s.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="cream" label="Facility">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <SectionHeading index="03" eyebrow="The floor" title="Equipped for serious work." className="!block" />
            <ul className="mt-10 border-t border-navy/10 text-[15px]">
              {["Power racks & competition plates", "Full dumbbell range", "Plate-loaded & cable machines", "Conditioning zone — ropes, sleds, kettlebells", "Cardio deck", "Changing rooms & lockers"].map((x) => (
                <li key={x} className="border-b border-navy/10 py-4">
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs opacity-70">{/* PLACEHOLDER */}Owner to confirm the final equipment list.</p>
          </div>
          <Reveal delay={0.1} className="relative aspect-[5/4] overflow-hidden rounded-[22px] bg-navy lg:col-span-6 lg:col-start-7">
            <Image src={img(IMG.weights, 1200)} alt="Dumbbell racks on the Dangal Gym floor" fill sizes="(min-width:1024px) 50vw, 100vw" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
          </Reveal>
        </div>
      </Section>

      <FinalCta />
      <div className="h-3 bg-cream" aria-hidden />
    </>
  );
}
