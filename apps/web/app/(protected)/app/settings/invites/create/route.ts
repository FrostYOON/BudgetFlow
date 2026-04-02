import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { createWorkspaceInvite } from "@/lib/settings";

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
  const email = normalizeValue(formData.get("email"));
  const role = normalizeValue(formData.get("role")) as "MEMBER" | "OWNER";

  if (!workspaceId || !email || (role !== "MEMBER" && role !== "OWNER")) {
    return NextResponse.redirect(
      new URL("/app/settings?error=invite_create_failed", request.url),
    );
  }

  try {
    await createWorkspaceInvite({
      accessToken,
      workspaceId,
      email,
      role,
    });

    return NextResponse.redirect(
      new URL("/app/settings?toast=invite_created", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings?error=invite_create_failed", request.url),
    );
  }
}
