import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Gate /admin/*: unauthenticated users go to /admin/login.
 * Role + 2FA (AAL2) enforcement happens in the admin layout (server-side, DB-backed).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isSupabaseConfigured) return NextResponse.next();

  const { response, user } = await updateSession(request);
  const isLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
