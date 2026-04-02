import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { recordSettlementTransfer } from "@/lib/settlements";

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
  const year = Number(formData.get("year") ?? 0);
  const month = Number(formData.get("month") ?? 0);
  const fromUserId = normalizeValue(formData.get("fromUserId"));
  const toUserId = normalizeValue(formData.get("toUserId"));
  const amount = normalizeValue(formData.get("amount"));

  if (!workspaceId || !year || !month || !fromUserId || !toUserId || !amount) {
    return NextResponse.redirect(new URL(`/app/settlements?year=${year}&month=${month}&error=settlement_record_failed`, request.url));
  }

  try {
    await recordSettlementTransfer({
      accessToken,
      workspaceId,
      year,
      month,
      fromUserId,
      toUserId,
      amount,
    });

    return NextResponse.redirect(new URL(`/app/settlements?year=${year}&month=${month}&toast=settlement_recorded`, request.url));
  } catch {
    return NextResponse.redirect(new URL(`/app/settlements?year=${year}&month=${month}&error=settlement_record_failed`, request.url));
  }
}
