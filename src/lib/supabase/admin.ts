import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses RLS — ONLY use in server code AFTER verifying the caller's role
 * (see requireRole in lib/auth.ts) or for validated public writes (enquiry form).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
