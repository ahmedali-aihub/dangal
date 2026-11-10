import type { Config } from "tailwindcss";

/**
 * Design system: SPACE BLACK + SILVER TITANIUM (an Apple-style monochrome).
 * ink       — space black: dark sections, hero, text on light   (DEFAULT #111113)
 * titanium  — ember titanium: light sections, text on dark     (DEFAULT #F5F5F7)
 * ember    — the bright metal highlight: primary buttons, markers, glow on dark grounds
 */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Every colour is a CSS variable (an "r g b" triplet) so the whole site can switch theme at runtime.
      // The palettes live in globals.css (:root = Space Black, [data-theme=...] = the others).
      colors: {
        ink: { DEFAULT: v("ink-800"), 950: v("ink-950"), 900: v("ink-900"), 800: v("ink-800"), 700: v("ink-700"), 600: v("ink-600"), 500: v("ink-500"), 400: v("ink-400"), 300: v("ink-300") },
        ember: { DEFAULT: v("ember-500"), 300: v("ember-300"), 400: v("ember-400"), 500: v("ember-500"), 600: v("ember-600"), 700: v("ember-700") },
        steel: { DEFAULT: v("steel-500"), 300: v("steel-300"), 400: v("steel-400"), 500: v("steel-500"), 700: v("steel-700"), 900: v("steel-900") },
        sand: { DEFAULT: v("sand-200"), 100: v("sand-100"), 200: v("sand-200"), 300: v("sand-300") },
        titanium: { DEFAULT: v("titanium-100"), 50: v("titanium-50"), 100: v("titanium-100"), 200: v("titanium-200"), 300: v("titanium-300"), 400: v("titanium-400") },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-sans)", "Georgia", "serif"],
      },
      letterSpacing: { tightest: "-0.045em", eyebrow: "0.16em" },
      boxShadow: {
        glass: "0 1px 0 0 rgba(245,245,247,0.12) inset, 0 24px 60px -24px rgba(3,3,5,0.6)",
        soft: "0 1px 2px rgba(17,17,19,0.06), 0 12px 32px -12px rgba(17,17,19,0.18)",
      },
      keyframes: {
        kenburns: { "0%": { transform: "scale(1.02)" }, "100%": { transform: "scale(1.12)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        kenburns: "kenburns 24s ease-in-out infinite alternate",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
