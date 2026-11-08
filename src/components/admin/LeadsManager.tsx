"use client";

import { clsx } from "clsx";
import { Download, Loader2, MessageCircle, Phone, Search, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteLead, updateLead } from "@/app/admin/actions/leads";
import type { Lead, LeadStatus } from "@/lib/types";
import { Badge, btn, field } from "./ui";

export const STATUSES: { v: LeadStatus; l: string }[] = [
  { v: "new", l: "New" },
  { v: "contacted", l: "Contacted" },
  { v: "trial_booked", l: "Trial booked" },
  { v: "converted", l: "Converted" },
  { v: "lost", l: "Lost" },
];

export function LeadsManager({ leads, canDelete }: { leads: Lead[]; canDelete: boolean }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const status = params.get("status") ?? "all";
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const go = (next: Record<string, string>) => {
    const p = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v && v !== "all" ? p.set(k, v) : p.delete(k)));
    router.push(`${path}?${p.toString()}`);
  };

  const save = (id: string, values: { status?: string; notes?: string }) =>
    start(async () => {
      const r = await updateLead(id, values);
      if (!r.ok) setError(r.error);
      else {
        setError(null);
        router.refresh();
      }
    });

  const exportHref = `/admin/leads/export?${new URLSearchParams({ ...(status !== "all" && { status }), ...(q && { q }) }).toString()}`;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {[{ v: "all", l: "All" }, ...STATUSES].map((s) => (
            <button key={s.v} onClick={() => go({ status: s.v })} aria-pressed={status === s.v} className={clsx("h-9 shrink-0 rounded-full px-4 text-sm", status === s.v ? "bg-navy text-cream" : "border border-navy/15 bg-white")}>
              {s.l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go({ q });
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email" aria-label="Search leads" className={clsx(field, "h-10 w-60 pl-9")} />
          </form>
          <a href={exportHref} className={btn.secondary}>
            <Download className="h-4 w-4" aria-hidden /> CSV
          </a>
        </div>
      </div>
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
        {leads.length === 0 ? (
          <p className="p-10 text-center text-sm opacity-70">No leads match.</p>
        ) : (
          <ul className="divide-y divide-navy/10">
            {leads.map((l) => {
              const expanded = open === l.id;
              const wa = `https://wa.me/${l.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${l.name.split(" ")[0]}, this is Dangal Gym. Thanks for your enquiry!`)}`;
              return (
                <li key={l.id}>
                  <button className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left hover:bg-cream-100/60 sm:grid-cols-[1.4fr_1.2fr_1fr_auto]" onClick={() => setOpen(expanded ? null : l.id)} aria-expanded={expanded}>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{l.name}</span>
                      <span className="block truncate text-xs opacity-70">{l.phone}</span>
                    </span>
                    <span className="hidden truncate text-sm opacity-75 sm:block">{l.interest ?? "General enquiry"}</span>
                    <span className="hidden text-xs opacity-70 sm:block">{new Date(l.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}</span>
                    <span className="flex items-center gap-1.5">
                      {l.kind === "free_trial" && <Badge tone="outline">Trial</Badge>}
                      <Badge tone={l.status === "new" ? "solid" : "neutral"}>{STATUSES.find((s) => s.v === l.status)?.l}</Badge>
                    </span>
                  </button>
                  {expanded && (
                    <div className="grid gap-6 bg-cream-100/50 px-5 py-5 lg:grid-cols-2">
                      <dl className="space-y-2 text-sm">
                        {[
                          ["Email", l.email],
                          ["Interest", l.interest],
                          ["Preferred time", l.preferred_time],
                          ["Message", l.message],
                          ["Came from", l.source],
                        ].map(([k, v]) =>
                          v ? (
                            <div key={k} className="grid grid-cols-[120px_1fr] gap-2">
                              <dt className="opacity-70">{k}</dt>
                              <dd className="break-words">{v}</dd>
                            </div>
                          ) : null,
                        )}
                        <div className="flex flex-wrap gap-2 pt-3">
                          <a href={`tel:${l.phone}`} className={btn.secondary}>
                            <Phone className="h-4 w-4" aria-hidden /> Call
                          </a>
                          <a href={wa} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
                            <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                          </a>
                          {canDelete && (
                            <button className={btn.danger} disabled={pending} onClick={() => confirm("Delete this lead permanently?") && start(async () => { const r = await deleteLead(l.id); if (r.ok) router.refresh(); else setError(r.error); })}>
                              <Trash2 className="h-4 w-4" aria-hidden /> Delete
                            </button>
                          )}
                        </div>
                      </dl>
                      <form
                        className="space-y-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          save(l.id, { status: String(fd.get("status")), notes: String(fd.get("notes") ?? "") });
                        }}
                      >
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] opacity-70">Status</span>
                          <select name="status" defaultValue={l.status} className={field}>
                            {STATUSES.map((s) => (
                              <option key={s.v} value={s.v}>
                                {s.l}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] opacity-70">Notes</span>
                          <textarea name="notes" defaultValue={l.notes ?? ""} rows={4} maxLength={2000} className={clsx(field, "h-auto py-2.5")} placeholder="Called on Monday, visiting Saturday 7 AM…" />
                        </label>
                        <button className={btn.primary} disabled={pending}>
                          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save
                        </button>
                      </form>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
