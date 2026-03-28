import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { updateCurrentWorkspaceMember } from "@/lib/settings";

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
  const workspaceId = String(formData.get("workspaceId") ?? "").trim();

  if (!workspaceId) {
    return NextResponse.redirect(
      new URL("/app/settings?error=workspace_missing", request.url),
    );
  }

  try {
    await updateCurrentWorkspaceMember({
      accessToken,
      workspaceId,
      nickname: normalizeOptionalValue(formData.get("nickname")),
    });

    return NextResponse.redirect(
      new URL("/app/settings?toast=member_saved", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings?error=member_save_failed", request.url),
    );
  }
}
