import Link from "next/link";
import { clsx } from "clsx";
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type Variant = "silver" | "titanium" | "ink" | "outline-titanium" | "outline-ink" | "text-titanium" | "text-ink";

const styles: Record<Variant, string> = {
  // Primary action: polished silver. Ink text on silver is > 15:1.
  silver:
    "bg-gradient-to-b from-white to-silver-600 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_10px_30px_-12px_rgba(255,255,255,0.35)] hover:to-silver hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_14px_36px_-12px_rgba(255,255,255,0.5)]",
  titanium: "bg-titanium text-ink hover:bg-white",
  ink: "bg-ink text-titanium hover:bg-ink-700",
  "outline-titanium": "border border-titanium/30 text-titanium hover:border-titanium/70 hover:bg-titanium/5",
  "outline-ink": "border border-ink/25 text-ink hover:border-ink/60 hover:bg-ink/[0.03]",
  "text-titanium": "text-titanium px-0 hover:opacity-80",
  "text-ink": "text-ink px-0 hover:opacity-70",
};

type Props = {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  arrow?: boolean;
  children: ReactNode;
  className?: string;
};

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-[background-color,border-color,color,opacity,transform] duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50";

const sizes = { sm: "h-9 px-4 text-[13px]", md: "h-11 px-6 text-sm", lg: "h-[52px] px-7 text-[15px]" };

function Inner({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      {typeof children === "string" ? (
        // Text roll on hover (see .roll in globals.css)
        <span className="roll" data-text={children}>
          <span>{children}</span>
        </span>
      ) : (
        <span>{children}</span>
      )}
      {arrow && (
        <ArrowUpRight
          aria-hidden
          className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          strokeWidth={1.75}
        />
      )}
    </>
  );
}

export function ButtonLink({
  variant = "ink",
  size = "md",
  arrow,
  children,
  className,
  ...rest
}: Props & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  const isText = variant.startsWith("text");
  return (
    <Link className={clsx(base, !isText && sizes[size], isText && "text-sm", styles[variant], className)} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  );
}

export function ExternalButton({
  variant = "ink",
  size = "md",
  arrow,
  children,
  className,
  ...rest
}: Props & Omit<ComponentProps<"a">, "children" | "className">) {
  const isText = variant.startsWith("text");
  return (
    <a className={clsx(base, !isText && sizes[size], isText && "text-sm", styles[variant], className)} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </a>
  );
}

export function Button({
  variant = "ink",
  size = "md",
  arrow,
  children,
  className,
  ...rest
}: Props & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button className={clsx(base, sizes[size], styles[variant], className)} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  );
}
