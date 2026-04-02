import { NextRequest, NextResponse } from "next/server";
import { signOutFromApi } from "@/lib/auth/api";
import {
  AUTH_ACCESS_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
} from "@/lib/auth/constants";
import { clearCookie } from "@/lib/auth/response-cookies";

const POST_REDIRECT_STATUS = 303;

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
  const response = NextResponse.redirect(redirectUrl, POST_REDIRECT_STATUS);

  clearCookie(response, AUTH_ACCESS_COOKIE_NAME);
  clearCookie(response, AUTH_REFRESH_COOKIE_NAME);
  return response;
}
