import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { archiveWorkspaceCategory } from "@/lib/categories";

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
  const categoryId = normalizeValue(formData.get("categoryId"));

  if (!workspaceId || !categoryId) {
    return NextResponse.redirect(
      new URL("/app/settings/categories?error=category_archive_failed", request.url),
    );
  }

  try {
    await archiveWorkspaceCategory({
      accessToken,
      workspaceId,
      categoryId,
    });

    return NextResponse.redirect(
      new URL("/app/settings/categories?toast=category_archived", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings/categories?error=category_archive_failed", request.url),
    );
  }
}
