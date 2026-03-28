import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { createWorkspaceTransaction } from "@/lib/transactions";

function normalizeValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function normalizeOptionalValue(value: FormDataEntryValue | null) {
  const normalized = normalizeValue(value);
  return normalized.length > 0 ? normalized : undefined;
}

function getReturnTo(value: FormDataEntryValue | null) {
  const normalized = normalizeValue(value);
  return normalized.startsWith("/app/transactions")
    ? normalized
    : "/app/transactions";
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
  const returnTo = getReturnTo(formData.get("returnTo"));
  const type = normalizeValue(formData.get("type")) as "INCOME" | "EXPENSE";
  const visibility = normalizeValue(formData.get("visibility")) as
    | "SHARED"
    | "PERSONAL";
  const amount = normalizeValue(formData.get("amount"));
  const currency = normalizeValue(formData.get("currency"));
  const transactionDate = normalizeValue(formData.get("transactionDate"));

  if (
    !workspaceId ||
    !type ||
    !visibility ||
    !amount ||
    !currency ||
    !transactionDate
  ) {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=transaction_save_failed`, request.url),
    );
  }

  try {
    await createWorkspaceTransaction({
      accessToken,
      workspaceId,
      type,
      visibility,
      amount,
      currency,
      transactionDate,
      categoryId: normalizeOptionalValue(formData.get("categoryId")),
      memo: normalizeOptionalValue(formData.get("memo")),
      paidByUserId: normalizeOptionalValue(formData.get("paidByUserId")),
    });

    return NextResponse.redirect(
      new URL(`${returnTo}?toast=transaction_created`, request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=transaction_save_failed`, request.url),
    );
  }
}
