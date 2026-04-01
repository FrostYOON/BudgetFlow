import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Reveal,
  StaggerItem,
  StaggerReveal,
} from "@/components/motion/reveal";
import { TransactionSplitFields } from "@/components/transactions/transaction-split-fields";
import { AppBadge } from "@/components/ui/app-badge";
import { AppButton, AppButtonLink } from "@/components/ui/app-button";
import { AppMetricSurface, AppSurface } from "@/components/ui/app-surface";
import { fetchFinancialAccounts, type FinancialAccount } from "@/lib/accounts";
import { getAppSession } from "@/lib/auth/session";
import { fetchWorkspaceMembers, type WorkspaceMemberSummary } from "@/lib/settings";
import {
  fetchWorkspaceCategories,
  fetchWorkspaceTransactions,
  formatCurrency,
  formatDateLabel,
  formatMonthLabel,
  getMonthRange,
  getNextMonth,
  getPreviousMonth,
  type TransactionCategory,
  type WorkspaceTransaction,
} from "@/lib/transactions";

function clampMonth(value: number) {
  return Math.min(Math.max(value, 1), 12);
}

function getPeriod(params?: {
  year?: string;
  month?: string;
}) {
  const now = new Date();
  const year = Number(params?.year ?? now.getFullYear());
  const month = clampMonth(Number(params?.month ?? now.getMonth() + 1));

  return {
    year: Number.isFinite(year) ? year : now.getFullYear(),
    month: Number.isFinite(month) ? month : now.getMonth() + 1,
  };
}

function getVisibility(
  value?: string,
): "SHARED" | "PERSONAL" | "ALL" {
  if (value === "SHARED" || value === "PERSONAL") {
    return value;
  }

  return "ALL";
}

function getType(
  value?: string,
): "INCOME" | "EXPENSE" | "ALL" {
  if (value === "INCOME" || value === "EXPENSE") {
    return value;
  }

  return "ALL";
}

function buildTransactionsHref(input: {
  categoryId?: string;
  compose?: boolean;
  filters?: boolean;
  importCsv?: boolean;
  maxAmount?: string;
  minAmount?: string;
  year: number;
  month: number;
  paidByUserId?: string;
  query?: string;
  type: "INCOME" | "EXPENSE" | "ALL";
  visibility: "SHARED" | "PERSONAL" | "ALL";
}) {
  const params = new URLSearchParams({
    year: String(input.year),
    month: String(input.month),
    type: input.type,
    visibility: input.visibility,
  });

  if (input.query) {
    params.set("q", input.query);
  }

  if (input.categoryId) {
    params.set("categoryId", input.categoryId);
  }

  if (input.paidByUserId) {
    params.set("paidByUserId", input.paidByUserId);
  }

  if (input.minAmount) {
    params.set("minAmount", input.minAmount);
  }

  if (input.maxAmount) {
    params.set("maxAmount", input.maxAmount);
  }

  if (input.compose) {
    params.set("compose", "1");
  }

  if (input.filters) {
    params.set("filters", "1");
  }

  if (input.importCsv) {
    params.set("importCsv", "1");
  }

  return `/app/transactions?${params.toString()}`;
}

function buildEditHref(baseHref: string, transactionId: string) {
  return `${baseHref}&edit=${transactionId}`;
}

function buildViewHref(baseHref: string, transactionId: string) {
  return `${baseHref}&view=${transactionId}`;
}

function formatInputAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(0) : "";
}

function normalizeQuery(value?: string) {
  return value?.trim() ? value.trim() : "";
}

function normalizeFilterValue(value?: string) {
  return value?.trim() ? value.trim() : "";
}

function parseAmountFilter(value?: string) {
  const normalized = normalizeFilterValue(value);

  if (!normalized) {
    return null;
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function getPanelState(value?: string) {
  return value === "1";
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getFilterChipClassName(
  active: boolean,
  tone: "primary" | "success" = "primary",
) {
  const activeClassName =
    tone === "success"
      ? "border-[color:var(--button-success-border)] bg-[color:var(--button-success-bg)] text-[color:var(--button-success-fg)] shadow-[var(--button-success-shadow)]"
      : "border-[color:var(--button-primary-border)] bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-fg)] shadow-[var(--button-primary-shadow)]";

  return `inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
    active
      ? activeClassName
      : "border-[color:var(--button-secondary-border)] bg-[color:var(--button-secondary-bg)] text-[color:var(--button-secondary-fg)] shadow-[var(--button-secondary-shadow)] hover:border-[color:var(--button-secondary-hover-border)] hover:bg-[color:var(--button-secondary-hover-bg)] hover:text-[color:var(--button-secondary-hover-fg)]"
  }`;
}

function getDefaultTransactionDate(
  requestedPeriod: { year: number; month: number },
  monthRange: { from: string; to: string },
) {
  const now = new Date();
  const isCurrentMonth =
    requestedPeriod.year === now.getFullYear() &&
    requestedPeriod.month === now.getMonth() + 1;

  if (isCurrentMonth) {
    return formatDateInputValue(now);
  }

  return monthRange.from;
}

function CategorySelect({
  categories,
  emptyLabel = "No category",
  name,
  defaultValue,
  transactionType,
}: {
  categories: TransactionCategory[];
  emptyLabel?: string;
  name: string;
  defaultValue?: string | null;
  transactionType?: "INCOME" | "EXPENSE";
}) {
  const incomeCategories = categories.filter((item) => item.type === "INCOME");
  const expenseCategories = categories.filter((item) => item.type === "EXPENSE");
  const filteredCategories = transactionType
    ? categories.filter((item) => item.type === transactionType)
    : categories;

  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
    >
      <option value="">{emptyLabel}</option>
      {transactionType ? (
        filteredCategories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))
      ) : (
        <>
          <optgroup label="Expense">
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Income">
            {incomeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </optgroup>
        </>
      )}
    </select>
  );
}

function MemberSelect({
  emptyLabel = "Use current member",
  members,
  name,
  defaultValue,
}: {
  emptyLabel?: string;
  members: WorkspaceMemberSummary[];
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
    >
      <option value="">{emptyLabel}</option>
      {members.map((member) => (
        <option key={member.userId} value={member.userId}>
          {member.nickname ?? member.name}
        </option>
      ))}
    </select>
  );
}

function AccountSelect({
  accounts,
  name,
  defaultValue,
  emptyLabel = "No account",
}: {
  accounts: FinancialAccount[];
  name: string;
  defaultValue?: string | null;
  emptyLabel?: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
    >
      <option value="">{emptyLabel}</option>
      {accounts
        .filter((account) => !account.isArchived)
        .map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
    </select>
  );
}

function QuickAddCard({
  categories,
  currency,
  defaultDate,
  defaultType,
  members,
  accounts,
  returnTo,
  workspaceId,
}: {
  categories: TransactionCategory[];
  currency: string;
  defaultDate: string;
  defaultType: "INCOME" | "EXPENSE";
  members: WorkspaceMemberSummary[];
  accounts: FinancialAccount[];
  returnTo: string;
  workspaceId: string;
}) {
  return (
    <form
      action="/app/transactions/create"
      method="post"
      className=""
    >
      <AppSurface as="div" padding="md">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="currency" value={currency} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Quick add</p>
        </div>
        <AppBadge tone="success">
          {currency}
        </AppBadge>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Amount</span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Date</span>
          <input
            name="transactionDate"
            type="date"
            defaultValue={defaultDate}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          />
        </label>
      </div>

      <div className="mt-4">
        <TransactionSplitFields
          categories={categories}
          defaultType={defaultType}
          defaultVisibility="SHARED"
          members={members}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Paid by</span>
          <MemberSelect members={members} name="paidByUserId" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Account</span>
          <AccountSelect accounts={accounts} name="accountId" />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Memo</span>
        <textarea
          name="memo"
          rows={3}
          placeholder="Optional note"
          className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
        />
      </label>

      <div className="mt-5 flex justify-end">
        <AppButton type="submit">
          Save transaction
        </AppButton>
      </div>
      </AppSurface>
    </form>
  );
}

function EditTransactionCard({
  categories,
  currency,
  members,
  accounts,
  returnTo,
  transaction,
  workspaceId,
}: {
  categories: TransactionCategory[];
  currency: string;
  members: WorkspaceMemberSummary[];
  accounts: FinancialAccount[];
  returnTo: string;
  transaction: WorkspaceTransaction;
  workspaceId: string;
}) {
  return (
    <form
      action="/app/transactions/update"
      method="post"
      className=""
    >
      <AppSurface as="div" padding="md" tone="success">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="transactionId" value={transaction.id} />
      <input type="hidden" name="currency" value={currency} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Edit transaction</p>
          <p className="mt-1 text-sm text-slate-500">{transaction.type}</p>
        </div>
        <AppButtonLink
          href={returnTo}
          size="sm"
          tone="secondary"
        >
          Cancel
        </AppButtonLink>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Amount</span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={formatInputAmount(transaction.amount)}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Date</span>
          <input
            name="transactionDate"
            type="date"
            defaultValue={transaction.transactionDate}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
          />
        </label>
      </div>

      <div className="mt-4">
        <TransactionSplitFields
          categories={categories}
          defaultMode={
            transaction.participants.some(
              (participant) => participant.shareType === "FIXED",
            )
              ? "FIXED"
              : "EQUAL"
          }
          defaultCategoryId={transaction.categoryId}
          defaultParticipants={transaction.participants}
          defaultType={transaction.type}
          defaultVisibility={transaction.visibility}
          members={members}
          showTypeControl={false}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Paid by</span>
          <MemberSelect
            members={members}
            name="paidByUserId"
            defaultValue={transaction.paidByUserId}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Currency</span>
          <input
            name="currency"
            type="text"
            defaultValue={transaction.currency}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Account</span>
          <AccountSelect
            accounts={accounts}
            name="accountId"
            defaultValue={transaction.accountId}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Memo</span>
        <textarea
          name="memo"
          rows={3}
          defaultValue={transaction.memo ?? ""}
          className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
        />
      </label>

      <div className="mt-5 flex justify-end">
        <AppButton type="submit">
          Update transaction
        </AppButton>
      </div>
      </AppSurface>
    </form>
  );
}

function TransactionDetailCard({
  currency,
  locale,
  returnTo,
  transaction,
}: {
  currency: string;
  locale: string;
  returnTo: string;
  transaction: WorkspaceTransaction;
}) {
  return (
    <AppSurface padding="md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Transaction detail</p>
          <p className="mt-1 text-sm text-slate-500">{transaction.transactionDate}</p>
        </div>
        <AppButtonLink href={returnTo} size="sm" tone="secondary">
          Close
        </AppButtonLink>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.1rem] bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Category
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {transaction.categoryName ?? "Uncategorized"}
          </p>
        </div>
        <div className="rounded-[1.1rem] bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Amount
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {formatCurrency(transaction.amount, currency, locale)}
          </p>
        </div>
        <div className="rounded-[1.1rem] bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Type
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {transaction.type}
          </p>
        </div>
        <div className="rounded-[1.1rem] bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Visibility
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {transaction.visibility}
          </p>
        </div>
        <div className="rounded-[1.1rem] bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Paid by
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {transaction.paidByUserName ?? "Unknown"}
          </p>
        </div>
        <div className="rounded-[1.1rem] bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Currency
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {transaction.currency}
          </p>
        </div>
        <div className="rounded-[1.1rem] bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Account
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950">
            {transaction.accountName ?? "No account"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.1rem] bg-slate-50 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Memo
        </p>
        <p className="mt-2 text-sm text-slate-700">
          {transaction.memo ?? "No note"}
        </p>
      </div>

      {transaction.participants.length > 0 ? (
        <div className="mt-4 rounded-[1.1rem] bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Split
          </p>
          <div className="mt-3 space-y-2">
            {transaction.participants.map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center justify-between gap-3 rounded-[0.9rem] bg-white px-3 py-3"
              >
                <p className="text-sm font-medium text-slate-950">
                  {participant.userName}
                </p>
                <p className="text-sm text-slate-500">
                  {participant.shareType === "EQUAL"
                    ? "Equal"
                    : formatCurrency(
                        participant.shareValue ?? "0",
                        currency,
                        locale,
                      )}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex gap-3">
        <AppButtonLink
          href={buildEditHref(returnTo, transaction.id)}
          className="flex-1"
        >
          Edit
        </AppButtonLink>
        <AppButtonLink href={returnTo} tone="secondary" className="flex-1">
          Back
        </AppButtonLink>
      </div>
    </AppSurface>
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoryId?: string;
    compose?: string;
    deleted?: string;
    edit?: string;
    filters?: string;
    importCsv?: string;
    maxAmount?: string;
    year?: string;
    month?: string;
    minAmount?: string;
    paidByUserId?: string;
    q?: string;
    type?: string;
    visibility?: string;
    view?: string;
  }>;
}) {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!session.currentWorkspace) {
    redirect("/app/onboarding");
  }

  const currentWorkspace = session.currentWorkspace;

  const params = await searchParams;
  const requestedPeriod = getPeriod(params);
  const type = getType(params.type);
  const visibility = getVisibility(params.visibility);
  const query = normalizeQuery(params.q);
  const categoryId = normalizeFilterValue(params.categoryId);
  const paidByUserId = normalizeFilterValue(params.paidByUserId);
  const rawMinAmount = normalizeFilterValue(params.minAmount);
  const rawMaxAmount = normalizeFilterValue(params.maxAmount);
  const minAmount = parseAmountFilter(params.minAmount);
  const maxAmount = parseAmountFilter(params.maxAmount);
  const isComposeOpen = getPanelState(params.compose);
  const isFiltersOpen = getPanelState(params.filters);
  const isImportOpen = getPanelState(params.importCsv);
  const monthRange = getMonthRange(
    requestedPeriod.year,
    requestedPeriod.month,
  );

  const [transactions, categories, members, accounts] = await Promise.all([
    fetchWorkspaceTransactions({
      accessToken: session.accessToken,
      workspaceId: currentWorkspace.id,
      from: monthRange.from,
      to: monthRange.to,
      type: type === "ALL" ? undefined : type,
      visibility: visibility === "ALL" ? undefined : visibility,
    }),
    fetchWorkspaceCategories({
      accessToken: session.accessToken,
      workspaceId: currentWorkspace.id,
    }),
    fetchWorkspaceMembers({
      accessToken: session.accessToken,
      workspaceId: currentWorkspace.id,
    }),
    fetchFinancialAccounts({
      accessToken: session.accessToken,
      workspaceId: currentWorkspace.id,
    }),
  ]);

  const locale = session.user.locale === "ko-KR" ? "ko-KR" : "en-CA";
  const prev = getPreviousMonth(requestedPeriod.year, requestedPeriod.month);
  const next = getNextMonth(requestedPeriod.year, requestedPeriod.month);
  const baseHref = buildTransactionsHref({
    categoryId,
    maxAmount: rawMaxAmount,
    year: requestedPeriod.year,
    minAmount: rawMinAmount,
    month: requestedPeriod.month,
    paidByUserId,
    query,
    type,
    visibility,
  });
  const composeHref = buildTransactionsHref({
    categoryId,
    compose: true,
    maxAmount: rawMaxAmount,
    minAmount: rawMinAmount,
    year: requestedPeriod.year,
    month: requestedPeriod.month,
    paidByUserId,
    query,
    type,
    visibility,
  });
  const filtersHref = buildTransactionsHref({
    categoryId,
    filters: true,
    maxAmount: rawMaxAmount,
    minAmount: rawMinAmount,
    year: requestedPeriod.year,
    month: requestedPeriod.month,
    paidByUserId,
    query,
    type,
    visibility,
  });
  const importHref = buildTransactionsHref({
    categoryId,
    importCsv: true,
    maxAmount: rawMaxAmount,
    minAmount: rawMinAmount,
    year: requestedPeriod.year,
    month: requestedPeriod.month,
    paidByUserId,
    query,
    type,
    visibility,
  });
  const filteredTransactions = transactions.items.filter((item) => {
    if (categoryId && item.categoryId !== categoryId) {
      return false;
    }

    if (paidByUserId && item.paidByUserId !== paidByUserId) {
      return false;
    }

    const amount = Number(item.amount);
    if (minAmount !== null && amount < minAmount) {
      return false;
    }

    if (maxAmount !== null && amount > maxAmount) {
      return false;
    }

    if (query) {
      const haystack = [
        item.categoryName,
        item.memo,
        item.paidByUserName,
        item.type,
        item.visibility,
        ...item.participants.map((participant) => participant.userName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
  const editableTransaction =
    filteredTransactions.find((item) => item.id === params.edit) ??
    transactions.items.find((item) => item.id === params.edit) ??
    null;
  const viewedTransaction =
    filteredTransactions.find((item) => item.id === params.view) ??
    transactions.items.find((item) => item.id === params.view) ??
    null;
  const defaultCreateDate = getDefaultTransactionDate(
    requestedPeriod,
    monthRange,
  );
  const defaultCreateType = type === "ALL" ? "EXPENSE" : type;
  const deletedTransactionId =
    typeof params.deleted === "string" && params.deleted.length > 0
      ? params.deleted
      : null;
  const activeFilterCount = [
    query,
    categoryId,
    paidByUserId,
    rawMinAmount,
    rawMaxAmount,
    type !== "ALL" ? type : null,
    visibility !== "ALL" ? visibility : null,
  ].filter(Boolean).length;
  const showMobileBackToList =
    isComposeOpen ||
    isFiltersOpen ||
    isImportOpen ||
    Boolean(editableTransaction) ||
    Boolean(viewedTransaction);

  const grouped = Object.entries(
    filteredTransactions.reduce<Record<string, typeof filteredTransactions>>(
      (acc, item) => {
        acc[item.transactionDate] = acc[item.transactionDate]
          ? [...acc[item.transactionDate], item]
          : [item];
        return acc;
      },
      {},
    ),
  );

  const totals = filteredTransactions.reduce(
    (acc, item) => {
      const amount = Number(item.amount);
      if (item.type === "INCOME") {
        acc.income += amount;
      } else {
        acc.expense += amount;
      }

      if (item.visibility === "SHARED") {
        acc.shared += amount;
      } else {
        acc.personal += amount;
      }
      return acc;
    },
    { income: 0, expense: 0, personal: 0, shared: 0 },
  );

  return (
    <div className="space-y-6">
      <Reveal delay={0.02}>
        <AppSurface padding="md">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Transactions
        </p>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {formatMonthLabel(requestedPeriod.year, requestedPeriod.month)}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {currentWorkspace.name}
            </p>
          </div>
          <AppBadge tone="default" className="px-4 py-2 text-sm font-semibold">
            {filteredTransactions.length} entries
          </AppBadge>
        </div>

        <div className="mt-5 flex items-center gap-3 text-sm">
          <AppButtonLink
            href={buildTransactionsHref({
              year: prev.year,
              month: prev.month,
              query,
              categoryId,
              paidByUserId,
              minAmount: rawMinAmount,
              maxAmount: rawMaxAmount,
              type,
              visibility,
            })}
            size="sm"
            tone="secondary"
          >
            Prev
          </AppButtonLink>
          <AppButtonLink
            href={buildTransactionsHref({
              year: next.year,
              month: next.month,
              query,
              categoryId,
              paidByUserId,
              minAmount: rawMinAmount,
              maxAmount: rawMaxAmount,
              type,
              visibility,
            })}
            size="sm"
            tone="secondary"
          >
            Next
          </AppButtonLink>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:hidden">
          <AppButtonLink href={composeHref} tone="primary" className="w-full">
            Add entry
          </AppButtonLink>
          <AppButtonLink href={filtersHref} tone="secondary" className="w-full">
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </AppButtonLink>
          <AppButtonLink href={importHref} tone="secondary" className="w-full">
            Import CSV
          </AppButtonLink>
          {showMobileBackToList ? (
            <AppButtonLink href={baseHref} tone="secondary" className="w-full">
              Back to list
            </AppButtonLink>
          ) : null}
        </div>
        </AppSurface>
      </Reveal>

      {isComposeOpen ? (
        <Reveal delay={0.05}>
          <AppSurface padding="md" tone="muted" className="xl:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  New transaction
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Start with the essentials, then save and return to the list.
                </p>
              </div>
              <AppBadge tone="subtle">Mobile focus</AppBadge>
            </div>
          </AppSurface>
        </Reveal>
      ) : null}

      <div className={isComposeOpen ? "block" : "hidden xl:block"}>
        <Reveal delay={0.06}>
          <QuickAddCard
            accounts={accounts}
            categories={categories}
            currency={currentWorkspace.baseCurrency}
            defaultDate={defaultCreateDate}
            defaultType={defaultCreateType}
            members={members}
            returnTo={baseHref}
            workspaceId={currentWorkspace.id}
          />
        </Reveal>
      </div>

      {editableTransaction ? (
        <Reveal delay={0.1}>
          <EditTransactionCard
            accounts={accounts}
            categories={categories}
            currency={currentWorkspace.baseCurrency}
            members={members}
            returnTo={baseHref}
            transaction={editableTransaction}
            workspaceId={currentWorkspace.id}
          />
        </Reveal>
      ) : null}

      {viewedTransaction && !editableTransaction ? (
        <Reveal delay={0.11}>
          <TransactionDetailCard
            currency={currentWorkspace.baseCurrency}
            locale={locale}
            returnTo={baseHref}
            transaction={viewedTransaction}
          />
        </Reveal>
      ) : null}

      {deletedTransactionId ? (
        <Reveal delay={0.12}>
          <AppSurface padding="md" tone="muted" className="border-amber-200 bg-amber-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Transaction deleted
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Restore it if you removed the wrong entry.
              </p>
            </div>
            <form action="/app/transactions/restore" method="post">
              <input
                type="hidden"
                name="workspaceId"
                value={currentWorkspace.id}
              />
              <input type="hidden" name="transactionId" value={deletedTransactionId} />
              <input type="hidden" name="returnTo" value={baseHref} />
              <AppButton type="submit" size="sm">
                Restore
              </AppButton>
            </form>
          </div>
          </AppSurface>
        </Reveal>
      ) : null}

      <StaggerReveal className="grid gap-3 sm:grid-cols-2">
        <StaggerItem>
          <AppMetricSurface>
          <p className="text-sm text-slate-500">Income</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.income),
              currentWorkspace.baseCurrency,
              locale,
            )}
          </p>
          </AppMetricSurface>
        </StaggerItem>
        <StaggerItem>
          <AppMetricSurface>
          <p className="text-sm text-slate-500">Expense</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.expense),
              currentWorkspace.baseCurrency,
              locale,
            )}
          </p>
          </AppMetricSurface>
        </StaggerItem>
        <StaggerItem>
          <AppMetricSurface>
          <p className="text-sm text-slate-500">Shared</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.shared),
              currentWorkspace.baseCurrency,
              locale,
            )}
          </p>
          </AppMetricSurface>
        </StaggerItem>
        <StaggerItem>
          <AppMetricSurface>
          <p className="text-sm text-slate-500">Personal</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.personal),
              currentWorkspace.baseCurrency,
              locale,
            )}
          </p>
          </AppMetricSurface>
        </StaggerItem>
      </StaggerReveal>

      <Reveal delay={0.16}>
        <section className="space-y-4">
        <div className={isImportOpen ? "block" : "hidden xl:block"}>
          <form action="/app/transactions/import" method="post" encType="multipart/form-data">
          <AppSurface as="div" padding="md" className="space-y-4">
            <input type="hidden" name="workspaceId" value={currentWorkspace.id} />
            <input type="hidden" name="returnTo" value={baseHref} />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">CSV import</p>
                <p className="mt-1 text-sm text-slate-500">
                  Headers: date,type,amount,currency,category,memo,visibility,paidBy,account
                </p>
              </div>
              <AppButton type="submit" tone="secondary" size="sm">
                Import CSV
              </AppButton>
            </div>
            <input
              name="file"
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm text-slate-600"
            />
            <textarea
              name="csvText"
              rows={5}
              placeholder="Paste CSV content here if you do not want to upload a file."
              className="w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
            />
          </AppSurface>
          </form>
        </div>

        <div className={isFiltersOpen ? "block" : "hidden xl:block"}>
          <form method="get">
          <AppSurface as="div" padding="md" className="space-y-4">
            <input type="hidden" name="year" value={requestedPeriod.year} />
            <input type="hidden" name="month" value={requestedPeriod.month} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="visibility" value={visibility} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Search</span>
                <input
                  name="q"
                  type="text"
                  defaultValue={query}
                  placeholder="Category, memo, payer"
                  className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Category</span>
                <CategorySelect
                  categories={categories}
                  name="categoryId"
                  defaultValue={categoryId}
                  emptyLabel="All categories"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Paid by</span>
                <MemberSelect
                  members={members}
                  name="paidByUserId"
                  defaultValue={paidByUserId}
                  emptyLabel="All members"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Min amount</span>
                <input
                  name="minAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={rawMinAmount}
                  className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Max amount</span>
                <input
                  name="maxAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={rawMaxAmount}
                  className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
                />
              </label>
            </div>

            <div className="flex gap-3">
              <AppButton type="submit" className="flex-1">
                Apply filters
              </AppButton>
              <AppButtonLink
                href={buildTransactionsHref({
                  year: requestedPeriod.year,
                  month: requestedPeriod.month,
                  type,
                  visibility,
                })}
                tone="secondary"
                className="flex-1"
              >
                Reset
              </AppButtonLink>
            </div>
          </AppSurface>
          </form>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { label: "All", value: "ALL" },
            { label: "Expense", value: "EXPENSE" },
            { label: "Income", value: "INCOME" },
          ].map((item) => {
            const active = type === item.value;

            return (
              <Link
                key={item.value}
                href={buildTransactionsHref({
                  year: requestedPeriod.year,
                  month: requestedPeriod.month,
                  query,
                  categoryId,
                  paidByUserId,
                  minAmount: rawMinAmount,
                  maxAmount: rawMaxAmount,
                  type: item.value as "INCOME" | "EXPENSE" | "ALL",
                  visibility,
                })}
                className={getFilterChipClassName(active, "success")}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { label: "All", value: "ALL" },
            { label: "Shared", value: "SHARED" },
            { label: "Personal", value: "PERSONAL" },
          ].map((item) => {
            const active = visibility === item.value;

            return (
              <Link
                key={item.value}
                href={buildTransactionsHref({
                  year: requestedPeriod.year,
                  month: requestedPeriod.month,
                  query,
                  categoryId,
                  paidByUserId,
                  minAmount: rawMinAmount,
                  maxAmount: rawMaxAmount,
                  type,
                  visibility: item.value as "SHARED" | "PERSONAL" | "ALL",
                })}
                className={getFilterChipClassName(active)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        </section>
      </Reveal>

      {grouped.length === 0 ? (
        <Reveal delay={0.2}>
          <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-950">No entries</p>
          </section>
        </Reveal>
      ) : (
        <Reveal delay={0.2}>
          <div className="space-y-6">
          {grouped.map(([date, items]) => (
            <section key={date} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {formatDateLabel(date, locale)}
                </h2>
                <span className="text-xs text-slate-400">{items.length}</span>
              </div>

              <div className="space-y-3">
                {items.map((transaction) => (
                  <article
                    key={transaction.id}
                    className={`rounded-[1.5rem] border px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] ${
                      editableTransaction?.id === transaction.id
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-900/8 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {transaction.categoryName ?? "Uncategorized"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {transaction.memo ??
                            transaction.accountName ??
                            transaction.paidByUserName ??
                            "No note"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-950">
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency,
                            locale,
                          )}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {transaction.type} · {transaction.visibility}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <div className="flex gap-2">
                        <form action="/app/transactions/delete" method="post">
                          <input
                            type="hidden"
                            name="workspaceId"
                            value={currentWorkspace.id}
                          />
                          <input
                            type="hidden"
                            name="transactionId"
                            value={transaction.id}
                          />
                          <input type="hidden" name="returnTo" value={baseHref} />
                          <AppButton type="submit" tone="danger" size="sm">
                            Delete
                          </AppButton>
                        </form>
                        <AppButtonLink
                          href={buildViewHref(baseHref, transaction.id)}
                          tone="secondary"
                          size="sm"
                        >
                          View
                        </AppButtonLink>
                        <AppButtonLink
                          href={buildEditHref(baseHref, transaction.id)}
                          tone="secondary"
                          size="sm"
                        >
                          Edit
                        </AppButtonLink>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
