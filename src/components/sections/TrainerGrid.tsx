import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Motion";
import { BLUR, img } from "@/lib/images";
import type { Trainer } from "@/lib/types";

/**
 * Trainer cards. Hover (or keyboard focus) lifts the card, brings the photo to full colour and slides up
 * a panel with the coach's bio and specialties. On touch screens the details are shown below the photo
 * on the Trainers page.
 */
export function TrainerGrid({ trainers, detailed = false }: { trainers: Trainer[]; detailed?: boolean }) {
  return (
    <ul className="grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {trainers.map((t, i) => (
        <Reveal as="li" key={t.id} delay={i * 0.06}>
          <article tabIndex={0} className="group rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-4 focus-visible:ring-offset-cream">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-cream-200 transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:-translate-y-1.5">
              {t.image_url ? (
                <Image
                  src={img(t.image_url, 800)}
                  alt={`${t.name}, ${t.role}`}
                  fill
                  sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                  placeholder="blur"
                  blurDataURL={BLUR}
                  className="object-cover grayscale-[40%] transition-[filter,transform] duration-[1.2s] ease-out group-hover:scale-[1.06] group-hover:grayscale-0 group-focus-visible:grayscale-0"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl font-light text-navy/30">{t.name.replace("Coach ", "").charAt(0)}</div>
              )}
              <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-medium text-navy backdrop-blur">{t.experience_years}+ yrs</span>

              {/* Hover / focus panel (pointer devices) */}
              <div
                aria-hidden={detailed || undefined}
                className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-[calc(100%+1rem)] rounded-2xl bg-navy/90 p-5 text-cream backdrop-blur-md transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0 [@media(hover:hover)]:block"
              >
                <p className="line-clamp-4 text-[13px] leading-relaxed text-cream/85">{t.bio}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {t.specialties.slice(0, 3).map((s) => (
                    <li key={s} className="rounded-full border border-cream/25 px-2.5 py-0.5 text-[11px]">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-normal tracking-[-0.02em]">{t.name}</h3>
                <p className="mt-1 text-sm opacity-70">{t.role}</p>
              </div>
              {!detailed && (
                <Link
                  href="/trainers"
                  tabIndex={-1}
                  aria-hidden
                  className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-navy/15 transition-all duration-500 group-hover:rotate-45 group-hover:border-navy group-hover:bg-navy group-hover:text-cream"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            {detailed && (
              <>
                <p className="mt-4 text-[15px] leading-relaxed opacity-80">{t.bio}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {t.specialties.map((s) => (
                    <li key={s} className="rounded-full border border-navy/20 px-3 py-1 text-xs opacity-80">
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>
        </Reveal>
      ))}
    </ul>
  );
}
