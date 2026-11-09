/**
 * Supabase settings, sanitised. Pasting values into a host's dashboard often adds an invisible trailing
 * space/newline (or a trailing "/"), which turns the address into "fetch failed". Trim defensively.
 */
const clean = (v: string | undefined) => (v ?? "").replace(/\s+/g, "");
export const SUPABASE_URL = clean(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/+$/, "");
export const SUPABASE_ANON_KEY = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const SUPABASE_SERVICE_KEY = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const hasServiceRole = Boolean(SUPABASE_SERVICE_KEY);

export const require2FA = process.env.ADMIN_REQUIRE_2FA !== "false";

export const MAX_VIDEO_MB = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_MB || 100);
