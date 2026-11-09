import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/AuthShell";
import { LoginForm } from "@/components/admin/AuthForms";
import { isAdminDemo } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  if (!isSupabaseConfigured) {
    return (
      <AuthShell title="Admin setup required" subtitle="Supabase isn't connected yet, so there is nothing to sign in to.">
        <div className="space-y-4 text-sm leading-relaxed opacity-85">
          <p>Add your Supabase keys to <code className="rounded bg-navy/5 px-1.5 py-0.5">.env.local</code> and run the SQL in <code className="rounded bg-navy/5 px-1.5 py-0.5">supabase/schema.sql</code>. Full steps are in the README.</p>
          {isAdminDemo && (
            <Link href="/admin" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-navy text-sm font-medium text-cream">
              Preview the admin panel (local demo)
            </Link>
          )}
        </div>
      </AuthShell>
    );
  }

  const supabase = await createClient();

  // Is the database set up? (video_settings is publicly readable, so the anon key can check.)
  const { error: dbError } = await supabase.from("video_settings").select("id").limit(1);
  if (dbError) {
    // Tables genuinely missing (PostgREST PGRST205 / Postgres 42P01) vs. a connection/key problem — say which.
    const tablesMissing = dbError.code === "PGRST205" || dbError.code === "42P01";
    return (
      <AuthShell
        title={tablesMissing ? "Database not set up yet" : "Can't reach the database"}
        subtitle={tablesMissing ? "The Supabase project is connected, but the tables haven't been created." : "The site couldn't connect to Supabase with the settings it was given."}
      >
        {tablesMissing ? (
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed opacity-85">
            <li>Supabase Dashboard → <strong>SQL Editor</strong> → New query.</li>
            <li>Paste the contents of <code className="rounded bg-navy/5 px-1.5 py-0.5">supabase/setup.sql</code> and press <strong>Run</strong>.</li>
            <li>Refresh this page.</li>
          </ol>
        ) : (
          <div className="space-y-4 text-sm leading-relaxed opacity-85">
            <p className="rounded-xl bg-navy/5 p-3 font-mono text-xs">
              {dbError.message}
              {dbError.hint ? ` — ${dbError.hint}` : ""}
            </p>
            <p>
              Check the environment variables in your host (Vercel → Settings → Environment Variables):{" "}
              <code>NEXT_PUBLIC_SUPABASE_URL</code> must be exactly your project address with no trailing slash or spaces, and{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> must be the <strong>publishable</strong> key (starts with <code>sb_publishable_</code>).
              After changing them, redeploy.
            </p>
          </div>
        )}
      </AuthShell>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && !error) redirect("/admin");

  return (
    <AuthShell title="Sign in" subtitle="Owner and staff access only.">
      {error === "no-access" && (
        <p role="alert" className="mb-6 rounded-xl bg-navy/5 p-3 text-sm">
          Your account isn&apos;t active yet. Ask the owner to enable it.
        </p>
      )}
      <LoginForm />
    </AuthShell>
  );
}
