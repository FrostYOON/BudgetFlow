import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { createFinancialAccount, type FinancialAccountType } from "@/lib/accounts";

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
  const name = normalizeValue(formData.get("name"));
  const type = normalizeValue(formData.get("type")) as FinancialAccountType;
  const currency = normalizeValue(formData.get("currency")).toUpperCase();

  if (!workspaceId || !name || !type || !currency) {
    return NextResponse.redirect(new URL("/app/settings/accounts?error=account_save_failed", request.url));
  }

  try {
    await createFinancialAccount({
      accessToken,
      workspaceId,
      name,
      type,
      currency,
      institutionName: normalizeValue(formData.get("institutionName")) || undefined,
      lastFour: normalizeValue(formData.get("lastFour")) || undefined,
    });

    return NextResponse.redirect(new URL("/app/settings/accounts?toast=account_saved", request.url));
  } catch {
    return NextResponse.redirect(new URL("/app/settings/accounts?error=account_save_failed", request.url));
  }
}
