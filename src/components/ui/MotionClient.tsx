"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Subtle magnetic pull for primary CTAs (mouse only). */
export function Magnetic({ children, strength = 0.22 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={ref}
      className="inline-flex transition-transform duration-300 ease-out will-change-transform"
      onPointerMove={(e) => {
        const el = ref.current;
        if (e.pointerType !== "mouse" || !el || prefersReduced()) return;
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * strength}px, ${(e.clientY - (r.top + r.height / 2)) * strength}px)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </span>
  );
}

/** Count-up number that starts when visible. Screen readers get the final value immediately. */
export function Counter({ to, suffix = "", duration = 1.8 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) return; // already on screen at load: show the real number
    setVal(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / (duration * 1000));
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(to * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "-40px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref}>
      <span className="sr-only">
        {to.toLocaleString("en-IN")}
        {suffix}
      </span>
      <span aria-hidden>
        {val.toLocaleString("en-IN")}
        {suffix}
      </span>
    </span>
  );
}
