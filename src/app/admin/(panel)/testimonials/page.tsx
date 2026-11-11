import { CrudManager } from "@/components/admin/CrudManager";
import { PageHeader } from "@/components/admin/ui";
import { PROGRAMS } from "@/content/programs";
import { getRows } from "@/lib/admin/queries";
import { can, requireRole } from "@/lib/auth";
import type { Testimonial } from "@/lib/types";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsAdmin() {
  const [s, rows] = await Promise.all([requireRole("testimonials"), getRows<Testimonial>("testimonials")]);
  return (
    <>
      <PageHeader title="Testimonials" description="Member stories in the home page carousel. Only publish with the member's permission." />
      <CrudManager
        table="testimonials"
        rows={rows}
        canDelete={can(s.role, "team")}
        newLabel="Add testimonial"
        emptyText="No testimonials yet."
        columns={[
          { key: "name", label: "Member" },
          { key: "program", label: "Program" },
          { key: "result", label: "Result" },
          { key: "rating", label: "Rating" },
        ]}
        fields={[
          { name: "name", label: "Member name", type: "text", required: true, half: true },
          { name: "program", label: "Program", type: "select", half: true, options: ["", ...PROGRAMS.map((p) => p.name), "Personal training"] },
          { name: "quote", label: "Quote", type: "textarea", required: true },
          { name: "result", label: "Result headline", type: "text", half: true, placeholder: "−12 kg in 4 months" },
          { name: "rating", label: "Rating (1–5)", type: "number", half: true },
          { name: "sort_order", label: "Display order", type: "number", half: true },
          { name: "is_active", label: "Visible on website", type: "boolean" },
        ]}
      />
    </>
  );
}
