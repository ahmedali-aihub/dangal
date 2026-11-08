import type { CSSProperties } from "react";

/** Line-by-line masked rise, pure CSS (paints with the HTML — no hydration wait). Owner can override the text per video. */
export function HeroHeadline({ headline }: { headline?: string }) {
  const lines = headline ? headline.split(/\n|\s\/\s/).filter(Boolean) : null;

  const content = lines ?? [
    <>Strength, earned</>,
    <>
      the <span className="serif-accent text-[1.06em]">Dangal</span> way.
    </>,
  ];

  return (
    <h1 className="display-xl max-w-[14ch] text-balance">
      {content.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <span className="rise block" style={{ "--delay": `${0.1 + i * 0.12}s` } as CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </h1>
  );
}
