import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/sections/PageHero";
import { Reveal } from "@/components/ui/Motion";
import { Section } from "@/components/ui/Section";
import { POSTS } from "@/content/blog";
import { BLUR, IMG, img } from "@/lib/images";

export const metadata: Metadata = {
  title: "Blog — Training, Nutrition & Wellness",
  description: "Practical training, nutrition and wellness advice from the coaches at Dangal Gym, Hyderabad.",
  alternates: { canonical: "/blog" },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function BlogPage() {
  const [lead, ...rest] = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHero
        eyebrow="Journal"
        title={<>Notes from <span className="serif-accent">the floor.</span></>}
        intro="Straight answers on training, food and recovery — written by people who coach every day."
        image={IMG.bar}
        crumbs={[{ name: "Blog", path: "/blog" }]}
      />
      <Section tone="titanium" label="Articles">
        <div className="container-x">
          <Reveal>
            <Link href={`/blog/${lead.slug}`} className="group grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] bg-ink lg:col-span-7">
                <Image src={img(lead.image, 1400)} alt="" fill sizes="(min-width:1024px) 58vw, 100vw" placeholder="blur" blurDataURL={BLUR} className="object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
              <div className="lg:col-span-4 lg:col-start-9">
                <p className="text-sm opacity-70">
                  {lead.category} · {fmt(lead.date)} · {lead.readMins} min read
                </p>
                <h2 className="mt-4 text-[clamp(1.75rem,3vw,2.5rem)] font-light leading-[1.08] tracking-[-0.035em] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                  {lead.title}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed opacity-70">{lead.excerpt}</p>
              </div>
            </Link>
          </Reveal>

          <ul className="mt-20 grid gap-x-4 gap-y-14 border-t border-ink/10 pt-14 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal as="li" key={p.slug} delay={i * 0.06}>
                <Link href={`/blog/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-ink">
                    <Image src={img(p.image, 800)} alt="" fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" placeholder="blur" blurDataURL={BLUR} className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  </div>
                  <p className="mt-5 text-sm opacity-70">
                    {p.category} · {fmt(p.date)}
                  </p>
                  <h2 className="mt-2 text-xl font-normal tracking-[-0.02em] group-hover:underline group-hover:underline-offset-4">{p.title}</h2>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
