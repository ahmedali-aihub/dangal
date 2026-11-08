import { PageHero } from "@/components/sections/PageHero";

export type LegalSection = { h: string; p: (string | string[])[] };

export function LegalPage({ title, path, updated, intro, sections }: { title: string; path: string; updated: string; intro: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHero eyebrow={`Last updated ${updated}`} title={title} crumbs={[{ name: title, path }]} />
      <section className="bg-cream py-16 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
            <ol className="sticky top-28 space-y-2 text-sm">
              {sections.map((s, i) => (
                <li key={s.h}>
                  <a href={`#s${i + 1}`} className="opacity-70 hover:opacity-100">
                    {i + 1}. {s.h}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="max-w-[720px] text-[16px] leading-[1.75] lg:col-span-8 lg:col-start-5">
            <p className="text-lg">{intro}</p>
            {sections.map((s, i) => (
              <section key={s.h} id={`s${i + 1}`} className="mt-12 scroll-mt-28">
                <h2 className="text-2xl font-normal tracking-[-0.025em]">
                  {i + 1}. {s.h}
                </h2>
                {s.p.map((x, j) =>
                  Array.isArray(x) ? (
                    <ul key={j} className="mt-4 list-disc space-y-2 pl-5 opacity-85">
                      {x.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j} className="mt-4 opacity-85">
                      {x}
                    </p>
                  ),
                )}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
