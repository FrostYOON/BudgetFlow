import type { ReactNode } from "react";
import { Reveal, StaggerItem, StaggerReveal } from "@/components/motion/reveal";
import { AppMetricSurface, AppSurface } from "@/components/ui/app-surface";
import type { MonthlyReportResponse } from "@/lib/reports";
import { formatCurrency } from "@/lib/reports";

type MonthlyReportContentProps = {
  animated?: boolean;
  currency: string;
  locale: string;
  report: MonthlyReportResponse;
};

export function MonthlyReportContent({
  animated = true,
  currency,
  locale,
  report,
}: MonthlyReportContentProps) {
  const summary = (
    <div className="grid gap-3 sm:grid-cols-2">
      <SummaryCard
        label="Income"
        value={formatCurrency(report.summary.totalIncome, currency, locale)}
      />
      <SummaryCard
        label="Expense"
        value={formatCurrency(report.summary.totalExpense, currency, locale)}
      />
      <SummaryCard
        label="Net"
        value={formatCurrency(report.summary.netAmount, currency, locale)}
      />
      <SummaryCard
        label="Remaining"
        value={formatCurrency(report.summary.remainingBudget, currency, locale)}
      />
    </div>
  );

  const categoryBreakdown = (
    <CardSection title="Category breakdown">
      <div className="space-y-3">
        {report.categoryBreakdown.map((item) => (
          <div
            key={item.categoryId}
            className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4 print:border print:border-slate-200 print:bg-white"
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
  );

  const payerBreakdown = (
    <CardSection title="Paid by">
      <div className="space-y-3">
        {report.payerBreakdown.map((item) => (
          <div
            key={item.userId}
            className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4 print:border print:border-slate-200 print:bg-white"
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
  );

  const budgetProgress = (
    <CardSection title="Budget progress">
      <div className="space-y-3">
        {report.budgetProgress.map((item) => (
          <div
            key={item.categoryId}
            className="rounded-2xl bg-slate-50 px-4 py-4 print:border print:border-slate-200 print:bg-white"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-950">
                {item.categoryName}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                {item.progressPct}%
              </p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200 print:bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-500 print:bg-slate-900"
                style={{ width: `${Math.min(item.progressPct, 100)}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 text-xs text-slate-500">
              <span>
                Planned {formatCurrency(item.plannedAmount, currency, locale)}
              </span>
              <span>
                Actual {formatCurrency(item.actualAmount, currency, locale)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CardSection>
  );

  const recurringUpcoming = (
    <CardSection title="Recurring upcoming">
      <div className="space-y-3">
        {report.recurringUpcoming.length === 0 ? (
          <p className="text-sm text-slate-500">No recurring items.</p>
        ) : (
          report.recurringUpcoming.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4 print:border print:border-slate-200 print:bg-white"
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
  );

  const insights = (
    <CardSection title="Insights">
      <div className="space-y-3">
        {report.insights.length === 0 ? (
          <p className="text-sm text-slate-500">No insights.</p>
        ) : (
          report.insights.map((insight) => (
            <div
              key={`${insight.type}-${insight.title}`}
              className="rounded-2xl border border-slate-900/8 bg-slate-50 px-4 py-4 print:border-slate-200 print:bg-white"
            >
              <p className="text-sm font-semibold text-slate-950">
                {insight.title}
              </p>
              <p className="mt-2 text-sm text-slate-600">{insight.message}</p>
            </div>
          ))
        )}
      </div>
    </CardSection>
  );

  if (!animated) {
    return (
      <div className="space-y-6">
        {summary}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {categoryBreakdown}
          {payerBreakdown}
          {budgetProgress}
          {recurringUpcoming}
        </section>
        {insights}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            value={formatCurrency(report.summary.remainingBudget, currency, locale)}
          />
        </StaggerItem>
      </StaggerReveal>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Reveal delay={0.04}>{categoryBreakdown}</Reveal>
        <Reveal delay={0.08}>{payerBreakdown}</Reveal>
        <Reveal delay={0.12}>{budgetProgress}</Reveal>
        <Reveal delay={0.16}>{recurringUpcoming}</Reveal>
      </section>

      <Reveal delay={0.2}>{insights}</Reveal>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <AppMetricSurface className="print:shadow-none print:border-slate-200 print:bg-white print:break-inside-avoid">
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
    <AppSurface
      padding="md"
      className="print:shadow-none print:border-slate-200 print:bg-white print:break-inside-avoid"
    >
      <div className="border-b border-slate-900/8 pb-4 print:border-slate-200">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </AppSurface>
  );
}
