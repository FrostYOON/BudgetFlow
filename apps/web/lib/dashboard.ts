import "server-only";

export interface DashboardInsight {
  type: string;
  severity: string;
  title: string;
  message: string;
}

export interface DashboardSummary {
  totalIncome: string;
  totalExpense: string;
  sharedExpense: string;
  personalExpense: string;
  monthlyBudget: string;
  allocatedBudget: string;
  unallocatedBudget: string;
  remainingBudget: string;
}

export interface DashboardTopCategory {
  categoryId: string;
  name: string;
  amount: string;
}

export interface DashboardRecentTransaction {
  id: string;
  amount: string;
  categoryName: string | null;
  paidByName: string | null;
}

export interface DashboardResponse {
  period: {
    year: number;
    month: number;
  };
  summary: DashboardSummary;
  topCategories: DashboardTopCategory[];
  recentTransactions: DashboardRecentTransaction[];
  insights: DashboardInsight[];
}

function getApiBaseUrl() {
  return process.env.BUDGETFLOW_API_URL ?? "http://localhost:3000/api/v1";
}

export async function fetchWorkspaceDashboard(input: {
  accessToken: string;
  workspaceId: string;
  year: number;
  month: number;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/dashboard?year=${input.year}&month=${input.month}`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load dashboard summary.");
  }

  return (await response.json()) as DashboardResponse;
}

export function formatCurrency(
  amount: string,
  currency: string,
  locale = "en-CA",
) {
  const value = Number(amount);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function getPreviousMonth(year: number, month: number) {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }

  return { year, month: month - 1 };
}

export function getNextMonth(year: number, month: number) {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }

  return { year, month: month + 1 };
}
