import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { buildMonthlyReportCsv, fetchMonthlyReport } from "@/lib/reports";

function clampMonth(value: number) {
  return Math.min(Math.max(value, 1), 12);
}

export async function GET(request: NextRequest) {
  const session = await getAppSession();

  if (!session || !session.currentWorkspace) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const year = Number(searchParams.get("year") ?? now.getFullYear());
  const month = clampMonth(Number(searchParams.get("month") ?? now.getMonth() + 1));

  const report = await fetchMonthlyReport({
    accessToken: session.accessToken,
    workspaceId: session.currentWorkspace.id,
    year: Number.isFinite(year) ? year : now.getFullYear(),
    month: Number.isFinite(month) ? month : now.getMonth() + 1,
  });

  const locale = session.user.locale === "ko-KR" ? "ko-KR" : "en-CA";
  const csv = buildMonthlyReportCsv({
    report,
    currency: session.currentWorkspace.baseCurrency,
    locale,
    workspaceName: session.currentWorkspace.name,
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="budgetflow-report-${report.year}-${String(report.month).padStart(2, "0")}.csv"`,
    },
  });
}
