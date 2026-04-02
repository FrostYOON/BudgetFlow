import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { deleteWorkspaceTransaction } from "@/lib/transactions";

function normalizeValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function getReturnTo(value: FormDataEntryValue | null) {
  const normalized = normalizeValue(value);
  return normalized.startsWith("/app/transactions")
    ? normalized
    : "/app/transactions";
}

function buildReturnUrl(
  request: NextRequest,
  returnTo: string,
  entries: Record<string, string>,
) {
  const url = new URL(returnTo, request.url);

  for (const [key, value] of Object.entries(entries)) {
    url.searchParams.set(key, value);
  }

  return url;
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.redirect(
      new URL("/sign-in?error=session_expired", request.url),
    );
  }

  const formData = await request.formData();
  const workspaceId = normalizeValue(formData.get("workspaceId"));
  const transactionId = normalizeValue(formData.get("transactionId"));
  const returnTo = getReturnTo(formData.get("returnTo"));

  if (!workspaceId || !transactionId) {
    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, { error: "transaction_delete_failed" }),
    );
  }

  try {
    await deleteWorkspaceTransaction({
      accessToken,
      workspaceId,
      transactionId,
    });

    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, {
        toast: "transaction_deleted",
        deleted: transactionId,
      }),
    );
  } catch {
    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, { error: "transaction_delete_failed" }),
    );
  }
}
