import { NextRequest, NextResponse } from "next/server";
import { decodeJwtExp, refreshWithApi } from "@/lib/auth/api";
import {
  AUTH_ACCESS_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
} from "@/lib/auth/constants";

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(AUTH_ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(AUTH_REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

function setAccessCookie(response: NextResponse, accessToken: string) {
  const exp = decodeJwtExp(accessToken);
  const maxAge = exp ? Math.max(exp - Math.floor(Date.now() / 1000), 60) : 3600;

  response.cookies.set(AUTH_ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

function setRefreshCookie(response: NextResponse, refreshToken: string) {
  response.cookies.set(AUTH_REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get(AUTH_REFRESH_COOKIE_NAME)?.value;
  const redirectTo =
    request.nextUrl.searchParams.get("redirectTo") ?? "/app/dashboard";

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  try {
    const auth = await refreshWithApi({
      refreshToken,
      refreshCookieName: "budgetflow_refresh_token",
    });

    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    setAccessCookie(response, auth.accessToken);

    if (auth.refreshToken) {
      setRefreshCookie(response, auth.refreshToken);
    }

    return response;
  } catch {
    const response = NextResponse.redirect(
      new URL("/sign-in?error=session_expired", request.url),
    );
    clearAuthCookies(response);
    return response;
  }
}
