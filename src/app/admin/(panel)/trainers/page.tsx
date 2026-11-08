import { CrudManager } from "@/components/admin/CrudManager";
import { PageHeader } from "@/components/admin/ui";
import { getRows } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth";
import type { Trainer } from "@/lib/types";

export const metadata = { title: "Trainers" };

export default async function TrainersAdmin() {
  await requireRole("trainers");
  const rows = await getRows<Trainer>("trainers");
  return (
    <>
      <PageHeader title="Trainers" description="Coach profiles shown on the home page and the Trainers page. Use portrait photos (4:5), ideally 1200px tall." />
      <CrudManager
        table="trainers"
        rows={rows}
        imageField="image_url"
        newLabel="Add trainer"
        emptyText="No trainers yet."
        columns={[
          { key: "name", label: "Name" },
          { key: "role", label: "Role" },
          { key: "experience_years", label: "Years" },
          { key: "sort_order", label: "Order" },
        ]}
        fields={[
          { name: "name", label: "Name", type: "text", required: true, half: true },
          { name: "role", label: "Title / role", type: "text", required: true, half: true },
          { name: "image_url", label: "Photo", type: "image" },
          { name: "bio", label: "Short bio", type: "textarea" },
          { name: "specialties", label: "Specialties (one per line)", type: "list" },
          { name: "experience_years", label: "Years of experience", type: "number", half: true },
          { name: "sort_order", label: "Display order", type: "number", half: true },
          { name: "instagram", label: "Instagram URL", type: "text", placeholder: "https://instagram.com/…" },
          { name: "is_active", label: "Visible on website", type: "boolean" },
        ]}
      />
    </>
  );
}
