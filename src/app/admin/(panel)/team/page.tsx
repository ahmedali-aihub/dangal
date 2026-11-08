import { TeamManager } from "@/components/admin/TeamManager";
import { PageHeader } from "@/components/admin/ui";
import { getTeam } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "Team & access" };

export default async function TeamPage() {
  const s = await requireRole("team");
  const team = await getTeam();
  return (
    <>
      <PageHeader
        title="Team & access"
        description="Owners can do everything. Staff can manage leads, gallery and testimonials, but can't change videos, pricing, trainers, offers or team access."
      />
      <TeamManager team={team} me={s.userId} />
    </>
  );
}
