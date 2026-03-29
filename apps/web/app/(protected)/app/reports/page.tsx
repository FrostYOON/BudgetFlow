import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  Reveal,
  StaggerItem,
  StaggerReveal,
} from "@/components/motion/reveal";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButtonLink } from "@/components/ui/app-button";
import { AppMetricSurface, AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import {
  fetchMonthlyReport,
  formatCurrency,
  formatMonthLabel,
} from "@/lib/reports";
import { getNextMonth, getPreviousMonth } from "@/lib/dashboard";

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

export default async function ReportsPage({
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
  const report = await fetchMonthlyReport({
    accessToken: session.accessToken,
    workspaceId: session.currentWorkspace.id,
    year: requestedPeriod.year,
    month: requestedPeriod.month,
  });

  const prev = getPreviousMonth(report.year, report.month);
  const next = getNextMonth(report.year, report.month);
  const locale = session.user.locale === "ko-KR" ? "ko-KR" : "en-CA";
  const currency = session.currentWorkspace.baseCurrency;

  return (
    <div className="space-y-6">
      <AppSurface padding="lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Monthly report
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {formatMonthLabel(report.year, report.month)}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {session.currentWorkspace.name}
            </p>
          </div>
          <AppButtonLink
            href="/app/dashboard"
            size="sm"
            tone="secondary"
          >
            Dashboard
          </AppButtonLink>
        </div>

        <div className="mt-5 flex items-center gap-3 text-sm">
          <AppButtonLink
            href={`/app/reports/export?year=${report.year}&month=${report.month}`}
            size="sm"
            tone="success"
          >
            Export CSV
          </AppButtonLink>
          <AppButtonLink
            href={`/app/reports?year=${prev.year}&month=${prev.month}`}
            size="sm"
            tone="secondary"
          >
            Prev
          </AppButtonLink>
          <AppBadge tone="default" className="px-4 py-2 text-sm font-medium">
            {formatMonthLabel(report.year, report.month)}
          </AppBadge>
          <AppButtonLink
            href={`/app/reports?year=${next.year}&month=${next.month}`}
            size="sm"
            tone="secondary"
          >
            Next
          </AppButtonLink>
        </div>
      </AppSurface>

      <StaggerReveal className="grid gap-3 sm:grid-cols-2">
        <StaggerItem>
          <SummaryCard
            label="Income"
            value={formatCurrency(report.summary.totalIncome, currency, locale)}
          />
        </StaggerItem>
        <StaggerItem>
          <SummaryCard
            label="Expense"
            value={formatCurrency(report.summary.totalExpense, currency, locale)}
          />
        </StaggerItem>
        <StaggerItem>
          <SummaryCard
            label="Net"
            value={formatCurrency(report.summary.netAmount, currency, locale)}
          />
        </StaggerItem>
        <StaggerItem>
          <SummaryCard
            label="Remaining"
            value={formatCurrency(
              report.summary.remainingBudget,
              currency,
              locale,
            )}
          />
        </StaggerItem>
      </StaggerReveal>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Reveal delay={0.04}>
          <CardSection title="Category breakdown">
          <div className="space-y-3">
            {report.categoryBreakdown.map((item) => (
              <div
                key={item.categoryId}
                className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.transactionCount} transactions
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-950">
                  {formatCurrency(item.amount, currency, locale)}
                </p>
              </div>
            ))}
          </div>
          </CardSection>
        </Reveal>

        <Reveal delay={0.08}>
          <CardSection title="Paid by">
          <div className="space-y-3">
            {report.payerBreakdown.map((item) => (
              <div
                key={item.userId}
                className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.transactionCount} transactions
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-950">
                  {formatCurrency(item.amount, currency, locale)}
                </p>
              </div>
            ))}
          </div>
          </CardSection>
        </Reveal>

        <Reveal delay={0.12}>
          <CardSection title="Budget progress">
          <div className="space-y-3">
            {report.budgetProgress.map((item) => (
              <div
                key={item.categoryId}
                className="rounded-2xl bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-950">
                    {item.categoryName}
                  </p>
                  <p className="text-xs font-semibold text-slate-500">
                    {item.progressPct}%
                  </p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(item.progressPct, 100)}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 text-xs text-slate-500">
                  <span>
                    Planned{" "}
                    {formatCurrency(item.plannedAmount, currency, locale)}
                  </span>
                  <span>
                    Actual {formatCurrency(item.actualAmount, currency, locale)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          </CardSection>
        </Reveal>

        <Reveal delay={0.16}>
          <CardSection title="Recurring upcoming">
          <div className="space-y-3">
            {report.recurringUpcoming.length === 0 ? (
              <p className="text-sm text-slate-500">No recurring items.</p>
            ) : (
              report.recurringUpcoming.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {item.memo ?? item.categoryName ?? "Recurring item"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.nextOccurrenceDate}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-950">
                    {formatCurrency(item.amount, currency, locale)}
                  </p>
                </div>
              ))
            )}
          </div>
          </CardSection>
        </Reveal>
      </section>

      <Reveal delay={0.2}>
        <CardSection title="Insights">
        <div className="space-y-3">
          {report.insights.length === 0 ? (
            <p className="text-sm text-slate-500">No insights.</p>
          ) : (
            report.insights.map((insight) => (
              <div
                key={`${insight.type}-${insight.title}`}
                className="rounded-2xl border border-slate-900/8 bg-slate-50 px-4 py-4"
              >
                <p className="text-sm font-semibold text-slate-950">
                  {insight.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {insight.message}
                </p>
              </div>
            ))
          )}
        </div>
        </CardSection>
      </Reveal>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <AppMetricSurface>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </AppMetricSurface>
  );
}

function CardSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <AppSurface padding="md">
      <div className="border-b border-slate-900/8 pb-4">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </AppSurface>
  );
}
