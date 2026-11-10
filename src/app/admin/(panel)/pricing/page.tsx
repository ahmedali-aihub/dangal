import { CrudManager } from "@/components/admin/CrudManager";
import { PageHeader } from "@/components/admin/ui";
import { getRows } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth";
import type { Plan } from "@/lib/types";

export const metadata = { title: "Pricing" };

export default async function PricingAdmin() {
  await requireRole("pricing");
  const rows = await getRows<Plan>("plans");
  return (
    <>
      <PageHeader title="Membership pricing" description="Edit plans shown on the home page and Membership page. Prices are in rupees." />
      <CrudManager
        table="plans"
        rows={rows}
        newLabel="Add plan"
        emptyText="No plans yet."
        columns={[
          { key: "name", label: "Plan" },
          { key: "duration", label: "Duration" },
          { key: "price", label: "Price", format: "price" },
          { key: "original_price", label: "Was", format: "price" },
          { key: "badge", label: "Badge" },
          { key: "sort_order", label: "Order" },
        ]}
        fields={[
          { name: "name", label: "Plan name", type: "text", required: true, half: true, placeholder: "Quarterly" },
          { name: "duration", label: "Duration", type: "text", required: true, half: true, placeholder: "3 months", help: "Include the number of months for per-month pricing" },
          { name: "price", label: "Price (₹)", type: "number", required: true, half: true },
          { name: "original_price", label: "Original price (₹)", type: "number", half: true, help: "Shown struck-through. Optional." },
          { name: "features", label: "Features (one per line)", type: "list" },
          { name: "badge", label: "Badge", type: "text", half: true, placeholder: "Most popular" },
          { name: "sort_order", label: "Display order", type: "number", half: true },
          { name: "highlight", label: "Highlight this plan", type: "boolean", help: "Shown in titanium to draw attention" },
          { name: "is_active", label: "Visible on website", type: "boolean" },
        ]}
      />
    </>
  );
}
