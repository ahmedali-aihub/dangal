import { Plus } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

/** Native <details> accordion: accessible, zero JS, and emits FAQPage schema for rich results. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <ul className="border-t border-ink/10">
        {items.map((f) => (
          <li key={f.q} className="border-b border-ink/10">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg tracking-[-0.015em] sm:text-xl [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-transform duration-300 group-open:rotate-45">
                  <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 pr-12 text-[15px] leading-relaxed opacity-75">{f.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
