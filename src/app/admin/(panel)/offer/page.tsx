import { CrudManager } from "@/components/admin/CrudManager";
import { PageHeader } from "@/components/admin/ui";
import { getRows } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth";
import type { Banner } from "@/lib/types";

export const metadata = { title: "Offer banner" };

export default async function OfferAdmin() {
  const [, rows] = await Promise.all([requireRole("banner"), getRows<Banner>("banners")]);
  return (
    <>
      <PageHeader
        title="Offer banner"
        description="A slim announcement shown at the bottom of the website. The first visible banner within its dates is shown. Times are Hyderabad time."
      />
      <CrudManager
        table="banners"
        rows={rows}
        newLabel="New banner"
        emptyText="No banners. Create one for your next offer."
        columns={[
          { key: "message", label: "Message" },
          { key: "cta_label", label: "Button" },
          { key: "starts_at", label: "Starts", format: "date" },
          { key: "ends_at", label: "Ends", format: "date" },
        ]}
        fields={[
          { name: "message", label: "Message", type: "text", required: true, placeholder: "Diwali offer: 30% off annual plans" },
          { name: "cta_label", label: "Button text", type: "text", half: true, placeholder: "Claim offer" },
          { name: "cta_href", label: "Button link", type: "text", half: true, placeholder: "/contact#trial" },
          { name: "starts_at", label: "Starts (optional)", type: "datetime", half: true },
          { name: "ends_at", label: "Ends (optional)", type: "datetime", half: true },
          { name: "is_active", label: "Banner on", type: "boolean" },
        ]}
      />
    </>
  );
}
