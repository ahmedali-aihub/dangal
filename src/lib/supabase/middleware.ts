import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/** Refreshes the Supabase session cookie and returns the user (or null). */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list: { name: string; value: string; options: CookieOptions }[]) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  // getClaims() checks the token signature locally (no round-trip to Supabase on every admin request)
  // and refreshes an expired session; the admin layout re-checks the role + 2FA against the database.
  const { data } = await supabase.auth.getClaims();
  return { response, user: data?.claims?.sub ? { id: data.claims.sub } : null };
}
