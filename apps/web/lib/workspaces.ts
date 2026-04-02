import "server-only";
import type { WorkspaceSummary } from "@/lib/auth/types";

export type WorkspaceType = "PERSONAL" | "COUPLE" | "FAMILY" | "ROOMMATE";

function getApiBaseUrl() {
  return process.env.BUDGETFLOW_API_URL ?? "http://localhost:3000/api/v1";
}

export async function createWorkspace(input: {
  accessToken: string;
  name: string;
  type: WorkspaceType;
  baseCurrency: string;
  timezone: string;
}) {
  const response = await fetch(`${getApiBaseUrl()}/workspaces`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      name: input.name,
      type: input.type,
      baseCurrency: input.baseCurrency,
      timezone: input.timezone,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create workspace.");
  }

  return (await response.json()) as WorkspaceSummary & {
    ownerUserId: string;
  };
}
