import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { SocialIcon } from "@/components/layout/SocialIcon";
import { PageHero } from "@/components/sections/PageHero";
import { ExternalButton } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { IMG } from "@/lib/images";
import { SITE, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Free Trial — Gym in Mehdipatnam, Hyderabad",
  description:
    "Book a free trial at Dangal Gym, #501 Aries Plaza, St Ann's College Street, Mehdipatnam, Hyderabad 500028. Call or WhatsApp +91 96764 43944.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Come train <span className="serif-accent">with us.</span></>}
        intro="Book a free trial, ask about batches or just drop by. We're on the 5th floor of Aries Plaza, Mehdipatnam."
        image={IMG.ropes}
        crumbs={[{ name: "Contact", path: "/contact" }]}
      >
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <ExternalButton href={`tel:${SITE.phoneRaw}`} variant="titanium">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden /> Call now
            </span>
          </ExternalButton>
          <ExternalButton href={whatsappLink()} target="_blank" rel="noopener noreferrer" variant="outline-titanium">
            <span className="inline-flex items-center gap-2">
              <SocialIcon name="whatsapp" /> WhatsApp
            </span>
          </ExternalButton>
        </div>
      </PageHero>

      <Section tone="titanium" id="trial" label="Book a free trial" className="scroll-mt-8">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow opacity-70">Free trial</p>
            <h2 className="display-md mt-5">One session. No pressure. Decide after.</h2>
            <dl className="mt-12 space-y-8 border-t border-ink/10 pt-8 text-[15px]">
              <div className="flex gap-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
                <div>
                  <dt className="font-medium">Address</dt>
                  <dd className="mt-1 opacity-75">
                    <address className="not-italic">
                      {SITE.address.line1}
                      <br />
                      {SITE.address.line2}
                      <br />
                      {SITE.address.city}, {SITE.address.state} – {SITE.address.postalCode}
                    </address>
                    <a href={SITE.googleBusinessUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block underline underline-offset-4">
                      Get directions
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
                <div>
                  <dt className="font-medium">Phone & WhatsApp</dt>
                  <dd className="mt-1 opacity-75">
                    <a href={`tel:${SITE.phoneRaw}`} className="hover:underline">
                      {SITE.phone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <Mail className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
                <div>
                  <dt className="font-medium">Email</dt>
                  <dd className="mt-1 opacity-75">
                    <a href={`mailto:${SITE.email}`} className="hover:underline">
                      {SITE.email}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden />
                <div>
                  <dt className="font-medium">Hours</dt>
                  <dd className="mt-1 opacity-75">
                    {SITE.hours.map((h) => (
                      <span key={h.days} className="block">
                        {h.days}: {h.label}
                      </span>
                    ))}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>
        </div>
      </Section>

      <section aria-label="Map" className="bg-titanium p-2 sm:p-3">
        <div className="relative h-[460px] overflow-hidden rounded-[22px] bg-ink sm:rounded-[28px]">
          <iframe
            src={SITE.mapEmbed}
            title="Map showing Dangal Gym at Aries Plaza, Mehdipatnam, Hyderabad"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0 grayscale-[60%] contrast-[1.05]"
          />
          <div className="glass-strong absolute bottom-4 left-4 max-w-xs rounded-2xl p-5 text-titanium sm:bottom-8 sm:left-8">
            <p className="text-sm font-medium">Dangal Gym</p>
            <p className="mt-1 text-sm text-titanium/75">Aries Plaza, 5th Floor · Mehdipatnam</p>
          </div>
        </div>
      </section>
      <div className="h-3 bg-titanium" aria-hidden />
    </>
  );
}
