export const SITE = {
  name: "Dangal Gym",
  legalName: "Dangal Gym",
  tagline: "Train like a wrestler. Live like a champion.",
  description:
    "Dangal Gym in Mehdipatnam, Hyderabad — professional fitness training centre with expert coaches, strength & conditioning, and four signature programs: I AM THE FITTEST MAN, WOMAN, ELDER (40+) and KID.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dangalgym.com").trim().replace(/\/+$/, ""),
  phone: "+91 96764 43944",
  phoneRaw: "+919676443944",
  whatsapp: "919676443944",
  email: "support@dangalgym.com",
  address: {
    line1: "#501, 5th Floor, Aries Plaza",
    line2: "St Ann's College Street, Mehdipatnam",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500028",
    country: "IN",
  },
  // TODO(owner): verify exact coordinates from Google Business Profile.
  geo: { lat: 17.3957, lng: 78.4393 },
  hours: [
    { days: "Mon – Sat", open: "06:00", close: "22:00", label: "6:00 AM – 10:00 PM" },
    { days: "Sunday", open: "06:00", close: "12:00", label: "6:00 AM – 12:00 PM" },
  ],
  socials: {
    instagram: "https://www.instagram.com/dangalgym",
    youtube: "https://www.youtube.com/@dangalgym",
    facebook: "https://www.facebook.com/dangalgym", // TODO(owner): confirm Facebook page URL
    x: "https://x.com/gymdangal",
  },
  // TODO(owner): paste the Google Business Profile share/review links.
  googleBusinessUrl:
    "https://www.google.com/maps/search/?api=1&query=Dangal+Gym+Aries+Plaza+Mehdipatnam+Hyderabad",
  googleReviewUrl:
    "https://www.google.com/maps/search/?api=1&query=Dangal+Gym+Aries+Plaza+Mehdipatnam+Hyderabad",
  mapEmbed:
    "https://www.google.com/maps?q=Aries+Plaza+St+Ann%27s+College+Street+Mehdipatnam+Hyderabad&output=embed",
};

export const NAV = [
  { href: "/programs", label: "Programs" },
  { href: "/training", label: "Training" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/trainers", label: "Trainers" },
  { href: "/schedule", label: "Schedule" },
  { href: "/membership", label: "Membership" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export const whatsappLink = (text = "Hi Dangal Gym, I'd like to know more about membership.") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
