import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { changePassword } from "@/lib/settings";

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

  try {
    await changePassword({
      accessToken,
      currentPassword: normalizeValue(formData.get("currentPassword")),
      nextPassword: normalizeValue(formData.get("nextPassword")),
    });

    return NextResponse.redirect(
      new URL("/app/settings?toast=password_changed", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings?error=password_change_failed", request.url),
    );
  }
}
