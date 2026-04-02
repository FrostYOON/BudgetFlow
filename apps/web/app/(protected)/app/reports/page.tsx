import { redirect } from "next/navigation";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButtonLink } from "@/components/ui/app-button";
import { AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import {
  buildMonthlyReportPrintHref,
  fetchMonthlyReport,
  formatMonthLabel,
  getMonthlyReportPeriod,
} from "@/lib/reports";
import { getNextMonth, getPreviousMonth } from "@/lib/dashboard";
import { MonthlyReportContent } from "./components/monthly-report-content";
import { PrintReportButton } from "./components/print-report-button";

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

  const requestedPeriod = getMonthlyReportPeriod(await searchParams);
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
  const printHref = buildMonthlyReportPrintHref(report.year, report.month);

  return (
    <div className="space-y-6">
      <AppSurface padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
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
          <AppButtonLink href="/app/dashboard" size="sm" tone="secondary">
            Dashboard
          </AppButtonLink>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <AppButtonLink
            href={`/app/reports/export?year=${report.year}&month=${report.month}`}
            size="sm"
            tone="success"
          >
            Export CSV
          </AppButtonLink>
          <PrintReportButton href={printHref} />
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

      <MonthlyReportContent
        animated
        currency={currency}
        locale={locale}
        report={report}
      />
    </div>
  );
}
