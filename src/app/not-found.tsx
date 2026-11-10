import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col bg-ink p-6 text-titanium sm:p-10">
      <Link href="/">
        <Logo />
      </Link>
      <div className="my-auto max-w-2xl">
        <p className="eyebrow text-titanium/60">Error 404</p>
        <h1 className="display-lg mt-5">
          This page tapped <span className="serif-accent">out.</span>
        </h1>
        <p className="lede mt-6 text-titanium/75">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex h-12 items-center rounded-full bg-titanium px-6 text-sm font-medium text-ink">
            Back to home
          </Link>
          <Link href="/contact" className="inline-flex h-12 items-center rounded-full border border-titanium/30 px-6 text-sm">
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
