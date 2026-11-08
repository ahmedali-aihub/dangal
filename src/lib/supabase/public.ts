import { createClient } from "@supabase/supabase-js";

/** Anonymous, cookie-free client for public, cacheable reads (RLS allows only published rows). */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    // A slow/unreachable database must never stall page rendering: give up after 4s and use built-in content.
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(4000) }) },
  });
}
