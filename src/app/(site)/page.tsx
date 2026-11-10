import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { ProgramFinder } from "@/components/home/ProgramFinder";
import { ProgramShowcase } from "@/components/home/ProgramShowcase";
import { GalleryPreview, InstagramFeed, Intro, Why } from "@/components/home/Sections";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { PlanCards } from "@/components/sections/PlanCards";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrainerGrid } from "@/components/sections/TrainerGrid";
import { ButtonLink } from "@/components/ui/Button";
import { SplitText } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { FAQS } from "@/content/data";
import { getGallery, getInstagram, getPlans, getTestimonials, getTrainers, getHeroVideo } from "@/lib/data";

// Admin changes revalidate instantly via cache tags.
export const revalidate = 60;

export default async function HomePage() {
  const [heroSlot, plans, trainers, testimonials, gallery, instagram] = await Promise.all([
    getHeroVideo(),
    getPlans(),
    getTrainers(),
    getTestimonials(),
    getGallery(),
    getInstagram(),
  ]);

  return (
    <>
      <Hero slot={heroSlot} isDefault={heroSlot.isDefault} />
      <Intro />
      <Marquee />
      <div className="h-3 bg-titanium sm:h-4" aria-hidden />

      <Section tone="ink" label="Signature programs" className="mx-2 rounded-[22px] sm:mx-3 sm:rounded-[28px]">
        <div className="container-x">
          <SectionHeading
            index="01"
            eyebrow="Signature programs"
            title={<>Four programs. One standard: <span className="serif-accent">the fittest.</span></>}
            lede="Built for where you are in life — not a one-size template. Each program has its own coaching, schedule and milestones."
            action={<ButtonLink href="/programs" variant="outline-titanium" arrow>All programs</ButtonLink>}
          />
          <div className="mt-14">
            <ProgramShowcase />
          </div>
        </div>
      </Section>

      <Section tone="sand" label="Program finder" id="finder">
        <div className="container-x">
          <ProgramFinder />
        </div>
      </Section>

      <Why />

      <Section tone="sand" label="Trainers">
        <div className="container-x">
          <SectionHeading
            index="03"
            eyebrow="The coaches"
            title={<>Coaches who have <span className="serif-accent">lived</span> the grind.</>}
            action={<ButtonLink href="/trainers" variant="outline-ink" arrow>Meet the team</ButtonLink>}
          />
          <div className="mt-14">
            <TrainerGrid trainers={trainers.slice(0, 4)} />
          </div>
        </div>
      </Section>

      <Section tone="ink" label="Membership" id="membership" className="mx-2 rounded-[22px] sm:mx-3 sm:rounded-[28px]">
        <div className="container-x">
          <SectionHeading
            index="04"
            eyebrow="Membership"
            title={<>Simple plans. <span className="serif-accent">No</span> hidden fees.</>}
            lede="Every plan includes full floor access, group classes and an onboarding assessment. Longer commitments, better value."
            action={<ButtonLink href="/membership" variant="outline-titanium" arrow>Compare plans</ButtonLink>}
          />
          <div className="mt-14">
            <PlanCards plans={plans} />
          </div>
        </div>
      </Section>

      <Section tone="titanium" label="Testimonials">
        <div className="container-x">
          <p className="eyebrow mb-10 opacity-70">
            <span className="tabular-nums">05</span>Member stories
          </p>
          <Testimonials items={testimonials} />
        </div>
      </Section>

      <GalleryPreview items={gallery} />
      <InstagramFeed posts={instagram} />

      <Section tone="titanium" className="pt-0 sm:pt-0 lg:pt-0" label="Frequently asked questions">
        <div className="container-x grid gap-12 border-t border-ink/10 pt-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow opacity-70">
              <span className="tabular-nums">07</span>FAQ
            </p>
            <SplitText as="h2" className="display-md mt-5 block">
              Questions, <span className="serif-accent">answered.</span>
            </SplitText>
            <p className="mt-5 text-[15px] opacity-70">
              Anything else? Call <a className="underline underline-offset-4" href="tel:+919676443944">+91 96764 43944</a>.
            </p>
          </div>
          <div className="lg:col-span-8">
            <Faq items={FAQS} />
          </div>
        </div>
      </Section>

      <FinalCta />
      <div className="h-3 bg-titanium" aria-hidden />
    </>
  );
}
