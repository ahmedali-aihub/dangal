export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const require2FA = process.env.ADMIN_REQUIRE_2FA !== "false";

export const MAX_VIDEO_MB = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_MB || 100);
