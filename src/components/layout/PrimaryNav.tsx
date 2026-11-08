"use client";

import { clsx } from "clsx";
import { CreditCard, Dumbbell, House, LayoutGrid, MessageCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const ITEMS: { href: string; label: string; icon: LucideIcon; solid: boolean }[] = [
  { href: "/", label: "Home", icon: House, solid: true },
  { href: "/programs", label: "Programs", icon: LayoutGrid, solid: true },
  { href: "/training", label: "Training", icon: Dumbbell, solid: false },
  { href: "/membership", label: "Membership", icon: CreditCard, solid: true },
  { href: "/contact", label: "Contact", icon: MessageCircle, solid: true },
];

const DRAG_THRESHOLD = 5; // px of movement before a press becomes a drag (below this it's a normal click)

/**
 * Desktop navigation with a single cream pill that marks the current page.
 * It never follows the cursor. It moves only when you:
 *   1. CLICK an item  → glides there (stretching, with a small spring) while the page loads, or
 *   2. DRAG the pill  → grab it, pull it toward another item, release: it snaps to the nearest one and opens it.
 * The icon under the pill turns solid and its label turns navy.
 */
export function PrimaryNav() {
  const pathname = usePathname();
  const router = useRouter();
  const bar = useRef<HTMLUListElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const shown = useRef(false); // was the pill visible at the last placement?
  const dragging = useRef(false);
  const drag = useRef<{ startX: number; left0: number; moved: boolean; pointerId: number } | null>(null);
  const nearest = useRef<number | null>(null);
  const suppressClick = useRef(false);

  const [pending, setPending] = useState<number | null>(null); // clicked, page still loading
  const [dragIdx, setDragIdx] = useState<number | null>(null); // item currently under the dragged pill

  const active = ITEMS.findIndex((i) => (i.href === "/" ? pathname === "/" : pathname === i.href || pathname.startsWith(`${i.href}/`)));
  const target = dragIdx ?? pending ?? (active >= 0 ? active : null);

  // Left edge of an item relative to the bar's inner box (a link's offsetLeft is relative to its <li>, not the bar).
  const leftOf = useCallback((el: HTMLElement) => {
    const b = bar.current!;
    return el.getBoundingClientRect().left - b.getBoundingClientRect().left - b.clientLeft;
  }, []);

  const moveTo = useCallback(
    (el: HTMLElement | null) => {
      const p = pill.current;
      if (!p) return;
      if (!el) {
        p.style.opacity = "0";
        shown.current = false;
        return;
      }
      // From hidden (first paint, or arriving from the Home page): appear in place, don't fly in from the old spot.
      const snap = !shown.current;
      if (snap) p.style.transition = "none";
      p.style.width = `${el.offsetWidth}px`;
      p.style.transform = `translate3d(${leftOf(el)}px, 0, 0)`;
      p.style.opacity = "1";
      if (snap) {
        void p.offsetWidth; // flush, then re-enable transitions for later moves
        p.style.transition = "";
      }
      shown.current = true;
    },
    [leftOf],
  );

  const place = useCallback(() => {
    if (dragging.current) return;
    moveTo(target === null ? null : links.current[target]);
  }, [target, moveTo]);

  useLayoutEffect(place, [place]);

  // Navigation finished: the real route is now the source of truth.
  useEffect(() => setPending(null), [pathname]);

  // Re-measure when web fonts load or the window resizes (label widths change).
  useEffect(() => {
    const re = () => place();
    window.addEventListener("resize", re);
    document.fonts?.ready.then(re);
    return () => window.removeEventListener("resize", re);
  }, [place]);

  const overPill = (e: React.PointerEvent) => {
    const p = pill.current;
    if (!p || p.style.opacity === "0") return false;
    const r = p.getBoundingClientRect();
    return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.button !== 0 || !overPill(e)) return;
    const b = bar.current!;
    const left0 = pill.current!.getBoundingClientRect().left - b.getBoundingClientRect().left - b.clientLeft;
    drag.current = { startX: e.clientX, left0, moved: false, pointerId: e.pointerId };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    const b = bar.current!;
    if (!d) {
      b.style.cursor = overPill(e) ? "grab" : "";
      return;
    }
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      d.moved = true;
      dragging.current = true;
      b.setPointerCapture(d.pointerId);
      pill.current!.classList.add("is-dragging");
      b.style.cursor = "grabbing";
    }
    const p = pill.current!;
    const w = p.offsetWidth;
    const left = Math.min(Math.max(d.left0 + dx, 0), b.clientWidth - w);
    p.style.transform = `translate3d(${left}px, 0, 0)`;

    // Which item is the pill over right now? (nearest centre) — it lights up live as you drag.
    const centre = left + w / 2;
    let best = 0;
    let bestDist = Infinity;
    links.current.forEach((el, i) => {
      if (!el) return;
      const dist = Math.abs(leftOf(el) + el.offsetWidth / 2 - centre);
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    });
    if (nearest.current !== best) {
      nearest.current = best;
      setDragIdx(best);
      p.style.width = `${links.current[best]!.offsetWidth}px`; // morphs to the width of the item it's over
    }
  };

  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return; // plain click: let the link handle it
    bar.current!.style.cursor = "";
    dragging.current = false;
    pill.current!.classList.remove("is-dragging");
    suppressClick.current = true;
    setTimeout(() => {
      suppressClick.current = false;
    }, 0);

    const idx = nearest.current ?? (active >= 0 ? active : 0);
    nearest.current = null;
    setDragIdx(null);
    moveTo(links.current[idx]); // snap (animated) to the nearest item
    if (idx !== active) {
      setPending(idx);
      router.push(ITEMS[idx].href);
    }
  };

  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul
        ref={bar}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="glass-strong relative flex cursor-pointer select-none items-center gap-1 rounded-full p-1.5"
      >
        {/* the sliding pill */}
        <span
          ref={pill}
          aria-hidden
          className="nav-pill pointer-events-none absolute inset-y-1.5 left-0 rounded-full bg-cream opacity-0 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]"
        />
        {ITEMS.map(({ href, label, icon: Icon, solid }, i) => {
          const under = target === i;
          return (
            <li key={href} className="relative z-10">
              <Link
                ref={(el) => {
                  links.current[i] = el;
                }}
                href={href}
                draggable={false}
                aria-current={i === active ? "page" : undefined}
                onClick={() => setPending(i)} // glide immediately on click, while the page loads
                className={clsx(
                  "flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-cream/70",
                  under ? "text-navy" : "text-cream/75 hover:text-cream",
                )}
                style={{ cursor: "inherit" }}
              >
                <Icon
                  className={clsx("h-[18px] w-[18px] transition-all duration-300", under && solid ? "fill-current" : "fill-transparent", under && "scale-110")}
                  strokeWidth={under ? 2 : 1.6}
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
