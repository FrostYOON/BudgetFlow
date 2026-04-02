import { NextRequest, NextResponse } from "next/server";
import { signUpWithApi } from "@/lib/auth/api";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import {
  setAccessCookie,
  setCurrentWorkspaceCookie,
  setRefreshCookie,
} from "@/lib/auth/response-cookies";

const POST_REDIRECT_STATUS = 303;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "").trim() || undefined;
  const timezone = String(formData.get("timezone") ?? "").trim() || undefined;
  const redirectTo = String(formData.get("redirectTo") ?? "/app/dashboard");

  if (!name || !email || !password) {
    return NextResponse.redirect(
      new URL("/sign-up?error=missing_fields", request.url),
      POST_REDIRECT_STATUS,
    );
  }

  try {
    const auth = await signUpWithApi({
      name,
      email,
      password,
      locale,
      timezone,
      refreshCookieName: "budgetflow_refresh_token",
    });
    const { redirectUrl, selectedWorkspace } = await resolvePostAuthRedirect({
      accessToken: auth.accessToken,
      redirectTo,
      requestUrl: request.url,
      defaultToast: "account_created",
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
      new URL("/sign-up?error=sign_up_failed", request.url),
      POST_REDIRECT_STATUS,
    );
  }
}
