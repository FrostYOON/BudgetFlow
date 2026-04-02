import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { rerunRecurringExecution } from "@/lib/recurring";

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
  const executionDate = normalizeValue(formData.get("executionDate"));
  const dryRun = normalizeValue(formData.get("dryRun")) === "true";

  if (!workspaceId || !executionDate) {
    return NextResponse.redirect(
      new URL("/app/recurring?error=recurring_rerun_failed", request.url),
    );
  }

  try {
    await rerunRecurringExecution({
      accessToken,
      workspaceId,
      executionDate,
      dryRun,
    });

    return NextResponse.redirect(
      new URL(
        `/app/recurring?toast=${dryRun ? "recurring_dry_run_complete" : "recurring_rerun_complete"}`,
        request.url,
      ),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/recurring?error=recurring_rerun_failed", request.url),
    );
  }
}
