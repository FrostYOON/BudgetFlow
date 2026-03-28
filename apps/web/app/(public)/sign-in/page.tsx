import Link from "next/link";
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const next = params.next ?? "/app/dashboard";

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
              Sign in with your actual BudgetFlow account.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              This screen now posts to the real Nest auth API. On success, the
              web app stores its own auth cookies and enters the protected app
              shell.
            </p>
          </div>

          <div className="grid gap-4 border-t border-white/10 pt-8 text-sm text-slate-300 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-white">Real auth</p>
              <p className="mt-1">
                Sign-in calls the live `/auth/sign-in` API.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white">Cookie session</p>
              <p className="mt-1">
                Access and refresh cookies are stored on web.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white">Protected shell</p>
              <p className="mt-1">Successful sign-in redirects into `/app`.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Sign in
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Enter your account details
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              The refresh token stays server-managed through web cookies. This
              keeps the browser flow compatible with the API contract.
            </p>
          </div>

          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error === "missing_fields"
                ? "Email and password are required."
                : error === "session_expired"
                  ? "Your session expired. Please sign in again."
                  : "Sign-in failed. Check your credentials and try again."}
            </div>
          ) : null}

          <form action="/auth/sign-in" method="post" className="space-y-4">
            <input type="hidden" name="redirectTo" value={next} />

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
                placeholder="minji@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
                placeholder="StrongPassword123!"
              />
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Need a new account?{" "}
            <Link
              href="/sign-up"
              className="text-white underline underline-offset-4"
            >
              Create one here
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
