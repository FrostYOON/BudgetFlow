import "server-only";

export interface BudgetCategorySummary {
  categoryId: string;
  categoryName: string;
  plannedAmount: string;
  actualAmount: string;
  remainingAmount: string;
  progressPct: number;
  alertThresholdPct: number | null;
}

export interface BudgetTemplateSummary {
  id: string | null;
  name: string | null;
  totalBudgetAmount: string | null;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    plannedAmount: string;
    alertThresholdPct: number | null;
  }>;
}

export interface MonthlyBudgetSummary {
  id: string;
  workspaceId: string;
  year: number;
  month: number;
  totalBudgetAmount: string;
  allocatedAmount: string;
  unallocatedAmount: string;
  actualAmount: string;
  categories: BudgetCategorySummary[];
}

export interface ExpenseCategory {
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

export async function fetchMonthlyBudget(input: {
  accessToken: string;
  workspaceId: string;
  year: number;
  month: number;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/budgets/${input.year}/${input.month}`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to load budget."));
  }

  return (await response.json()) as MonthlyBudgetSummary;
}

export async function fetchExpenseCategories(input: {
  accessToken: string;
  workspaceId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/categories?type=EXPENSE`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to load categories."));
  }

  return (await response.json()) as ExpenseCategory[];
}

export async function upsertMonthlyBudget(input: {
  accessToken: string;
  workspaceId: string;
  year: number;
  month: number;
  totalBudgetAmount: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/budgets/${input.year}/${input.month}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        totalBudgetAmount: input.totalBudgetAmount,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to save monthly budget."),
    );
  }

  return (await response.json()) as MonthlyBudgetSummary;
}

export async function replaceCategoryBudgets(input: {
  accessToken: string;
  workspaceId: string;
  year: number;
  month: number;
  categories: Array<{
    categoryId: string;
    plannedAmount: string;
    alertThresholdPct?: number;
  }>;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/budgets/${input.year}/${input.month}/categories`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categories: input.categories,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to save category budgets."),
    );
  }

  return response.json();
}

export async function fetchBudgetTemplate(input: {
  accessToken: string;
  workspaceId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/budgets/template`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to load budget template."),
    );
  }

  return (await response.json()) as BudgetTemplateSummary;
}

export async function copyPreviousMonthBudget(input: {
  accessToken: string;
  workspaceId: string;
  year: number;
  month: number;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/budgets/${input.year}/${input.month}/copy-previous`,
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
      await readErrorMessage(response, "Failed to copy previous month budget."),
    );
  }

  return (await response.json()) as MonthlyBudgetSummary;
}

export async function saveBudgetTemplate(input: {
  accessToken: string;
  workspaceId: string;
  year: number;
  month: number;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/budgets/${input.year}/${input.month}/save-template`,
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
      await readErrorMessage(response, "Failed to save budget template."),
    );
  }

  return (await response.json()) as BudgetTemplateSummary;
}

export async function applyBudgetTemplate(input: {
  accessToken: string;
  workspaceId: string;
  year: number;
  month: number;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/budgets/${input.year}/${input.month}/apply-template`,
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
      await readErrorMessage(response, "Failed to apply budget template."),
    );
  }

  return (await response.json()) as MonthlyBudgetSummary;
}
