import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { markNotificationRead } from "@/lib/notifications";

function normalizeValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/sign-in?error=session_expired", request.url));
  }

  const formData = await request.formData();
  const notificationKey = normalizeValue(formData.get("notificationKey"));

  if (!notificationKey) {
    return NextResponse.redirect(new URL("/app/notifications?error=notification_read_failed", request.url));
  }

  try {
    await markNotificationRead({
      accessToken,
      notificationKey,
    });

    return NextResponse.redirect(new URL("/app/notifications?toast=notification_read", request.url));
  } catch {
    return NextResponse.redirect(new URL("/app/notifications?error=notification_read_failed", request.url));
  }
}
