import { SITE } from "@/lib/site";
import type { Plan } from "@/lib/types";

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; escape "<" to prevent </script> injection from content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const dayMap: Record<string, string[]> = {
  "Mon – Sat": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  Sunday: ["Sunday"],
};

export function businessSchema(plans: Plan[] = []) {
  return {
    "@context": "https://schema.org",
    "@type": ["HealthClub", "LocalBusiness"],
    "@id": `${SITE.url}/#gym`,
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    telephone: SITE.phoneRaw,
    email: SITE.email,
    image: `${SITE.url}/opengraph-image`,
    logo: `${SITE.url}/icon.svg`,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Credit Card, Debit Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE.address.line1}, ${SITE.address.line2}`,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.state,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    hasMap: SITE.googleBusinessUrl,
    areaServed: ["Mehdipatnam", "Tolichowki", "Masab Tank", "Asif Nagar", "Humayun Nagar", "Hyderabad"].map((n) => ({
      "@type": "Place",
      name: n,
    })),
    openingHoursSpecification: SITE.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayMap[h.days] ?? [],
      opens: h.open,
      closes: h.close,
    })),
    sameAs: Object.values(SITE.socials),
    ...(plans.length && {
      makesOffer: plans.map((p) => ({
        "@type": "Offer",
        name: `${p.name} membership`,
        price: p.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      })),
    }),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.path}`,
    })),
  };
}
