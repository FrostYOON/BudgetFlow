import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f2] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-12">
        <div className="rounded-[2rem] border border-slate-900/8 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Sign up preview
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance">
            Workspace-first onboarding will start here.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            The real sign-up flow is tracked separately. For now, the app shell
            and route protection are ready, so use the preview sign-in entry to
            land in the protected workspace experience.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Continue to preview sign-in
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Back to overview
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
