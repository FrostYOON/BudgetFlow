"use client";

import { useState } from "react";
import Link from "next/link";

type DashboardCalendarTransaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  visibility: "SHARED" | "PERSONAL";
  amount: string;
  currency: string;
  transactionDate: string;
  categoryName: string | null;
  memo: string | null;
  paidByUserName: string | null;
};

type CalendarDaySummary = {
  dateKey: string;
  income: number;
  expense: number;
  count: number;
  transactions: DashboardCalendarTransaction[];
};

function formatCurrency(
  amount: string,
  currency: string,
  locale = "en-CA",
) {
  const value = Number(amount);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDateLabel(input: string, locale = "en-CA") {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${input}T00:00:00.000Z`));
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDefaultSelectedDate(
  year: number,
  month: number,
  daySummaries: Map<string, CalendarDaySummary>,
) {
  const today = new Date();
  const todayKey = toDateKey(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );

  if (
    today.getFullYear() === year &&
    today.getMonth() + 1 === month
  ) {
    return todayKey;
  }

  const firstTransactionDay = [...daySummaries.keys()].sort()[0];
  return firstTransactionDay ?? toDateKey(year, month, 1);
}

function buildDaySummaries(transactions: DashboardCalendarTransaction[]) {
  return transactions.reduce((map, transaction) => {
    const current = map.get(transaction.transactionDate) ?? {
      dateKey: transaction.transactionDate,
      income: 0,
      expense: 0,
      count: 0,
      transactions: [],
    };

    const amount = Number(transaction.amount);

    if (transaction.type === "INCOME") {
      current.income += amount;
    } else {
      current.expense += amount;
    }

    current.count += 1;
    current.transactions.push(transaction);
    map.set(transaction.transactionDate, current);

    return map;
  }, new Map<string, CalendarDaySummary>());
}

function buildCalendarDays(year: number, month: number) {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const lastOfMonth = new Date(Date.UTC(year, month, 0));
  const firstWeekday = firstOfMonth.getUTCDay();
  const daysInMonth = lastOfMonth.getUTCDate();
  const cells = [];

  for (let index = 0; index < 42; index += 1) {
    const dayOffset = index - firstWeekday;
    const cellDate = new Date(Date.UTC(year, month - 1, 1 + dayOffset));

    cells.push({
      dateKey: cellDate.toISOString().slice(0, 10),
      dayNumber: cellDate.getUTCDate(),
      inCurrentMonth: dayOffset >= 0 && dayOffset < daysInMonth,
    });
  }

  return cells;
}

function formatMiniAmount(value: number, locale: string) {
  if (!value) {
    return null;
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardTransactionCalendar({
  currency,
  locale,
  month,
  transactions,
  year,
}: {
  currency: string;
  locale: string;
  month: number;
  transactions: DashboardCalendarTransaction[];
  year: number;
}) {
  const daySummaries = buildDaySummaries(transactions);
  const [selectedDate, setSelectedDate] = useState(
    getDefaultSelectedDate(year, month, daySummaries),
  );

  const selectedSummary =
    daySummaries.get(selectedDate) ??
    ({
      dateKey: selectedDate,
      income: 0,
      expense: 0,
      count: 0,
      transactions: [],
    } satisfies CalendarDaySummary);

  const calendarDays = buildCalendarDays(year, month);
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const formattedSelectedDate = formatDateLabel(selectedDate, locale);

  return (
    <section className="space-y-5 rounded-[1.75rem] border border-slate-900/8 bg-white px-4 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Monthly flow</h2>
          <p className="mt-1 text-sm text-slate-500">
            Tap a date to inspect that day.
          </p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {transactions.length} entries
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {weekdayLabels.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          const summary = daySummaries.get(day.dateKey);
          const isSelected = selectedDate === day.dateKey;
          const incomeLabel = formatMiniAmount(summary?.income ?? 0, locale);
          const expenseLabel = formatMiniAmount(summary?.expense ?? 0, locale);

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => setSelectedDate(day.dateKey)}
              className={`min-h-[88px] rounded-[1.25rem] border px-2 py-2 text-left transition ${
                isSelected
                  ? "border-slate-950 bg-slate-950 text-white"
                  : day.inCurrentMonth
                    ? "border-slate-200 bg-slate-50 text-slate-950 hover:border-slate-300"
                    : "border-slate-100 bg-slate-50/50 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{day.dayNumber}</span>
                {summary?.count ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      isSelected
                        ? "bg-white/15 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {summary.count}
                  </span>
                ) : null}
              </div>

              {summary ? (
                <div className="mt-3 space-y-1">
                  {expenseLabel ? (
                    <div
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                        isSelected
                          ? "bg-rose-400/20 text-rose-100"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      -{expenseLabel}
                    </div>
                  ) : null}
                  {incomeLabel ? (
                    <div
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                        isSelected
                          ? "bg-emerald-400/20 text-emerald-100"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      +{incomeLabel}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.5rem] border border-slate-900/8 bg-slate-50 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">
              {formattedSelectedDate}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {selectedSummary.count} transaction
              {selectedSummary.count === 1 ? "" : "s"}
            </p>
          </div>
          <Link
            href={`/app/transactions?year=${year}&month=${month}&type=ALL&visibility=ALL`}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Open ledger
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {selectedSummary.transactions.length === 0 ? (
            <p className="text-sm text-slate-500">No transactions on this date.</p>
          ) : (
            selectedSummary.transactions.map((transaction) => (
              <article
                key={transaction.id}
                className="rounded-[1.2rem] bg-white px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">
                      {transaction.categoryName ?? "Uncategorized"}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {transaction.memo ?? transaction.paidByUserName ?? "No note"}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-slate-950">
                    {formatCurrency(transaction.amount, currency, locale)}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {transaction.type}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {transaction.visibility}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
