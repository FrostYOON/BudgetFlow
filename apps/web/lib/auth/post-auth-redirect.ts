import "server-only";

import { fetchWorkspaces } from "@/lib/auth/api";
import type { WorkspaceSummary } from "@/lib/auth/types";
import { acceptWorkspaceInvite } from "@/lib/settings";

interface PostAuthRedirectInput {
  accessToken: string;
  redirectTo: string;
  requestUrl: string;
  defaultToast: string;
  preferredWorkspaceId?: string | null;
}

interface PostAuthRedirectResult {
  redirectUrl: URL;
  selectedWorkspace: WorkspaceSummary | null;
}

function parseInviteToken(redirectTo: string, requestUrl: string) {
  try {
    const redirectUrl = new URL(redirectTo, requestUrl);

    if (redirectUrl.pathname !== "/auth/accept-invite") {
      return null;
    }

    return redirectUrl.searchParams.get("token")?.trim() || null;
  } catch {
    return null;
  }
}

function pickWorkspace(
  workspaces: WorkspaceSummary[],
  preferredWorkspaceId?: string | null,
) {
  return (
    (preferredWorkspaceId
      ? workspaces.find((workspace) => workspace.id === preferredWorkspaceId)
      : null) ??
    workspaces[0] ??
    null
  );
}

function buildDefaultRedirectUrl(input: {
  redirectTo: string;
  requestUrl: string;
  defaultToast: string;
  workspaces: WorkspaceSummary[];
}) {
  const destination =
    input.redirectTo !== "/app/dashboard"
      ? input.redirectTo
      : input.workspaces[0]
        ? "/app/dashboard"
        : "/app/onboarding";
  const redirectUrl = new URL(destination, input.requestUrl);

  redirectUrl.searchParams.set("toast", input.defaultToast);

  return redirectUrl;
}

function buildInviteResult(input: {
  requestUrl: string;
  workspaces: WorkspaceSummary[];
  preferredWorkspaceId?: string | null;
}) {
  const selectedWorkspace = pickWorkspace(
    input.workspaces,
    input.preferredWorkspaceId,
  );
  const redirectPath = input.workspaces[0] ? "/app/dashboard" : "/app/onboarding";
  const redirectUrl = new URL(redirectPath, input.requestUrl);

  return {
    redirectUrl,
    selectedWorkspace,
  };
}

export async function resolvePostAuthRedirect(
  input: PostAuthRedirectInput,
): Promise<PostAuthRedirectResult> {
  const inviteToken = parseInviteToken(input.redirectTo, input.requestUrl);

  if (inviteToken) {
    try {
      const acceptedInvite = await acceptWorkspaceInvite({
        accessToken: input.accessToken,
        token: inviteToken,
      });
      const workspaces = await fetchWorkspaces(input.accessToken);
      const selectedWorkspace =
        workspaces.find((workspace) => workspace.id === acceptedInvite.workspaceId) ??
        workspaces[0] ??
        null;
      const redirectUrl = new URL("/app/dashboard", input.requestUrl);

      redirectUrl.searchParams.set("toast", "invite_accepted");

      return {
        redirectUrl,
        selectedWorkspace,
      };
    } catch {
      const workspaces = await fetchWorkspaces(input.accessToken);
      const result = buildInviteResult({
        requestUrl: input.requestUrl,
        workspaces,
        preferredWorkspaceId: input.preferredWorkspaceId,
      });

      result.redirectUrl.searchParams.set("error", "invite_accept_failed");

      return result;
    }
  }

  const workspaces = await fetchWorkspaces(input.accessToken);

  return {
    redirectUrl: buildDefaultRedirectUrl({
      redirectTo: input.redirectTo,
      requestUrl: input.requestUrl,
      defaultToast: input.defaultToast,
      workspaces,
    }),
    selectedWorkspace: pickWorkspace(workspaces, input.preferredWorkspaceId),
  };
}
