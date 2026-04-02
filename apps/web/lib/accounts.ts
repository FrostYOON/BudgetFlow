import "server-only";

export type FinancialAccountType =
  | "CASH"
  | "CHECKING"
  | "SAVINGS"
  | "CREDIT_CARD"
  | "E_WALLET";

export interface FinancialAccount {
  id: string;
  workspaceId: string;
  name: string;
  type: FinancialAccountType;
  currency: string;
  institutionName: string | null;
  lastFour: string | null;
  sortOrder: number;
  isArchived: boolean;
  createdAt: string;
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

export async function fetchFinancialAccounts(input: {
  accessToken: string;
  workspaceId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/accounts`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to load financial accounts."),
    );
  }

  return (await response.json()) as FinancialAccount[];
}

export async function createFinancialAccount(input: {
  accessToken: string;
  workspaceId: string;
  name: string;
  type: FinancialAccountType;
  currency: string;
  institutionName?: string;
  lastFour?: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/accounts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: input.name,
        type: input.type,
        currency: input.currency,
        institutionName: input.institutionName,
        lastFour: input.lastFour,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to create financial account."),
    );
  }

  return response.json();
}

export async function archiveFinancialAccount(input: {
  accessToken: string;
  workspaceId: string;
  accountId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/accounts/${input.accountId}`,
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
      await readErrorMessage(response, "Failed to archive financial account."),
    );
  }

  return response.json();
}
