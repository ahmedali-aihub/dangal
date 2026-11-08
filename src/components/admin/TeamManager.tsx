"use client";

import { clsx } from "clsx";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { inviteStaff, updateStaff } from "@/app/admin/actions/team";
import type { TeamMember } from "@/lib/admin/queries";
import { Badge, btn, Card, field, labelText } from "./ui";

export function TeamManager({ team, me }: { team: TeamMember[]; me: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ t: string; err?: boolean } | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const r = await fn();
      setMsg(r.ok ? { t: ok } : { t: (r as { error: string }).error, err: true });
      if (r.ok) router.refresh();
    });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <h2 className="text-lg tracking-[-0.02em]">People with access</h2>
        <ul className="mt-4 divide-y divide-navy/10">
          {team.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {m.name ?? m.email} {m.id === me && <span className="text-xs opacity-70">(you)</span>}
                </p>
                <p className="truncate text-xs opacity-70">{m.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {m.mfa ? (
                  <Badge>
                    <ShieldCheck className="h-3 w-3" aria-hidden /> 2FA on
                  </Badge>
                ) : (
                  <Badge tone="outline">
                    <ShieldAlert className="h-3 w-3" aria-hidden /> 2FA pending
                  </Badge>
                )}
                <select
                  aria-label={`Role for ${m.email}`}
                  defaultValue={m.role}
                  disabled={m.id === me || pending}
                  onChange={(e) => run(() => updateStaff(m.id, { role: e.target.value as "owner" | "staff" }), "Role updated.")}
                  className="h-9 rounded-full border border-navy/15 bg-white px-3 text-sm"
                >
                  <option value="staff">Staff</option>
                  <option value="owner">Owner</option>
                </select>
                <button
                  className={clsx(btn.secondary, "h-9")}
                  disabled={m.id === me || pending}
                  onClick={() => run(() => updateStaff(m.id, { is_active: !m.is_active }), m.is_active ? "Access removed." : "Access restored.")}
                >
                  {m.is_active ? "Disable" : "Enable"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg tracking-[-0.02em]">Invite a team member</h2>
        <p className="mt-1 text-sm opacity-65">They&apos;ll get an email to set a password, then must set up 2FA on first sign-in.</p>
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const form = e.currentTarget;
            run(async () => {
              const r = await inviteStaff({ email: String(fd.get("email")), name: String(fd.get("name")), role: String(fd.get("role")) as "owner" | "staff" });
              if (r.ok) form.reset();
              return r;
            }, "Invitation sent.");
          }}
        >
          <label className="block">
            <span className={labelText}>Name</span>
            <input name="name" required maxLength={80} className={field} />
          </label>
          <label className="block">
            <span className={labelText}>Email</span>
            <input name="email" type="email" required className={field} />
          </label>
          <label className="block">
            <span className={labelText}>Role</span>
            <select name="role" className={field} defaultValue="staff">
              <option value="staff">Staff — leads, gallery, testimonials</option>
              <option value="owner">Owner — full access</option>
            </select>
          </label>
          <button className={btn.primary} disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Send invite
          </button>
        </form>
        {msg && <p className={clsx("mt-4 text-sm", msg.err ? "text-red-800" : "opacity-75")}>{msg.t}</p>}
      </Card>
    </div>
  );
}
