import Link from "next/link";
import { redirect } from "next/navigation";
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
  year: number;
  month: number;
  type: "INCOME" | "EXPENSE" | "ALL";
  visibility: "SHARED" | "PERSONAL" | "ALL";
}) {
  const params = new URLSearchParams({
    year: String(input.year),
    month: String(input.month),
    type: input.type,
    visibility: input.visibility,
  });

  return `/app/transactions?${params.toString()}`;
}

function buildEditHref(baseHref: string, transactionId: string) {
  return `${baseHref}&edit=${transactionId}`;
}

function formatInputAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(0) : "";
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
    return now.toISOString().slice(0, 10);
  }

  return monthRange.from;
}

function CategorySelect({
  categories,
  name,
  defaultValue,
  transactionType,
}: {
  categories: TransactionCategory[];
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
      <option value="">No category</option>
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
  members,
  name,
  defaultValue,
}: {
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
      <option value="">Use current member</option>
      {members.map((member) => (
        <option key={member.userId} value={member.userId}>
          {member.nickname ?? member.name}
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
  returnTo,
}: {
  categories: TransactionCategory[];
  currency: string;
  defaultDate: string;
  defaultType: "INCOME" | "EXPENSE";
  members: WorkspaceMemberSummary[];
  returnTo: string;
}) {
  return (
    <form
      action="/app/transactions/create"
      method="post"
      className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6"
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="currency" value={currency} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Quick add</p>
        </div>
        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          {currency}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Type</span>
          <select
            name="type"
            defaultValue={defaultType}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Visibility</span>
          <select
            name="visibility"
            defaultValue="SHARED"
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:bg-white"
          >
            <option value="SHARED">Shared</option>
            <option value="PERSONAL">Personal</option>
          </select>
        </label>

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

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <CategorySelect categories={categories} name="categoryId" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Paid by</span>
          <MemberSelect members={members} name="paidByUserId" />
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
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Save transaction
        </button>
      </div>
    </form>
  );
}

function EditTransactionCard({
  categories,
  currency,
  members,
  returnTo,
  transaction,
}: {
  categories: TransactionCategory[];
  currency: string;
  members: WorkspaceMemberSummary[];
  returnTo: string;
  transaction: WorkspaceTransaction;
}) {
  return (
    <form
      action="/app/transactions/update"
      method="post"
      className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.04)] sm:px-6"
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="transactionId" value={transaction.id} />
      <input type="hidden" name="currency" value={currency} />

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">Edit transaction</p>
          <p className="mt-1 text-sm text-slate-500">{transaction.type}</p>
        </div>
        <Link
          href={returnTo}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
        >
          Cancel
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Visibility</span>
          <select
            name="visibility"
            defaultValue={transaction.visibility}
            className="mt-2 w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400"
          >
            <option value="SHARED">Shared</option>
            <option value="PERSONAL">Personal</option>
          </select>
        </label>

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

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <CategorySelect
            categories={categories}
            name="categoryId"
            defaultValue={transaction.categoryId}
            transactionType={transaction.type}
          />
        </label>
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
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Update transaction
        </button>
      </div>
    </form>
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    deleted?: string;
    year?: string;
    month?: string;
    type?: string;
    visibility?: string;
    edit?: string;
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
  const monthRange = getMonthRange(
    requestedPeriod.year,
    requestedPeriod.month,
  );

  const [transactions, categories, members] = await Promise.all([
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
  ]);

  const locale = session.user.locale === "ko-KR" ? "ko-KR" : "en-CA";
  const prev = getPreviousMonth(requestedPeriod.year, requestedPeriod.month);
  const next = getNextMonth(requestedPeriod.year, requestedPeriod.month);
  const baseHref = buildTransactionsHref({
    year: requestedPeriod.year,
    month: requestedPeriod.month,
    type,
    visibility,
  });
  const editableTransaction =
    transactions.items.find((item) => item.id === params.edit) ?? null;
  const defaultCreateDate = getDefaultTransactionDate(
    requestedPeriod,
    monthRange,
  );
  const defaultCreateType = type === "ALL" ? "EXPENSE" : type;
  const deletedTransactionId =
    typeof params.deleted === "string" && params.deleted.length > 0
      ? params.deleted
      : null;

  const grouped = Object.entries(
    transactions.items.reduce<Record<string, typeof transactions.items>>(
      (acc, item) => {
        acc[item.transactionDate] = acc[item.transactionDate]
          ? [...acc[item.transactionDate], item]
          : [item];
        return acc;
      },
      {},
    ),
  );

  const totals = transactions.items.reduce(
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
      <section className="rounded-[1.75rem] border border-slate-900/8 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
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
          <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            {transactions.items.length} entries
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 text-sm">
          <Link
            href={buildTransactionsHref({
              year: prev.year,
              month: prev.month,
              type,
              visibility,
            })}
            className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Prev
          </Link>
          <Link
            href={buildTransactionsHref({
              year: next.year,
              month: next.month,
              type,
              visibility,
            })}
            className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Next
          </Link>
        </div>
      </section>

      <QuickAddCard
        categories={categories}
        currency={currentWorkspace.baseCurrency}
        defaultDate={defaultCreateDate}
        defaultType={defaultCreateType}
        members={members}
        returnTo={baseHref}
      />

      {editableTransaction ? (
        <EditTransactionCard
          categories={categories}
          currency={currentWorkspace.baseCurrency}
          members={members}
          returnTo={baseHref}
          transaction={editableTransaction}
        />
      ) : null}

      {deletedTransactionId ? (
        <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4">
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
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Restore
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Income</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.income),
              currentWorkspace.baseCurrency,
              locale,
            )}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Expense</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.expense),
              currentWorkspace.baseCurrency,
              locale,
            )}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Shared</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.shared),
              currentWorkspace.baseCurrency,
              locale,
            )}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Personal</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.personal),
              currentWorkspace.baseCurrency,
              locale,
            )}
          </p>
        </article>
      </section>

      <section className="space-y-3">
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
                  type: item.value as "INCOME" | "EXPENSE" | "ALL",
                  visibility,
                })}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-500 text-slate-950"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-slate-950 hover:text-slate-950"
                }`}
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
                  type,
                  visibility: item.value as "SHARED" | "PERSONAL" | "ALL",
                })}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-slate-950 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      {grouped.length === 0 ? (
        <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-slate-950">No entries</p>
        </section>
      ) : (
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
                          {transaction.memo ?? transaction.paidByUserName ?? "No note"}
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
                          <button
                            type="submit"
                            className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-400 hover:text-rose-800"
                          >
                            Delete
                          </button>
                        </form>
                        <Link
                          href={buildEditHref(baseHref, transaction.id)}
                          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
