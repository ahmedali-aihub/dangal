import { NextResponse, type NextRequest } from "next/server";
import { hasServiceRole, isSupabaseConfigured } from "@/lib/env";
import { notifyOwner, verifyTurnstile } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { enquirySchema } from "@/lib/validation";

export const runtime = "nodejs";

const MIN_FILL_MS = 2500; // humans take longer than this to fill the form

export async function POST(req: NextRequest) {
  // CSRF: require same-origin + JSON (a cross-site HTML form cannot send application/json)
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
  }

  const ip = clientIp(req.headers);
  const rl = await rateLimit(`enquiry:${ip}`, 5, 60 * 10);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests. Please call us instead." }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  const d = parsed.data;

  // Spam traps: pretend success so bots learn nothing.
  if (d.website || Date.now() - d.startedAt < MIN_FILL_MS) return NextResponse.json({ ok: true });
  if (!(await verifyTurnstile(d.turnstileToken, ip))) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  }

  const phone = d.phone.replace(/^(\+?91)/, "");
  const lead = {
    name: d.name,
    phone: `+91${phone}`,
    email: d.email || null,
    interest: d.interest || null,
    preferred_time: d.preferredTime || null,
    message: d.message || null,
    kind: d.kind,
    source: d.source || null,
  };

  if (isSupabaseConfigured && hasServiceRole) {
    const { error } = await createAdminClient().from("leads").insert(lead);
    if (error) {
      console.error("[enquiry] insert failed", error);
      return NextResponse.json({ error: "Something went wrong. Please call or WhatsApp us." }, { status: 500 });
    }
  } else {
    console.info("[enquiry] demo mode — lead not stored", { name: lead.name, kind: lead.kind });
  }

  await notifyOwner({ ...lead, preferredTime: lead.preferred_time });
  return NextResponse.json({ ok: true });
}
