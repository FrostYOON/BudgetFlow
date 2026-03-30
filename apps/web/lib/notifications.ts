import "server-only";

export interface NotificationItem {
  key: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  createdAt: string;
  isRead: boolean;
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

export async function fetchNotifications(input: {
  accessToken: string;
  workspaceId?: string;
}) {
  const params = new URLSearchParams();

  if (input.workspaceId) {
    params.set("workspaceId", input.workspaceId);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/notifications${params.size ? `?${params.toString()}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to load notifications."),
    );
  }

  const payload = (await response.json()) as { items: NotificationItem[] };
  return payload.items;
}

export async function markNotificationRead(input: {
  accessToken: string;
  notificationKey: string;
}) {
  const response = await fetch(`${getApiBaseUrl()}/notifications/read`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationKey: input.notificationKey,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to mark notification as read."),
    );
  }

  return response.json();
}

export async function markAllNotificationsRead(input: {
  accessToken: string;
  workspaceId?: string;
}) {
  const params = new URLSearchParams();

  if (input.workspaceId) {
    params.set("workspaceId", input.workspaceId);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/notifications/read-all${params.size ? `?${params.toString()}` : ""}`,
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
      await readErrorMessage(response, "Failed to mark notifications as read."),
    );
  }

  return response.json();
}
