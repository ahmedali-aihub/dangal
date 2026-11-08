import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured, require2FA } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export type Session = { userId: string; email: string; role: Role; name: string | null };

/** What each role may do. Owner = everything. Staff = day-to-day operations. */
export const PERMISSIONS = {
  videos: ["owner"],
  pricing: ["owner"],
  trainers: ["owner"],
  banner: ["owner"],
  team: ["owner"],
  testimonials: ["owner", "staff"],
  gallery: ["owner", "staff"],
  leads: ["owner", "staff"],
} as const satisfies Record<string, readonly Role[]>;

export type Resource = keyof typeof PERMISSIONS;
export const can = (role: Role, resource: Resource) => (PERMISSIONS[resource] as readonly Role[]).includes(role);

/**
 * Resolves the signed-in staff member, enforcing: valid session → active profile → 2FA (AAL2).
 * Redirects (never throws) so it is safe in layouts and server actions.
 */
/** Local-development-only preview of the admin UI when Supabase isn't configured. Never active in production. */
export const isAdminDemo = !isSupabaseConfigured && process.env.NODE_ENV === "development";
const DEMO_SESSION: Session = { userId: "demo", email: "demo@localhost", role: "owner", name: "Demo Owner" };

export async function requireStaff(opts: { allowUnenrolled2FA?: boolean } = {}): Promise<Session> {
  if (isAdminDemo) return DEMO_SESSION;
  if (!isSupabaseConfigured) redirect("/admin/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, is_active")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=no-access");
  }

  if (require2FA) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal1" && aal.currentLevel === "aal1") {
      if (!opts.allowUnenrolled2FA) redirect("/admin/security");
    } else if (aal?.currentLevel !== "aal2") {
      redirect("/admin/login/verify");
    }
  }

  return { userId: user.id, email: user.email ?? "", role: profile.role as Role, name: profile.full_name };
}

/** Use at the top of every admin server action / page that needs a specific resource. */
export async function requireRole(resource: Resource): Promise<Session> {
  const session = await requireStaff();
  if (!can(session.role, resource)) redirect("/admin?denied=1");
  return session;
}
