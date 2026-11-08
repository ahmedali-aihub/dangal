import Image from "next/image";
import { ButtonLink, ExternalButton } from "@/components/ui/Button";
import { Magnetic, Reveal, SplitText } from "@/components/ui/Motion";
import { BLUR, IMG, img } from "@/lib/images";
import { whatsappLink } from "@/lib/site";

export function FinalCta({
  title = (
    <>
      Your first session
      <br />
      is on <span className="serif-accent">us.</span>
    </>
  ),
  body = "Walk in, meet a coach, train a full session and decide later. No joining fee on the day, no pressure — just the floor and the work.",
}: {
  title?: React.ReactNode;
  body?: string;
}) {
  return (
    <section aria-label="Book a free trial" className="bg-cream p-2 sm:p-3">
      <div className="relative isolate overflow-hidden rounded-[22px] bg-navy text-cream sm:rounded-[28px]">
        <Image
          src={img(IMG.floor, 1920)}
          alt=""
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={BLUR}
          className="-z-10 object-cover opacity-50"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-navy/60" />
        <div aria-hidden className="fluted absolute inset-0 -z-10 opacity-50" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/90 via-navy-950/50 to-transparent" />
        <div className="container-x grid gap-10 py-24 sm:py-32 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow text-cream/70">Free trial</p>
            <SplitText as="h2" className="display-lg mt-5 block">
              {title}
            </SplitText>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4 lg:col-start-9">
            <p className="lede text-cream/80">{body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Magnetic>
                <ButtonLink href="/contact#trial" variant="coral" size="lg" arrow>
                  Book free trial
                </ButtonLink>
              </Magnetic>
              <ExternalButton href={whatsappLink("Hi Dangal Gym, I'd like to book a free trial.")} target="_blank" rel="noopener noreferrer" variant="text-cream" arrow>
                WhatsApp us
              </ExternalButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
