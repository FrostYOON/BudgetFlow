import { NextRequest, NextResponse } from "next/server";
import { createWorkspaceTransaction, fetchWorkspaceCategories } from "@/lib/transactions";
import { fetchWorkspaceMembers } from "@/lib/settings";
import { AUTH_ACCESS_COOKIE_NAME } from "@/lib/auth/constants";
import { fetchFinancialAccounts } from "@/lib/accounts";

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

function parseCsvRow(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvRow(lines[0]).map((value) => value.toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = parseCsvRow(line);
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = cells[index] ?? "";
      return acc;
    }, {});
  });
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(AUTH_ACCESS_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL("/sign-in?error=session_expired", request.url));
  }

  const formData = await request.formData();
  const workspaceId = normalizeValue(formData.get("workspaceId"));
  const returnTo = getReturnTo(formData.get("returnTo"));
  const file = formData.get("file");
  const csvText = normalizeValue(formData.get("csvText"));
  const rawText =
    file instanceof File && file.size > 0 ? await file.text() : csvText;

  if (!workspaceId || !rawText) {
    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, { error: "csv_import_failed" }),
    );
  }

  try {
    const [categories, members, accounts] = await Promise.all([
      fetchWorkspaceCategories({ accessToken, workspaceId }),
      fetchWorkspaceMembers({ accessToken, workspaceId }),
      fetchFinancialAccounts({ accessToken, workspaceId }),
    ]);

    const categoryMap = new Map(
      categories.map((item) => [item.name.toLowerCase(), item]),
    );
    const memberMap = new Map(
      members.map((item) => [item.name.toLowerCase(), item]),
    );
    const accountMap = new Map(
      accounts.map((item) => [item.name.toLowerCase(), item]),
    );

    const rows = parseCsv(rawText);
    let importedCount = 0;

    for (const row of rows) {
      const type = (row.type || "EXPENSE").toUpperCase() as "INCOME" | "EXPENSE";
      const visibility = (row.visibility || "PERSONAL").toUpperCase() as
        | "SHARED"
        | "PERSONAL";
      const category = categoryMap.get((row.category || "").toLowerCase());
      const payer = memberMap.get((row.paidby || "").toLowerCase());
      const account = accountMap.get((row.account || "").toLowerCase());

      if (!row.date || !row.amount || !row.currency) {
        continue;
      }

      await createWorkspaceTransaction({
        accessToken,
        workspaceId,
        type,
        visibility,
        amount: row.amount,
        currency: row.currency.toUpperCase(),
        transactionDate: row.date,
        categoryId: category?.id,
        memo: row.memo || undefined,
        paidByUserId: payer?.userId,
        accountId: account?.id,
      });

      importedCount += 1;
    }

    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, {
        toast: importedCount > 0 ? "transactions_imported" : "csv_import_empty",
      }),
    );
  } catch {
    return NextResponse.redirect(
      buildReturnUrl(request, returnTo, { error: "csv_import_failed" }),
    );
  }
}
