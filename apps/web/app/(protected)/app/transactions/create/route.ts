import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { createWorkspaceTransaction } from "@/lib/transactions";

function normalizeValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function normalizeOptionalValue(value: FormDataEntryValue | null) {
  const normalized = normalizeValue(value);
  return normalized.length > 0 ? normalized : undefined;
}

function parseSplitParticipants(value: FormDataEntryValue | null) {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(normalized) as {
      userId: string;
      shareType: "EQUAL" | "FIXED" | "PERCENTAGE";
      shareValue?: string;
    }[];

    return parsed.filter((participant) => participant.userId);
  } catch {
    return undefined;
  }
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
  const returnTo = getReturnTo(formData.get("returnTo"));
  const type = normalizeValue(formData.get("type")) as "INCOME" | "EXPENSE";
  const visibility = normalizeValue(formData.get("visibility")) as
    | "SHARED"
    | "PERSONAL";
  const amount = normalizeValue(formData.get("amount"));
  const currency = normalizeValue(formData.get("currency"));
  const transactionDate = normalizeValue(formData.get("transactionDate"));

  if (
    !workspaceId ||
    !type ||
    !visibility ||
    !amount ||
    !currency ||
    !transactionDate
  ) {
    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, { error: "transaction_save_failed" }),
    );
  }

  try {
    await createWorkspaceTransaction({
      accessToken,
      workspaceId,
      type,
      visibility,
      amount,
      currency,
      transactionDate,
      categoryId: normalizeOptionalValue(formData.get("categoryId")),
      memo: normalizeOptionalValue(formData.get("memo")),
      paidByUserId: normalizeOptionalValue(formData.get("paidByUserId")),
      accountId: normalizeOptionalValue(formData.get("accountId")),
      participants: parseSplitParticipants(formData.get("splitParticipants")),
    });

    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, { toast: "transaction_created" }),
    );
  } catch {
    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, { error: "transaction_save_failed" }),
    );
  }
}
