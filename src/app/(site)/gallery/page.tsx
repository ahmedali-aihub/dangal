import type { Metadata } from "next";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { FinalCta } from "@/components/sections/FinalCta";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { getGallery } from "@/lib/data";
import { IMG } from "@/lib/images";

export const metadata: Metadata = {
  title: "Gallery — Inside Dangal Gym",
  description: "Photos of the training floor, equipment, classes and community at Dangal Gym, Aries Plaza, Mehdipatnam, Hyderabad.",
  alternates: { canonical: "/gallery" },
};

export const revalidate = 300;

export default async function GalleryPage() {
  const items = await getGallery();
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title={<>Inside <span className="serif-accent">Dangal.</span></>}
        intro="The floor, the people and the work. Better in person — book a visit any day."
        image={IMG.weights}
        crumbs={[{ name: "Gallery", path: "/gallery" }]}
      />
      <Section tone="titanium" label="Photo gallery">
        <div className="container-x">
          <GalleryGrid items={items} />
        </div>
      </Section>
      <FinalCta />
      <div className="h-3 bg-titanium" aria-hidden />
    </>
  );
}
