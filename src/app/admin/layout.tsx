import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Dangal Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-cream-100 text-navy">{children}</div>;
}
