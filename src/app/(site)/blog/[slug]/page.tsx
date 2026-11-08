import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCta } from "@/components/sections/FinalCta";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { POSTS, getPost } from "@/content/blog";
import { BLUR, img } from "@/lib/images";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", publishedTime: p.date, images: [img(p.image, 1200)] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const more = POSTS.filter((x) => x.slug !== p.slug).slice(0, 2);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: p.title,
          description: p.excerpt,
          datePublished: p.date,
          image: img(p.image, 1200),
          author: { "@type": "Organization", name: SITE.name },
          publisher: { "@id": `${SITE.url}/#gym` },
          mainEntityOfPage: `${SITE.url}/blog/${p.slug}`,
        }}
      />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: p.title, path: `/blog/${p.slug}` }])} />

      <article className="bg-cream">
        <header className="bg-cream p-2 sm:p-3">
          <div className="rounded-[22px] bg-navy text-cream sm:rounded-[28px]">
            <div className="container-x max-w-4xl pb-14 pt-36 sm:pb-20 sm:pt-44">
              <Link href="/blog" className="text-sm text-cream/70 hover:text-cream">
                ← Journal
              </Link>
              <p className="mt-10 text-sm text-cream/60">
                {p.category} · {new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {p.readMins} min read
              </p>
              <h1 className="mt-4 text-[clamp(2.2rem,5vw,4rem)] font-light leading-[1.02] tracking-[-0.04em] text-balance">{p.title}</h1>
            </div>
          </div>
        </header>

        <div className="container-x max-w-4xl">
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[22px] bg-navy">
            <Image src={img(p.image, 1600)} alt="" fill priority sizes="(min-width:1024px) 900px, 100vw" placeholder="blur" blurDataURL={BLUR} className="object-cover" />
          </div>
          <div className="mx-auto max-w-[680px] py-16 text-[17px] leading-[1.75]">
            <p className="text-xl leading-relaxed tracking-[-0.01em]">{p.excerpt}</p>
            {p.body.map((b, i) => (
              <div key={i} className="mt-8">
                {b.h && <h2 className="mb-3 text-2xl font-normal tracking-[-0.025em]">{b.h}</h2>}
                <p className="opacity-85">{b.p}</p>
              </div>
            ))}
          </div>

          {more.length > 0 && (
            <aside className="border-t border-navy/10 py-14" aria-label="More articles">
              <p className="eyebrow opacity-70">Keep reading</p>
              <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                {more.map((m) => (
                  <li key={m.slug}>
                    <Link href={`/blog/${m.slug}`} className="text-xl tracking-[-0.02em] hover:underline hover:underline-offset-4">
                      {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </article>
      <FinalCta />
      <div className="h-3 bg-cream" aria-hidden />
    </>
  );
}
