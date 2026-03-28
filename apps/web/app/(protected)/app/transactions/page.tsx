import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";
import {
  fetchWorkspaceTransactions,
  formatCurrency,
  formatDateLabel,
  formatMonthLabel,
  getMonthRange,
  getNextMonth,
  getPreviousMonth,
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

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    month?: string;
    type?: string;
    visibility?: string;
  }>;
}) {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!session.currentWorkspace) {
    redirect("/app/onboarding");
  }

  const params = await searchParams;
  const requestedPeriod = getPeriod(params);
  const type = getType(params.type);
  const visibility = getVisibility(params.visibility);
  const monthRange = getMonthRange(
    requestedPeriod.year,
    requestedPeriod.month,
  );
  const transactions = await fetchWorkspaceTransactions({
    accessToken: session.accessToken,
    workspaceId: session.currentWorkspace.id,
    from: monthRange.from,
    to: monthRange.to,
    type: type === "ALL" ? undefined : type,
    visibility: visibility === "ALL" ? undefined : visibility,
  });

  const locale = session.user.locale === "ko-KR" ? "ko-KR" : "en-CA";
  const prev = getPreviousMonth(requestedPeriod.year, requestedPeriod.month);
  const next = getNextMonth(requestedPeriod.year, requestedPeriod.month);

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
              {session.currentWorkspace.name}
            </p>
          </div>
          <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            {transactions.items.length} entries
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 text-sm">
          <Link
            href={`/app/transactions?year=${prev.year}&month=${prev.month}&type=${type}&visibility=${visibility}`}
            className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Prev
          </Link>
          <Link
            href={`/app/transactions?year=${next.year}&month=${next.month}&type=${type}&visibility=${visibility}`}
            className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Next
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Income</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.income),
              session.currentWorkspace.baseCurrency,
              locale,
            )}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Expense</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.expense),
              session.currentWorkspace.baseCurrency,
              locale,
            )}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Shared</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.shared),
              session.currentWorkspace.baseCurrency,
              locale,
            )}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-slate-500">Personal</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              String(totals.personal),
              session.currentWorkspace.baseCurrency,
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
                href={`/app/transactions?year=${requestedPeriod.year}&month=${requestedPeriod.month}&type=${item.value}&visibility=${visibility}`}
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
                href={`/app/transactions?year=${requestedPeriod.year}&month=${requestedPeriod.month}&type=${type}&visibility=${item.value}`}
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
          <p className="text-sm font-medium text-slate-950">
            No transactions for this month
          </p>
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
                    className="rounded-[1.5rem] border border-slate-900/8 bg-white px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]"
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
