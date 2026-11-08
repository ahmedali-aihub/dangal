import { IMG } from "@/lib/images";
import type { Banner, GalleryItem, Plan, Testimonial, Trainer } from "@/lib/types";

/**
 * FALLBACK / DEMO CONTENT.
 * When Supabase is configured the live tables win; this is used for demo mode and if the DB is unreachable.
 * ALL NUMBERS, PRICES, NAMES AND QUOTES BELOW ARE PLACEHOLDERS — replace via the admin panel / seed.sql.
 */

export const STATS = [
  { value: 1500, suffix: "+", label: "Members trained" }, // PLACEHOLDER
  { value: 12, suffix: "", label: "Expert trainers" }, // PLACEHOLDER
  { value: 8, suffix: "+", label: "Years of grit" }, // PLACEHOLDER
  { value: 600, suffix: "+", label: "Transformations" }, // PLACEHOLDER
];

export const WHY = [
  { icon: "Trophy", title: "Coached by champions", body: "Certified trainers with competitive backgrounds who coach technique first, ego never." },
  { icon: "Flame", title: "The Dangal method", body: "Wrestling-bred conditioning blended with modern sports science. Hard work, programmed intelligently." },
  { icon: "Users", title: "A community that lifts", body: "Train beside people who push you. Batches, challenges and a culture where nobody walks alone." },
  { icon: "Salad", title: "Nutrition built in", body: "Indian-diet-friendly meal plans and supplement guidance, not generic charts." },
  { icon: "ShieldCheck", title: "Safe & hygienic", body: "Premium equipment, sanitised floors, women-only batches and supervised kids' sessions." },
  { icon: "LineChart", title: "Progress you can see", body: "Body composition check-ins and strength tracking, so results are measured, not guessed." },
];

// REAL PRICES (from the gym's current price list). Every plan includes the same benefits.
const PLAN_FEATURES = [
  "Gym access 6:00 AM – 10:00 PM",
  "90 min / day training",
  "Book any slot, 7 days a week", // TODO(owner): old site said "Book anytime for 7 Weeks" — confirm wording
  "Sports nutrition food",
  "Body assessment",
];

export const PLANS: Plan[] = [
  { id: "p1", name: "Monthly", duration: "1 month", price: 4000, original_price: null, features: PLAN_FEATURES, highlight: false, badge: null, sort_order: 1, is_active: true },
  { id: "p2", name: "Quarterly", duration: "3 months", price: 8000, original_price: null, features: PLAN_FEATURES, highlight: false, badge: null, sort_order: 2, is_active: true },
  { id: "p3", name: "Half Yearly", duration: "6 months", price: 12000, original_price: null, features: PLAN_FEATURES, highlight: false, badge: null, sort_order: 3, is_active: true },
  { id: "p4", name: "Yearly", duration: "12 months", price: 18000, original_price: null, features: PLAN_FEATURES, highlight: true, badge: "Best choice", sort_order: 4, is_active: true },
];

/**
 * The gym's own film — plays in the home hero and "The Dangal Film" projection section whenever no other
 * video is set (or scheduled) in Admin → Video projection. File: /public/videos/dangal-film.mp4 (854×480, 48s, with audio).
 */
export const DEFAULT_FILM = {
  id: "dangal-film",
  title: "The Dangal Gym film",
  source: "upload" as const,
  src: "/videos/dangal-film.mp4",
  poster_url: "/videos/dangal-film-poster.jpg",
  cover_url: "/videos/dangal-film-cover.jpg",
  duration: "0:48",
  headline: null,
  subline: null,
};

export const TRAINERS: Trainer[] = [
  { id: "t1", name: "Coach Imran Khan", role: "Head Coach · Strength & Conditioning", bio: "Former state-level wrestler turned strength coach. Believes the basics, done perfectly, build legends.", specialties: ["Strength", "Wrestling conditioning", "Fat loss"], experience_years: 12, image_url: IMG.coach1, instagram: null, sort_order: 1, is_active: true },
  { id: "t2", name: "Coach Ayesha Fatima", role: "Women's Fitness & Nutrition Coach", bio: "Certified nutritionist who builds strong, sustainable physiques with a no-crash-diet philosophy.", specialties: ["Women's fitness", "Nutrition", "Posture"], experience_years: 8, image_url: IMG.coach2, instagram: null, sort_order: 2, is_active: true },
  { id: "t3", name: "Coach Rakesh Reddy", role: "Bodybuilding & Hypertrophy", bio: "Competitive bodybuilder specialising in muscle gain, contest prep and injury-proof lifting.", specialties: ["Hypertrophy", "Contest prep", "Mobility"], experience_years: 10, image_url: IMG.coach3, instagram: null, sort_order: 3, is_active: true },
  { id: "t4", name: "Coach Sana Mirza", role: "Kids & Senior Fitness Specialist", bio: "Makes movement joyful for kids and safe for seniors, with a calm, patient coaching style.", specialties: ["Kids fitness", "Senior fitness", "Mobility"], experience_years: 6, image_url: IMG.coach4, instagram: null, sort_order: 4, is_active: true },
];

export const TESTIMONIALS: Testimonial[] = [
  { id: "r1", name: "Mohammed Arif", program: "I AM THE FITTEST MAN", quote: "I lost 14 kg in 5 months and gained more strength than I ever had in college. The coaches actually care.", rating: 5, result: "−14 kg in 5 months", image_url: null, sort_order: 1, is_active: true },
  { id: "r2", name: "Sneha Reddy", program: "I AM THE FITTEST WOMAN", quote: "The women's batch made me comfortable from day one. My posture, energy and confidence are completely different.", rating: 5, result: "Stronger & confident", image_url: null, sort_order: 2, is_active: true },
  { id: "r3", name: "Suresh Kumar (52)", program: "I AM THE FITTEST ELDER (40+)", quote: "At 52 I thought my gym days were over. The trainers designed a plan around my knees and I feel 10 years younger.", rating: 5, result: "Pain-free & active", image_url: null, sort_order: 3, is_active: true },
  { id: "r4", name: "Farah (mother of Zaid, 11)", program: "I AM THE FITTEST KID", quote: "My son loves going. He is more disciplined, more active and finally off the screen.", rating: 5, result: "Active & disciplined", image_url: null, sort_order: 4, is_active: true },
];

export const GALLERY: GalleryItem[] = [
  { id: "g1", title: "Strength floor", category: "Facility", image_url: IMG.weights, sort_order: 1, is_active: true },
  { id: "g2", title: "Heavy day", category: "Training", image_url: IMG.hero, sort_order: 2, is_active: true },
  { id: "g3", title: "Conditioning zone", category: "Facility", image_url: IMG.ropes, sort_order: 3, is_active: true },
  { id: "g4", title: "Racks & plates", category: "Facility", image_url: IMG.racks, sort_order: 4, is_active: true },
  { id: "g5", title: "Women's batch", category: "Community", image_url: IMG.woman, sort_order: 5, is_active: true },
  { id: "g6", title: "Dumbbell row", category: "Facility", image_url: IMG.floor2, sort_order: 6, is_active: true },
  { id: "g7", title: "Mobility class", category: "Community", image_url: IMG.elder, sort_order: 7, is_active: true },
  { id: "g8", title: "Barbell club", category: "Training", image_url: IMG.squat, sort_order: 8, is_active: true },
  { id: "g9", title: "Back day", category: "Training", image_url: IMG.hall, sort_order: 9, is_active: true },
  { id: "g10", title: "Kids' batch", category: "Community", image_url: IMG.kid, sort_order: 10, is_active: true },
  { id: "g11", title: "Women's strength", category: "Community", image_url: IMG.bar, sort_order: 11, is_active: true },
  { id: "g12", title: "Open floor", category: "Facility", image_url: IMG.studio, sort_order: 12, is_active: true },
];

export const BANNER: Banner | null = {
  id: "b1",
  message: "New batch launch — join this month and get your first week free.", // PLACEHOLDER offer
  cta_label: "Claim free trial",
  cta_href: "/contact#trial",
  is_active: true,
  starts_at: null,
  ends_at: null,
};

export const FAQS = [
  { q: "Where is Dangal Gym located?", a: "We are at #501, 5th Floor, Aries Plaza, St Ann's College Street, Mehdipatnam, Hyderabad — 500028. Use the map on our Contact page for directions." },
  { q: "Can I try before I join?", a: "Yes. Book a free trial session from the Contact page or call/WhatsApp +91 96764 43944. You'll meet a coach and tour the floor with no pressure." },
  { q: "Are there separate batches for women?", a: "Yes. We run dedicated women-only batches with female coaching staff in a comfortable, private environment." },
  { q: "I'm a complete beginner. Is that okay?", a: "Absolutely — most members start as beginners. Every new member gets an orientation, movement assessment and a plan matched to their level." },
  { q: "Do you offer personal training and diet plans?", a: "Yes. Personal training and personalised Indian-diet-friendly nutrition plans are available as add-ons and are included in our higher membership tiers." },
  { q: "Is the kids' program safe?", a: "Kids train with bodyweight and play-based exercises under direct supervision of trained instructors. No heavy loading." },
  { q: "Can I pause or transfer my membership?", a: "Annual members can freeze up to 30 days. For other cases, speak to the front desk — we are happy to help with genuine situations." },
  { q: "What payment methods do you accept?", a: "UPI, cards, net banking and cash. EMI options may be available on annual plans." },
];

export const SCHEDULE = [
  { day: "Mon", slots: [
    { time: "6:00 – 7:00 AM", name: "Dawn Strength", program: "MAN", coach: "Coach Imran" },
    { time: "6:00 – 7:30 AM", name: "Joint-friendly Strength", program: "ELDER", coach: "Coach Sana" },
    { time: "9:00 – 10:30 AM", name: "Strength & HIIT (Women only)", program: "WOMAN", coach: "Coach Ayesha" },
    { time: "5:00 – 6:00 PM", name: "Junior Agility (7–10)", program: "KID", coach: "Coach Sana" },
    { time: "7:00 – 8:30 PM", name: "Hypertrophy", program: "MAN", coach: "Coach Rakesh" },
  ]},
  { day: "Tue", slots: [
    { time: "6:00 – 7:30 AM", name: "Mobility & Balance", program: "ELDER", coach: "Coach Sana" },
    { time: "9:00 – 10:30 AM", name: "Strength & HIIT (Women only)", program: "WOMAN", coach: "Coach Ayesha" },
    { time: "5:00 – 6:00 PM", name: "Junior Strength (11–15)", program: "KID", coach: "Coach Sana" },
    { time: "5:30 – 7:00 PM", name: "Core, Posture & Flow", program: "WOMAN", coach: "Coach Ayesha" },
    { time: "7:00 – 8:30 PM", name: "Dangal Conditioning", program: "MAN", coach: "Coach Imran" },
  ]},
  { day: "Wed", slots: [
    { time: "6:00 – 7:00 AM", name: "Dawn Strength", program: "MAN", coach: "Coach Imran" },
    { time: "6:00 – 7:30 AM", name: "Joint-friendly Strength", program: "ELDER", coach: "Coach Sana" },
    { time: "9:00 – 10:30 AM", name: "Strength & HIIT (Women only)", program: "WOMAN", coach: "Coach Ayesha" },
    { time: "5:00 – 6:00 PM", name: "Junior Agility (7–10)", program: "KID", coach: "Coach Sana" },
    { time: "7:00 – 8:30 PM", name: "Hypertrophy", program: "MAN", coach: "Coach Rakesh" },
  ]},
  { day: "Thu", slots: [
    { time: "6:00 – 7:30 AM", name: "Mobility & Balance", program: "ELDER", coach: "Coach Sana" },
    { time: "9:00 – 10:30 AM", name: "Strength & HIIT (Women only)", program: "WOMAN", coach: "Coach Ayesha" },
    { time: "5:00 – 6:00 PM", name: "Junior Strength (11–15)", program: "KID", coach: "Coach Sana" },
    { time: "5:30 – 7:00 PM", name: "Core, Posture & Flow", program: "WOMAN", coach: "Coach Ayesha" },
    { time: "7:00 – 8:30 PM", name: "Dangal Conditioning", program: "MAN", coach: "Coach Imran" },
  ]},
  { day: "Fri", slots: [
    { time: "6:00 – 7:00 AM", name: "Dawn Strength", program: "MAN", coach: "Coach Imran" },
    { time: "6:00 – 7:30 AM", name: "Joint-friendly Strength", program: "ELDER", coach: "Coach Sana" },
    { time: "9:00 – 10:30 AM", name: "Strength & HIIT (Women only)", program: "WOMAN", coach: "Coach Ayesha" },
    { time: "5:00 – 6:00 PM", name: "Junior Agility (7–10)", program: "KID", coach: "Coach Sana" },
    { time: "7:00 – 8:30 PM", name: "Hypertrophy", program: "MAN", coach: "Coach Rakesh" },
  ]},
  { day: "Sat", slots: [
    { time: "6:00 – 7:30 AM", name: "Strength + Mobility", program: "ELDER", coach: "Coach Sana" },
    { time: "7:00 – 9:00 AM", name: "Dangal Day — Team Challenge", program: "MAN", coach: "Coach Imran" },
    { time: "9:00 – 10:30 AM", name: "Strength & HIIT (Women only)", program: "WOMAN", coach: "Coach Ayesha" },
    { time: "5:00 – 6:00 PM", name: "Junior Strength (11–15)", program: "KID", coach: "Coach Sana" },
    { time: "5:30 – 7:00 PM", name: "Core, Posture & Flow", program: "WOMAN", coach: "Coach Ayesha" },
  ]},
  { day: "Sun", slots: [
    { time: "6:00 – 8:00 AM", name: "Open floor + Stretch Club", program: "ALL", coach: "Duty coach" },
    { time: "8:00 – 10:00 AM", name: "Family Fitness Hour", program: "ALL", coach: "Coach Imran" },
  ]},
];

export const TRAINING_TYPES = [
  { title: "Strength & Powerlifting", image: IMG.squat, body: "Olympic-grade racks, calibrated plates and coached lifts to build raw strength safely." },
  { title: "Bodybuilding & Hypertrophy", image: IMG.weights, body: "Structured muscle-building blocks with a full range of free weights and plate-loaded machines." },
  { title: "Dangal Conditioning", image: IMG.ropes, body: "Battle ropes, sleds, kettlebells and wrestling-inspired circuits for relentless stamina." },
  { title: "Functional & HIIT", image: IMG.hall, body: "Fast, fun, high-intensity group training that burns fat and sharpens athleticism." },
  { title: "Personal Training", image: IMG.coach1, body: "One-to-one coaching, custom programming and accountability for faster results." },
  { title: "Mobility & Recovery", image: IMG.elder, body: "Stretching, foam-rolling and breathwork to keep you training for decades." },
];

export const DIET_PLANS = [
  { name: "Lean & Shred", goal: "Fat loss", kcal: "1,500 – 1,800", macros: "40% protein · 35% carbs · 25% fat", meals: ["Early: warm water + soaked almonds", "Breakfast: moong chilla / egg-white omelette + curd", "Lunch: 2 rotis, dal, sabzi, salad", "Snack: roasted chana / sprouts", "Dinner: grilled paneer or chicken with sautéed veg"] },
  { name: "Lean Mass", goal: "Muscle gain", kcal: "2,600 – 3,200", macros: "30% protein · 45% carbs · 25% fat", meals: ["Breakfast: eggs/paneer paratha + milk + banana", "Mid: peanut butter sandwich + whey", "Lunch: rice, dal, chicken/paneer curry, curd", "Pre-workout: oats + fruit", "Dinner: roti, sabzi, eggs/fish + milk"] },
  { name: "Balanced Vegetarian", goal: "General fitness", kcal: "1,900 – 2,300", macros: "25% protein · 50% carbs · 25% fat", meals: ["Breakfast: poha/upma with sprouts", "Lunch: dal, rice/roti, sabzi, curd", "Snack: fruit + nuts / buttermilk", "Dinner: khichdi / paneer bhurji with roti"] },
  { name: "40+ Heart-Smart", goal: "Healthy ageing", kcal: "1,700 – 2,100", macros: "25% protein · 45% carbs · 30% fat (unsaturated)", meals: ["Breakfast: oats/ragi porridge + nuts", "Lunch: millet roti, dal, leafy veg, salad", "Snack: fruit + buttermilk", "Dinner: light soup, grilled protein, veg"] },
];

export const SUPPLEMENT_GUIDE = [
  { name: "Whey / plant protein", note: "A convenient way to hit your daily protein target. Food first; supplement the gap." },
  { name: "Creatine monohydrate", note: "Most-researched supplement for strength. 3–5 g daily with water is typical for healthy adults." },
  { name: "Omega-3", note: "Supports heart and joint health, especially if you rarely eat fish." },
  { name: "Vitamin D & Multivitamin", note: "Common deficiencies in India — test first, then supplement if advised." },
  { name: "Caffeine (pre-workout)", note: "Optional performance aid. Avoid late in the day and if sensitive to stimulants." },
];

export const NEXT_BATCH_NOTE = "New batches start on the 1st and 15th of every month."; // PLACEHOLDER
