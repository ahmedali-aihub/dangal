import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS — ONLY use in server code AFTER verifying the caller's role
 * (see requireRole in lib/auth.ts) or for validated public writes (enquiry form).
 */
export function createAdminClient() {
  const url = SUPABASE_URL;
  const key = SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase service role is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
