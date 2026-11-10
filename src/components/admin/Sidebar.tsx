"use client";

import { clsx } from "clsx";
import { BadgeIndianRupee, Clapperboard, ExternalLink, Image as ImageIcon, Inbox, LayoutDashboard, LogOut, Megaphone, Menu, MessageSquareQuote, UserCog, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/app/admin/actions/auth";
import { Logo } from "@/components/layout/Logo";

const ICONS = { LayoutDashboard, Clapperboard, Inbox, BadgeIndianRupee, Users, MessageSquareQuote, ImageIcon, Megaphone, UserCog };
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number; section?: string };

export function Sidebar({ items, user }: { items: NavItem[]; user: { name: string; role: string } }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col">
      <ul className="space-y-0.5">
        {items.map((it, i) => {
          const Icon = ICONS[it.icon];
          const heading = it.section && it.section !== items[i - 1]?.section ? it.section : null;
          const active = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
          return (
            <li key={it.href} className={heading ? (i === 0 ? "" : "pt-5") : ""}>
              {heading && <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-titanium/65">{heading}</p>}
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={clsx("flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors", active ? "bg-titanium/[0.12] text-titanium" : "text-titanium/65 hover:bg-titanium/[0.06] hover:text-titanium")}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                <span className="flex-1">{it.label}</span>
                {!!it.badge && <span className="rounded-full bg-titanium px-2 py-0.5 text-[11px] font-medium text-ink">{it.badge}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-3 pt-8">
        <Link href="/" target="_blank" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-titanium/65 hover:text-titanium">
          <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden /> View website
        </Link>
        <div className="flex items-center justify-between rounded-2xl border border-titanium/10 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm">{user.name}</p>
            <p className="text-xs capitalize text-titanium/65">{user.role}</p>
          </div>
          <form action={signOut}>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-full text-titanium/70 hover:bg-titanium/10 hover:text-titanium" title="Sign out">
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="sr-only">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between bg-ink px-4 py-3 text-titanium lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-titanium/15" aria-expanded={open}>
          <Menu className="h-5 w-5" aria-hidden />
          <span className="sr-only">Open admin menu</span>
        </button>
      </div>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-ink p-5 text-titanium lg:flex">
        <Logo className="mb-10 px-2" />
        {nav}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink p-5 text-titanium lg:hidden" role="dialog" aria-modal="true">
          <div className="mb-8 flex items-center justify-between">
            <Logo />
            <button onClick={() => setOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-titanium/15" autoFocus>
              <X className="h-5 w-5" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          {nav}
        </div>
      )}
    </>
  );
}
