import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import {
  PREVIEW_WORKSPACES,
  type PreviewWorkspace,
} from "@/lib/preview-workspaces";

export interface PreviewSession {
  userName: string;
  email: string;
  workspace: PreviewWorkspace;
}

export function getWorkspaceById(workspaceId: string) {
  return PREVIEW_WORKSPACES.find((workspace) => workspace.id === workspaceId);
}

export async function getPreviewSession(): Promise<PreviewSession> {
  const cookieStore = await cookies();
  const workspaceId =
    cookieStore.get(AUTH_COOKIE_NAME)?.value ?? PREVIEW_WORKSPACES[0].id;
  const workspace = getWorkspaceById(workspaceId) ?? PREVIEW_WORKSPACES[0];

  return {
    userName: "Preview Owner",
    email: "preview@budgetflow.app",
    workspace,
  };
}
