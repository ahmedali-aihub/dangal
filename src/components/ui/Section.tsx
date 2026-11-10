import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Reveal } from "./Motion";
import { SplitText } from "./SplitText";

export function Section({
  tone = "titanium",
  id,
  className,
  children,
  label,
}: {
  tone?: "titanium" | "ink" | "sand";
  id?: string;
  className?: string;
  children: ReactNode;
  label?: string;
}) {
  return (
    <section
      id={id}
      aria-label={label}
      className={clsx(
        // content-visibility: skip style/layout/paint for off-screen sections until they approach the viewport
        "relative py-20 [contain-intrinsic-size:auto_900px] [content-visibility:auto] sm:py-28 lg:py-32",
        tone === "ink" && "ink-glow bg-ink text-titanium",
        tone === "titanium" && "bg-titanium text-ink",
        tone === "sand" && "bg-sand text-ink",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Editorial section heading: index · eyebrow, large light title, optional lede on the right. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  lede,
  action,
  className,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("grid gap-8 lg:grid-cols-12 lg:items-end", className)}>
      <div className="lg:col-span-7">
        <Reveal>
          <p className="eyebrow opacity-70">
            {index && <span className="tabular-nums">{index}</span>}
            {eyebrow}
          </p>
        </Reveal>
        <SplitText as="h2" className="display-lg mt-5 block text-balance">
          {title}
        </SplitText>
      </div>
      {(lede || action) && (
        <Reveal delay={0.1} className="flex flex-col items-start gap-6 lg:col-span-4 lg:col-start-9">
          {lede && <p className="lede text-pretty opacity-75">{lede}</p>}
          {action}
        </Reveal>
      )}
    </div>
  );
}
