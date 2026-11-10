import { Logo } from "@/components/layout/Logo";

/** Split-screen shell for login / 2FA screens. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-titanium lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="fluted absolute inset-0 opacity-50" />
        <Logo className="relative" />
        <div className="relative">
          <p className="eyebrow text-titanium/60">Control room</p>
          <p className="mt-5 max-w-md text-4xl font-light leading-[1.1] tracking-[-0.04em]">
            Run the gym&apos;s website — videos, leads, pricing and more — <span className="serif-accent">without touching code.</span>
          </p>
        </div>
        <p className="relative text-xs text-titanium/65">Protected area · All access is logged</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-light tracking-[-0.035em]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm opacity-70">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}

export const authInput =
  "h-12 w-full rounded-xl border border-ink/15 bg-white px-4 text-[15px] outline-none transition focus:border-ink";
export const authButton =
  "inline-flex h-12 w-full items-center justify-center rounded-full bg-ink text-sm font-medium text-titanium transition-colors hover:bg-ink-700 disabled:opacity-60";
