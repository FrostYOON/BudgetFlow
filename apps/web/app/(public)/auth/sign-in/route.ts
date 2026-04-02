import { NextRequest, NextResponse } from "next/server";
import { decodeJwtExp, signInWithApi } from "@/lib/auth/api";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import {
  AUTH_ACCESS_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  CURRENT_WORKSPACE_COOKIE_NAME,
} from "@/lib/auth/constants";

const POST_REDIRECT_STATUS = 303;

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

export async function POST(request: NextRequest) {
  const existingWorkspaceId =
    request.cookies.get(CURRENT_WORKSPACE_COOKIE_NAME)?.value ?? null;
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/app/dashboard");

  if (!email || !password) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=missing_fields&next=${encodeURIComponent(redirectTo)}`, request.url),
      POST_REDIRECT_STATUS,
    );
  }

  try {
    const auth = await signInWithApi({
      email,
      password,
      refreshCookieName: "budgetflow_refresh_token",
    });
    const { redirectUrl, selectedWorkspace } = await resolvePostAuthRedirect({
      accessToken: auth.accessToken,
      redirectTo,
      requestUrl: request.url,
      defaultToast: "signed_in",
      preferredWorkspaceId: existingWorkspaceId,
    });
    const response = NextResponse.redirect(redirectUrl, POST_REDIRECT_STATUS);

    setAccessCookie(response, auth.accessToken);

    if (auth.refreshToken) {
      setRefreshCookie(response, auth.refreshToken);
    }

    if (selectedWorkspace) {
      response.cookies.set(CURRENT_WORKSPACE_COOKIE_NAME, selectedWorkspace.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch {
    return NextResponse.redirect(
      new URL(`/sign-in?error=invalid_credentials&next=${encodeURIComponent(redirectTo)}`, request.url),
      POST_REDIRECT_STATUS,
    );
  }
}
