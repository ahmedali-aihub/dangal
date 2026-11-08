import { IMG } from "@/lib/images";

export type Program = {
  slug: string;
  name: string; // keep the existing program names
  short: string;
  audience: string;
  tagline: string;
  image: string;
  philosophy: string[];
  workouts: { title: string; detail: string }[];
  benefits: string[];
  schedule: { days: string; time: string; focus: string }[];
  idealFor: string[];
};

// PLACEHOLDER COPY — owner to review programs, timings and claims before launch.
export const PROGRAMS: Program[] = [
  {
    slug: "fittest-man",
    name: "I AM THE FITTEST MAN",
    short: "MAN",
    audience: "Men, 16–40",
    tagline: "Build the body. Forge the mind. Own the arena.",
    image: IMG.man,
    philosophy: [
      "In the akhara, strength is never for show — it is earned through repetition, discipline and humility. This program carries that spirit into a modern strength lab.",
      "We combine progressive overload, athletic conditioning and mobility so you build muscle that performs, a heart that endures and a body that stays injury-free.",
    ],
    workouts: [
      { title: "Strength Foundations", detail: "Squat, hinge, press, pull and carry patterns coached to perfect technique before heavy load." },
      { title: "Hypertrophy Blocks", detail: "Structured 12-week muscle-building cycles with tracked progression." },
      { title: "Dangal Conditioning", detail: "Battle ropes, sled pushes, kettlebell complexes and wrestling-inspired circuits." },
      { title: "Mobility & Recovery", detail: "Joint-prep, stretching and breathwork to train hard and recover harder." },
    ],
    benefits: [
      "Lean muscle & raw strength",
      "Fat loss that lasts",
      "Higher energy through better sleep, nutrition and training habits",
      "Confidence, posture and presence",
      "Personalised nutrition guidance",
    ],
    schedule: [
      { days: "Mon · Wed · Fri", time: "6:00 – 7:30 AM", focus: "Strength + conditioning" },
      { days: "Mon · Wed · Fri", time: "7:00 – 8:30 PM", focus: "Hypertrophy" },
      { days: "Saturday", time: "7:00 – 9:00 AM", focus: "Dangal Day — team challenge" },
    ],
    idealFor: ["First-time lifters", "Office-goers wanting strength", "Athletes cross-training"],
  },
  {
    slug: "fittest-woman",
    name: "I AM THE FITTEST WOMAN",
    short: "WOMAN",
    audience: "Women, 16–45",
    tagline: "Strong is the new standard. Unapologetically.",
    image: IMG.woman,
    philosophy: [
      "Strength training reshapes how you move, feel and carry yourself. This program is built around women's physiology — hormones, bone density, recovery and real-life schedules.",
      "Expect a supportive, respectful floor, female-friendly coaching and results you can measure: strength, stamina and confidence.",
    ],
    workouts: [
      { title: "Strength & Shape", detail: "Glute, core and upper-body strength using free weights and machines." },
      { title: "HIIT & Fat Burn", detail: "Short, intense intervals that respect your joints and your calendar." },
      { title: "Core & Posture", detail: "Pilates-inspired core work for a stronger back and pelvic floor." },
      { title: "Flexibility Flow", detail: "Yoga-style mobility and stress-reset sessions." },
    ],
    benefits: [
      "Toned, strong physique",
      "Better bone density & posture",
      "Weight-management friendly plans",
      "Stress relief and better sleep",
      "Women-only batches available",
    ],
    schedule: [
      { days: "Mon – Sat", time: "9:00 – 10:30 AM", focus: "Women-only strength & HIIT" },
      { days: "Tue · Thu · Sat", time: "5:30 – 7:00 PM", focus: "Core, posture & flow" },
    ],
    idealFor: ["Beginners nervous about the gym", "Returning to fitness after a break", "Women chasing strength goals"],
  },
  {
    slug: "fittest-elder",
    name: "I AM THE FITTEST ELDER (40+)",
    short: "ELDER 40+",
    audience: "Adults 40+",
    tagline: "Age is a number. Strength is a decision.",
    image: IMG.elder,
    philosophy: [
      "After 40 the body asks for smarter training, not less training. Muscle, balance and joint health are the real anti-ageing medicine.",
      "Our coaches design low-impact, high-value sessions that protect joints, support healthy weight and give you energy for the life you love. We work alongside your doctor's advice.",
    ],
    workouts: [
      { title: "Joint-Friendly Strength", detail: "Machine and dumbbell work with controlled tempo to rebuild muscle safely." },
      { title: "Balance & Mobility", detail: "Reduce fall risk, ease stiffness and keep your range of motion." },
      { title: "Heart Health Cardio", detail: "Zone-based walking, cycling and low-impact conditioning." },
      { title: "Breathwork & Relaxation", detail: "Pranayama and stress-management practices to unwind." },
    ],
    benefits: [
      "Better balance and fewer aches",
      "Support for healthy weight and an active lifestyle",
      "Preserved muscle & bone health",
      "A like-minded community",
      "Doctor-aware programming",
    ],
    schedule: [
      { days: "Mon – Sat", time: "6:00 – 7:30 AM", focus: "Strength + mobility" },
      { days: "Mon · Wed · Fri", time: "11:00 AM – 12:00 PM", focus: "Gentle conditioning" },
    ],
    idealFor: ["Beginners over 40", "Those with a doctor's go-ahead to exercise", "Returning after a long break"],
  },
  {
    slug: "fittest-kid",
    name: "I AM THE FITTEST KID",
    short: "KID",
    audience: "Ages 7–15",
    tagline: "Play hard. Grow strong. Build a champion.",
    image: IMG.kid,
    philosophy: [
      "Children don't need heavy weights — they need movement, coordination and confidence. Our program turns fitness into play and builds habits that last a lifetime.",
      "Coached by trained instructors in a safe, supervised environment, kids learn agility, balance, discipline and teamwork.",
    ],
    workouts: [
      { title: "Agility & Coordination", detail: "Obstacle runs, ladders and ball games." },
      { title: "Bodyweight Strength", detail: "Push, pull, squat and plank fundamentals with perfect form." },
      { title: "Akhara Basics", detail: "Wrestling-inspired balance and flexibility drills — fun and safe." },
      { title: "Sports Skills", detail: "Speed, stamina and agility for cricket, football and athletics." },
    ],
    benefits: [
      "Healthy weight and posture",
      "Better focus and discipline",
      "Confidence and teamwork",
      "Screen-time balance",
      "Progress updates for parents",
    ],
    schedule: [
      { days: "Mon · Wed · Fri", time: "5:00 – 6:00 PM", focus: "Ages 7–10" },
      { days: "Tue · Thu · Sat", time: "5:00 – 6:00 PM", focus: "Ages 11–15" },
    ],
    idealFor: ["Active kids needing an outlet", "Young athletes", "Children who need confidence"],
  },
];

export const getProgram = (slug: string) => PROGRAMS.find((p) => p.slug === slug);
