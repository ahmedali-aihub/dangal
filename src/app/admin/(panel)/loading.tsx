/** Shown instantly while an admin page loads, so a click always gets an immediate response. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse">
      <div className="h-9 w-56 rounded-xl bg-ink/10" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-lg bg-ink/[0.07]" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl border border-ink/10 bg-white/60" />
        ))}
      </div>
      <div className="mt-6 h-64 rounded-2xl border border-ink/10 bg-white/60" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
