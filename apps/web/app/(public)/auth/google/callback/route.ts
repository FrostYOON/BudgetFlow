import { NextRequest, NextResponse } from "next/server";
import { signInWithGoogleCodeApi } from "@/lib/auth/api";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import {
  clearCookie,
  setAccessCookie,
  setCurrentWorkspaceCookie,
  setRefreshCookie,
} from "@/lib/auth/response-cookies";

const GOOGLE_AUTH_STATE_COOKIE = "budgetflow_google_auth_state";
const GOOGLE_AUTH_REDIRECT_COOKIE = "budgetflow_google_auth_redirect";
const POST_REDIRECT_STATUS = 303;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim() || "";
  const state = request.nextUrl.searchParams.get("state")?.trim() || "";
  const storedState =
    request.cookies.get(GOOGLE_AUTH_STATE_COOKIE)?.value?.trim() || "";
  const redirectTo =
    request.cookies.get(GOOGLE_AUTH_REDIRECT_COOKIE)?.value || "/app/dashboard";

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("next", redirectTo);

  if (!code || !state || !storedState || state !== storedState) {
    signInUrl.searchParams.set("error", "social_auth_failed");

    const response = NextResponse.redirect(signInUrl, POST_REDIRECT_STATUS);
    clearCookie(response, GOOGLE_AUTH_STATE_COOKIE);
    clearCookie(response, GOOGLE_AUTH_REDIRECT_COOKIE);
    return response;
  }

  try {
    const callbackUrl = new URL("/auth/google/callback", request.url);
    const auth = await signInWithGoogleCodeApi({
      code,
      redirectUri: callbackUrl.toString(),
      refreshCookieName: "budgetflow_refresh_token",
    });
    const { redirectUrl, selectedWorkspace } = await resolvePostAuthRedirect({
      accessToken: auth.accessToken,
      redirectTo,
      requestUrl: request.url,
      defaultToast: "signed_in",
    });
    const response = NextResponse.redirect(redirectUrl, POST_REDIRECT_STATUS);

    setAccessCookie(response, auth.accessToken);

    if (auth.refreshToken) {
      setRefreshCookie(response, auth.refreshToken);
    }

    if (selectedWorkspace) {
      setCurrentWorkspaceCookie(response, selectedWorkspace.id);
    }

    clearCookie(response, GOOGLE_AUTH_STATE_COOKIE);
    clearCookie(response, GOOGLE_AUTH_REDIRECT_COOKIE);

    return response;
  } catch {
    signInUrl.searchParams.set("error", "social_auth_failed");
    const response = NextResponse.redirect(signInUrl, POST_REDIRECT_STATUS);

    clearCookie(response, GOOGLE_AUTH_STATE_COOKIE);
    clearCookie(response, GOOGLE_AUTH_REDIRECT_COOKIE);

    return response;
  }
}
