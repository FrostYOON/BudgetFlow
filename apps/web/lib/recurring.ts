import "server-only";

export type RecurringExecutionRunStatus = "RUNNING" | "SUCCESS" | "FAILED";
export type RecurringExecutionTriggerType = "SCHEDULED" | "MANUAL";
export type RecurringRepeatUnit = "WEEKLY" | "MONTHLY" | "YEARLY";
export type RecurringTransactionType = "INCOME" | "EXPENSE";
export type RecurringVisibility = "SHARED" | "PERSONAL";

export interface RecurringTransaction {
  id: string;
  workspaceId: string;
  type: RecurringTransactionType;
  visibility: RecurringVisibility;
  amount: string;
  currency: string;
  categoryId: string | null;
  categoryName: string | null;
  memo: string | null;
  paidByUserId: string | null;
  paidByUserName: string | null;
  repeatUnit: RecurringRepeatUnit;
  repeatInterval: number;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringExecutionRun {
  id: string;
  workspaceId: string;
  triggerType: RecurringExecutionTriggerType;
  status: RecurringExecutionRunStatus;
  targetDate: string;
  initiatedByUserId: string | null;
  initiatedByUserName: string | null;
  candidateCount: number | null;
  createdCount: number | null;
  skippedCount: number | null;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface RecurringOpsSummary {
  scheduler: {
    enabled: boolean;
    cron: string;
    workspaceTimezone: string;
    currentLocalDate: string;
    nextTargetDate: string;
  };
  recurringTransactions: {
    activeCount: number;
    inactiveCount: number;
  };
  last7Days: {
    totalRuns: number;
    successRuns: number;
    failedRuns: number;
    createdTransactions: number;
    skippedTransactions: number;
  };
  lastRun: RecurringExecutionRun | null;
  lastSuccessfulRun: RecurringExecutionRun | null;
  lastFailedRun: RecurringExecutionRun | null;
  recentFailures: RecurringExecutionRun[];
}

export interface RerunRecurringExecutionResponse {
  run: RecurringExecutionRun | null;
  result: {
    year: number;
    month: number;
    dryRun: boolean;
    summary: {
      candidateCount: number;
      createdCount: number;
      skippedCount: number;
    };
    items: Array<{
      recurringTransactionId: string;
      transactionId: string | null;
      transactionDate: string;
      memo: string | null;
      amount: string;
      skipped: boolean;
      skipReason: string | null;
    }>;
  };
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

export async function fetchRecurringOpsSummary(input: {
  accessToken: string;
  workspaceId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/recurring-transactions/ops`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to load recurring ops summary."),
    );
  }

  return (await response.json()) as RecurringOpsSummary;
}

export async function fetchRecurringTransactions(input: {
  accessToken: string;
  workspaceId: string;
  includeInactive?: boolean;
}) {
  const params = new URLSearchParams();

  if (input.includeInactive) {
    params.set("includeInactive", "true");
  }

  const query = params.toString();
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/recurring-transactions${
      query ? `?${query}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to load recurring transactions."),
    );
  }

  return (await response.json()) as RecurringTransaction[];
}

export async function createRecurringTransaction(input: {
  accessToken: string;
  workspaceId: string;
  type: RecurringTransactionType;
  visibility: RecurringVisibility;
  amount: string;
  currency: string;
  categoryId?: string;
  memo?: string;
  paidByUserId?: string;
  repeatUnit: RecurringRepeatUnit;
  repeatInterval: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
}) {
  const { accessToken, workspaceId, ...payload } = input;
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${workspaceId}/recurring-transactions`,
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
      await readErrorMessage(response, "Failed to create recurring rule."),
    );
  }

  return response.json();
}

export async function updateRecurringTransaction(input: {
  accessToken: string;
  workspaceId: string;
  recurringTransactionId: string;
  type: RecurringTransactionType;
  visibility: RecurringVisibility;
  amount: string;
  currency: string;
  categoryId?: string;
  memo?: string;
  paidByUserId?: string;
  repeatUnit: RecurringRepeatUnit;
  repeatInterval: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}) {
  const { accessToken, workspaceId, recurringTransactionId, ...payload } = input;
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${workspaceId}/recurring-transactions/${recurringTransactionId}`,
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
      await readErrorMessage(response, "Failed to update recurring rule."),
    );
  }

  return response.json();
}

export async function deactivateRecurringTransaction(input: {
  accessToken: string;
  workspaceId: string;
  recurringTransactionId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/recurring-transactions/${input.recurringTransactionId}`,
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
      await readErrorMessage(response, "Failed to deactivate recurring rule."),
    );
  }

  return response.json();
}

export async function fetchRecurringExecutionRuns(input: {
  accessToken: string;
  workspaceId: string;
  limit?: number;
}) {
  const params = new URLSearchParams();

  if (input.limit) {
    params.set("limit", String(input.limit));
  }

  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/recurring-transactions/execution-runs${
      params.toString().length > 0 ? `?${params.toString()}` : ""
    }`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to load recurring runs."),
    );
  }

  return (await response.json()) as RecurringExecutionRun[];
}

export async function rerunRecurringExecution(input: {
  accessToken: string;
  workspaceId: string;
  executionDate: string;
  dryRun: boolean;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/recurring-transactions/execution-runs/rerun`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        executionDate: input.executionDate,
        dryRun: input.dryRun,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to rerun recurring execution."),
    );
  }

  return (await response.json()) as RerunRecurringExecutionResponse;
}

export function formatDateLabel(input: string, locale = "en-CA") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${input}T00:00:00.000Z`));
}

export function formatDateTimeLabel(
  input: string | null,
  locale = "en-CA",
  timeZone = "UTC",
) {
  if (!input) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    year: "numeric",
    timeZone,
  }).format(new Date(input));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatRecurringRule(item: RecurringTransaction) {
  if (item.repeatUnit === "WEEKLY") {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `Every ${item.repeatInterval} week${item.repeatInterval > 1 ? "s" : ""}${
      item.dayOfWeek !== null ? ` · ${labels[item.dayOfWeek]}` : ""
    }`;
  }

  if (item.repeatUnit === "MONTHLY") {
    return `Every ${item.repeatInterval} month${item.repeatInterval > 1 ? "s" : ""}${
      item.dayOfMonth !== null ? ` · day ${item.dayOfMonth}` : ""
    }`;
  }

  return `Every ${item.repeatInterval} year${item.repeatInterval > 1 ? "s" : ""}`;
}
