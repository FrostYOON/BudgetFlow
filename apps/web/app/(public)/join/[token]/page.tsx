import Link from "next/link";
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
              <Link
                href={next}
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Join workspace
              </Link>
            ) : (
              <>
                <Link
                  href={`/sign-in?next=${encodeURIComponent(next)}`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Sign in to join
                </Link>
                <Link
                  href={`/sign-up?next=${encodeURIComponent(next)}`}
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
