import "server-only";

export interface WorkspaceTransaction {
  id: string;
  workspaceId: string;
  type: "INCOME" | "EXPENSE";
  visibility: "SHARED" | "PERSONAL";
  amount: string;
  currency: string;
  transactionDate: string;
  categoryId: string | null;
  categoryName: string | null;
  memo: string | null;
  createdByUserId: string;
  paidByUserId: string | null;
  paidByUserName: string | null;
  isDeleted: boolean;
  createdAt: string;
}

export interface TransactionListResponse {
  items: WorkspaceTransaction[];
  nextCursor: string | null;
}

function getApiBaseUrl() {
  return process.env.BUDGETFLOW_API_URL ?? "http://localhost:3000/api/v1";
}

export async function fetchWorkspaceTransactions(input: {
  accessToken: string;
  workspaceId: string;
  from: string;
  to: string;
  type?: "INCOME" | "EXPENSE";
  visibility?: "SHARED" | "PERSONAL";
}) {
  const params = new URLSearchParams({
    from: input.from,
    to: input.to,
  });

  if (input.type) {
    params.set("type", input.type);
  }

  if (input.visibility) {
    params.set("visibility", input.visibility);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/transactions?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load transactions.");
  }

  return (await response.json()) as TransactionListResponse;
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

export function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));

  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
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

export function formatDateLabel(input: string, locale = "en-CA") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${input}T00:00:00.000Z`));
}
