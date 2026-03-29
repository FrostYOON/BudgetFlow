import Link from "next/link";
import { redirect } from "next/navigation";
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
      <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
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
          <Link
            href="/app/dashboard"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-5 flex items-center gap-3 text-sm">
          <Link
            href={`/app/reports?year=${prev.year}&month=${prev.month}`}
            className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Prev
          </Link>
          <Link
            href={`/app/reports?year=${next.year}&month=${next.month}`}
            className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Next
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
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
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
      </section>

      <CardSection title="Insights">
        <div className="space-y-3">
          {report.insights.length === 0 ? (
            <p className="text-sm text-slate-500">No active insights.</p>
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
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </article>
  );
}

function CardSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
      <div className="border-b border-slate-900/8 pb-4">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
