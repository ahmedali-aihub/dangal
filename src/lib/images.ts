// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER IMAGERY (Unsplash). Replace every URL here with the gym's real
// photography (upload to /public/images or Supabase Storage). One file to edit.
// ─────────────────────────────────────────────────────────────────────────────
const u = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const IMG = {
  hero: u("1605296867304-46d5465a13f1"),
  man: u("1581009146145-b5ef050c2e1e"),
  woman: u("1546483875-ad9014c88eba"),
  elder: u("1544367567-0f2fcb009e0b"),
  kid: u("1571019613454-1cb2f99b2d8b"),
  floor: u("1540497077202-7c8a3999166f"),
  floor2: u("1583454110551-21f2fa2afe61"),
  weights: u("1534438327276-14e5300c3a48"),
  racks: u("1558611848-73f7eb4001a1"),
  studio: u("1593079831268-3381b0db4a77"),
  hall: u("1526506118085-60ce8714f8c5"),
  ropes: u("1599058917212-d750089bc07e"),
  squat: u("1517836357463-d25dfeac3438"),
  bar: u("1574680096145-d05b474e2155"),
  // Trainer portraits — PLACEHOLDERS, replace with real coach photos via Admin → Trainers.
  coach1: u("1581009146145-b5ef050c2e1e"),
  coach2: u("1594381898411-846e7d193883"),
  coach3: u("1526506118085-60ce8714f8c5"),
  coach4: u("1574680096145-d05b474e2155"),
  group: u("1518611012118-696072aa579a"),
  monochrome: u("1571902943202-507ec2618e8f"),
  grip: u("1549060279-7e168fcee0c2"),
  transform: u("1594381898411-846e7d193883"),
};

/** Build an optimised Unsplash URL (placeholder helper). Non-Unsplash URLs pass through. */
export const img = (src: string, w = 1600, q = 70) =>
  src.includes("images.unsplash.com") ? `${src}?auto=format&fit=crop&w=${w}&q=${q}` : src;

/** Tiny blurred placeholder so images fade in without layout shift. */
export const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjUiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjUiIGZpbGw9IiMxMTExMTMiLz48L3N2Zz4=";
