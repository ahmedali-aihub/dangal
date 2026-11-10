import { clsx } from "clsx";

/** Shared admin UI primitives (server-safe). */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-light tracking-[-0.035em] sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm opacity-65">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("rounded-2xl border border-ink/10 bg-white p-5 sm:p-6", className)}>{children}</div>;
}

export function DemoNotice() {
  return (
    <div className="mb-6 rounded-2xl border border-ink/15 bg-titanium-200/70 px-5 py-4 text-sm">
      <strong className="font-medium">Local demo mode.</strong> You&apos;re previewing the admin panel with sample data. Connect Supabase (see README) to
      save changes, upload videos and receive leads.
    </div>
  );
}

export const btn = {
  primary: "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-titanium transition-colors hover:bg-ink-700 disabled:opacity-50",
  secondary: "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-sm transition-colors hover:border-ink/40 disabled:opacity-50",
  ghost: "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm opacity-75 transition hover:bg-ink/5 hover:opacity-100 disabled:opacity-40",
  danger: "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm text-red-800 transition hover:bg-red-50 disabled:opacity-40",
};

export const field = "h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 text-sm outline-none transition focus:border-ink";
export const labelText = "mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] opacity-70";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "solid" | "outline" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        tone === "solid" && "bg-ink text-titanium",
        tone === "neutral" && "bg-ink/[0.07]",
        tone === "outline" && "border border-ink/20",
      )}
    >
      {children}
    </span>
  );
}
