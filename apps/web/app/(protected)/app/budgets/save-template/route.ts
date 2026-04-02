import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { saveBudgetTemplate } from "@/lib/budgets";

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
    await saveBudgetTemplate({
      accessToken,
      workspaceId,
      year,
      month,
    });

    return NextResponse.redirect(new URL(`/app/budgets?year=${year}&month=${month}&toast=budget_template_saved`, request.url));
  } catch {
    return NextResponse.redirect(new URL(`/app/budgets?year=${year}&month=${month}&error=budget_template_failed`, request.url));
  }
}
