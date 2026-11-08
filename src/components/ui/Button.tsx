import Link from "next/link";
import { clsx } from "clsx";
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type Variant = "coral" | "cream" | "navy" | "outline-cream" | "outline-navy" | "text-cream" | "text-navy";

const styles: Record<Variant, string> = {
  // Primary action. Navy text on coral = 5.8:1 (AA).
  coral: "bg-coral text-navy shadow-[0_10px_30px_-10px_rgba(255,107,91,0.7)] hover:bg-coral-400 hover:shadow-[0_14px_36px_-10px_rgba(255,107,91,0.85)]",
  cream: "bg-cream text-navy hover:bg-white",
  navy: "bg-navy text-cream hover:bg-navy-700",
  "outline-cream": "border border-cream/30 text-cream hover:border-cream/70 hover:bg-cream/5",
  "outline-navy": "border border-navy/25 text-navy hover:border-navy/60 hover:bg-navy/[0.03]",
  "text-cream": "text-cream px-0 hover:opacity-80",
  "text-navy": "text-navy px-0 hover:opacity-70",
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
  variant = "navy",
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
  variant = "navy",
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
  variant = "navy",
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
