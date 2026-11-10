import type { Config } from "tailwindcss";

/**
 * Design system: SPACE BLACK + SILVER TITANIUM (an Apple-style monochrome).
 * ink       — space black: dark sections, hero, text on light   (DEFAULT #111113)
 * titanium  — silver titanium: light sections, text on dark     (DEFAULT #F5F5F7)
 * silver    — the bright metal highlight: primary buttons, markers, glow on dark grounds
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#111113",
          950: "#050506",
          900: "#09090b",
          800: "#111113",
          700: "#1c1c1f",
          600: "#2a2a2e",
          500: "#48484d",
          400: "#76767c",
          300: "#a1a1a6",
        },
        // Bright metal — primary CTAs, markers, glows. Always pair with ink text (never titanium text).
        silver: {
          DEFAULT: "#ECECF1",
          300: "#ffffff",
          400: "#f7f7fa",
          500: "#ECECF1",
          600: "#d8d8de",
          700: "#c1c1c8",
        },
        titanium: {
          DEFAULT: "#F5F5F7",
          50: "#fbfbfd",
          100: "#F5F5F7",
          200: "#E8E8ED",
          300: "#D2D2D7",
          400: "#AEAEB2",
        },
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
