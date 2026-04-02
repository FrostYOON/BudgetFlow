import { SignUpContextFields } from "@/components/auth/sign-up-context-fields";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/app/dashboard";

  return (
    <main className="min-h-screen bg-[#f4f6f2] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-12">
        <div className="rounded-[2rem] border border-slate-900/8 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Sign up
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance">
            Create your BudgetFlow account.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Start with a personal budget. Add a shared space later if you need one.
          </p>

          <form
            action="/auth/sign-up"
            method="post"
            className="mt-10 space-y-4"
          >
            <input type="hidden" name="redirectTo" value={next} />
            <SignUpContextFields />
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Name
              </span>
              <input
                name="name"
                type="text"
                required
                minLength={2}
                autoComplete="name"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6f2]"
                placeholder="Minji"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6f2]"
                placeholder="minji@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f6f2]"
                placeholder="StrongPassword123!"
              />
            </label>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <AppButton type="submit" className="px-6 py-3">
                Create account
              </AppButton>
              <AppButtonLink
                href={`/sign-in?next=${encodeURIComponent(next)}`}
                className="px-6 py-3"
              >
                Back to sign in
              </AppButtonLink>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
