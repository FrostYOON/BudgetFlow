import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import {
  fetchWorkspaceCategoriesForSettings,
  updateWorkspaceCategory,
} from "@/lib/categories";

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
  const direction = normalizeValue(formData.get("direction"));

  if (!workspaceId || !categoryId || !["up", "down"].includes(direction)) {
    return NextResponse.redirect(
      new URL("/app/settings/categories?error=category_reorder_failed", request.url),
    );
  }

  try {
    const categories = await fetchWorkspaceCategoriesForSettings({
      accessToken,
      workspaceId,
      includeArchived: true,
    });

    const currentCategory = categories.find((item) => item.id === categoryId);

    if (!currentCategory) {
      return NextResponse.redirect(
        new URL("/app/settings/categories?error=category_reorder_failed", request.url),
      );
    }

    const siblings = categories
      .filter(
        (item) =>
          item.type === currentCategory.type &&
          item.isArchived === currentCategory.isArchived,
      )
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

    const currentIndex = siblings.findIndex((item) => item.id === categoryId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= siblings.length) {
      return NextResponse.redirect(
        new URL("/app/settings/categories?toast=category_reordered", request.url),
      );
    }

    const targetCategory = siblings[targetIndex];

    await updateWorkspaceCategory({
      accessToken,
      workspaceId,
      categoryId: currentCategory.id,
      name: currentCategory.name,
      type: currentCategory.type,
      color: currentCategory.color ?? undefined,
      icon: currentCategory.icon ?? undefined,
      sortOrder: targetCategory.sortOrder,
    });

    await updateWorkspaceCategory({
      accessToken,
      workspaceId,
      categoryId: targetCategory.id,
      name: targetCategory.name,
      type: targetCategory.type,
      color: targetCategory.color ?? undefined,
      icon: targetCategory.icon ?? undefined,
      sortOrder: currentCategory.sortOrder,
    });

    return NextResponse.redirect(
      new URL("/app/settings/categories?toast=category_reordered", request.url),
    );
  } catch {
    return NextResponse.redirect(
      new URL("/app/settings/categories?error=category_reorder_failed", request.url),
    );
  }
}
