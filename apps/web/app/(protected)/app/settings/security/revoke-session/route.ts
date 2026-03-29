import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { revokeAuthSession } from "@/lib/settings";

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
  const sessionId = normalizeValue(formData.get("sessionId"));

  if (!sessionId) {
    return NextResponse.redirect(
      new URL("/app/settings?error=session_revoke_failed", request.url),
    );
  }

  try {
    await revokeAuthSession({
      accessToken,
      sessionId,
    });

    return NextResponse.redirect(
      new URL("/app/settings?toast=session_revoked", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings?error=session_revoke_failed", request.url),
    );
  }
}
