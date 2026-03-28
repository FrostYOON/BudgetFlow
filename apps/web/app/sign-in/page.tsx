import Link from "next/link";
import { PREVIEW_WORKSPACES } from "@/lib/preview-workspaces";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-12 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10">
        <section className="flex flex-col justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
            >
              BudgetFlow
            </Link>
            <h1 className="mt-8 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Protected routes are ready. Use the preview session to enter the
              MVP shell.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              This issue builds the auth gate and application frame. The full
              form-based login flow will be implemented in the next web auth
              task.
            </p>
          </div>

          <div className="grid gap-4 border-t border-white/10 pt-8 text-sm text-slate-300 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-white">Protected app routes</p>
              <p className="mt-1">`/app/*` is now cookie-gated.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Workspace context</p>
              <p className="mt-1">Preview workspace switching is available.</p>
            </div>
            <div>
              <p className="font-semibold text-white">Primary navigation</p>
              <p className="mt-1">
                Dashboard, transactions, budgets, recurring.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Sign in preview
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Choose a household workspace
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              This creates a preview session cookie and redirects into the
              authenticated app shell.
            </p>
          </div>

          <div className="space-y-3">
            {PREVIEW_WORKSPACES.map((workspace) => (
              <form
                key={workspace.id}
                action="/auth/preview-session"
                method="post"
                className="rounded-2xl border border-white/10 bg-white/4 p-4"
              >
                <input type="hidden" name="workspaceId" value={workspace.id} />
                <input type="hidden" name="redirectTo" value="/app/dashboard" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {workspace.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {workspace.summary}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Enter shell
                  </button>
                </div>
              </form>
            ))}
          </div>

          <p className="mt-6 text-sm text-slate-400">
            Need a new household instead?{" "}
            <Link
              href="/sign-up"
              className="text-white underline underline-offset-4"
            >
              Open sign-up preview
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
