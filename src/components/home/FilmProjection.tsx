import { SplitText } from "@/components/ui/SplitText";
import { Ambilight } from "@/components/video/Ambilight";
import { WatchFilm } from "@/components/video/FilmTheater";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { DEFAULT_FILM } from "@/content/data";
import type { VideoSlot } from "@/lib/types";
import { posterFor } from "@/lib/video";

/**
 * "The Dangal Film" — the gym's video projected like cinema: a projector beam falls on the screen, the
 * screen tilts up into place as you scroll, the picture's colours glow around the frame, and
 * "Watch with sound" opens a full-screen theatre. Plays whatever the admin sets for the section
 * placement, falling back to the gym's own film.
 */
export function FilmProjection({ slot, isDefault }: { slot: VideoSlot; isDefault: boolean }) {
  const v = slot.videos[0];
  if (!v) return null;
  const poster = posterFor(v) ?? DEFAULT_FILM.cover_url;
  const title = isDefault ? (
    <>
      Step inside <span className="serif-accent">the akhara.</span>
    </>
  ) : (
    v.headline || v.title
  );

  return (
    <section aria-label="The Dangal film" className="bg-cream p-2 sm:p-3">
      <div className="relative isolate overflow-hidden rounded-[22px] bg-navy-950 py-20 text-cream sm:rounded-[28px] sm:py-28">
        {/* projector beam + room atmosphere */}
        <div aria-hidden className="projector-beam pointer-events-none absolute left-1/2 top-0 -z-10 h-[78%] w-[min(1200px,130%)] -translate-x-1/2" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-3 w-40 -translate-x-1/2 rounded-b-full bg-cream/40 blur-md" />

        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow justify-center text-cream/80">
              <span className="relative mr-1 flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-70 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
              </span>
              {isDefault ? "Now showing · The Dangal film" : "Now showing"}
            </p>
            <SplitText as="h2" className="display-lg mt-5 block text-balance">
              {title}
            </SplitText>
            <p className="lede mx-auto mt-5 max-w-xl text-cream/75">
              {v.subline || "The floor, the people and the fire that make Dangal — in under a minute. Turn the sound up."}
            </p>
          </div>

          <div className="relative mx-auto mt-14 max-w-5xl sm:mt-16">
            <Ambilight src={v.source === "upload" ? v.src : null} poster={poster} />
            <div className="projector-screen relative aspect-video overflow-hidden rounded-[14px] bg-black shadow-[0_50px_140px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(244,237,224,0.12)] sm:rounded-[20px]">
              <VideoPlayer slot={slot} fallbackImage={poster} fallbackAlt={v.title} controls="none" mediaClassName="contrast-[1.05] saturate-[1.08]" />
              {/* Glossy glass: reflection, vignette, polished edge and a slow light sweep */}
              <div aria-hidden className="gloss-sheen pointer-events-none absolute inset-0 z-10" />
              <div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(130%_100%_at_50%_40%,transparent_55%,rgba(0,0,0,0.5)_100%)]" />
              <div aria-hidden className="gloss-sweep z-10 motion-reduce:hidden" />
              <div aria-hidden className="gloss-bezel pointer-events-none absolute inset-0 z-10 rounded-[inherit]" />
              {/* whole screen is clickable — never covers the film's own captions */}
              <WatchFilm video={v} variant="cover" label="Play with sound" />
            </div>
            {/* the projector's reflection on the floor */}
            <div aria-hidden className="mx-auto -mt-2 h-8 w-3/4 rounded-[50%] bg-coral/25 blur-2xl" />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
              <WatchFilm video={v} variant="cream" label="Watch with sound" duration={isDefault ? DEFAULT_FILM.duration : undefined} />
              <span className="text-sm text-cream/70">Muted preview playing · full film with sound</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
