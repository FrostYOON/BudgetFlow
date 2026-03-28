import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { replaceCategoryBudgets } from "@/lib/budgets";

function normalizeAmount(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeThreshold(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    return undefined;
  }

  return parsed;
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
  const categoryIds = formData
    .getAll("categoryId")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!workspaceId || !year || !month) {
    return NextResponse.redirect(
      new URL(
        `/app/budgets?year=${year || ""}&month=${month || ""}&error=allocations_save_failed`,
        request.url,
      ),
    );
  }

  const categories = categoryIds.flatMap((categoryId) => {
    const plannedAmount = normalizeAmount(
      formData.get(`plannedAmount:${categoryId}`),
    );

    if (!plannedAmount) {
      return [];
    }

    const alertThresholdPct = normalizeThreshold(
      formData.get(`alertThresholdPct:${categoryId}`),
    );

    return [
      {
        categoryId,
        plannedAmount,
        ...(alertThresholdPct ? { alertThresholdPct } : {}),
      },
    ];
  });

  try {
    await replaceCategoryBudgets({
      accessToken,
      workspaceId,
      year,
      month,
      categories,
    });

    return NextResponse.redirect(
      new URL(
        `/app/budgets?year=${year}&month=${month}&toast=allocations_saved`,
        request.url,
      ),
    );
  } catch {
    return NextResponse.redirect(
      new URL(
        `/app/budgets?year=${year}&month=${month}&error=allocations_save_failed`,
        request.url,
      ),
    );
  }
}
