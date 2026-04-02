import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  BarChart3,
  PiggyBank,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DashboardTransactionCalendar } from "@/components/dashboard/dashboard-transaction-calendar";
import {
  Reveal,
  StaggerItem,
  StaggerReveal,
} from "@/components/motion/reveal";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButtonLink } from "@/components/ui/app-button";
import { AppMetricSurface, AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import { getDateDisplayLocale, getNumberDisplayLocale } from "@/lib/display-locale";
import {
  fetchWorkspaceDashboard,
  formatCurrency,
  formatMonthLabel,
  getNextMonth,
  getPreviousMonth,
} from "@/lib/dashboard";
import { fetchWorkspaceTransactions, getMonthRange } from "@/lib/transactions";

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
    redirect("/app/onboarding");
  }

  const requestedPeriod = getPeriod(await searchParams);
  const monthRange = getMonthRange(
    requestedPeriod.year,
    requestedPeriod.month,
  );
  const [dashboard, monthlyTransactions] = await Promise.all([
    fetchWorkspaceDashboard({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
      year: requestedPeriod.year,
      month: requestedPeriod.month,
    }),
    fetchWorkspaceTransactions({
      accessToken: session.accessToken,
      workspaceId: session.currentWorkspace.id,
      from: monthRange.from,
      to: monthRange.to,
    }),
  ]);

  const prev = getPreviousMonth(dashboard.period.year, dashboard.period.month);
  const next = getNextMonth(dashboard.period.year, dashboard.period.month);
  const currency = session.currentWorkspace.baseCurrency;
  const isPersonalWorkspace = session.currentWorkspace.type === "PERSONAL";
  const numberLocale = getNumberDisplayLocale(session.user.locale);
  const dateLocale = getDateDisplayLocale();
  const settlementsHref = `/app/settlements?year=${dashboard.period.year}&month=${dashboard.period.month}`;
  const reportsHref = `/app/reports?year=${dashboard.period.year}&month=${dashboard.period.month}`;
  const budgetsHref = `/app/budgets?year=${dashboard.period.year}&month=${dashboard.period.month}`;
  const composeTransactionHref = `/app/transactions?year=${dashboard.period.year}&month=${dashboard.period.month}&type=EXPENSE&visibility=ALL&compose=1`;
  const visibleInsights = dashboard.insights.slice(0, 3);
  const hiddenInsightsCount = Math.max(dashboard.insights.length - visibleInsights.length, 0);
  const monthTransactionCount = monthlyTransactions.items.length;
  const primaryActions: Array<{
    href: string;
    icon: LucideIcon;
    label: string;
    tone: "primary" | "secondary" | "success";
  }> = isPersonalWorkspace
    ? [
        {
          href: composeTransactionHref,
          icon: Plus,
          label: "Add entry",
          tone: "primary",
        },
        {
          href: budgetsHref,
          icon: PiggyBank,
          label: "Budget",
          tone: "success",
        },
        {
          href: reportsHref,
          icon: BarChart3,
          label: "Report",
          tone: "secondary",
        },
      ]
    : [
        {
          href: composeTransactionHref,
          icon: Plus,
          label: "Add entry",
          tone: "primary",
        },
        {
          href: settlementsHref,
          icon: ArrowLeftRight,
          label: "Settle",
          tone: "secondary",
        },
        {
          href: reportsHref,
          icon: BarChart3,
          label: "Report",
          tone: "secondary",
        },
      ];

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
    <div className="space-y-8">
      <Reveal delay={0.02}>
        <AppSurface padding="lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Dashboard
              </p>
              <h1 className="mt-3 hidden text-3xl font-semibold tracking-tight text-slate-950 lg:block">
                {session.currentWorkspace.name}
              </h1>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 lg:hidden">
                Monthly overview
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AppBadge tone="default" className="px-4 py-2 text-sm font-medium lg:hidden">
                  {formatMonthLabel(dashboard.period.year, dashboard.period.month)}
                </AppBadge>
                <AppBadge tone="subtle">
                  {isPersonalWorkspace ? "Personal" : "Shared"}
                </AppBadge>
              </div>
            </div>

            <div className="hidden items-center gap-3 text-sm lg:flex">
              <AppButtonLink
                href={`/app/dashboard?year=${prev.year}&month=${prev.month}`}
                tone="secondary"
                size="sm"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
                Prev
              </AppButtonLink>
              <AppBadge tone="default" className="px-4 py-2 text-sm font-medium">
                {formatMonthLabel(dashboard.period.year, dashboard.period.month)}
              </AppBadge>
              <AppButtonLink
                href={`/app/dashboard?year=${next.year}&month=${next.month}`}
                tone="secondary"
                size="sm"
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </AppButtonLink>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
            {primaryActions.map((action) => {
              const Icon = action.icon;

              return (
                <AppButtonLink
                  key={action.href}
                  href={action.href}
                  tone={action.tone}
                  className="w-full flex-col gap-2 rounded-[1.15rem] px-3 py-3 text-center sm:flex-row sm:justify-start sm:gap-3 sm:rounded-[1.35rem] sm:px-4 sm:py-4 sm:text-left"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/10 sm:h-10 sm:w-10 sm:rounded-2xl">
                    <Icon className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                  <span className="text-xs font-semibold sm:text-sm">{action.label}</span>
                </AppButtonLink>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 lg:hidden">
            <AppButtonLink
              href={`/app/dashboard?year=${prev.year}&month=${prev.month}`}
              tone="secondary"
              className="w-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
              Prev
            </AppButtonLink>
            <AppBadge tone="default" className="justify-center px-4 py-2 text-sm font-medium">
              {formatMonthLabel(dashboard.period.year, dashboard.period.month)}
            </AppBadge>
            <AppButtonLink
              href={`/app/dashboard?year=${next.year}&month=${next.month}`}
              tone="secondary"
              className="w-full gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </AppButtonLink>
          </div>
        </AppSurface>
      </Reveal>

      <StaggerReveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <AppMetricSurface className="sm:col-span-2 xl:col-span-1">
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
              numberLocale,
            )}
          </p>
          </AppMetricSurface>
        </StaggerItem>

        <StaggerItem>
          <AppMetricSurface>
          <p className="text-sm text-slate-500">
            {isPersonalWorkspace ? "Total expense" : "Shared spend"}
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              isPersonalWorkspace
                ? dashboard.summary.totalExpense
                : dashboard.summary.sharedExpense,
              currency,
              numberLocale,
            )}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            {isPersonalWorkspace ? "Income " : "Personal spend "}
            {formatCurrency(
              isPersonalWorkspace
                ? dashboard.summary.totalIncome
                : dashboard.summary.personalExpense,
              currency,
              numberLocale,
            )}
          </p>
          </AppMetricSurface>
        </StaggerItem>

        <StaggerItem>
          <AppMetricSurface className="hidden sm:block">
          <p className="text-sm text-slate-500">Monthly budget</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(dashboard.summary.monthlyBudget, currency, numberLocale)}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Allocated{" "}
            {formatCurrency(
              dashboard.summary.allocatedBudget,
              currency,
              numberLocale,
            )}
          </p>
          </AppMetricSurface>
        </StaggerItem>

        <StaggerItem>
          <AppMetricSurface className="hidden sm:block">
          <p className="text-sm text-slate-500">
            {isPersonalWorkspace ? "Transactions this month" : "Open insights"}
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {isPersonalWorkspace ? monthTransactionCount : dashboard.insights.length}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            {isPersonalWorkspace ? "Recent activity " : "Top expense "}
            {formatCurrency(dashboard.summary.totalExpense, currency, numberLocale)}
          </p>
          </AppMetricSurface>
        </StaggerItem>
      </StaggerReveal>

      <Reveal delay={0.08}>
        <AppSurface padding="md" tone="muted" className="sm:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">Mobile summary</p>
              <p className="mt-1 text-sm text-slate-500">
                Keep budget status first and open the rest when needed.
              </p>
            </div>
            <AppBadge tone="success">
              {dashboard.insights.length} insight{dashboard.insights.length === 1 ? "" : "s"}
            </AppBadge>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Monthly budget
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {formatCurrency(dashboard.summary.monthlyBudget, currency, numberLocale)}
              </p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Open insights
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {dashboard.insights.length}
              </p>
            </div>
          </div>
        </AppSurface>
      </Reveal>

      {isPersonalWorkspace ? (
        <Reveal delay={0.12}>
          <AppSurface padding="lg">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-900/8 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Personal focus
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep daily entry, monthly budget, and report review close together.
                </p>
              </div>
              <AppBadge tone="success">
                {monthTransactionCount} transaction{monthTransactionCount === 1 ? "" : "s"}
              </AppBadge>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Budget remaining
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(
                    dashboard.summary.remainingBudget,
                    currency,
                    numberLocale,
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Income logged
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(
                    dashboard.summary.totalIncome,
                    currency,
                    numberLocale,
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Expense logged
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(
                    dashboard.summary.totalExpense,
                    currency,
                    numberLocale,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <AppButtonLink href={composeTransactionHref} tone="primary" size="sm" className="gap-2">
                <Plus className="h-4 w-4" strokeWidth={2.2} />
                Add entry
              </AppButtonLink>
              <AppButtonLink href={budgetsHref} tone="secondary" size="sm" className="gap-2">
                <PiggyBank className="h-4 w-4" strokeWidth={2.2} />
                Budget
              </AppButtonLink>
              <AppButtonLink href={reportsHref} tone="secondary" size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" strokeWidth={2.2} />
                Report
              </AppButtonLink>
            </div>
          </AppSurface>
        </Reveal>
      ) : (
        <>
          <Reveal delay={0.12}>
            <AppSurface padding="lg" className="lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Shared settlement
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Check balances and suggested transfers from the settlements page.
                  </p>
                </div>
                <AppBadge tone="success">
                  {formatCurrency(
                    dashboard.settlement.totalSharedExpense,
                    currency,
                    numberLocale,
                  )}
                </AppBadge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    People involved
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {dashboard.settlement.balances.length}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Suggested transfers
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {dashboard.settlement.suggestedTransfers.length}
                  </p>
                </div>
              </div>

              <AppButtonLink href={settlementsHref} tone="secondary" className="mt-4 w-full gap-2">
                <ArrowLeftRight className="h-4 w-4" strokeWidth={2.2} />
                Open settlements
              </AppButtonLink>
            </AppSurface>
          </Reveal>

          <Reveal delay={0.14}>
            <AppSurface padding="lg" className="hidden lg:block">
              <div className="flex items-center justify-between gap-3 border-b border-slate-900/8 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Shared settlement
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Based on shared expense splits this month.
                  </p>
                </div>
                <AppBadge tone="success">
                  {formatCurrency(
                    dashboard.settlement.totalSharedExpense,
                    currency,
                    numberLocale,
                  )}
                </AppBadge>
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Balances
                  </p>
                  {dashboard.settlement.balances.map((balance) => {
                    const isPositive = Number(balance.netAmount) >= 0;
                    return (
                      <div
                        key={balance.userId}
                        className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4"
                      >
                        <p className="text-sm font-semibold text-slate-950">
                          {balance.name}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            isPositive ? "text-emerald-700" : "text-rose-600"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {formatCurrency(balance.netAmount, currency, numberLocale)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Suggested transfers
                  </p>
                  {dashboard.settlement.suggestedTransfers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                      Everyone is settled for this month.
                    </div>
                  ) : (
                    dashboard.settlement.suggestedTransfers.map((transfer) => (
                      <div
                        key={`${transfer.fromUserId}-${transfer.toUserId}`}
                        className="rounded-2xl border border-slate-900/8 px-4 py-4"
                      >
                        <p className="text-sm font-semibold text-slate-950">
                          {transfer.fromName} → {transfer.toName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatCurrency(transfer.amount, currency, numberLocale)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </AppSurface>
          </Reveal>
        </>
      )}

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-8">
          <Reveal delay={0.04}>
            <DashboardTransactionCalendar
              currency={currency}
              locale={dateLocale}
              month={dashboard.period.month}
              nextHref={`/app/dashboard?year=${next.year}&month=${next.month}`}
              previousHref={`/app/dashboard?year=${prev.year}&month=${prev.month}`}
              transactions={monthlyTransactions.items}
              year={dashboard.period.year}
            />
          </Reveal>

          <Reveal delay={0.08}>
            <AppSurface padding="lg">
            <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Top categories
                </h2>
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
                      {formatCurrency(category.amount, currency, numberLocale)}
                    </p>
                  </div>
                ))
              )}
            </div>
            </AppSurface>
          </Reveal>

          <Reveal delay={0.12}>
            <AppSurface padding="lg">
            <div className="flex items-center justify-between gap-4 border-b border-slate-900/8 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Recent transactions
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {dashboard.recentTransactions.length === 0 ? (
                <p className="text-sm text-slate-500">No transactions yet.</p>
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
                      {formatCurrency(transaction.amount, currency, numberLocale)}
                    </p>
                  </div>
                ))
              )}
            </div>
            </AppSurface>
          </Reveal>
        </div>

        <aside className="space-y-8">
          <Reveal delay={0.16}>
            <AppSurface padding="lg">
            <h2 className="text-lg font-semibold text-slate-950">Insights</h2>

            <div className="mt-5 space-y-3">
              {visibleInsights.length === 0 ? (
                <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
                  No insights this month.
                </div>
              ) : (
                visibleInsights.map((insight, index) => (
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
            {hiddenInsightsCount > 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                {hiddenInsightsCount} more insight
                {hiddenInsightsCount === 1 ? "" : "s"} remain after the highest-priority items.
              </p>
            ) : null}
            </AppSurface>
          </Reveal>

          <Reveal delay={0.2}>
            <AppSurface padding="lg">
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
                    numberLocale,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Total expense</span>
                <span className="font-semibold text-slate-950">
                  {formatCurrency(
                    dashboard.summary.totalExpense,
                    currency,
                    numberLocale,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Allocated budget</span>
                <span className="font-semibold text-slate-950">
                  {formatCurrency(
                    dashboard.summary.allocatedBudget,
                    currency,
                    numberLocale,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Unallocated budget</span>
                <span className="font-semibold text-slate-950">
                  {formatCurrency(
                    dashboard.summary.unallocatedBudget,
                    currency,
                    numberLocale,
                  )}
                </span>
              </div>
            </div>
            </AppSurface>
          </Reveal>
        </aside>
      </section>
    </div>
  );
}
