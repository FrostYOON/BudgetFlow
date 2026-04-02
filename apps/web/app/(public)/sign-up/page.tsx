import { GoogleMark } from "@/components/auth/google-mark";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { AppButtonLink } from "@/components/ui/app-button";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
    error?: string;
    name?: string;
    next?: string;
  }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/app/dashboard";
  const isGoogleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID);
  const draftName = params.name ?? "";
  const draftEmail = params.email ?? "";

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
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Use your real name so shared spaces stay clear for everyone. Your
            password should be at least 8 characters and include uppercase,
            lowercase, and a number.
          </p>

          <SignUpForm
            draftEmail={draftEmail}
            draftName={draftName}
            next={next}
          />

          {isGoogleEnabled ? (
            <div className="mt-6 border-t border-slate-900/8 pt-6">
              <AppButtonLink
                href={`/auth/google/start?redirectTo=${encodeURIComponent(next)}`}
                className="px-6 py-3"
              >
                <GoogleMark className="h-4 w-4" />
                Continue with Google
              </AppButtonLink>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
