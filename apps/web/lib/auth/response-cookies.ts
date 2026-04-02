import "server-only";

import type { NextResponse } from "next/server";
import { decodeJwtExp } from "@/lib/auth/api";
import {
  AUTH_ACCESS_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  CURRENT_WORKSPACE_COOKIE_NAME,
} from "@/lib/auth/constants";

export function setAccessCookie(response: NextResponse, accessToken: string) {
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

export function setRefreshCookie(response: NextResponse, refreshToken: string) {
  response.cookies.set(AUTH_REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function setCurrentWorkspaceCookie(
  response: NextResponse,
  workspaceId: string,
) {
  response.cookies.set(CURRENT_WORKSPACE_COOKIE_NAME, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearCookie(response: NextResponse, name: string) {
  response.cookies.set(name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
