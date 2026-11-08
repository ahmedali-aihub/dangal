"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { require2FA, isSupabaseConfigured } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | undefined;

const credentials = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(8).max(200),
});

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { error: "Supabase is not configured." };
  const parsed = credentials.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const ip = clientIp(await headers());
  const [byIp, byEmail] = await Promise.all([
    rateLimit(`login:ip:${ip}`, 10, 15 * 60),
    rateLimit(`login:email:${parsed.data.email}`, 5, 15 * 60),
  ]);
  if (!byIp.ok || !byEmail.ok) return { error: "Too many attempts. Try again in 15 minutes." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // Same message for unknown email / wrong password — don't leak which accounts exist.
  if (error) {
    // Supabase setting, not the user's fault: say so instead of a misleading "wrong password".
    if (error.code === "email_provider_disabled") {
      return { error: "Email sign-in is switched off in Supabase. Dashboard → Authentication → Sign In / Providers → Email → turn on “Enable Email provider”." };
    }
    return { error: "Incorrect email or password." };
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") redirect("/admin/login/verify");
  if (require2FA && aal?.nextLevel === "aal1") redirect("/admin/security");
  redirect("/admin");
}

export async function verifyMfa(_: FormState, form: FormData): Promise<FormState> {
  const code = String(form.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from your authenticator app." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const rl = await rateLimit(`mfa:${user.id}`, 6, 5 * 60);
  if (!rl.ok) return { error: "Too many attempts. Wait 5 minutes and try again." };

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const totp = factors?.totp.find((f) => f.status === "verified");
  if (!totp) redirect("/admin/security");

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: totp.id, code });
  if (error) return { error: "That code didn't work. Check your device time and try again." };
  redirect("/admin");
}

export async function startEnrollment(): Promise<{ factorId: string; qr: string; secret: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expired. Sign in again." };

  // Clean up any half-finished enrollments
  const { data: existing } = await supabase.auth.mfa.listFactors();
  for (const f of existing?.all ?? []) {
    if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Dangal Admin ${crypto.randomUUID().slice(0, 8)}`, // unique: Supabase rejects duplicate names
    issuer: "Dangal Gym",
  });
  if (error || !data) return { error: error?.message ?? "Could not start 2FA setup." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function confirmEnrollment(_: FormState, form: FormData): Promise<FormState> {
  const factorId = String(form.get("factorId") ?? "");
  const code = String(form.get("code") ?? "").replace(/\s/g, "");
  if (!factorId || !/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const rl = await rateLimit(`mfa-enroll:${user.id}`, 6, 5 * 60);
  if (!rl.ok) return { error: "Too many attempts. Wait 5 minutes." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { error: "Invalid code. Make sure you scanned the latest QR code." };
  redirect("/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
