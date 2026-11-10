import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { LogoDefs } from "@/components/layout/Logo";
import { SITE } from "@/lib/site";
import "./globals.css";

// One variable family for UI + display; tight tracking does the "display" work.
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Dangal Gym — Best Gym in Mehdipatnam, Hyderabad | Personal Training & Fitness",
    template: "%s | Dangal Gym, Mehdipatnam",
  },
  description: SITE.description,
  keywords: [
    "gym in Mehdipatnam",
    "best gym in Hyderabad",
    "fitness centre Mehdipatnam",
    "personal trainer Hyderabad",
    "women gym Mehdipatnam",
    "kids fitness Hyderabad",
    "gym near St Ann's College",
    "Dangal Gym",
  ],
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: SITE.name,
    title: "Dangal Gym — Train like a wrestler. Live like a champion.",
    description: SITE.description,
  },
  twitter: { card: "summary_large_image", site: "@gymdangal", creator: "@gymdangal" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: true, address: true },
  other: { "geo.region": "IN-TG", "geo.placename": "Hyderabad", "geo.position": `${SITE.geo.lat};${SITE.geo.lng}` },
};

export const viewport: Viewport = {
  themeColor: "#111113",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={sans.variable}
      style={{ ["--font-display" as string]: "var(--font-sans)" }}
    >
      <body>
        <LogoDefs />
        {children}
      </body>
    </html>
  );
}
