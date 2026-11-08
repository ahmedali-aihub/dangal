import { CrudManager } from "@/components/admin/CrudManager";
import { PageHeader } from "@/components/admin/ui";
import { getRows } from "@/lib/admin/queries";
import { can, requireRole } from "@/lib/auth";
import type { GalleryItem } from "@/lib/types";

export const metadata = { title: "Gallery" };

export default async function GalleryAdmin() {
  const s = await requireRole("gallery");
  const rows = await getRows<GalleryItem>("gallery");
  return (
    <>
      <PageHeader title="Gallery" description="Photos for the Gallery page and home page preview. The first 5 (by order) appear on the home page." />
      <CrudManager
        table="gallery"
        rows={rows}
        imageField="image_url"
        canDelete={can(s.role, "team")}
        newLabel="Add photo"
        emptyText="No photos yet."
        columns={[
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "sort_order", label: "Order" },
        ]}
        fields={[
          { name: "image_url", label: "Photo", type: "image" },
          { name: "title", label: "Caption", type: "text", required: true, half: true },
          { name: "category", label: "Category", type: "select", half: true, options: ["Facility", "Training", "Community", "Events", "Transformations"] },
          { name: "sort_order", label: "Display order", type: "number", half: true },
          { name: "is_active", label: "Visible on website", type: "boolean" },
        ]}
      />
    </>
  );
}
