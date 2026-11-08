import { AuthShell } from "@/components/admin/AuthShell";
import { CodeForm } from "@/components/admin/AuthForms";

export const metadata = { title: "Two-factor verification" };
export const dynamic = "force-dynamic";

export default function VerifyPage() {
  return (
    <AuthShell title="Two-factor check" subtitle="Open your authenticator app and enter the current code.">
      <CodeForm />
    </AuthShell>
  );
}
