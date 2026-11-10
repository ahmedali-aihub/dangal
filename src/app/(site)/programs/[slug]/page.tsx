import { Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCta } from "@/components/sections/FinalCta";
import { PageHero } from "@/components/sections/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Magnetic, Reveal } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { PROGRAMS, getProgram } from "@/content/programs";
import { BLUR, img } from "@/lib/images";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProgram((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name} — ${p.audience}`,
    description: `${p.tagline} ${p.philosophy[0].slice(0, 110)}… Dangal Gym, Mehdipatnam, Hyderabad.`,
    alternates: { canonical: `/programs/${p.slug}` },
    openGraph: { images: [img(p.image, 1200)] },
  };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProgram((await params).slug);
  if (!p) notFound();
  const others = PROGRAMS.filter((o) => o.slug !== p.slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: p.name,
          serviceType: "Fitness training program",
          audience: { "@type": "Audience", audienceType: p.audience },
          provider: { "@id": `${SITE.url}/#gym` },
          areaServed: "Hyderabad",
          description: p.tagline,
        }}
      />
      <PageHero
        eyebrow={`Signature program · ${p.audience}`}
        title={p.name}
        intro={p.tagline}
        image={p.image}
        crumbs={[
          { name: "Programs", path: "/programs" },
          { name: p.name, path: `/programs/${p.slug}` },
        ]}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 lg:justify-end">
          <Magnetic>
            <ButtonLink href={`/contact?program=${p.slug}#trial`} variant="ember" size="lg" arrow>
              Join this program
            </ButtonLink>
          </Magnetic>
          <a href="#schedule" className="text-sm text-titanium/80 hover:text-titanium">
            See schedule ↓
          </a>
        </div>
      </PageHero>

      {/* Philosophy */}
      <Section tone="titanium" label="Philosophy">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow opacity-70">
              <span className="tabular-nums">01</span>Philosophy
            </p>
          </Reveal>
          <div className="space-y-8 lg:col-span-8 lg:col-start-5">
            {p.philosophy.map((para, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p className={i === 0 ? "text-[clamp(1.4rem,2.6vw,2.2rem)] font-light leading-[1.2] tracking-[-0.03em]" : "lede opacity-75"}>{para}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Workouts */}
      <Section tone="ink" label="Workouts" className="mx-2 rounded-[22px] sm:mx-3 sm:rounded-[28px]">
        <div className="container-x">
          <SectionHeading index="02" eyebrow="The work" title={<>What you&apos;ll <span className="serif-accent">train.</span></>} />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[22px] bg-titanium/10 sm:grid-cols-2">
            {p.workouts.map((w, i) => (
              <Reveal as="li" key={w.title} delay={(i % 2) * 0.06} className="bg-ink p-8 sm:p-10">
                <span className="text-xs tabular-nums text-titanium/65">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 text-2xl font-light tracking-[-0.03em]">{w.title}</h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-titanium/70">{w.detail}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* Benefits + ideal for */}
      <Section tone="titanium" label="Benefits">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading index="03" eyebrow="Benefits" title="What changes." className="!block" />
            <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[22px] bg-ink">
              <Image src={img(p.image, 900)} alt="" fill sizes="(min-width:1024px) 40vw, 100vw" placeholder="blur" blurDataURL={BLUR} className="object-cover object-top" />
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="border-t border-ink/10">
              {p.benefits.map((b, i) => (
                <Reveal as="li" key={b} delay={i * 0.04} className="flex items-center gap-5 border-b border-ink/10 py-5 text-lg tracking-[-0.015em]">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-titanium">
                    <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  {b}
                </Reveal>
              ))}
            </ul>
            <div className="mt-12">
              <p className="eyebrow opacity-70">Ideal for</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.idealFor.map((x) => (
                  <li key={x} className="rounded-full border border-ink/20 px-4 py-2 text-sm">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            {p.slug === "fittest-elder" && (
              <p className="mt-8 text-xs opacity-70">
                Please consult your doctor before starting a new exercise program, especially if you have a medical condition.
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* Schedule */}
      <Section tone="sand" id="schedule" label="Schedule">
        <div className="container-x">
          <SectionHeading
            index="04"
            eyebrow="Schedule"
            title="When we train."
            action={<ButtonLink href="/schedule" variant="outline-ink" arrow>Full timetable</ButtonLink>}
          />
          <div className="mt-12 overflow-hidden rounded-[22px] bg-titanium">
            <table className="w-full text-left text-[15px]">
              <caption className="sr-only">{p.name} batch timings</caption>
              <thead className="text-xs uppercase tracking-eyebrow opacity-70">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Days</th>
                  <th scope="col" className="px-6 py-4 font-medium">Time</th>
                  <th scope="col" className="hidden px-6 py-4 font-medium sm:table-cell">Focus</th>
                </tr>
              </thead>
              <tbody>
                {p.schedule.map((s) => (
                  <tr key={s.days + s.time} className="border-t border-ink/10">
                    <td className="px-6 py-5">{s.days}</td>
                    <td className="px-6 py-5 tabular-nums">
                      {s.time}
                      <span className="mt-1 block text-sm opacity-70 sm:hidden">{s.focus}</span>
                    </td>
                    <td className="hidden px-6 py-5 opacity-75 sm:table-cell">{s.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Other programs */}
      <Section tone="titanium" label="Other programs">
        <div className="container-x">
          <p className="eyebrow opacity-70">Other programs</p>
          <ul className="mt-8 grid border-t border-ink/10 sm:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug} className="border-b border-ink/10 sm:border-b-0 sm:border-r sm:last:border-r-0">
                <Link href={`/programs/${o.slug}`} className="group block py-8 sm:px-6 sm:first:pl-0">
                  <p className="text-xs opacity-70">{o.audience}</p>
                  <p className="mt-2 text-xl tracking-[-0.02em] group-hover:underline group-hover:underline-offset-4">{o.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta title={<>Ready to say <span className="serif-accent">“I am the fittest”?</span></>} />
      <div className="h-3 bg-titanium" aria-hidden />
    </>
  );
}
