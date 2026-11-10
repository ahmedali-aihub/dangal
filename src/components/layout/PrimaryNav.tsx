"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// `hideOnPhone`: on narrow phones the bar has room for four links; Contact stays one tap away in the menu and the bottom dock.
const ITEMS: { href: string; label: string; hideOnPhone?: boolean }[] = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/training", label: "Training" },
  { href: "/membership", label: "Membership" },
  { href: "/contact", label: "Contact", hideOnPhone: true },
];

const DRAG_THRESHOLD = 5; // px of movement before a press becomes a drag (below this it's a normal click)

/**
 * Primary navigation, drawn inside the header capsule. A single cream pill marks the current page.
 * It never follows the cursor. It moves only when you:
 *   1. CLICK an item  → glides there (stretching, with a small spring) while the page loads, or
 *   2. DRAG the pill  → grab it, pull it toward another item, release: it snaps to the nearest one and opens it.
 *
 * The label under the pill is navy because the pill carries its OWN copy of the labels, clipped to its
 * shape and counter-moved so they stay aligned with the real ones. Whatever the pill covers is therefore
 * always legible — mid-glide, mid-drag, or on first paint — with no colour state to get out of sync.
 */
export function PrimaryNav() {
  const pathname = usePathname();
  const router = useRouter();
  const bar = useRef<HTMLUListElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const ghost = useRef<HTMLSpanElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const ghosts = useRef<(HTMLSpanElement | null)[]>([]);
  const shown = useRef(false); // was the pill visible at the last placement?
  const dragging = useRef(false);
  const drag = useRef<{ startX: number; left0: number; moved: boolean; pointerId: number } | null>(null);
  const nearest = useRef<number | null>(null);
  const suppressClick = useRef(false);

  const [pending, setPending] = useState<number | null>(null); // clicked, page still loading

  const active = ITEMS.findIndex((i) => (i.href === "/" ? pathname === "/" : pathname === i.href || pathname.startsWith(`${i.href}/`)));
  const target = pending ?? (active >= 0 ? active : null);

  // Left edge of an item relative to the bar's box (a link's offsetLeft is relative to its <li>, not the bar).
  const leftOf = useCallback((el: HTMLElement) => {
    const b = bar.current!;
    return el.getBoundingClientRect().left - b.getBoundingClientRect().left - b.clientLeft;
  }, []);

  // Phones have spare room between links, so the pill is a little wider than its label there.
  const padFor = () => (window.innerWidth < 400 ? 2 : window.innerWidth < 1024 ? 5 : 0);

  const setX = useCallback((left: number) => {
    if (pill.current) pill.current.style.transform = `translate3d(${left}px, 0, 0)`;
    if (ghost.current) ghost.current.style.transform = `translate3d(${-left}px, 0, 0)`;
  }, []);

  // Keep the pill's private copy of the labels exactly on top of the real ones.
  const alignGhosts = useCallback(() => {
    links.current.forEach((el, i) => {
      const g = ghosts.current[i];
      if (!el || !g) return;
      g.style.left = `${leftOf(el)}px`;
      g.style.width = `${el.offsetWidth}px`;
    });
  }, [leftOf]);

  const moveTo = useCallback(
    (el: HTMLElement | null) => {
      const p = pill.current;
      const g = ghost.current;
      if (!p || !g) return;
      if (!el || el.offsetWidth === 0) {
        p.style.opacity = "0";
        shown.current = false;
        return;
      }
      alignGhosts();
      const pad = padFor();
      // From hidden (first paint, or arriving from a page that isn't in the nav): appear in place, don't fly in.
      const snap = !shown.current;
      if (snap) {
        p.style.transition = "none";
        g.style.transition = "none";
      }
      p.style.width = `${el.offsetWidth + pad * 2}px`;
      setX(leftOf(el) - pad);
      p.style.opacity = "1";
      if (snap) {
        void p.offsetWidth; // flush, then re-enable transitions for later moves
        p.style.transition = "";
        g.style.transition = "";
      }
      shown.current = true;
    },
    [alignGhosts, leftOf, setX],
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
    const re = () => {
      alignGhosts();
      place();
    };
    window.addEventListener("resize", re);
    document.fonts?.ready.then(re);
    return () => window.removeEventListener("resize", re);
  }, [place, alignGhosts]);

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
      ghost.current!.classList.add("is-dragging");
      b.style.cursor = "grabbing";
    }
    const p = pill.current!;
    const w = p.offsetWidth;
    const left = Math.min(Math.max(d.left0 + dx, -padFor()), b.clientWidth - w + padFor());
    setX(left);

    // Which item is the pill over right now? (nearest centre) — the pill morphs to its width as you drag.
    const centre = left + w / 2;
    let best = -1;
    let bestDist = Infinity;
    links.current.forEach((el, i) => {
      if (!el || el.offsetWidth === 0) return;
      const dist = Math.abs(leftOf(el) + el.offsetWidth / 2 - centre);
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    });
    if (best >= 0 && nearest.current !== best) {
      nearest.current = best;
      p.style.width = `${links.current[best]!.offsetWidth + padFor() * 2}px`;
    }
  };

  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return; // plain click: let the link handle it
    bar.current!.style.cursor = "";
    dragging.current = false;
    pill.current!.classList.remove("is-dragging");
    ghost.current!.classList.remove("is-dragging");
    suppressClick.current = true;
    setTimeout(() => {
      suppressClick.current = false;
    }, 0);

    const idx = nearest.current ?? (active >= 0 ? active : 0);
    nearest.current = null;
    moveTo(links.current[idx]); // snap (animated) to the nearest item
    if (idx !== active) {
      setPending(idx);
      router.push(ITEMS[idx].href);
    }
  };

  const text = "text-[clamp(11px,3vw,14px)] font-medium tracking-[0.01em] lg:text-[14px]";

  return (
    <nav aria-label="Primary" className="min-w-0 flex-1 sm:flex-none">
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
        className="relative mx-1 flex cursor-pointer touch-pan-y select-none items-center justify-between sm:mx-0 sm:justify-start sm:gap-1"
      >
        {ITEMS.map(({ href, label, hideOnPhone }, i) => (
          <li key={href} className={clsx("relative z-10", hideOnPhone && "hidden min-[520px]:block")}>
            <Link
              ref={(el) => {
                links.current[i] = el;
              }}
              href={href}
              draggable={false}
              aria-current={i === active ? "page" : undefined}
              onClick={() => setPending(i)} // glide immediately on click, while the page loads
              className={clsx(
                "flex h-9 items-center rounded-full px-[clamp(3px,1vw,12px)] text-cream/75 outline-none transition-colors duration-300 hover:text-cream focus-visible:ring-2 focus-visible:ring-cream/70 sm:px-4 lg:h-10 lg:px-5",
                text,
              )}
              style={{ cursor: "inherit" }}
            >
              {label}
            </Link>
          </li>
        ))}

        {/* The pill — above the labels, carrying its own navy copy of them (clipped to the pill's shape). */}
        <span
          ref={pill}
          aria-hidden
          className="nav-pill pointer-events-none absolute inset-y-0 left-0 z-20 overflow-hidden rounded-full bg-cream opacity-0 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.55)]"
        >
          <span ref={ghost} className="nav-ghost absolute left-0 top-0 h-full w-full">
            {ITEMS.map(({ href, label }, i) => (
              <span
                key={href}
                ref={(el) => {
                  ghosts.current[i] = el;
                }}
                className={clsx("absolute top-0 flex h-full items-center justify-center whitespace-nowrap text-navy", text)}
              >
                {label}
              </span>
            ))}
          </span>
        </span>
      </ul>
    </nav>
  );
}
