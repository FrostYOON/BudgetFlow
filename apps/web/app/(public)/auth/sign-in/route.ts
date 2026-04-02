import { NextRequest, NextResponse } from "next/server";
import { signInWithApi } from "@/lib/auth/api";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import {
  CURRENT_WORKSPACE_COOKIE_NAME,
} from "@/lib/auth/constants";
import {
  setAccessCookie,
  setCurrentWorkspaceCookie,
  setRefreshCookie,
} from "@/lib/auth/response-cookies";

const POST_REDIRECT_STATUS = 303;

function buildSignInUrl(
  requestUrl: string,
  input: {
    email: string;
    error: string;
    redirectTo: string;
  },
) {
  const url = new URL("/sign-in", requestUrl);
  url.searchParams.set("next", input.redirectTo);
  url.searchParams.set("error", input.error);

  if (input.email) {
    url.searchParams.set("email", input.email);
  }

  return url;
}

export async function POST(request: NextRequest) {
  const existingWorkspaceId =
    request.cookies.get(CURRENT_WORKSPACE_COOKIE_NAME)?.value ?? null;
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/app/dashboard");

  if (!email && !password) {
    return NextResponse.redirect(
      buildSignInUrl(request.url, {
        email,
        error: "sign_in_missing_email_and_password",
        redirectTo,
      }),
      POST_REDIRECT_STATUS,
    );
  }

  if (!email) {
    return NextResponse.redirect(
      buildSignInUrl(request.url, {
        email,
        error: "sign_in_missing_email",
        redirectTo,
      }),
      POST_REDIRECT_STATUS,
    );
  }

  if (!password) {
    return NextResponse.redirect(
      buildSignInUrl(request.url, {
        email,
        error: "sign_in_missing_password",
        redirectTo,
      }),
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
      setCurrentWorkspaceCookie(response, selectedWorkspace.id);
    }

    return response;
  } catch {
    return NextResponse.redirect(
      buildSignInUrl(request.url, {
        email,
        error: "invalid_credentials",
        redirectTo,
      }),
      POST_REDIRECT_STATUS,
    );
  }
}
