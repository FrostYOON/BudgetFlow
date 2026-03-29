import Link from "next/link";

const SAMPLE_HOUSEHOLDS = [
  {
    name: "Personal budget",
    summary: "Salary, subscriptions, groceries, and monthly goals in one place.",
    meta: "1 member · CAD 1,850 monthly budget",
  },
  {
    name: "Couple household",
    summary: "Monthly rent, groceries, and shared subscriptions in one budget.",
    meta: "2 members · CAD 3,200 monthly budget",
  },
  {
    name: "Family workspace",
    summary: "Food, school, utilities, and recurring bills tracked together.",
    meta: "4 members · CAD 5,850 monthly budget",
  },
  {
    name: "Roommate setup",
    summary: "Shared rent split, internet, and household supplies.",
    meta: "3 members · CAD 2,450 monthly budget",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f3fbf7,transparent_42%),linear-gradient(180deg,#f8fbfa_0%,#eef2ef_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-slate-900/8 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              BudgetFlow
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Budgeting for yourself first, shared spaces when needed.
            </h1>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/sign-in"
              className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-slate-950 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
            >
              Create account
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 gap-12 py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-700">
              Solo budgets, couples, families, roommates
            </p>
            <h2 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-slate-950 sm:text-6xl">
              Start with your own budget, then add shared money when life gets collaborative.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              BudgetFlow keeps daily money tracking simple. Use it alone by default,
              then add a couple, family, or roommate space when you need shared visibility.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Create your account
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
              >
                Go to auth entry
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white/85 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="border-b border-slate-900/8 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Typical workspace shapes
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Start with a personal budget or move into a shared setup without changing tools.
              </p>
            </div>

            <div className="divide-y divide-slate-900/8">
              {SAMPLE_HOUSEHOLDS.map((workspace) => (
                <article
                  key={workspace.name}
                  className="grid gap-2 px-6 py-5 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {workspace.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {workspace.summary}
                    </p>
                  </div>
                  <div className="text-sm text-slate-500 sm:text-right">
                    <p>{workspace.meta}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
