import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { archiveFinancialAccount } from "@/lib/accounts";

function normalizeValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/sign-in?error=session_expired", request.url));
  }

  const formData = await request.formData();
  const workspaceId = normalizeValue(formData.get("workspaceId"));
  const accountId = normalizeValue(formData.get("accountId"));

  if (!workspaceId || !accountId) {
    return NextResponse.redirect(new URL("/app/settings/accounts?error=account_archive_failed", request.url));
  }

  try {
    await archiveFinancialAccount({
      accessToken,
      workspaceId,
      accountId,
    });

    return NextResponse.redirect(new URL("/app/settings/accounts?toast=account_archived", request.url));
  } catch {
    return NextResponse.redirect(new URL("/app/settings/accounts?error=account_archive_failed", request.url));
  }
}
