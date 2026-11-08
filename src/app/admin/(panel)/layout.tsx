import { DemoNotice } from "@/components/admin/ui";
import { Sidebar, type NavItem } from "@/components/admin/Sidebar";
import { can, isAdminDemo, requireStaff } from "@/lib/auth";
import { getLeadStats } from "@/lib/admin/queries";
import { hasServiceRole } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  // Signed in, but the server-side secret key isn't configured yet: explain instead of crashing.
  if (!hasServiceRole && !isAdminDemo) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24">
        <h1 className="text-3xl font-light tracking-[-0.035em]">One last setup step</h1>
        <p className="mt-4 text-[15px] leading-relaxed opacity-75">
          You&apos;re signed in, but the admin panel needs the Supabase <strong>secret key</strong> to read and save data.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>Supabase Dashboard → <strong>Project Settings → API Keys</strong> → copy the <em>secret</em> key (starts with <code>sb_secret_</code>).</li>
          <li>Open <code>.env.local</code> in the project and paste it after <code>SUPABASE_SERVICE_ROLE_KEY=</code>.</li>
          <li>Restart the dev server (Ctrl + C, then <code>npm run dev</code>) and refresh this page.</li>
        </ol>
      </main>
    );
  }

  const stats = await getLeadStats().catch(() => null);

  const items: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" as const },
    can(session.role, "videos") && { href: "/admin/videos", label: "Video projection", icon: "Clapperboard" as const },
    { href: "/admin/leads", label: "Leads", icon: "Inbox" as const, badge: stats?.newCount },
    can(session.role, "pricing") && { href: "/admin/pricing", label: "Pricing", icon: "BadgeIndianRupee" as const },
    can(session.role, "trainers") && { href: "/admin/trainers", label: "Trainers", icon: "Users" as const },
    { href: "/admin/testimonials", label: "Testimonials", icon: "MessageSquareQuote" as const },
    { href: "/admin/gallery", label: "Gallery", icon: "ImageIcon" as const },
    can(session.role, "banner") && { href: "/admin/offer", label: "Offer banner", icon: "Megaphone" as const },
    can(session.role, "team") && { href: "/admin/team", label: "Team & access", icon: "UserCog" as const },
  ].filter(Boolean) as NavItem[];

  return (
    <div className="lg:pl-64">
      <Sidebar items={items} user={{ name: session.name ?? session.email, role: session.role }} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        {isAdminDemo && <DemoNotice />}
        {children}
      </main>
    </div>
  );
}
