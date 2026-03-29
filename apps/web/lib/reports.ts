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

export { formatCurrency, formatMonthLabel };
