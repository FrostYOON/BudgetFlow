import "server-only";
import { cookies } from "next/headers";
import {
  AUTH_ACCESS_COOKIE_NAME,
  CURRENT_WORKSPACE_COOKIE_NAME,
} from "@/lib/auth/constants";
import { fetchMe, fetchWorkspaces } from "@/lib/auth/api";
import type { AuthUser, WorkspaceSummary } from "@/lib/auth/types";

export interface AppSession {
  accessToken: string;
  user: AuthUser;
  workspaces: WorkspaceSummary[];
  currentWorkspace: WorkspaceSummary | null;
}

export async function getAppSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return null;
  }

  const user = await fetchMe(accessToken);

  if (!user) {
    return null;
  }

  const workspaces = await fetchWorkspaces(accessToken);
  const selectedWorkspaceId =
    cookieStore.get(CURRENT_WORKSPACE_COOKIE_NAME)?.value ?? null;

  const currentWorkspace =
    workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ??
    workspaces[0] ??
    null;

  return {
    accessToken,
    user,
    workspaces,
    currentWorkspace,
  };
}
