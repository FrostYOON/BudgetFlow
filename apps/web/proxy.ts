import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_ACCESS_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
} from "@/lib/auth/constants";

const AUTH_PAGES = new Set(["/sign-in", "/sign-up"]);

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE_NAME)?.value;
  const hasAccessToken = Boolean(accessToken);
  const hasRefreshToken = Boolean(refreshToken);
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/app") && !hasAccessToken) {
    if (hasRefreshToken) {
      const refreshUrl = new URL("/auth/refresh", request.url);
      refreshUrl.searchParams.set("redirectTo", `${pathname}${search}`);

      return NextResponse.redirect(refreshUrl);
    }

    const redirectUrl = new URL("/sign-in", request.url);
    redirectUrl.searchParams.set("next", `${pathname}${search}`);

    return NextResponse.redirect(redirectUrl);
  }

  if (AUTH_PAGES.has(pathname) && hasAccessToken) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  if (AUTH_PAGES.has(pathname) && !hasAccessToken && hasRefreshToken) {
    const refreshUrl = new URL("/auth/refresh", request.url);
    refreshUrl.searchParams.set("redirectTo", "/app/dashboard");

    return NextResponse.redirect(refreshUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/sign-in", "/sign-up", "/auth/refresh"],
};
