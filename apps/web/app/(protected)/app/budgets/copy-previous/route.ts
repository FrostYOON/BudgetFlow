import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { copyPreviousMonthBudget } from "@/lib/budgets";

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

  try {
    await copyPreviousMonthBudget({
      accessToken,
      workspaceId,
      year,
      month,
    });

    return NextResponse.redirect(new URL(`/app/budgets?year=${year}&month=${month}&toast=budget_copied`, request.url));
  } catch {
    return NextResponse.redirect(new URL(`/app/budgets?year=${year}&month=${month}&error=budget_copy_failed`, request.url));
  }
}
