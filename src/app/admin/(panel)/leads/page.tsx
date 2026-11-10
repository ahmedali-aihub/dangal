import { Suspense } from "react";
import { LeadsManager } from "@/components/admin/LeadsManager";
import { PageHeader } from "@/components/admin/ui";
import { getLeads } from "@/lib/admin/queries";
import { can, requireRole } from "@/lib/auth";
import type { LeadStatus } from "@/lib/types";

export const metadata = { title: "Enquiries" };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const s = await requireRole("leads");
  const { status, q } = await searchParams;
  const leads = await getLeads({ status: (status as LeadStatus) ?? "all", q });
  return (
    <>
      <PageHeader title="Enquiries" description="Enquiries and free-trial bookings from the website. You are also notified by email and WhatsApp the moment one arrives." />
      <Suspense>
        <LeadsManager leads={leads} canDelete={can(s.role, "team")} />
      </Suspense>
    </>
  );
}
