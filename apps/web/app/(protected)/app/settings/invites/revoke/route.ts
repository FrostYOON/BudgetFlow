import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { revokeWorkspaceInvite } from "@/lib/settings";

function normalizeValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.redirect(
      new URL("/sign-in?error=session_expired", request.url),
    );
  }

  const formData = await request.formData();
  const workspaceId = normalizeValue(formData.get("workspaceId"));
  const inviteId = normalizeValue(formData.get("inviteId"));

  if (!workspaceId || !inviteId) {
    return NextResponse.redirect(
      new URL("/app/settings?error=invite_revoke_failed", request.url),
    );
  }

  try {
    await revokeWorkspaceInvite({
      accessToken,
      workspaceId,
      inviteId,
    });

    return NextResponse.redirect(
      new URL("/app/settings?toast=invite_revoked", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings?error=invite_revoke_failed", request.url),
    );
  }
}
