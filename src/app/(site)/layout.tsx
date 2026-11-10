import { MobileDock, OfferBanner, SmoothScroll } from "@/components/layout/Chrome";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd, businessSchema } from "@/components/seo/JsonLd";
import { getBanner, getPlans } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [banner, plans] = await Promise.all([getBanner(), getPlans()]);
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-titanium focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <JsonLd data={businessSchema(plans)} />
      <SmoothScroll />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <OfferBanner banner={banner} />
      <MobileDock />
    </>
  );
}
