import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { removeWorkspaceMember } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.redirect(
      new URL("/sign-in?error=session_expired", request.url),
    );
  }

  const formData = await request.formData();
  const workspaceId = String(formData.get("workspaceId") ?? "").trim();
  const memberUserId = String(formData.get("memberUserId") ?? "").trim();

  if (!workspaceId || !memberUserId) {
    return NextResponse.redirect(
      new URL("/app/settings?error=workspace_missing", request.url),
    );
  }

  try {
    await removeWorkspaceMember({
      accessToken,
      workspaceId,
      memberUserId,
    });

    return NextResponse.redirect(
      new URL("/app/settings?toast=member_removed", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings?error=member_remove_failed", request.url),
    );
  }
}
