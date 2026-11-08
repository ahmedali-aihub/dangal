import { IMG } from "@/lib/images";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  readMins: number;
  category: string;
  image: string;
  body: { h?: string; p: string }[];
};

// PLACEHOLDER ARTICLES — write in the gym's voice or have the coaches review before publishing.
export const POSTS: Post[] = [
  {
    slug: "5-mistakes-beginners-make-in-the-gym",
    title: "5 mistakes beginners make in the gym (and how to avoid them)",
    excerpt: "Skipping warm-ups, chasing weight over form and more — fix these and your progress will accelerate.",
    date: "2026-09-12",
    readMins: 4,
    category: "Training",
    image: IMG.floor,
    body: [
      { p: "Everyone starts somewhere. The good news: most early plateaus come from a handful of avoidable mistakes." },
      { h: "1. Lifting for ego, not form", p: "Heavy weight with poor technique builds injuries, not muscle. Own the movement at a lighter load first; add weight only when every rep looks identical." },
      { h: "2. Skipping the warm-up", p: "Five to ten minutes of dynamic movement raises body temperature and prepares joints. It's the cheapest injury insurance there is." },
      { h: "3. No plan", p: "Random workouts produce random results. Follow a structured programme with progressive overload and track it." },
      { h: "4. Ignoring protein and sleep", p: "Muscle is built in recovery. Aim for adequate protein across meals and 7–8 hours of sleep." },
      { h: "5. Quitting too early", p: "Visible change takes 8–12 weeks of consistency. Show up, trust the process, and let the coach adjust the plan." },
    ],
  },
  {
    slug: "indian-diet-for-muscle-gain",
    title: "How to eat for muscle gain on an Indian diet",
    excerpt: "Dal, paneer, eggs, curd and rotis can absolutely build muscle — here is how to structure your plate.",
    date: "2026-08-03",
    readMins: 5,
    category: "Nutrition",
    image: IMG.weights,
    body: [
      { p: "You don't need imported powders to build muscle. A well-planned Indian diet can deliver everything your body needs." },
      { h: "Anchor each meal with protein", p: "Eggs, chicken, fish, paneer, dal, curd, soya and sprouts. Aim for a palm-sized portion of protein at every meal." },
      { h: "Eat enough, consistently", p: "Muscle gain needs a small calorie surplus. Add a glass of milk, a handful of nuts or an extra roti rather than relying on junk." },
      { h: "Time carbs around training", p: "Rice, roti, oats and fruit before and after training fuel performance and recovery." },
      { p: "General guidance only — for a plan tailored to you, speak to our coaches or a registered dietitian." },
    ],
  },
  {
    slug: "why-strength-training-matters-after-40",
    title: "Why strength training matters even more after 40",
    excerpt: "Muscle, balance and bone density decline with age — resistance training is the best defence.",
    date: "2026-07-18",
    readMins: 4,
    category: "Wellness",
    image: IMG.elder,
    body: [
      { p: "From our 30s we gradually lose muscle and bone density. Resistance training slows — and can partly reverse — that decline." },
      { h: "Start where you are", p: "Machines, dumbbells and bodyweight exercises with controlled tempo are a safe start. Check with your doctor if you have any condition." },
      { h: "Balance is strength too", p: "Single-leg work and mobility drills reduce fall risk and keep you independent." },
      { h: "Consistency beats intensity", p: "Two to three sessions a week, done regularly, change how you feel within weeks." },
    ],
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
