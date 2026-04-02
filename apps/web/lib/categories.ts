import "server-only";

export type CategoryType = "INCOME" | "EXPENSE";

export interface WorkspaceCategory {
  id: string;
  workspaceId: string;
  name: string;
  type: CategoryType;
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

export async function fetchWorkspaceCategoriesForSettings(input: {
  accessToken: string;
  workspaceId: string;
  includeArchived?: boolean;
}) {
  const params = new URLSearchParams();

  if (input.includeArchived) {
    params.set("includeArchived", "true");
  }

  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/categories${
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
      await readErrorMessage(response, "Failed to load categories."),
    );
  }

  return (await response.json()) as WorkspaceCategory[];
}

export async function createWorkspaceCategory(input: {
  accessToken: string;
  workspaceId: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  sortOrder?: number;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/categories`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to create category."),
    );
  }

  return (await response.json()) as WorkspaceCategory;
}

export async function updateWorkspaceCategory(input: {
  accessToken: string;
  workspaceId: string;
  categoryId: string;
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  sortOrder?: number;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/categories/${input.categoryId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: input.name,
        type: input.type,
        color: input.color,
        icon: input.icon,
        sortOrder: input.sortOrder,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to update category."),
    );
  }

  return (await response.json()) as WorkspaceCategory;
}

export async function archiveWorkspaceCategory(input: {
  accessToken: string;
  workspaceId: string;
  categoryId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/categories/${input.categoryId}`,
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
      await readErrorMessage(response, "Failed to archive category."),
    );
  }

  return (await response.json()) as WorkspaceCategory;
}

export async function unarchiveWorkspaceCategory(input: {
  accessToken: string;
  workspaceId: string;
  categoryId: string;
}) {
  const response = await fetch(
    `${getApiBaseUrl()}/workspaces/${input.workspaceId}/categories/${input.categoryId}/unarchive`,
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
      await readErrorMessage(response, "Failed to restore category."),
    );
  }

  return (await response.json()) as WorkspaceCategory;
}
