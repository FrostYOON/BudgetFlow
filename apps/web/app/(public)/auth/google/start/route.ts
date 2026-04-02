import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_AUTH_STATE_COOKIE = "budgetflow_google_auth_state";
const GOOGLE_AUTH_REDIRECT_COOKIE = "budgetflow_google_auth_redirect";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectTo =
    request.nextUrl.searchParams.get("redirectTo")?.trim() || "/app/dashboard";

  if (!clientId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("error", "social_auth_unavailable");
    signInUrl.searchParams.set("next", redirectTo);

    return NextResponse.redirect(signInUrl);
  }

  const callbackUrl = new URL("/auth/google/callback", request.url);
  const state = randomUUID();
  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", callbackUrl.toString());
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid profile email");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(googleUrl);

  response.cookies.set(GOOGLE_AUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  response.cookies.set(GOOGLE_AUTH_REDIRECT_COOKIE, redirectTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
