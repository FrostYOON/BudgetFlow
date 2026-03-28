import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/src/features/auth/constants";

export async function POST(request: NextRequest) {
  const redirectTo = String(
    (await request.formData()).get("redirectTo") ?? "/sign-in",
  );
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
