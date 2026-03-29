import "server-only";

export interface WorkspaceMemberSummary {
  userId: string;
  name: string;
  nickname?: string | null;
  role: string;
  status: string;
}

export interface WorkspaceInviteSummary {
  id: string;
  email: string;
  role: string;
  status: string;
  workspaceId: string;
  token: string;
  expiresAt: string;
}

export interface WorkspaceInviteDisplayMeta {
  label: string;
  tone: "subtle" | "success" | "warning" | "danger";
  detail: string;
}

export interface WorkspaceSettingsInput {
  accessToken: string;
  workspaceId: string;
  name: string;
  type: string;
  baseCurrency: string;
  timezone: string;
}

function getApiBaseUrl() {
  return process.env.BUDGETFLOW_API_URL ?? "http://localhost:3000/api/v1";
}

const INVITE_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const INVITE_RELATIVE_FORMATTER = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

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
    throw new Error(
      await readErrorMessage(response, "Failed to load workspace members."),
    );
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
    throw new Error(
      await readErrorMessage(response, "Failed to update account settings."),
    );
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
    throw new Error(
      await readErrorMessage(response, "Failed to update household profile."),
    );
  }

  return response.json();
}

export async function updateWorkspaceSettings(input: WorkspaceSettingsInput) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: input.name,
        type: input.type,
        baseCurrency: input.baseCurrency,
        timezone: input.timezone,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to update household settings."),
    );
  }

  return response.json();
}

export async function fetchWorkspaceInvites(input: {
  accessToken: string;
  workspaceId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/invites`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to load household invites."),
    );
  }

  return (await response.json()) as WorkspaceInviteSummary[];
}

export function buildWorkspaceInviteJoinPath(token: string) {
  return `/join/${token}`;
}

export function formatWorkspaceInviteDate(input: string) {
  return INVITE_DATE_FORMATTER.format(new Date(input));
}

export function getWorkspaceInviteDisplayMeta(
  invite: WorkspaceInviteSummary,
): WorkspaceInviteDisplayMeta {
  const expiresAt = new Date(invite.expiresAt);
  const isExpired =
    invite.status === "INVITED" && expiresAt.getTime() <= Date.now();
  const relativeDays = Math.round(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  const relativeText =
    Math.abs(relativeDays) < 1
      ? "today"
      : INVITE_RELATIVE_FORMATTER.format(relativeDays, "day");

  if (invite.status === "INVITED") {
    return {
      label: isExpired ? "Expired" : "Pending",
      tone: isExpired ? "danger" : "warning",
      detail: isExpired
        ? `Expired ${formatWorkspaceInviteDate(invite.expiresAt)}`
        : `Expires ${relativeText}`,
    };
  }

  if (invite.status === "ACTIVE") {
    return {
      label: "Accepted",
      tone: "success",
      detail: "Invite accepted.",
    };
  }

  return {
    label: "Revoked",
    tone: "subtle",
    detail: "Invite revoked.",
  };
}

export async function createWorkspaceInvite(input: {
  accessToken: string;
  workspaceId: string;
  email: string;
  role: "MEMBER" | "OWNER";
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/invites`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email,
        role: input.role,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to create household invite."),
    );
  }

  return (await response.json()) as WorkspaceInviteSummary;
}

export async function acceptWorkspaceInvite(input: {
  accessToken: string;
  token: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspace-invites/${input.token}/accept`,
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
      await readErrorMessage(response, "Failed to accept household invite."),
    );
  }

  return (await response.json()) as {
    workspaceId: string;
    memberStatus: string;
  };
}

export async function revokeWorkspaceInvite(input: {
  accessToken: string;
  workspaceId: string;
  inviteId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/invites/${input.inviteId}/revoke`,
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
      await readErrorMessage(response, "Failed to revoke household invite."),
    );
  }

  return (await response.json()) as WorkspaceInviteSummary;
}

export async function resendWorkspaceInvite(input: {
  accessToken: string;
  workspaceId: string;
  inviteId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/invites/${input.inviteId}/resend`,
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
      await readErrorMessage(response, "Failed to resend household invite."),
    );
  }

  return (await response.json()) as WorkspaceInviteSummary;
}
