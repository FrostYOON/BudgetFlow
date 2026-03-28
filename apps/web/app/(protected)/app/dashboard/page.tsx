import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";
import {
  fetchWorkspaceDashboard,
  formatCurrency,
  formatMonthLabel,
  getNextMonth,
  getPreviousMonth,
} from "@/lib/dashboard";

function clampMonth(value: number) {
  return Math.min(Math.max(value, 1), 12);
}

function getPeriod(params?: { year?: string; month?: string }) {
  const now = new Date();
  const year = Number(params?.year ?? now.getFullYear());
  const month = clampMonth(Number(params?.month ?? now.getMonth() + 1));

  return {
    year: Number.isFinite(year) ? year : now.getFullYear(),
    month: Number.isFinite(month) ? month : now.getMonth() + 1,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!session.currentWorkspace) {
    return (
      <div className="space-y-8">
        <section className="border-b border-slate-900/8 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            No workspace connected yet
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Your account is authenticated, but there is no household workspace
            available yet. The next onboarding step should create a workspace or
            accept an invite.
          </p>
        </section>
      </div>
    );
  }

  const requestedPeriod = getPeriod(await searchParams);
  const dashboard = await fetchWorkspaceDashboard({
    accessToken: session.accessToken,
    workspaceId: session.currentWorkspace.id,
    year: requestedPeriod.year,
    month: requestedPeriod.month,
  });

  const prev = getPreviousMonth(dashboard.period.year, dashboard.period.month);
  const next = getNextMonth(dashboard.period.year, dashboard.period.month);
  const currency = session.currentWorkspace.baseCurrency;
  const locale = session.user.locale === "ko-KR" ? "ko-KR" : "en-CA";

  const budgetUsedPct =
    Number(dashboard.summary.monthlyBudget) > 0
      ? Math.min(
          (Number(dashboard.summary.totalExpense) /
            Number(dashboard.summary.monthlyBudget)) *
            100,
          100,
        )
      : 0;

  return (
    <div className="space-y-10">
      <section className="border-b border-slate-900/8 pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {session.currentWorkspace.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Live dashboard summary for{" "}
              {formatMonthLabel(dashboard.period.year, dashboard.period.month)}.
              This screen is backed by the real dashboard API and current
              authenticated workspace context.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link
              href={`/app/dashboard?year=${prev.year}&month=${prev.month}`}
              className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Previous
            </Link>
            <div className="rounded-full bg-slate-950 px-4 py-2 font-medium text-white">
              {formatMonthLabel(dashboard.period.year, dashboard.period.month)}
            </div>
            <Link
              href={`/app/dashboard?year=${next.year}&month=${next.month}`}
              className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              Next
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-4">
        <article className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Budget used</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {budgetUsedPct.toFixed(0)}%
          </p>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-emerald-600"
              style={{ width: `${budgetUsedPct}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Remaining{" "}
            {formatCurrency(
              dashboard.summary.remainingBudget,
              currency,
              locale,
            )}
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Shared spend</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(dashboard.summary.sharedExpense, currency, locale)}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Personal spend{" "}
            {formatCurrency(
              dashboard.summary.personalExpense,
              currency,
              locale,
            )}
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Monthly budget</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(dashboard.summary.monthlyBudget, currency, locale)}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Allocated{" "}
            {formatCurrency(
              dashboard.summary.allocatedBudget,
              currency,
              locale,
            )}
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Open insights</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {dashboard.insights.length}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Top expense{" "}
            {formatCurrency(dashboard.summary.totalExpense, currency, locale)}
          </p>
        </article>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-8">
          <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Top categories
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Highest expense categories for the selected month.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {dashboard.topCategories.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No expense categories recorded for this period.
                </p>
              ) : (
                dashboard.topCategories.map((category) => (
                  <div
                    key={category.categoryId}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">
                        {category.name}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                        Expense category
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-950">
                      {formatCurrency(category.amount, currency, locale)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Recent transactions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest recorded entries in the selected workspace.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {dashboard.recentTransactions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No transactions have been recorded yet.
                </p>
              ) : (
                dashboard.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-900/8 px-4 py-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">
                        {transaction.categoryName ?? "Uncategorized"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Paid by {transaction.paidByName ?? "Unknown"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-950">
                      {formatCurrency(transaction.amount, currency, locale)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-slate-950">Insights</h2>
            <p className="mt-1 text-sm text-slate-500">
              Rule-based insights from the current month.
            </p>

            <div className="mt-5 space-y-3">
              {dashboard.insights.length === 0 ? (
                <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                  No active insights for this month. Budget and spending look
                  stable.
                </div>
              ) : (
                dashboard.insights.map((insight, index) => (
                  <article
                    key={`${insight.type}-${index}`}
                    className="rounded-2xl border border-slate-900/8 px-4 py-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {insight.severity}
                    </p>
                    <h3 className="mt-2 font-semibold text-slate-950">
                      {insight.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {insight.message}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-6 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-semibold text-slate-950">
              Budget breakdown
            </h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Total income</span>
                <span className="font-semibold text-slate-950">
                  {formatCurrency(
                    dashboard.summary.totalIncome,
                    currency,
                    locale,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Total expense</span>
                <span className="font-semibold text-slate-950">
                  {formatCurrency(
                    dashboard.summary.totalExpense,
                    currency,
                    locale,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Allocated budget</span>
                <span className="font-semibold text-slate-950">
                  {formatCurrency(
                    dashboard.summary.allocatedBudget,
                    currency,
                    locale,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Unallocated budget</span>
                <span className="font-semibold text-slate-950">
                  {formatCurrency(
                    dashboard.summary.unallocatedBudget,
                    currency,
                    locale,
                  )}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
