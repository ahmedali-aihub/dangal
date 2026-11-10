import "server-only";
import { cache } from "react";
import { BANNER, GALLERY, PLANS, TESTIMONIALS, TRAINERS } from "@/content/data";
import { isAdminDemo } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Banner, Lead, LeadStatus, VideoRow } from "@/lib/types";

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

/** Cheap count (no rows transferred) — used by the sidebar badge on every admin page. */
export const getNewLeadCount = cache(async (): Promise<number> => {
  if (isAdminDemo) return DEMO_LEADS.filter((l) => l.status === "new").length;
  const { count } = await createAdminClient().from("leads").select("id", { count: "exact", head: true }).eq("status", "new");
  return count ?? 0;
});

/** Dashboard numbers: a handful of head-only counts + the 6 latest rows, all in parallel (never the whole table). */
export async function getLeadStats() {
  if (isAdminDemo) {
    return { total: DEMO_LEADS.length, last7: DEMO_LEADS.length, newCount: 1, converted: 0, trials: 1, recent: DEMO_LEADS };
  }
  const sb = createAdminClient();
  const count = (status?: LeadStatus, since?: string) => {
    let q = sb.from("leads").select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    if (since) q = q.gte("created_at", since);
    return q.then((r) => r.count ?? 0);
  };
  const since7 = new Date(Date.now() - 7 * 864e5).toISOString();
  const [total, last7, newCount, trials, converted, recent] = await Promise.all([
    count(),
    count(undefined, since7),
    count("new"),
    count("trial_booked"),
    count("converted"),
    sb.from("leads").select("*").order("created_at", { ascending: false }).limit(6).then((r) => (r.data ?? []) as Lead[]),
  ]);
  return { total, last7, newCount, converted, trials, recent };
}

/** The video currently on the home page (null → the built-in film is playing). */
export async function getHeroVideoRow(): Promise<VideoRow | null> {
  if (isAdminDemo) return null;
  const { data } = await createAdminClient().from("videos").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return (data as VideoRow | null) ?? null;
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
