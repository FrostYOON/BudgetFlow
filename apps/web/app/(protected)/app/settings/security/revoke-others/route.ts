import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { revokeOtherAuthSessions } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.redirect(
      new URL("/sign-in?error=session_expired", request.url),
    );
  }

  try {
    await revokeOtherAuthSessions({
      accessToken,
    });

    return NextResponse.redirect(
      new URL("/app/settings?toast=other_sessions_revoked", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings?error=session_revoke_failed", request.url),
    );
  }
}
