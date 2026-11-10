"use client";

import { useActionState, useEffect, useState } from "react";
import { confirmEnrollment, signIn, startEnrollment, verifyMfa } from "@/app/admin/actions/auth";
import { authButton, authInput } from "./AuthShell";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input name="email" type="email" autoComplete="username" required className={`${authInput} mt-2`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <input name="password" type="password" autoComplete="current-password" required minLength={8} className={`${authInput} mt-2`} />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-red-800">
          {state.error}
        </p>
      )}
      <button disabled={pending} className={authButton}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function CodeForm() {
  const [state, action, pending] = useActionState(verifyMfa, undefined);
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Authentication code</span>
        <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required autoFocus className={`${authInput} mt-2 text-center text-2xl tracking-[0.5em]`} />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-red-800">
          {state.error}
        </p>
      )}
      <button disabled={pending} className={authButton}>
        {pending ? "Verifying…" : "Verify"}
      </button>
    </form>
  );
}

/** Make Supabase's QR (raw SVG text, sometimes with unescaped <, # and spaces) a valid, fully-encoded data URI. */
function qrSrc(qr: string) {
  const comma = qr.indexOf(",");
  if (!qr.startsWith("data:image/svg+xml") || comma < 0) return qr; // already a PNG/other data URI
  const raw = qr.slice(comma + 1);
  const svg = raw.startsWith("%3C") || raw.startsWith("%3c") ? decodeURIComponent(raw) : raw;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function EnrollForm() {
  const [setup, setSetup] = useState<{ factorId: string; qr: string; secret: string } | { error: string } | null>(null);
  const [state, action, pending] = useActionState(confirmEnrollment, undefined);

  useEffect(() => {
    // Dev mode mounts effects twice; only the latest run may set state (the earlier one's factor is replaced server-side).
    let cancelled = false;
    startEnrollment().then((r) => !cancelled && setSetup(r));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!setup) return <div className="h-64 animate-pulse rounded-2xl bg-ink/5" aria-label="Loading" />;
  if ("error" in setup) return <p className="text-sm text-red-800">{setup.error}</p>;

  return (
    <div className="space-y-6">
      <ol className="list-decimal space-y-2 pl-5 text-sm opacity-80">
        <li>Install Google Authenticator, Microsoft Authenticator or 1Password.</li>
        <li>Scan this QR code (or type the key manually).</li>
        <li>Enter the 6-digit code shown in the app.</li>
      </ol>
      <div className="flex justify-center rounded-2xl bg-white p-4">
        {/* Plain <img>: Supabase returns the QR as a raw SVG data string, which next/image rejects. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrSrc(setup.qr)} alt="Scan this QR code with your authenticator app" width={180} height={180} className="h-[180px] w-[180px]" />
      </div>
      <p className="break-all rounded-xl bg-ink/5 p-3 text-center font-mono text-xs">{setup.secret}</p>
      <form action={action} className="space-y-4">
        <input type="hidden" name="factorId" value={setup.factorId} />
        <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required placeholder="123456" className={`${authInput} text-center text-2xl tracking-[0.5em]`} />
        {state?.error && (
          <p role="alert" className="text-sm text-red-800">
            {state.error}
          </p>
        )}
        <button disabled={pending} className={authButton}>
          {pending ? "Verifying…" : "Turn on 2FA"}
        </button>
      </form>
    </div>
  );
}
