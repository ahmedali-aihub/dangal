import "server-only";
import { BANNER, GALLERY, PLANS, TESTIMONIALS, TRAINERS } from "@/content/data";
import { isAdminDemo } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Banner, Lead, LeadStatus, VideoRow, VideoSettings } from "@/lib/types";

/** Admin reads use the service role AFTER the page has called requireRole(). */

const DEMO_ROWS: Record<string, unknown[]> = {
  plans: PLANS,
  trainers: TRAINERS,
  testimonials: TESTIMONIALS,
  gallery: GALLERY,
  banners: BANNER ? [BANNER] : [],
};

export async function getRows<T>(table: "plans" | "trainers" | "testimonials" | "gallery" | "banners"): Promise<T[]> {
  if (isAdminDemo) return DEMO_ROWS[table] as T[];
  const order = table === "banners" ? "updated_at" : "sort_order";
  const { data, error } = await createAdminClient().from(table).select("*").order(order, { ascending: table !== "banners" });
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

const DEMO_LEADS: Lead[] = [
  { id: "00000000-0000-4000-8000-000000000001", name: "Rahul Verma", phone: "+919800000001", email: "rahul@example.com", interest: "I AM THE FITTEST MAN", preferred_time: "Evening (4–8 PM)", message: "Want to start strength training.", kind: "free_trial", source: "/contact", status: "new", notes: null, created_at: new Date(Date.now() - 36e5).toISOString() },
  { id: "00000000-0000-4000-8000-000000000002", name: "Priya Sharma", phone: "+919800000002", email: null, interest: "I AM THE FITTEST WOMAN", preferred_time: "Morning (8–11 AM)", message: null, kind: "enquiry", source: "/membership", status: "contacted", notes: "Called, visiting Saturday.", created_at: new Date(Date.now() - 864e5).toISOString() },
  { id: "00000000-0000-4000-8000-000000000003", name: "Venkat Rao", phone: "+919800000003", email: null, interest: "I AM THE FITTEST ELDER (40+)", preferred_time: null, message: "Knee issues — is it OK?", kind: "free_trial", source: "/programs/fittest-elder", status: "trial_booked", notes: null, created_at: new Date(Date.now() - 3 * 864e5).toISOString() },
];

export async function getLeads(opts: { status?: LeadStatus | "all"; q?: string; limit?: number } = {}): Promise<Lead[]> {
  if (isAdminDemo) return DEMO_LEADS.filter((l) => !opts.status || opts.status === "all" || l.status === opts.status);
  let q = createAdminClient().from("leads").select("*").order("created_at", { ascending: false }).limit(opts.limit ?? 500);
  if (opts.status && opts.status !== "all") q = q.eq("status", opts.status);
  if (opts.q) {
    const term = opts.q.replace(/[%_,()]/g, "").slice(0, 60);
    if (term) q = q.or(`name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Lead[];
}

export async function getLeadStats() {
  const leads = isAdminDemo ? DEMO_LEADS : await getLeads({ limit: 2000 });
  const now = Date.now();
  const byStatus = leads.reduce<Record<string, number>>((a, l) => ((a[l.status] = (a[l.status] ?? 0) + 1), a), {});
  return {
    total: leads.length,
    last7: leads.filter((l) => now - new Date(l.created_at).getTime() < 7 * 864e5).length,
    newCount: byStatus.new ?? 0,
    converted: byStatus.converted ?? 0,
    trials: byStatus.trial_booked ?? 0,
    recent: leads.slice(0, 6),
  };
}

export async function getVideoAdmin(): Promise<{ rows: VideoRow[]; settings: VideoSettings; canRevert: boolean }> {
  const fallback: VideoSettings = { id: 1, playlist_enabled: false, rotate_seconds: 20 };
  if (isAdminDemo) return { rows: [], settings: fallback, canRevert: false };
  const sb = createAdminClient();
  const [{ data: rows }, { data: settings }, { data: hist }] = await Promise.all([
    sb.from("videos").select("*").order("created_at", { ascending: false }),
    sb.from("video_settings").select("*").eq("id", 1).maybeSingle(),
    sb.from("video_activations").select("video_id").order("created_at", { ascending: false }).limit(30),
  ]);
  const ids = (hist ?? []).map((h: { video_id: string | null }) => h.video_id);
  return {
    rows: (rows ?? []) as VideoRow[],
    settings: (settings as VideoSettings) ?? fallback,
    canRevert: ids.some((id) => id && id !== ids[0]),
  };
}

export type TeamMember = { id: string; email: string; name: string | null; role: "owner" | "staff"; is_active: boolean; mfa: boolean; last_sign_in: string | null };

export async function getTeam(): Promise<TeamMember[]> {
  if (isAdminDemo) return [{ id: "demo", email: "demo@localhost", name: "Demo Owner", role: "owner", is_active: true, mfa: true, last_sign_in: null }];
  const sb = createAdminClient();
  const [{ data: profiles }, { data: users }] = await Promise.all([
    sb.from("profiles").select("*").order("created_at"),
    sb.auth.admin.listUsers({ perPage: 200 }),
  ]);
  return (profiles ?? []).map((p: { id: string; full_name: string | null; role: "owner" | "staff"; is_active: boolean }) => {
    const u = users?.users.find((x) => x.id === p.id);
    return {
      id: p.id,
      email: u?.email ?? "—",
      name: p.full_name,
      role: p.role,
      is_active: p.is_active,
      mfa: Boolean(u?.factors?.some((f) => f.status === "verified")),
      last_sign_in: u?.last_sign_in_at ?? null,
    };
  });
}

export type { Banner };
