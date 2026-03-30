import { NextRequest, NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { updateWorkspaceTransaction } from "@/lib/transactions";

function normalizeValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function normalizeNullableValue(value: FormDataEntryValue | null) {
  const normalized = normalizeValue(value);
  return normalized.length > 0 ? normalized : null;
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
  const transactionId = normalizeValue(formData.get("transactionId"));
  const returnTo = getReturnTo(formData.get("returnTo"));
  const visibility = normalizeValue(formData.get("visibility")) as
    | "SHARED"
    | "PERSONAL";
  const amount = normalizeValue(formData.get("amount"));
  const currency = normalizeValue(formData.get("currency"));
  const transactionDate = normalizeValue(formData.get("transactionDate"));

  if (
    !workspaceId ||
    !transactionId ||
    !visibility ||
    !amount ||
    !currency ||
    !transactionDate
  ) {
    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, { error: "transaction_update_failed" }),
    );
  }

  try {
    await updateWorkspaceTransaction({
      accessToken,
      workspaceId,
      transactionId,
      visibility,
      amount,
      currency,
      transactionDate,
      categoryId: normalizeNullableValue(formData.get("categoryId")),
      memo: normalizeNullableValue(formData.get("memo")),
      paidByUserId: normalizeOptionalValue(formData.get("paidByUserId")),
      accountId: normalizeNullableValue(formData.get("accountId")),
      participants: parseSplitParticipants(formData.get("splitParticipants")),
    });

    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, { toast: "transaction_updated" }),
    );
  } catch {
    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, { error: "transaction_update_failed" }),
    );
  }
}
