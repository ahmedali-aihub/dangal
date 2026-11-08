import { getLeads } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth";
import type { LeadStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

/** CSV-safe cell: quote, escape quotes, and neutralise spreadsheet formula injection (=, +, -, @). */
const cell = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  await requireRole("leads");
  const url = new URL(req.url);
  const leads = await getLeads({ status: (url.searchParams.get("status") as LeadStatus) ?? "all", q: url.searchParams.get("q") ?? undefined, limit: 5000 });
  const header = ["Created (IST)", "Name", "Phone", "Email", "Type", "Interest", "Preferred time", "Status", "Message", "Notes", "Source"];
  const rows = leads.map((l) =>
    [
      new Date(l.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      l.name,
      l.phone,
      l.email,
      l.kind === "free_trial" ? "Free trial" : "Enquiry",
      l.interest,
      l.preferred_time,
      l.status,
      l.message,
      l.notes,
      l.source,
    ]
      .map(cell)
      .join(","),
  );
  const csv = "﻿" + [header.map(cell).join(","), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dangal-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
