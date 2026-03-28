import { NextRequest, NextResponse } from "next/server";
import { CURRENT_WORKSPACE_COOKIE_NAME } from "@/lib/auth/constants";

export function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  const redirectTo =
    request.nextUrl.searchParams.get("redirectTo") ?? "/app/dashboard";

  if (!workspaceId) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set(CURRENT_WORKSPACE_COOKIE_NAME, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
