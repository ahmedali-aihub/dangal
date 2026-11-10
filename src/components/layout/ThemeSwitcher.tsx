"use client";

import { clsx } from "clsx";
import { Check, Palette } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export const THEMES = [
  { id: "space", label: "Space Black", note: "Black & silver, orange spark", base: "#111113", accent: "#FF6A3D" },
  { id: "blue", label: "Blue Titanium", note: "Deep blue, ice-blue spark", base: "#0e1422", accent: "#5AA9FF" },
  { id: "natural", label: "Natural Titanium", note: "Warm graphite, champagne", base: "#1c1915", accent: "#E0B07A" },
  { id: "green", label: "Alpine Green", note: "Forest black, mint spark", base: "#0e1612", accent: "#50DC96" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
const KEY = "dangal-theme";

/** Reads/sets the theme. The attribute is applied before first paint by the inline script in the root layout. */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>("space");

  useEffect(() => {
    const cur = document.documentElement.dataset.theme as ThemeId | undefined;
    if (cur && THEMES.some((t) => t.id === cur)) setThemeState(cur);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue && THEMES.some((t) => t.id === e.newValue)) {
        document.documentElement.dataset.theme = e.newValue;
        setThemeState(e.newValue as ThemeId);
      }
    };
    window.addEventListener("storage", onStorage); // keeps other open tabs in sync
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.dataset.theme = id;
    setThemeState(id);
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* private mode: the choice just lasts for this visit */
    }
    const base = THEMES.find((t) => t.id === id)?.base;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", base ?? "#111113");
    window.setTimeout(() => root.classList.remove("theme-anim"), 600);
  }, []);

  return { theme, setTheme };
}

function Swatch({ base, accent, className }: { base: string; accent: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx("inline-block shrink-0 rounded-full ring-1 ring-titanium/30", className)}
      style={{ background: `linear-gradient(135deg, ${base} 0 50%, ${accent} 50% 100%)` }}
    />
  );
}

/** Round palette button in the header that opens a small panel of themes. */
export function ThemeButton({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <div ref={box} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        title="Change theme"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-titanium/15 bg-titanium/[0.08] transition-colors duration-300 hover:bg-titanium/15"
      >
        <Palette className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden />
        <span className="sr-only">Change theme</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme"
          className="fade-in absolute right-0 top-[calc(100%+14px)] z-50 w-[272px] rounded-3xl border border-titanium/15 bg-ink-900/95 p-2 text-titanium shadow-glass backdrop-blur-xl"
        >
          <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-eyebrow text-titanium/60">Theme</p>
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="menuitemradio"
              aria-checked={theme === t.id}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              className={clsx("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors", theme === t.id ? "bg-titanium/[0.12]" : "hover:bg-titanium/[0.07]")}
            >
              <Swatch base={t.base} accent={t.accent} className="h-7 w-7" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{t.label}</span>
                <span className="block truncate text-xs text-titanium/60">{t.note}</span>
              </span>
              {theme === t.id && <Check className="h-4 w-4 text-ember" strokeWidth={2} aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Inline theme picker for the full-screen menu (the only theme control on phones). */
export function ThemeSwatches() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <p className="eyebrow text-titanium/65">Theme</p>
      <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Theme">
        {THEMES.map((t) => (
          <button
            key={t.id}
            role="radio"
            aria-checked={theme === t.id}
            onClick={() => setTheme(t.id)}
            className={clsx("flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition-colors", theme === t.id ? "border-ember bg-titanium/[0.1]" : "border-titanium/15 hover:bg-titanium/[0.06]")}
          >
            <Swatch base={t.base} accent={t.accent} className="h-6 w-6" />
            <span className="leading-tight">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
