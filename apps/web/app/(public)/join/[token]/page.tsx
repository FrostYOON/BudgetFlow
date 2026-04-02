import { AppButtonLink } from "@/components/ui/app-button";
import { getAppSession } from "@/lib/auth/session";

export default async function JoinWorkspacePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getAppSession();
  const next = `/auth/accept-invite?token=${encodeURIComponent(token)}`;

  return (
    <main className="min-h-screen bg-[#f4f6f2] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md items-center">
        <section className="w-full rounded-[2rem] border border-slate-900/8 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Shared space invite
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Join this shared budget
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Accept the invite to see shared transactions, budgets, and recurring
            plans in one workspace.
          </p>

          <div className="mt-8 space-y-3">
            {session ? (
              <AppButtonLink
                href={next}
                tone="success"
                className="w-full"
              >
                Join workspace
              </AppButtonLink>
            ) : (
              <>
                <AppButtonLink
                  href={`/sign-in?next=${encodeURIComponent(next)}`}
                  tone="primary"
                  className="w-full"
                >
                  Sign in to join
                </AppButtonLink>
                <AppButtonLink
                  href={`/sign-up?next=${encodeURIComponent(next)}`}
                  tone="secondary"
                  className="w-full"
                >
                  Create account
                </AppButtonLink>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
