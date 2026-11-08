import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProgramFinder } from "@/components/home/ProgramFinder";
import { FinalCta } from "@/components/sections/FinalCta";
import { PageHero } from "@/components/sections/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Motion";
import { Section } from "@/components/ui/Section";
import { PROGRAMS } from "@/content/programs";
import { BLUR, IMG, img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Signature Programs — Men, Women, 40+ and Kids",
  description:
    "I AM THE FITTEST MAN, WOMAN, ELDER (40+) and KID — four coached fitness programs at Dangal Gym, Mehdipatnam, Hyderabad.",
  alternates: { canonical: "/programs" },
};

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Signature programs"
        title={<>I am the <span className="serif-accent">fittest.</span></>}
        intro="Four programs, each designed around a stage of life. Different coaching, different schedules — the same standard of discipline."
        image={IMG.floor2}
        crumbs={[{ name: "Programs", path: "/programs" }]}
      />

      <Section tone="cream" label="All programs">
        <div className="container-x space-y-24 sm:space-y-32">
          {PROGRAMS.map((p, i) => (
            <article key={p.slug} className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <Reveal variant="image" className={`relative aspect-[4/3] overflow-hidden rounded-[22px] bg-navy lg:col-span-7 ${i % 2 ? "lg:order-2 lg:col-start-6" : ""}`}>
                <Link href={`/programs/${p.slug}`} tabIndex={-1} aria-hidden className="group absolute inset-0 block">
                  <Image src={img(p.image, 1400)} alt="" fill sizes="(min-width:1024px) 58vw, 100vw" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
                  <span className="absolute inset-0 bg-navy/25 transition-colors duration-700 group-hover:bg-navy/10" />
                  <span className="absolute bottom-5 left-5 rounded-full bg-cream/90 px-4 py-2 text-xs text-navy opacity-0 backdrop-blur transition-all duration-500 group-hover:opacity-100">
                    View program →
                  </span>
                </Link>
              </Reveal>
              <Reveal delay={0.08} className={`lg:col-span-4 ${i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}>
                <p className="eyebrow opacity-70">
                  <span className="tabular-nums">0{i + 1}</span>
                  {p.audience}
                </p>
                <h2 className="mt-5 text-[clamp(1.9rem,3.6vw,3rem)] font-light leading-[1.02] tracking-[-0.04em]">{p.name}</h2>
                <p className="mt-5 text-[15px] leading-relaxed opacity-75">{p.philosophy[0]}</p>
                <ul className="mt-6 space-y-2 border-t border-navy/10 pt-6 text-sm">
                  {p.workouts.slice(0, 3).map((w) => (
                    <li key={w.title} className="flex justify-between gap-4">
                      <span>{w.title}</span>
                      <span aria-hidden className="opacity-30">—</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <ButtonLink href={`/programs/${p.slug}`} variant="navy" arrow>
                    Explore program
                  </ButtonLink>
                  <Link href={`/contact?program=${p.slug}#trial`} className="link-underline text-sm">
                    Book a trial
                  </Link>
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      </Section>
      <Section tone="sand" label="Program finder" id="finder">
        <div className="container-x">
          <ProgramFinder />
        </div>
      </Section>
      <div className="h-3 bg-cream" aria-hidden />
      <FinalCta />
      <div className="h-3 bg-cream" aria-hidden />
    </>
  );
}
