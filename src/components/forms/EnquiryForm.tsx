"use client";

import { clsx } from "clsx";
import { CheckCircle2, Loader2 } from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { PROGRAMS } from "@/content/programs";
import { whatsappLink } from "@/lib/site";
import { INTERESTS, TIMES, enquirySchema } from "@/lib/validation";

type Errors = Partial<Record<string, string[]>>;
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const input =
  "peer h-14 w-full rounded-xl border bg-cream-50 px-4 pt-5 text-[15px] text-navy outline-none transition placeholder:text-transparent focus:border-navy aria-[invalid=true]:border-red-700";
const labelCls =
  "pointer-events-none absolute left-4 top-2 text-[11px] uppercase tracking-[0.1em] text-navy/70 transition-all";

export function EnquiryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(Date.now());
  const [kind, setKind] = useState<"free_trial" | "enquiry">("free_trial");
  const [interest, setInterest] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  // Prefill from ?program= or ?plan= (links from program and pricing pages)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const prog = PROGRAMS.find((p) => p.slug === q.get("program"));
    if (prog) setInterest(prog.name);
    else if (q.get("plan")) setInterest("General membership");
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      interest: String(fd.get("interest") ?? ""),
      preferredTime: String(fd.get("preferredTime") ?? ""),
      message: String(fd.get("message") ?? ""),
      kind,
      consent: fd.get("consent") === "on",
      website: String(fd.get("website") ?? ""),
      startedAt: startedAt.current,
      turnstileToken: String(fd.get("cf-turnstile-response") ?? "") || undefined,
      source: typeof window !== "undefined" ? window.location.pathname + window.location.search : undefined,
    };

    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      setErrors(fe);
      const first = Object.keys(fe)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.fields) setErrors(json.fields);
        setMessage(json.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setMessage("Network error. Please try again or WhatsApp us.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex min-h-[420px] flex-col items-start justify-center rounded-[24px] bg-cream-50 p-8 sm:p-12" role="status">
        <CheckCircle2 className="h-10 w-10" strokeWidth={1.25} aria-hidden />
        <h3 className="mt-6 text-3xl font-light tracking-[-0.035em]">
          {kind === "free_trial" ? "Your free trial request is in." : "Thanks — we've got your message."}
        </h3>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed opacity-75">
          A coach will call you within a few working hours to confirm a time. Prefer instant? Message us on WhatsApp.
        </p>
        <a href={whatsappLink("Hi, I just booked a free trial on the website.")} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex h-11 items-center rounded-full bg-navy px-6 text-sm text-cream">
          Continue on WhatsApp
        </a>
      </div>
    );
  }

  const err = (k: string) => errors[k]?.[0];

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="rounded-[24px] bg-cream-50 p-6 sm:p-10" aria-label="Free trial and enquiry form">
      {SITE_KEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />}

      <div role="radiogroup" aria-label="Request type" className="grid grid-cols-2 gap-1 rounded-full bg-navy/[0.06] p-1">
        {(
          [
            ["free_trial", "Book a free trial"],
            ["enquiry", "General enquiry"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={clsx("h-11 rounded-full text-sm transition-colors", kind === k ? "bg-navy text-cream" : "text-navy/70 hover:text-navy")}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Field id="name" label="Full name *" error={err("name")}>
          <input id="name" name="name" autoComplete="name" placeholder="Full name" maxLength={80} required aria-invalid={!!err("name")} aria-describedby={err("name") ? "name-err" : undefined} className={clsx(input, "border-navy/15")} />
        </Field>
        <Field id="phone" label="Mobile number *" error={err("phone")}>
          <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Mobile" maxLength={16} required aria-invalid={!!err("phone")} aria-describedby={err("phone") ? "phone-err" : undefined} className={clsx(input, "border-navy/15")} />
        </Field>
        <Field id="email" label="Email (optional)" error={err("email")}>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="Email" maxLength={120} aria-invalid={!!err("email")} aria-describedby={err("email") ? "email-err" : undefined} className={clsx(input, "border-navy/15")} />
        </Field>
        <Field id="interest" label="Interested in">
          <select id="interest" name="interest" value={interest} onChange={(e) => setInterest(e.target.value)} className={clsx(input, "appearance-none border-navy/15")}>
            <option value="">Select a program</option>
            {INTERESTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>
        <Field id="preferredTime" label="Preferred time" className="sm:col-span-2">
          <select id="preferredTime" name="preferredTime" defaultValue="" className={clsx(input, "appearance-none border-navy/15")}>
            <option value="">Any time</option>
            {TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field id="message" label="Goals or questions" className="sm:col-span-2" error={err("message")}>
          <textarea id="message" name="message" rows={4} maxLength={1000} placeholder="Message" className={clsx(input, "!h-auto resize-none border-navy/15 pt-7")} />
        </Field>
      </div>

      {/* Honeypot — hidden from humans and assistive tech */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {SITE_KEY && <div className="cf-turnstile mt-5" data-sitekey={SITE_KEY} data-theme="light" />}

      <label className="mt-5 flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 accent-navy" aria-invalid={!!err("consent")} aria-describedby={err("consent") ? "consent-err" : undefined} />
        <span className="opacity-75">
          I agree to be contacted by Dangal Gym by phone, WhatsApp or email about my request. See our{" "}
          <a href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </span>
      </label>
      {err("consent") && (
        <p id="consent-err" className="mt-2 text-sm text-red-800">
          {err("consent")}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-navy px-8 text-[15px] font-medium text-cream transition-colors hover:bg-navy-700 disabled:opacity-60"
        >
          {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {kind === "free_trial" ? "Request free trial" : "Send enquiry"}
        </button>
        <p className="text-xs opacity-70">We reply within a few working hours.</p>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-4 text-sm text-red-800">
          {message}
        </p>
      )}
    </form>
  );
}

function Field({ id, label, error, className, children }: { id: string; label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("relative", className)}>
      {children}
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
