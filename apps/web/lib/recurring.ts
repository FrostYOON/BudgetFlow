import "server-only";

export type RecurringExecutionRunStatus = "RUNNING" | "SUCCESS" | "FAILED";
export type RecurringExecutionTriggerType = "SCHEDULED" | "MANUAL";

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

function getApiBaseUrl() {
  return process.env.BUDGETFLOW_API_URL ?? "http://localhost:3000/api/v1";
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
    throw new Error("Failed to load recurring ops summary.");
  }

  return (await response.json()) as RecurringOpsSummary;
}

export function formatDateLabel(input: string, locale = "en-CA") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
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
