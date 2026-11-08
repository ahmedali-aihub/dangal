import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/AuthShell";
import { EnrollForm } from "@/components/admin/AuthForms";
import { isAdminDemo, requireStaff } from "@/lib/auth";

export const metadata = { title: "Set up two-factor authentication" };
export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  if (isAdminDemo) redirect("/admin");
  await requireStaff({ allowUnenrolled2FA: true });
  return (
    <AuthShell title="Protect your account" subtitle="Two-factor authentication is required for all admin users.">
      <EnrollForm />
    </AuthShell>
  );
}
