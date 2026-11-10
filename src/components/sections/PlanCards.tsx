import { clsx } from "clsx";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Motion";
import type { Plan } from "@/lib/types";
import { PlanSwitcher } from "./PlanSwitcher";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function StaticItem({ children, className }: { children: React.ReactNode; className?: string; as?: "li"; delay?: number }) {
  return <li className={className}>{children}</li>;
}
const monthsOf = (p: Plan) => Number(p.duration.match(/\d+/)?.[0] ?? 1);

/**
 * Membership plans with a Total / Per-month toggle and "you save" vs paying monthly. Rendered on ink.
 * `reveal={false}` when the cards start on screen (no scroll fade for content already in view).
 */
export function PlanCards({ plans, reveal = true }: { plans: Plan[]; reveal?: boolean }) {
  const monthly = plans.find((p) => monthsOf(p) === 1)?.price;
  const Item = reveal ? Reveal : StaticItem;

  return (
    <PlanSwitcher>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p, i) => {
          const months = monthsOf(p);
          const perMonth = Math.round(p.price / months);
          const save = monthly && months > 1 ? monthly * months - p.price : 0;
          return (
            <Item as="li" key={p.id} delay={i * 0.06} className="h-full">
              <article
                className={clsx(
                  "group relative flex h-full flex-col rounded-[22px] p-7 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:-translate-y-1.5",
                  p.highlight
                    ? "bg-titanium text-ink shadow-[0_30px_90px_-30px_rgba(255,255,255,0.14)] ring-2 ring-ember"
                    : "border border-titanium/15 bg-titanium/[0.04] text-titanium hover:border-titanium/35",
                )}
              >
                {/* "Best choice" stamp for the featured plan (echoes the gym's existing price list) */}
                {p.highlight && p.badge && (
                  <span
                    aria-hidden
                    className="absolute -right-3 -top-5 inline-flex h-[74px] w-[74px] rotate-[10deg] flex-col items-center justify-center rounded-full bg-ember text-center text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-ink ring-4 ring-ink shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:rotate-[-4deg] group-hover:scale-110"
                  >
                    {p.badge.split(" ").map((w) => (
                      <span key={w}>{w}</span>
                    ))}
                  </span>
                )}
                <div className="flex min-h-[3.75rem] items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl tracking-[-0.02em]">{p.name}</h3>
                    <p className="mt-1 text-sm opacity-70">{p.duration}</p>
                  </div>
                  {p.badge && !p.highlight && <span className="shrink-0 rounded-full bg-titanium/15 px-3 py-1 text-[11px] font-medium">{p.badge}</span>}
                  {p.badge && p.highlight && <span className="sr-only">{p.badge}</span>}
                </div>

                <div className="mt-10">
                  <p className="h-5 text-sm opacity-70">
                    {p.original_price && p.original_price > p.price ? (
                      <>
                        <span className="sr-only">Regular price </span>
                        <s className="group-data-[view=month]/plans:hidden">{inr(p.original_price)}</s>
                        <s className="hidden group-data-[view=month]/plans:inline">{inr(Math.round(p.original_price / months))} / mo</s>
                      </>
                    ) : null}
                  </p>
                  {/* Total view */}
                  <div className="group-data-[view=month]/plans:hidden">
                    <p className="fade-up mt-1 text-[3rem] font-light leading-none tracking-[-0.045em] tabular-nums">{inr(p.price)}</p>
                    <p className="mt-2 h-5 text-sm opacity-70">{months > 1 ? `≈ ${inr(perMonth)} / month` : "Billed monthly"}</p>
                  </div>
                  {/* Per-month view */}
                  <div className="hidden group-data-[view=month]/plans:block">
                    <p className="fade-up mt-1 text-[3rem] font-light leading-none tracking-[-0.045em] tabular-nums">
                      {inr(perMonth)}
                      <span className="text-base tracking-normal opacity-70"> /mo</span>
                    </p>
                    <p className="mt-2 h-5 text-sm opacity-70">{months > 1 ? `${inr(p.price)} paid upfront` : "Billed monthly"}</p>
                  </div>
                  <p className="mt-4 h-7">
                    {save > 0 && (
                      <span className={clsx("inline-flex rounded-full px-3 py-1 text-xs font-semibold", "bg-ember text-ink")}>
                        Save {inr(save)} vs monthly
                      </span>
                    )}
                  </p>
                </div>

                <ul className={clsx("mt-6 flex-1 space-y-3 border-t pt-6 text-[14px]", p.highlight ? "border-ink/10" : "border-titanium/10")}>
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
                      <span className="opacity-85">{f}</span>
                    </li>
                  ))}
                </ul>

                <ButtonLink href={`/contact?plan=${encodeURIComponent(p.name)}#trial`} variant={p.highlight ? "ember" : "outline-titanium"} className="mt-8 w-full" arrow>
                  {`Join ${p.name}`}
                </ButtonLink>
              </article>
            </Item>
          );
        })}
      </ul>
    </PlanSwitcher>
  );
}
