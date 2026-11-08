import Image from "next/image";
import Link from "next/link";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { SplitText } from "@/components/ui/SplitText";
import { BLUR, img } from "@/lib/images";

/** Inset navy hero for inner pages — consistent with the home hero, shorter. */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  crumbs,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  image?: string;
  crumbs: { name: string; path: string }[];
  children?: React.ReactNode;
}) {
  const trail = [{ name: "Home", path: "/" }, ...crumbs];
  return (
    <section className="bg-cream p-2 sm:p-3">
      <JsonLd data={breadcrumbSchema(trail)} />
      <div className="relative isolate overflow-hidden rounded-[22px] bg-navy text-cream sm:rounded-[28px]">
        {image && (
          <>
            <Image
              src={img(image, 1920)}
              alt=""
              fill
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL={BLUR}
              className="-z-10 object-cover opacity-60 lg:animate-kenburns motion-reduce:animate-none"
            />
            <div aria-hidden className="absolute inset-0 -z-10 bg-navy/55" />
          </>
        )}
        <div aria-hidden className="fluted absolute inset-0 -z-10 opacity-50" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-navy-950/30" />

        <div className="container-x flex min-h-[460px] flex-col justify-end pb-12 pt-36 sm:min-h-[540px] sm:pb-16">
          <nav aria-label="Breadcrumb" className="mb-8 text-[12px] text-cream/60">
            <ol className="flex flex-wrap items-center gap-2">
              {trail.map((c, i) => (
                <li key={c.path} className="flex items-center gap-2">
                  {i < trail.length - 1 ? (
                    <Link href={c.path} className="hover:text-cream">
                      {c.name}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-cream/90">
                      {c.name}
                    </span>
                  )}
                  {i < trail.length - 1 && <span aria-hidden>/</span>}
                </li>
              ))}
            </ol>
          </nav>
          {/* Above the fold: CSS entrance (paints immediately, no hydration wait) */}
          <div>
            <p className="fade-up eyebrow text-cream/75">{eyebrow}</p>
            <SplitText as="h1" mode="load" className="display-lg mt-5 block max-w-[18ch] text-balance">
              {title}
            </SplitText>
          </div>
          {(intro || children) && (
            <div className="fade-up mt-8 grid gap-8 border-t border-cream/15 pt-8 lg:grid-cols-12" style={{ ["--delay" as string]: "0.12s" }}>
              {intro && <p className="lede text-cream/80 lg:col-span-6">{intro}</p>}
              {children && <div className="lg:col-span-5 lg:col-start-8">{children}</div>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
