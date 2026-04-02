import { NextRequest, NextResponse } from "next/server";
import { fetchWorkspaces } from "@/lib/auth/api";
import {
  AUTH_ACCESS_COOKIE_NAME,
  CURRENT_WORKSPACE_COOKIE_NAME,
} from "@/lib/auth/constants";
import { acceptWorkspaceInvite } from "@/lib/settings";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)?.value;
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.redirect(
      new URL("/sign-in?error=invite_accept_failed", request.url),
    );
  }

  if (!accessToken) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set(
      "next",
      `/auth/accept-invite?token=${encodeURIComponent(token)}`,
    );
    signInUrl.searchParams.set("error", "session_expired");

    return NextResponse.redirect(signInUrl);
  }

  try {
    const acceptedInvite = await acceptWorkspaceInvite({
      accessToken,
      token,
    });

    const workspaces = await fetchWorkspaces(accessToken);
    const workspace =
      workspaces.find((item) => item.id === acceptedInvite.workspaceId) ??
      workspaces[0] ??
      null;

    const response = NextResponse.redirect(
      new URL("/app/dashboard?toast=invite_accepted", request.url),
    );

    if (workspace) {
      response.cookies.set(CURRENT_WORKSPACE_COOKIE_NAME, workspace.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/sign-in?error=invite_accept_failed", request.url),
    );
  }
}
