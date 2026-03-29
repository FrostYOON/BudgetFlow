import "server-only";
import { formatCurrency, formatMonthLabel } from "@/lib/dashboard";

export interface MonthlyReportInsight {
  type: string;
  severity: string;
  title: string;
  message: string;
}

export interface MonthlyReportResponse {
  year: number;
  month: number;
  summary: {
    totalIncome: string;
    totalExpense: string;
    netAmount: string;
    sharedExpense: string;
    personalExpense: string;
    monthlyBudget: string;
    remainingBudget: string;
  };
  categoryBreakdown: Array<{
    categoryId: string;
    name: string;
    amount: string;
    transactionCount: number;
  }>;
  payerBreakdown: Array<{
    userId: string;
    name: string;
    amount: string;
    transactionCount: number;
  }>;
  budgetProgress: Array<{
    categoryId: string;
    categoryName: string;
    plannedAmount: string;
    actualAmount: string;
    remainingAmount: string;
    progressPct: number;
  }>;
  recurringUpcoming: Array<{
    id: string;
    memo: string | null;
    amount: string;
    categoryName: string | null;
    nextOccurrenceDate: string;
  }>;
  insights: MonthlyReportInsight[];
}

function getApiBaseUrl() {
  return process.env.BUDGETFLOW_API_URL ?? "http://localhost:3000/api/v1";
}

function clampMonth(value: number) {
  return Math.min(Math.max(value, 1), 12);
}

export function getMonthlyReportPeriod(params?: {
  year?: string;
  month?: string;
}) {
  const now = new Date();
  const year = Number(params?.year ?? now.getFullYear());
  const month = clampMonth(Number(params?.month ?? now.getMonth() + 1));

  return {
    year: Number.isFinite(year) ? year : now.getFullYear(),
    month: Number.isFinite(month) ? month : now.getMonth() + 1,
  };
}

export function buildMonthlyReportPrintHref(year: number, month: number) {
  return `/app/reports/print?year=${year}&month=${month}`;
}

export async function fetchMonthlyReport(input: {
  accessToken: string;
  workspaceId: string;
  year: number;
  month: number;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/reports/monthly?year=${input.year}&month=${input.month}`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load monthly report.");
  }

  return (await response.json()) as MonthlyReportResponse;
}

function escapeCsvValue(value: string | number) {
  const normalized = String(value);

  if (normalized.includes(",") || normalized.includes("\"") || normalized.includes("\n")) {
    return `"${normalized.replaceAll("\"", "\"\"")}"`;
  }

  return normalized;
}

export function buildMonthlyReportCsv(input: {
  currency: string;
  locale: string;
  report: MonthlyReportResponse;
  workspaceName: string;
}) {
  const { currency, locale, report, workspaceName } = input;

  const lines: string[] = [];

  lines.push("BudgetFlow Monthly Report");
  lines.push(`Workspace,${escapeCsvValue(workspaceName)}`);
  lines.push(`Period,${escapeCsvValue(formatMonthLabel(report.year, report.month))}`);
  lines.push("");
  lines.push("Summary");
  lines.push("Metric,Value");
  lines.push(`Income,${escapeCsvValue(formatCurrency(report.summary.totalIncome, currency, locale))}`);
  lines.push(`Expense,${escapeCsvValue(formatCurrency(report.summary.totalExpense, currency, locale))}`);
  lines.push(`Net,${escapeCsvValue(formatCurrency(report.summary.netAmount, currency, locale))}`);
  lines.push(`Remaining budget,${escapeCsvValue(formatCurrency(report.summary.remainingBudget, currency, locale))}`);
  lines.push("");
  lines.push("Category Breakdown");
  lines.push("Category,Amount,Transactions");
  report.categoryBreakdown.forEach((item) => {
    lines.push(
      [
        escapeCsvValue(item.name),
        escapeCsvValue(formatCurrency(item.amount, currency, locale)),
        escapeCsvValue(item.transactionCount),
      ].join(","),
    );
  });
  lines.push("");
  lines.push("Payer Breakdown");
  lines.push("Payer,Amount,Transactions");
  report.payerBreakdown.forEach((item) => {
    lines.push(
      [
        escapeCsvValue(item.name),
        escapeCsvValue(formatCurrency(item.amount, currency, locale)),
        escapeCsvValue(item.transactionCount),
      ].join(","),
    );
  });
  lines.push("");
  lines.push("Budget Progress");
  lines.push("Category,Planned,Actual,Remaining,ProgressPct");
  report.budgetProgress.forEach((item) => {
    lines.push(
      [
        escapeCsvValue(item.categoryName),
        escapeCsvValue(formatCurrency(item.plannedAmount, currency, locale)),
        escapeCsvValue(formatCurrency(item.actualAmount, currency, locale)),
        escapeCsvValue(formatCurrency(item.remainingAmount, currency, locale)),
        escapeCsvValue(item.progressPct),
      ].join(","),
    );
  });
  lines.push("");
  lines.push("Recurring Upcoming");
  lines.push("Name,Amount,Next Occurrence");
  report.recurringUpcoming.forEach((item) => {
    lines.push(
      [
        escapeCsvValue(item.memo ?? item.categoryName ?? "Recurring item"),
        escapeCsvValue(formatCurrency(item.amount, currency, locale)),
        escapeCsvValue(item.nextOccurrenceDate),
      ].join(","),
    );
  });
  lines.push("");
  lines.push("Insights");
  lines.push("Title,Severity,Message");
  report.insights.forEach((item) => {
    lines.push(
      [
        escapeCsvValue(item.title),
        escapeCsvValue(item.severity),
        escapeCsvValue(item.message),
      ].join(","),
    );
  });

  return lines.join("\n");
}

export { formatCurrency, formatMonthLabel };
