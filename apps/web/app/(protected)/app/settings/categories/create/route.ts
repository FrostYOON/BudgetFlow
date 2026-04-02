import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import {
  createWorkspaceCategory,
  type CategoryType,
} from "@/lib/categories";

function normalizeValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function normalizeOptionalValue(value: FormDataEntryValue | null) {
  const normalized = normalizeValue(value);
  return normalized.length > 0 ? normalized : undefined;
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
  const name = normalizeValue(formData.get("name"));
  const type = normalizeValue(formData.get("type")) as CategoryType;
  const color = normalizeOptionalValue(formData.get("color"));
  const icon = normalizeOptionalValue(formData.get("icon"));
  const sortOrder = Number(normalizeValue(formData.get("sortOrder")) || "0");

  if (!workspaceId || !name || (type !== "INCOME" && type !== "EXPENSE")) {
    return NextResponse.redirect(
      new URL("/app/settings/categories?error=category_create_failed", request.url),
    );
  }

  try {
    await createWorkspaceCategory({
      accessToken,
      workspaceId,
      name,
      type,
      color,
      icon,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    });

    return NextResponse.redirect(
      new URL("/app/settings/categories?toast=category_created", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings/categories?error=category_create_failed", request.url),
    );
  }
}
