import { NextRequest, NextResponse } from "next/server";
import { signOutFromApi } from "@/lib/auth/api";
import {
  AUTH_ACCESS_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  CURRENT_WORKSPACE_COOKIE_NAME,
} from "@/lib/auth/constants";

export async function POST(request: NextRequest) {
  const redirectTo = String(
    (await request.formData()).get("redirectTo") ?? "/sign-in",
  );
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)?.value;

  if (accessToken) {
    await signOutFromApi(accessToken);
  }

  const redirectUrl = new URL(redirectTo, request.url);
  redirectUrl.searchParams.set("toast", "signed_out");
  const response = NextResponse.redirect(redirectUrl);

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
  response.cookies.set(CURRENT_WORKSPACE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
