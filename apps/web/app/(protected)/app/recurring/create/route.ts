import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { createRecurringTransaction, type RecurringRepeatUnit, type RecurringTransactionType, type RecurringVisibility } from "@/lib/recurring";

function normalizeValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function normalizeOptionalValue(value: FormDataEntryValue | null) {
  const normalized = normalizeValue(value);
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeOptionalInteger(value: FormDataEntryValue | null) {
  const normalized = normalizeValue(value);
  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isInteger(parsed) ? parsed : undefined;
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
  const type = normalizeValue(formData.get("type")) as RecurringTransactionType;
  const visibility = normalizeValue(formData.get("visibility")) as RecurringVisibility;
  const amount = normalizeValue(formData.get("amount"));
  const currency = normalizeValue(formData.get("currency"));
  const repeatUnit = normalizeValue(formData.get("repeatUnit")) as RecurringRepeatUnit;
  const repeatInterval = Number(formData.get("repeatInterval") ?? 1);
  const startDate = normalizeValue(formData.get("startDate"));

  if (
    !workspaceId ||
    !type ||
    !visibility ||
    !amount ||
    !currency ||
    !repeatUnit ||
    !Number.isInteger(repeatInterval) ||
    repeatInterval < 1 ||
    !startDate
  ) {
    return NextResponse.redirect(
      new URL("/app/recurring?error=recurring_save_failed", request.url),
    );
  }

  try {
    await createRecurringTransaction({
      accessToken,
      workspaceId,
      type,
      visibility,
      amount,
      currency,
      categoryId: normalizeOptionalValue(formData.get("categoryId")),
      memo: normalizeOptionalValue(formData.get("memo")),
      paidByUserId: normalizeOptionalValue(formData.get("paidByUserId")),
      repeatUnit,
      repeatInterval,
      dayOfMonth: normalizeOptionalInteger(formData.get("dayOfMonth")),
      dayOfWeek: normalizeOptionalInteger(formData.get("dayOfWeek")),
      startDate,
      endDate: normalizeOptionalValue(formData.get("endDate")),
    });

    return NextResponse.redirect(
      new URL("/app/recurring?toast=recurring_saved", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/recurring?error=recurring_save_failed", request.url),
    );
  }
}
