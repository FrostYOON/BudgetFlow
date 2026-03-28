import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { getWorkspaceById } from "@/lib/auth/preview-session";

function buildRedirectResponse(
  request: NextRequest,
  workspaceId: string,
  redirectTo: string,
) {
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(AUTH_COOKIE_NAME, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/app/dashboard");

  if (!getWorkspaceById(workspaceId)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return buildRedirectResponse(request, workspaceId, redirectTo);
}

export function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? "";
  const redirectTo =
    request.nextUrl.searchParams.get("redirectTo") ?? "/app/dashboard";

  if (!getWorkspaceById(workspaceId)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return buildRedirectResponse(request, workspaceId, redirectTo);
}
