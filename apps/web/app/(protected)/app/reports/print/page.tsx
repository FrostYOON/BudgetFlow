import { redirect } from "next/navigation";
import { AppSurface } from "@/components/ui/app-surface";
import { getAppSession } from "@/lib/auth/session";
import {
  fetchMonthlyReport,
  formatMonthLabel,
  getMonthlyReportPeriod,
} from "@/lib/reports";
import { MonthlyReportContent } from "../components/monthly-report-content";
import { PrintReportControls } from "./print-report-controls";

export default async function ReportsPrintPage({
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

  const locale = session.user.locale === "ko-KR" ? "ko-KR" : "en-CA";
  const currency = session.currentWorkspace.baseCurrency;
  const backHref = `/app/reports?year=${report.year}&month=${report.month}`;

  return (
    <div className="space-y-6">
      <style>{`
        @page {
          size: auto;
          margin: 14mm;
        }

        @media print {
          body {
            background: #ffffff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .report-print-sheet,
          .report-print-sheet * {
            visibility: visible !important;
          }

          .report-print-sheet {
            position: absolute;
            inset: 0;
            padding: 0 !important;
          }
        }
      `}</style>

      <AppSurface padding="lg" className="print:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Monthly report export
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {formatMonthLabel(report.year, report.month)}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {session.currentWorkspace.name}
            </p>
          </div>

          <PrintReportControls backHref={backHref} />
        </div>
      </AppSurface>

      <div className="report-print-sheet">
        <div className="space-y-6">
          <AppSurface
            padding="lg"
            className="print:shadow-none print:border-slate-200 print:bg-white print:break-inside-avoid"
          >
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
            <div className="mt-5">
              <MonthlyReportContent
                animated={false}
                currency={currency}
                locale={locale}
                report={report}
              />
            </div>
          </AppSurface>
        </div>
      </div>
    </div>
  );
}
