import "server-only";
import { unstable_rethrow } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

/**
 * Wraps a server action body: converts thrown errors into a typed result the UI can show,
 * while letting Next's redirect()/notFound() propagate.
 */
export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  if (!isSupabaseConfigured) return { ok: false, error: "Demo mode — connect Supabase (see README) to save changes." };
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    unstable_rethrow(e);
    const msg = e instanceof Error ? e.message : "Unexpected error";
    console.error("[admin action]", msg);
    return { ok: false, error: msg };
  }
}
