import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { getHeroVideoRow, getLeadStats } from "@/lib/admin/queries";
import { can, requireStaff } from "@/lib/auth";

export const metadata = { title: "Dashboard" };

const STATUS: Record<string, string> = { new: "New", contacted: "Contacted", trial_booked: "Trial booked", converted: "Converted", lost: "Lost" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  // Everything starts at once (the session check, the numbers and the video) instead of one after another.
  const [session, stats, video] = await Promise.all([requireStaff(), getLeadStats(), getHeroVideoRow().catch(() => null)]);
  const owner = can(session.role, "videos");
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric" }).format(new Date()));

  return (
    <>
      {denied && <p className="mb-6 rounded-xl bg-ink/5 p-3 text-sm">You don&apos;t have access to that section. Ask the owner.</p>}
      <PageHeader
        title={`Good ${hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}, ${(session.name ?? "").split(" ")[0] || "there"}.`}
        description="Here's what's happening at Dangal today."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["New leads", stats.newCount, "/admin/leads?status=new"],
          ["Leads this week", stats.last7, "/admin/leads"],
          ["Trials booked", stats.trials, "/admin/leads?status=trial_booked"],
          ["Converted", stats.converted, "/admin/leads?status=converted"],
        ].map(([label, value, href]) => (
          <Link key={label as string} href={href as string} className="group rounded-2xl border border-ink/10 bg-white p-5 transition-colors hover:border-ink/30">
            <p className="flex items-center justify-between text-sm opacity-65">
              {label}
              <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" aria-hidden />
            </p>
            <p className="mt-4 text-4xl font-light tracking-[-0.04em] tabular-nums">{value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg tracking-[-0.02em]">Recent enquiries</h2>
            <Link href="/admin/leads" className="text-sm opacity-65 hover:opacity-100">
              View all →
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-ink/10">
            {stats.recent.length === 0 && <li className="py-6 text-sm opacity-70">No enquiries yet.</li>}
            {stats.recent.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="truncate text-xs opacity-70">
                    {l.interest ?? "General"} · {new Date(l.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {l.kind === "free_trial" && <Badge tone="outline">Trial</Badge>}
                  <Badge tone={l.status === "new" ? "solid" : "neutral"}>{STATUS[l.status]}</Badge>
                  <a href={`tel:${l.phone}`} className="hidden text-sm underline-offset-4 hover:underline sm:inline">
                    Call
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {owner && (
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg tracking-[-0.02em]">Home page video</h2>
              <Link href="/admin/videos" className="text-sm opacity-65 hover:opacity-100">
                Change →
              </Link>
            </div>
            <p className="mt-4 rounded-xl bg-titanium-100 p-4 text-sm">{video ? video.title : <span className="opacity-70">The Dangal film (built-in)</span>}</p>
            <p className="mt-3 text-xs opacity-65">This is the only video on the website — it plays at the top of the home page.</p>
          </Card>
        )}
      </div>
    </>
  );
}
