import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_ACCESS_COOKIE_NAME,
  CURRENT_WORKSPACE_COOKIE_NAME,
} from "@/lib/auth/constants";
import {
  createWorkspace,
  type WorkspaceType,
} from "@/lib/workspaces";

const VALID_WORKSPACE_TYPES = new Set<WorkspaceType>([
  "COUPLE",
  "FAMILY",
  "ROOMMATE",
]);

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
  const name = normalizeValue(formData.get("name"));
  const type = normalizeValue(formData.get("type")) as WorkspaceType;
  const baseCurrency = normalizeValue(formData.get("baseCurrency"));
  const timezone = normalizeValue(formData.get("timezone"));

  if (
    !name ||
    !VALID_WORKSPACE_TYPES.has(type) ||
    !baseCurrency ||
    !timezone
  ) {
    return NextResponse.redirect(
      new URL("/app/onboarding?error=workspace_create_failed", request.url),
    );
  }

  try {
    const workspace = await createWorkspace({
      accessToken,
      name,
      type,
      baseCurrency,
      timezone,
    });

    const response = NextResponse.redirect(
      new URL("/app/dashboard?toast=workspace_created", request.url),
    );

    response.cookies.set(CURRENT_WORKSPACE_COOKIE_NAME, workspace.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/app/onboarding?error=workspace_create_failed", request.url),
    );
  }
}
