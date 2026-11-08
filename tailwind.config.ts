import type { Config } from "tailwindcss";

/**
 * Design system: NAVY + CREAM, with a CORAL accent.
 * Navy  #14213D  — brand ground, hero, dark sections
 * Cream #F4EDE0  — light sections, text on navy
 * Coral #FF6B5B  — the spark: primary CTAs, badges, glows, accent words on navy
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#14213D",
          950: "#0a1226",
          900: "#0e1a33",
          800: "#14213D",
          700: "#1e3057",
          600: "#2b4170",
          500: "#41588c",
          400: "#6c80ad",
          300: "#9aa9c9",
        },
        // Accent — used sparingly for energy: primary CTAs, highlights, glows. Pair with navy text (AA), never cream text.
        coral: {
          DEFAULT: "#FF6B5B",
          300: "#ffb0a6",
          400: "#ff8a7d",
          500: "#FF6B5B",
          600: "#f2503f",
          700: "#d93f2f",
        },
        cream: {
          DEFAULT: "#F4EDE0",
          50: "#faf7f0",
          100: "#F4EDE0",
          200: "#ebe1cf",
          300: "#ddd0b8",
          400: "#c4b697",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      letterSpacing: { tightest: "-0.045em", eyebrow: "0.16em" },
      boxShadow: {
        glass: "0 1px 0 0 rgba(244,237,224,0.12) inset, 0 24px 60px -24px rgba(5,10,25,0.6)",
        soft: "0 1px 2px rgba(20,33,61,0.06), 0 12px 32px -12px rgba(20,33,61,0.18)",
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
