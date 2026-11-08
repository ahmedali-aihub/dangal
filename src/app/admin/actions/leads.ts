"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { run } from "@/lib/admin/run";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { clean } from "@/lib/validation";

const patch = z
  .object({
    status: z.enum(["new", "contacted", "trial_booked", "converted", "lost"]),
    notes: z.string().max(2000).transform(clean).nullable(),
  })
  .partial();

export async function updateLead(id: string, values: { status?: string; notes?: string | null }) {
  return run(async () => {
    const s = await requireRole("leads");
    z.string().uuid().parse(id);
    const data = patch.parse(values);
    const { error } = await createAdminClient().from("leads").update(data).eq("id", id);
    if (error) throw new Error(error.message);
    await createAdminClient().from("audit_log").insert({ actor: s.userId, action: "update", entity: "leads", entity_id: id });
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
  });
}

export async function deleteLead(id: string) {
  return run(async () => {
    const s = await requireRole("team"); // owner only
    z.string().uuid().parse(id);
    const { error } = await createAdminClient().from("leads").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await createAdminClient().from("audit_log").insert({ actor: s.userId, action: "delete", entity: "leads", entity_id: id });
    revalidatePath("/admin/leads");
  });
}
