import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { updateCurrentUser } from "@/lib/settings";

function normalizeOptionalValue(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
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
    await updateCurrentUser({
      accessToken,
      name: String(formData.get("name") ?? "").trim(),
      locale: String(formData.get("locale") ?? "").trim(),
      timezone: String(formData.get("timezone") ?? "").trim(),
      profileImageUrl: normalizeOptionalValue(formData.get("profileImageUrl")),
    });

    return NextResponse.redirect(
      new URL("/app/settings?toast=settings_saved", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings?error=settings_save_failed", request.url),
    );
  }
}
