import "server-only";
import { SITE } from "@/lib/site";

type LeadPayload = {
  name: string;
  phone: string;
  email?: string | null;
  interest?: string | null;
  preferredTime?: string | null;
  message?: string | null;
  kind: "enquiry" | "free_trial";
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Email the owner via Resend. Silently skipped if not configured. */
async function sendEmail(lead: LeadPayload) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true };
  const label = lead.kind === "free_trial" ? "Free trial booking" : "New enquiry";
  const rows: [string, string | null | undefined][] = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Interested in", lead.interest],
    ["Preferred time", lead.preferredTime],
    ["Message", lead.message],
  ];
  const html = `
  <div style="font-family:Arial,sans-serif;background:#F5F5F7;padding:24px">
    <div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">
      <div style="background:#111113;color:#F5F5F7;padding:20px 24px;font-size:18px">${label} — Dangal Gym</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#111113">
        ${rows
          .filter(([, v]) => v)
          .map(
            ([k, v]) =>
              `<tr><td style="padding:10px 24px;color:#86868b;width:140px;vertical-align:top">${k}</td><td style="padding:10px 24px">${esc(String(v))}</td></tr>`,
          )
          .join("")}
      </table>
      <div style="padding:20px 24px"><a href="tel:${esc(lead.phone)}" style="background:#111113;color:#F5F5F7;padding:10px 18px;border-radius:999px;text-decoration:none">Call ${esc(lead.name)}</a></div>
    </div>
  </div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Dangal Gym <noreply@dangalgym.com>",
      to: [process.env.OWNER_EMAIL || SITE.email],
      reply_to: lead.email || undefined,
      subject: `${label}: ${lead.name} (${lead.phone})`,
      html,
    }),
  });
  return { ok: res.ok };
}

/** WhatsApp the owner via Meta WhatsApp Cloud API. Uses an approved template if configured. */
async function sendWhatsApp(lead: LeadPayload) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.OWNER_WHATSAPP;
  if (!token || !phoneId || !to) return { skipped: true };

  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const body = template
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: lead.name },
                { type: "text", text: lead.phone },
                { type: "text", text: lead.interest || (lead.kind === "free_trial" ? "Free trial" : "General enquiry") },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: `${lead.kind === "free_trial" ? "🏋️ Free trial booking" : "📩 New enquiry"}\nName: ${lead.name}\nPhone: ${lead.phone}${lead.interest ? `\nInterest: ${lead.interest}` : ""}${lead.preferredTime ? `\nTime: ${lead.preferredTime}` : ""}${lead.message ? `\nMsg: ${lead.message.slice(0, 300)}` : ""}`,
        },
      };

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: res.ok };
}

export async function notifyOwner(lead: LeadPayload) {
  const results = await Promise.allSettled([sendEmail(lead), sendWhatsApp(lead)]);
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[notify] ${i === 0 ? "email" : "whatsapp"} failed`, r.reason);
  });
}

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured → rely on honeypot, time-trap and rate limits
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const json = (await res.json()) as { success: boolean };
    return json.success;
  } catch {
    return false;
  }
}
