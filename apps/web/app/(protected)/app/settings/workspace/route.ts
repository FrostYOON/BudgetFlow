import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { updateWorkspaceSettings } from "@/lib/settings";

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
  const name = normalizeValue(formData.get("name"));
  const type = normalizeValue(formData.get("type"));
  const baseCurrency = normalizeValue(formData.get("baseCurrency"));
  const timezone = normalizeValue(formData.get("timezone"));

  if (!workspaceId || !name || !type || !baseCurrency || !timezone) {
    return NextResponse.redirect(
      new URL("/app/settings?error=workspace_settings_failed", request.url),
    );
  }

  try {
    await updateWorkspaceSettings({
      accessToken,
      workspaceId,
      name,
      type,
      baseCurrency,
      timezone,
    });

    return NextResponse.redirect(
      new URL("/app/settings?toast=workspace_settings_saved", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings?error=workspace_settings_failed", request.url),
    );
  }
}
