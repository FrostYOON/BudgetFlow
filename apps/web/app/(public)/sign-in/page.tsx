import Link from "next/link";
import { GoogleMark } from "@/components/auth/google-mark";
import { SignInForm } from "@/components/auth/sign-in-form";
import { AppButtonLink } from "@/components/ui/app-button";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/app/dashboard";
  const draftEmail = params.email ?? "";
  const isGoogleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID);

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
              Sign in to BudgetFlow.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Personal budgeting first. Shared spaces when you need them.
            </p>
          </div>

          <div className="border-t border-white/10 pt-8 text-sm text-slate-300">
            <p className="max-w-lg">
              Track personal spending first. Move into shared budgeting when you need a household space.
            </p>
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
              Continue to your workspace.
            </p>
          </div>

          <SignInForm draftEmail={draftEmail} next={next} />

          {isGoogleEnabled ? (
            <div className="mt-4 border-t border-white/10 pt-4">
              <AppButtonLink
                href={`/auth/google/start?redirectTo=${encodeURIComponent(next)}`}
                tone="secondary"
                className="w-full border-white/20 bg-white/8 text-white shadow-none hover:border-white/35 hover:bg-white/14 hover:text-white"
              >
                <GoogleMark className="h-4 w-4" />
                Continue with Google
              </AppButtonLink>
            </div>
          ) : null}

          <p className="mt-6 text-sm text-slate-400">
            Need a new account?{" "}
            <AppButtonLink
              href={`/sign-up?next=${encodeURIComponent(next)}`}
              tone="secondary"
              size="sm"
              className="ml-2 border-white/20 bg-white/8 text-white shadow-none hover:border-white/35 hover:bg-white/14 hover:text-white"
            >
              Create account
            </AppButtonLink>
          </p>
        </section>
      </div>
    </main>
  );
}
