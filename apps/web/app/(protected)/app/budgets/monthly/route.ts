import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { upsertMonthlyBudget } from "@/lib/budgets";

function normalizeAmount(value: FormDataEntryValue | null) {
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
  const year = Number(formData.get("year") ?? 0);
  const month = Number(formData.get("month") ?? 0);
  const totalBudgetAmount = normalizeAmount(formData.get("totalBudgetAmount"));

  if (!workspaceId || !year || !month || !totalBudgetAmount) {
    return NextResponse.redirect(
      new URL(
        `/app/budgets?year=${year || ""}&month=${month || ""}&error=budget_save_failed`,
        request.url,
      ),
    );
  }

  try {
    await upsertMonthlyBudget({
      accessToken,
      workspaceId,
      year,
      month,
      totalBudgetAmount,
    });

    return NextResponse.redirect(
      new URL(
        `/app/budgets?year=${year}&month=${month}&toast=budget_saved`,
        request.url,
      ),
    );
  } catch {
    return NextResponse.redirect(
      new URL(
        `/app/budgets?year=${year}&month=${month}&error=budget_save_failed`,
        request.url,
      ),
    );
  }
}
