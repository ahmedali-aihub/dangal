import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/** Anonymous, cookie-free client for public, cacheable reads (RLS allows only published rows). */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    // A slow/unreachable database must never stall page rendering: give up after 4s and use built-in content.
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(4000) }) },
  });
}
