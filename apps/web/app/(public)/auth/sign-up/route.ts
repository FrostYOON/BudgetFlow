import { NextRequest, NextResponse } from "next/server";
import { signUpWithApi } from "@/lib/auth/api";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import {
  setAccessCookie,
  setCurrentWorkspaceCookie,
  setRefreshCookie,
} from "@/lib/auth/response-cookies";

const POST_REDIRECT_STATUS = 303;

function appendDraftFields(
  signUpUrl: URL,
  input: {
    email: string;
    name: string;
  },
) {
  if (input.name) {
    signUpUrl.searchParams.set("name", input.name);
  }

  if (input.email) {
    signUpUrl.searchParams.set("email", input.email);
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const locale = String(formData.get("locale") ?? "").trim() || undefined;
  const timezone = String(formData.get("timezone") ?? "").trim() || undefined;
  const redirectTo = String(formData.get("redirectTo") ?? "/app/dashboard");
  const signUpUrl = new URL("/sign-up", request.url);

  signUpUrl.searchParams.set("next", redirectTo);
  appendDraftFields(signUpUrl, { name, email });

  if (!name || !email || !password || !confirmPassword) {
    if (!name && !email && !password && !confirmPassword) {
      signUpUrl.searchParams.set("error", "sign_up_missing_all_fields");
    } else if (!name) {
      signUpUrl.searchParams.set("error", "sign_up_missing_name");
    } else if (!email) {
      signUpUrl.searchParams.set("error", "sign_up_missing_email");
    } else if (!password) {
      signUpUrl.searchParams.set("error", "sign_up_missing_password");
    } else {
      signUpUrl.searchParams.set("error", "sign_up_missing_password_confirmation");
    }
    return NextResponse.redirect(signUpUrl, POST_REDIRECT_STATUS);
  }

  if (name.length < 2) {
    signUpUrl.searchParams.set("error", "invalid_name");
    return NextResponse.redirect(signUpUrl, POST_REDIRECT_STATUS);
  }

  if (!email.includes("@")) {
    signUpUrl.searchParams.set("error", "invalid_email");
    return NextResponse.redirect(signUpUrl, POST_REDIRECT_STATUS);
  }

  if (password !== confirmPassword) {
    signUpUrl.searchParams.set("error", "password_confirm_mismatch");
    return NextResponse.redirect(signUpUrl, POST_REDIRECT_STATUS);
  }

  if (
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    if (password.length < 8) {
      signUpUrl.searchParams.set("error", "password_too_short");
    } else if (!/[A-Z]/.test(password)) {
      signUpUrl.searchParams.set("error", "password_missing_uppercase");
    } else if (!/[a-z]/.test(password)) {
      signUpUrl.searchParams.set("error", "password_missing_lowercase");
    } else if (!/\d/.test(password)) {
      signUpUrl.searchParams.set("error", "password_missing_number");
    } else {
      signUpUrl.searchParams.set("error", "password_missing_special");
    }
    return NextResponse.redirect(signUpUrl, POST_REDIRECT_STATUS);
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes("email is already in use")) {
      signUpUrl.searchParams.set("error", "email_in_use");
    } else if (normalizedMessage.includes("name is already in use")) {
      signUpUrl.searchParams.set("error", "name_in_use");
    } else if (normalizedMessage.includes("uppercase")) {
      signUpUrl.searchParams.set("error", "password_missing_uppercase");
    } else if (normalizedMessage.includes("lowercase")) {
      signUpUrl.searchParams.set("error", "password_missing_lowercase");
    } else if (normalizedMessage.includes("number")) {
      signUpUrl.searchParams.set("error", "password_missing_number");
    } else if (normalizedMessage.includes("special character")) {
      signUpUrl.searchParams.set("error", "password_missing_special");
    } else {
      signUpUrl.searchParams.set("error", "sign_up_failed");
    }

    return NextResponse.redirect(signUpUrl, POST_REDIRECT_STATUS);
  }
}
