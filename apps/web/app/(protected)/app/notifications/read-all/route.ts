import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { markAllNotificationsRead } from "@/lib/notifications";

function normalizeValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/sign-in?error=session_expired", request.url));
  }

  const formData = await request.formData();
  const workspaceId = normalizeValue(formData.get("workspaceId")) || undefined;

  try {
    await markAllNotificationsRead({
      accessToken,
      workspaceId,
    });

    return NextResponse.redirect(new URL("/app/notifications?toast=notifications_read", request.url));
  } catch {
    return NextResponse.redirect(new URL("/app/notifications?error=notification_read_failed", request.url));
  }
}
