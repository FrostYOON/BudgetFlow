import "server-only";

export interface SettlementBalance {
  userId: string;
  name: string;
  netAmount: string;
}

export interface SuggestedSettlementTransfer {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: string;
}

export interface CompletedSettlementTransfer {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: string;
  settledAt: string;
  memo: string | null;
}

export interface SettlementSummary {
  totalSharedExpense: string;
  balances: SettlementBalance[];
  suggestedTransfers: SuggestedSettlementTransfer[];
  completedTransfers: CompletedSettlementTransfer[];
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

export async function fetchSettlementSummary(input: {
  accessToken: string;
  workspaceId: string;
  year: number;
  month: number;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/settlements/${input.year}/${input.month}`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to load settlement summary."),
    );
  }

  return (await response.json()) as SettlementSummary;
}

export async function recordSettlementTransfer(input: {
  accessToken: string;
  workspaceId: string;
  year: number;
  month: number;
  fromUserId: string;
  toUserId: string;
  amount: string;
  memo?: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/settlements/${input.year}/${input.month}/record`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fromUserId: input.fromUserId,
        toUserId: input.toUserId,
        amount: input.amount,
        memo: input.memo,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to record settlement transfer."),
    );
  }

  return (await response.json()) as SettlementSummary;
}
