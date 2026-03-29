import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { deactivateRecurringTransaction } from "@/lib/recurring";

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
  const recurringTransactionId = normalizeValue(
    formData.get("recurringTransactionId"),
  );

  if (!workspaceId || !recurringTransactionId) {
    return NextResponse.redirect(
      new URL("/app/recurring?error=recurring_deactivate_failed", request.url),
    );
  }

  try {
    await deactivateRecurringTransaction({
      accessToken,
      workspaceId,
      recurringTransactionId,
    });

    return NextResponse.redirect(
      new URL("/app/recurring?toast=recurring_deactivated", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/recurring?error=recurring_deactivate_failed", request.url),
    );
  }
}
