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
  accountId: string | null;
  accountName: string | null;
  participants: WorkspaceTransactionParticipant[];
  isDeleted: boolean;
  createdAt: string;
}

export interface WorkspaceTransactionParticipant {
  userId: string;
  userName: string;
  shareType: "EQUAL" | "FIXED" | "PERCENTAGE";
  shareValue: string | null;
}

export interface TransactionListResponse {
  items: WorkspaceTransaction[];
  nextCursor: string | null;
}

export interface TransactionCategory {
  id: string;
  workspaceId: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isDefault: boolean;
  isArchived: boolean;
}

function getApiBaseUrl() {
  return process.env.BUDGETFLOW_API_URL ?? "http://localhost:3000/api/v1";
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message)) {
      return payload.message[0] ?? fallback;
    }
    return payload.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function fetchWorkspaceTransactions(input: {
  accessToken: string;
  workspaceId: string;
  from: string;
  to: string;
  cursor?: string;
  limit?: number;
  type?: "INCOME" | "EXPENSE";
  visibility?: "SHARED" | "PERSONAL";
  accountId?: string;
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

  if (input.cursor) {
    params.set("cursor", input.cursor);
  }

  if (input.limit) {
    params.set("limit", String(input.limit));
  }

  if (input.accountId) {
    params.set("accountId", input.accountId);
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
    throw new Error(
      await readErrorMessage(response, "Failed to load transactions."),
    );
  }

  return (await response.json()) as TransactionListResponse;
}

export async function fetchAllWorkspaceTransactions(input: {
  accessToken: string;
  workspaceId: string;
  from: string;
  to: string;
  type?: "INCOME" | "EXPENSE";
  visibility?: "SHARED" | "PERSONAL";
}) {
  const items: WorkspaceTransaction[] = [];
  let cursor: string | undefined;

  do {
    const page = await fetchWorkspaceTransactions({
      ...input,
      cursor,
      limit: 100,
    });

    items.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  return items;
}

export async function fetchWorkspaceCategories(input: {
  accessToken: string;
  workspaceId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/categories`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to load categories."),
    );
  }

  return (await response.json()) as TransactionCategory[];
}

export async function createWorkspaceTransaction(input: {
  accessToken: string;
  workspaceId: string;
  type: "INCOME" | "EXPENSE";
  visibility: "SHARED" | "PERSONAL";
  amount: string;
  currency: string;
  transactionDate: string;
  categoryId?: string;
  memo?: string;
  paidByUserId?: string;
  accountId?: string;
  participants?: {
    userId: string;
    shareType: "EQUAL" | "FIXED" | "PERCENTAGE";
    shareValue?: string;
  }[];
}) {
  const { accessToken, workspaceId, ...payload } = input;
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${workspaceId}/transactions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to create transaction."),
    );
  }

  return response.json();
}

export async function updateWorkspaceTransaction(input: {
  accessToken: string;
  workspaceId: string;
  transactionId: string;
  visibility: "SHARED" | "PERSONAL";
  amount: string;
  currency: string;
  transactionDate: string;
  categoryId: string | null;
  memo: string | null;
  paidByUserId?: string;
  accountId?: string | null;
  participants?: {
    userId: string;
    shareType: "EQUAL" | "FIXED" | "PERCENTAGE";
    shareValue?: string;
  }[];
}) {
  const { accessToken, workspaceId, transactionId, ...payload } = input;
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${workspaceId}/transactions/${transactionId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to update transaction."),
    );
  }

  return response.json();
}

export async function deleteWorkspaceTransaction(input: {
  accessToken: string;
  workspaceId: string;
  transactionId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/transactions/${input.transactionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to delete transaction."),
    );
  }

  return response.json();
}

export async function restoreWorkspaceTransaction(input: {
  accessToken: string;
  workspaceId: string;
  transactionId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/transactions/${input.transactionId}/restore`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to restore transaction."),
    );
  }

  return response.json();
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
    timeZone: "UTC",
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
    timeZone: "UTC",
  }).format(new Date(`${input}T00:00:00.000Z`));
}
