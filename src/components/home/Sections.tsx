import { Flame, LineChart, Salad, ShieldCheck, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SocialIcon } from "@/components/layout/SocialIcon";
import { ButtonLink, ExternalButton } from "@/components/ui/Button";
import { Counter, Parallax, Reveal, SplitText } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { STATS, WHY } from "@/content/data";
import { BLUR, IMG, img } from "@/lib/images";
import { SITE } from "@/lib/site";
import type { GalleryItem } from "@/lib/types";
import { SpotlightList } from "./SpotlightList";

/* ───────────── Manifesto + animated stats ───────────── */
export function Intro() {
  return (
    <Section tone="cream" label="About Dangal Gym">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow opacity-70">Dangal · दंगल</p>
            <p className="mt-4 text-sm leading-relaxed opacity-70">
              <em>noun</em> — a wrestling bout held in the akhara; a contest of strength, skill and spirit.
            </p>
          </Reveal>
          <div className="lg:col-span-9">
            <SplitText as="p" mode="scrub" className="block text-[clamp(1.6rem,3.3vw,2.9rem)] font-light leading-[1.15] tracking-[-0.035em] text-balance">
              We built Dangal on the discipline of the akhara — show up, respect the work, get stronger than yesterday —
              and paired it with <span className="serif-accent">modern coaching</span> that measures every rep, meal and milestone.
            </SplitText>
          </div>
        </div>

        <dl className="mt-20 grid grid-cols-2 border-t border-navy/10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.06}
              className={`border-b border-navy/10 py-8 lg:border-b-0 ${i % 2 === 0 ? "pr-4" : "border-l pl-6"} lg:pl-8 ${i > 0 ? "lg:border-l" : "lg:pl-0"}`}
            >
              <dt className="text-sm opacity-70">{s.label}</dt>
              <dd className="mt-3 text-[clamp(2.75rem,5vw,4.25rem)] font-light leading-none tracking-[-0.05em] tabular-nums">
                <Counter to={s.value} suffix={s.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </Section>
  );
}

/* ───────────── Why Dangal ───────────── */
const ICONS = { Trophy, Flame, Users, Salad, ShieldCheck, LineChart } as const;

export function Why() {
  return (
    <Section tone="cream" className="pt-0 sm:pt-0 lg:pt-0" label="Why Dangal">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeading index="02" eyebrow="Why Dangal" title={<>Hard work, <span className="serif-accent">intelligently</span> programmed.</>} className="!block" />
            <Parallax className="relative mt-10 hidden aspect-[4/5] overflow-hidden rounded-[22px] bg-navy lg:block">
              <Image src={img(IMG.racks, 1000)} alt="Squat racks and plates on the Dangal strength floor" fill sizes="40vw" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
            </Parallax>
          </div>
        </div>
        <SpotlightList className="grid gap-px overflow-hidden rounded-[22px] bg-navy/10 sm:grid-cols-2 lg:col-span-7">
          {WHY.map((w, i) => {
            const Icon = ICONS[w.icon as keyof typeof ICONS];
            return (
              <Reveal as="li" key={w.title} delay={(i % 2) * 0.06} className="group flex flex-col bg-cream p-8 sm:min-h-[260px]">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy text-cream transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:-rotate-12 group-hover:scale-110">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                  </span>
                  <span className="text-xs tabular-nums opacity-70">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-auto pt-10 text-xl tracking-[-0.02em]">{w.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed opacity-70">{w.body}</p>
              </Reveal>
            );
          })}
        </SpotlightList>
      </div>
    </Section>
  );
}

/* ───────────── Gallery preview ───────────── */
export function GalleryPreview({ items }: { items: GalleryItem[] }) {
  const shown = items.slice(0, 5);
  if (!shown.length) return null;
  return (
    <Section tone="cream" label="Gallery">
      <div className="container-x">
        <SectionHeading
          index="06"
          eyebrow="Inside Dangal"
          title={<>A floor built for <span className="serif-accent">serious</span> training.</>}
          action={<ButtonLink href="/gallery" variant="outline-navy" arrow>View gallery</ButtonLink>}
        />
        <ul className="mt-14 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2">
          {shown.map((g, i) => (
            <Reveal
              as="li"
              key={g.id}
              variant="image"
              className={`group relative overflow-hidden rounded-[18px] bg-navy/10 ${i === 0 ? "col-span-2 row-span-2 aspect-square lg:aspect-auto" : "aspect-[4/3]"}`}
            >
              <Link href="/gallery" className="absolute inset-0 block">
                <Image
                  src={img(g.image_url, i === 0 ? 1400 : 700)}
                  alt=""
                  fill
                  sizes={i === 0 ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"}
                  placeholder="blur"
                  blurDataURL={BLUR}
                  className="object-cover"
                />
                <span aria-hidden className="absolute inset-0 bg-navy/0 transition-colors duration-500 group-hover:bg-navy/25" />
                <span className="absolute bottom-3 left-3 translate-y-0 rounded-full bg-cream/90 px-3 py-1 text-[11px] text-navy backdrop-blur transition-transform duration-500 group-hover:-translate-y-1">
                  {g.title}
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ───────────── Instagram ───────────── */
export function InstagramFeed({ posts }: { posts: { id: string; url: string; permalink: string; caption: string }[] }) {
  const fallback = [IMG.squat, IMG.ropes, IMG.woman, IMG.bar, IMG.weights, IMG.kid];
  return (
    <Section tone="cream" className="pt-0 sm:pt-0 lg:pt-0" label="Instagram">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-6 border-t border-navy/10 pt-10 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow opacity-70">Instagram</p>
            <p className="mt-4 text-[clamp(1.75rem,3.4vw,2.75rem)] font-light tracking-[-0.035em]">@dangalgym</p>
          </div>
          <ExternalButton href={SITE.socials.instagram} target="_blank" rel="noopener noreferrer" variant="outline-navy" arrow>
            Follow us
          </ExternalButton>
        </div>
        <ul className="no-scrollbar -mx-4 mt-10 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
          {(posts.length ? posts.slice(0, 6) : fallback.map((u, i) => ({ id: String(i), url: u, permalink: SITE.socials.instagram, caption: "Dangal Gym on Instagram" }))).map((p) => (
            <li key={p.id} className="w-[44vw] shrink-0 snap-start sm:w-auto">
              <Link href={p.permalink} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden rounded-[16px] bg-navy/10">
                {posts.length ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.url} alt={p.caption || "Instagram post"} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <Image src={img(p.url, 500)} alt={p.caption} fill sizes="(min-width:1024px) 16vw, 44vw" placeholder="blur" blurDataURL={BLUR} className="object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-navy/0 text-cream opacity-0 transition-all group-hover:bg-navy/40 group-hover:opacity-100">
                  <SocialIcon name="instagram" className="h-6 w-6" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
