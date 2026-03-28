import "server-only";

export interface WorkspaceMemberSummary {
  userId: string;
  name: string;
  nickname?: string | null;
  role: string;
  status: string;
}

function getApiBaseUrl() {
  return process.env.BUDGETFLOW_API_URL ?? "http://localhost:3000/api/v1";
}

export async function fetchWorkspaceMembers(input: {
  accessToken: string;
  workspaceId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/members`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load workspace members.");
  }

  return (await response.json()) as WorkspaceMemberSummary[];
}

export async function updateCurrentUser(input: {
  accessToken: string;
  name: string;
  locale: string;
  timezone: string;
  profileImageUrl?: string | null;
}) {
  const response = await fetch(`${getApiBaseUrl()}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to update account settings.");
  }

  return response.json();
}

export async function updateCurrentWorkspaceMember(input: {
  accessToken: string;
  workspaceId: string;
  nickname: string | null;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/members/me`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname: input.nickname,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update household profile.");
  }

  return response.json();
}
