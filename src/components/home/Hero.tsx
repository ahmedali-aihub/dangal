import { CalendarCheck, Clock3, MapPin, ShieldCheck, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Motion";
import { WatchFilm } from "@/components/video/FilmTheater";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { DEFAULT_FILM } from "@/content/data";
import { IMG } from "@/lib/images";
import type { VideoSlot } from "@/lib/types";
import { HeroHeadline } from "./HeroHeadline";
import { TodayCard } from "./TodayCard";

const FEATURES = [
  { icon: ShieldCheck, text: ["Certified coaches,", "technique first"] },
  { icon: Users, text: ["Women-only", "batches daily"] },
  { icon: Clock3, text: ["Open 6 AM", "to 10 PM"] },
  { icon: CalendarCheck, text: ["Free trial,", "no pressure"] },
  { icon: MapPin, text: ["Aries Plaza,", "Mehdipatnam"] },
];

export function Hero({ slot, isDefault = false }: { slot: VideoSlot; isDefault?: boolean }) {
  const single = slot.videos.length === 1 ? slot.videos[0] : null;
  // "Watch the film" plays the hero's video with sound; the default film gets its known runtime.
  const film = slot.videos[0];
  const filmDuration = isDefault ? DEFAULT_FILM.duration : undefined;
  const headline = single?.headline?.trim();
  const subline =
    single?.subline?.trim() ||
    "A professional training centre in Mehdipatnam. Real coaching, honest programming and a floor that pushes you — from your first session to your strongest year.";

  return (
    <section aria-label="Introduction" className="bg-cream p-2 sm:p-3">
      <div className="relative isolate flex min-h-[640px] flex-col overflow-hidden rounded-[22px] bg-navy text-cream sm:rounded-[28px] h-[calc(100svh-1rem)] sm:h-[calc(100svh-1.5rem)] max-h-[1080px]">
        <VideoPlayer
          slot={slot}
          fallbackImage={IMG.hero}
          fallbackAlt="Athlete lifting a loaded barbell at Dangal Gym"
          priority
          className="hero-media"
          // Soft focus: makes 480p footage read as intentional atmosphere behind the reeded glass.
          mediaClassName="scale-[1.04] blur-[1.5px]"
          controlsClassName="right-4 top-[92px] sm:right-6 sm:top-[110px] lg:bottom-8 lg:right-10 lg:top-auto"
        >
        {/* Colour grade: pull any footage into the brand navy, keep text AA-readable */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-navy-600/45" />
        {/* Coral light bleeding up from the bottom-right, slowly breathing (Tidewell-style glow) */}
        <div
          aria-hidden
          className="glow-breathe pointer-events-none absolute -bottom-[20%] -right-[10%] z-10 h-[80%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(255,107,91,0.42),rgba(255,107,91,0.12)_55%,transparent)] blur-2xl motion-reduce:animate-none"
        />
        <div aria-hidden className="fluted pointer-events-none absolute inset-0 z-10 opacity-60" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(10,18,38,0.55)_0%,rgba(10,18,38,0)_28%,rgba(10,18,38,0.15)_55%,rgba(10,18,38,0.9)_100%)]"
        />
        </VideoPlayer>

        <div className="hero-content pointer-events-none container-x relative z-20 flex flex-1 flex-col pb-[88px] pt-28 sm:pb-6 sm:pt-32">
          <div className="pointer-events-auto hidden justify-end lg:flex">
            <TodayCard />
          </div>

          <div className="mt-auto">
            <HeroHeadline headline={headline} />

            <div className="fade-up mt-8 flex flex-col gap-8 sm:mt-10 lg:flex-row lg:items-end lg:justify-between" style={{ ["--delay" as string]: "0.45s" }}>
              <p className="max-w-[460px] text-[15px] leading-relaxed text-cream/80 sm:text-base">{subline}</p>
              <div className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-4 lg:mr-28">
                <Magnetic>
                  <ButtonLink href="/contact#trial" variant="coral" size="lg" arrow>
                    Book a free trial
                  </ButtonLink>
                </Magnetic>
                {film && <WatchFilm video={film} duration={filmDuration} />}
              </div>
            </div>

            <div className="relative mt-10 border-t border-cream/15 pt-6 sm:mt-14">
              <span aria-hidden className="grow-x absolute -top-px left-0 h-[2px] w-28 rounded-full bg-coral" style={{ ["--dur" as string]: "1.6s" }} />
              <ul className="no-scrollbar -mx-4 flex gap-8 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-5 lg:pr-28">
                {FEATURES.map(({ icon: Icon, text }, i) => (
                  <li
                    key={text[0]}
                    className="fade-up shrink-0 text-[13px] leading-snug text-cream/80"
                    style={{ ["--delay" as string]: `${0.6 + i * 0.07}s` }}
                  >
                    <Icon className="mb-3 h-4 w-4 text-cream" strokeWidth={1.5} aria-hidden />
                    {text[0]}
                    <br />
                    {text[1]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
