import { AppButtonLink } from "@/components/ui/app-button";

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
    <main className="min-h-screen bg-[image:var(--landing-bg)] text-[color:var(--foreground)]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[color:var(--surface-border)] pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              BudgetFlow
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
              Budgeting for yourself first, shared spaces when needed.
            </h1>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <AppButtonLink
              href="/sign-in"
              tone="secondary"
              size="sm"
            >
              Sign in
            </AppButtonLink>
            <AppButtonLink
              href="/sign-up"
              tone="primary"
              size="sm"
            >
              Create account
            </AppButtonLink>
          </nav>
        </header>

        <div className="grid flex-1 gap-12 py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-emerald-700">
              Solo budgets, couples, families, roommates
            </p>
            <h2 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-[color:var(--foreground)] sm:text-6xl">
              Start with your own budget, then add shared money when life gets collaborative.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--text-soft)]">
              BudgetFlow keeps daily money tracking simple. Use it alone by default,
              then add a couple, family, or roommate space when you need shared visibility.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <AppButtonLink
                href="/sign-up"
                tone="success"
              >
                Create your account
              </AppButtonLink>
              <AppButtonLink
                href="/sign-in"
                tone="secondary"
              >
                Go to auth entry
              </AppButtonLink>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[color:var(--surface-border)] bg-[color:var(--surface-soft)] shadow-[var(--surface-shadow)] backdrop-blur">
            <div className="border-b border-[color:var(--surface-border)] px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Typical workspace shapes
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-soft)]">
                Start with a personal budget or move into a shared setup without changing tools.
              </p>
            </div>

            <div className="divide-y divide-[color:var(--surface-border)]">
              {SAMPLE_HOUSEHOLDS.map((workspace) => (
                <article
                  key={workspace.name}
                  className="grid gap-2 px-6 py-5 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                      {workspace.name}
                    </h3>
                    <p className="mt-1 text-sm text-[color:var(--text-soft)]">
                      {workspace.summary}
                    </p>
                  </div>
                  <div className="text-sm text-[color:var(--text-muted)] sm:text-right">
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
