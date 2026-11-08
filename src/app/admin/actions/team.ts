"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { run } from "@/lib/admin/run";
import { requireRole } from "@/lib/auth";
import { SITE } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { clean } from "@/lib/validation";

export async function inviteStaff(input: { email: string; name: string; role: "owner" | "staff" }) {
  return run(async () => {
    const s = await requireRole("team");
    const v = z
      .object({
        email: z.string().trim().toLowerCase().email().max(120),
        name: z.string().max(80).transform(clean).pipe(z.string().min(1)),
        role: z.enum(["owner", "staff"]),
      })
      .parse(input);
    const sb = createAdminClient();
    const { data, error } = await sb.auth.admin.inviteUserByEmail(v.email, {
      data: { full_name: v.name },
      redirectTo: `${SITE.url}/admin/login`,
    });
    if (error) throw new Error(error.message);
    await sb.from("profiles").upsert({ id: data.user.id, full_name: v.name, role: v.role, is_active: true });
    await sb.from("audit_log").insert({ actor: s.userId, action: `invite:${v.role}`, entity: "profiles", entity_id: data.user.id });
    revalidatePath("/admin/team");
  });
}

export async function updateStaff(id: string, values: { role?: "owner" | "staff"; is_active?: boolean }) {
  return run(async () => {
    const s = await requireRole("team");
    z.string().uuid().parse(id);
    if (id === s.userId) throw new Error("You can't change your own role or access.");
    const v = z.object({ role: z.enum(["owner", "staff"]).optional(), is_active: z.boolean().optional() }).parse(values);
    const sb = createAdminClient();
    const { error } = await sb.from("profiles").update(v).eq("id", id);
    if (error) throw new Error(error.message);
    if (v.is_active === false) await sb.auth.admin.signOut(id).catch(() => {}); // best effort
    await sb.from("audit_log").insert({ actor: s.userId, action: "update", entity: "profiles", entity_id: id });
    revalidatePath("/admin/team");
  });
}
