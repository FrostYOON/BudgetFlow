"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  detectHolidayContext,
  type HolidayContext,
  type HolidayInfo,
  loadHolidayMap,
} from "@/lib/holiday-calendar";

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

type CalendarDay = {
  dateKey: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  weekday: number;
  isToday: boolean;
};

function formatCurrency(
  amount: string | number,
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

function formatMonthLabel(year: number, month: number, locale = "en-CA") {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
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

  if (today.getFullYear() === year && today.getMonth() + 1 === month) {
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
  const todayKey = toDateKey(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
  );
  const cells: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const dayOffset = index - firstWeekday;
    const cellDate = new Date(Date.UTC(year, month - 1, 1 + dayOffset));
    const dateKey = cellDate.toISOString().slice(0, 10);

    cells.push({
      dateKey,
      dayNumber: cellDate.getUTCDate(),
      inCurrentMonth: dayOffset >= 0 && dayOffset < daysInMonth,
      weekday: cellDate.getUTCDay(),
      isToday: dateKey === todayKey,
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

function getDayTone(weekday: number) {
  if (weekday === 0) {
    return {
      headerClassName: "text-rose-500",
      cellClassName: "border-rose-100 bg-rose-50/70",
      mutedCellClassName: "border-rose-50 bg-rose-50/40",
    };
  }

  if (weekday === 6) {
    return {
      headerClassName: "text-sky-500",
      cellClassName: "border-sky-100 bg-sky-50/70",
      mutedCellClassName: "border-sky-50 bg-sky-50/40",
    };
  }

  return {
    headerClassName: "text-slate-400",
    cellClassName: "border-slate-200 bg-white",
    mutedCellClassName: "border-slate-100 bg-slate-50/60",
  };
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
  const [holidayContext] = useState<HolidayContext>(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localeHint =
      typeof navigator !== "undefined" ? navigator.language : locale;

    return detectHolidayContext({
      locale: localeHint,
      timeZone,
    });
  });
  const [holidayMap, setHolidayMap] = useState<Map<string, HolidayInfo>>(
    () => new Map(),
  );

  const calendarDays = useMemo(() => buildCalendarDays(year, month), [year, month]);
  const calendarYears = useMemo(
    () =>
      [...new Set(calendarDays.map((day) => Number(day.dateKey.slice(0, 4))))].sort(),
    [calendarDays],
  );

  useEffect(() => {
    let isCancelled = false;

    loadHolidayMap({
      context: holidayContext,
      years: calendarYears,
    }).then((map) => {
      if (!isCancelled) {
        setHolidayMap(map);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [calendarYears, holidayContext]);

  const selectedSummary =
    daySummaries.get(selectedDate) ??
    ({
      dateKey: selectedDate,
      income: 0,
      expense: 0,
      count: 0,
      transactions: [],
    } satisfies CalendarDaySummary);

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const formattedSelectedDate = formatDateLabel(selectedDate, locale);
  const monthLabel = formatMonthLabel(year, month, locale);
  const selectedHoliday = holidayMap.get(selectedDate) ?? null;
  const selectedNet = selectedSummary.income - selectedSummary.expense;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-900/8 bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_34%,#f8fafc_100%)] px-4 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6">
      <div className="flex flex-col gap-4 border-b border-slate-900/8 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Calendar
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              {monthLabel}
            </h2>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {transactions.length} entries
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-600">
            Sundays
          </span>
          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-600">
            Saturdays
          </span>
          {holidayContext.label ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
              {holidayContext.label}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em]">
        {weekdayLabels.map((label, index) => (
          <div key={label} className={getDayTone(index).headerClassName}>
            {label}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {calendarDays.map((day) => {
          const summary = daySummaries.get(day.dateKey);
          const isSelected = selectedDate === day.dateKey;
          const holiday = holidayMap.get(day.dateKey) ?? null;
          const incomeLabel = formatMiniAmount(summary?.income ?? 0, locale);
          const expenseLabel = formatMiniAmount(summary?.expense ?? 0, locale);
          const tone = getDayTone(day.weekday);

          let className =
            "min-h-[106px] rounded-[1.35rem] border px-2.5 py-2.5 text-left transition sm:min-h-[116px]";

          if (isSelected) {
            className += " border-slate-950 bg-slate-950 text-white shadow-[0_16px_24px_rgba(15,23,42,0.18)]";
          } else if (day.inCurrentMonth) {
            className += ` ${tone.cellClassName} text-slate-950 hover:-translate-y-0.5 hover:border-slate-300`;
          } else {
            className += ` ${tone.mutedCellClassName} text-slate-300`;
          }

          if (holiday && !isSelected) {
            className += " ring-1 ring-inset ring-amber-200";
          }

          if (day.isToday && !isSelected) {
            className += " shadow-[inset_0_0_0_1px_rgba(15,23,42,0.12)]";
          }

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => setSelectedDate(day.dateKey)}
              className={className}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">{day.dayNumber}</span>
                  {day.isToday ? (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected ? "bg-emerald-300" : "bg-emerald-500"
                      }`}
                    />
                  ) : null}
                </div>

                {summary?.count ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      isSelected
                        ? "bg-white/15 text-white"
                        : "bg-slate-950/6 text-slate-700"
                    }`}
                  >
                    {summary.count}
                  </span>
                ) : null}
              </div>

              <div className="mt-2 min-h-[22px]">
                {holiday ? (
                  <span
                    className={`inline-flex max-w-full truncate rounded-full px-2 py-1 text-[10px] font-semibold ${
                      isSelected
                        ? "bg-amber-300/20 text-amber-100"
                        : "bg-amber-100 text-amber-800"
                    }`}
                    title={holiday.name}
                  >
                    {holiday.shortName}
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
              ) : (
                <div className="mt-3">
                  <div
                    className={`h-6 rounded-full ${
                      isSelected ? "bg-white/8" : "bg-slate-900/[0.035]"
                    }`}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div
        key={selectedDate}
        className="mt-5 rounded-[1.6rem] border border-slate-900/8 bg-white/90 px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)] motion-safe:animate-page-enter"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-950">
              {formattedSelectedDate}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                {selectedSummary.count} items
              </span>
              {selectedHoliday ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">
                  {selectedHoliday.name}
                </span>
              ) : null}
              {holidayContext.timeZone ? (
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-800">
                  {holidayContext.timeZone}
                </span>
              ) : null}
              <span
                className={`rounded-full px-2.5 py-1 ${
                  selectedNet >= 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                Net {selectedNet >= 0 ? "+" : "-"}
                {formatMiniAmount(Math.abs(selectedNet), locale) ?? "0"}
              </span>
            </div>
          </div>

          <Link
            href={`/app/transactions?year=${year}&month=${month}&type=ALL&visibility=ALL`}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            Open ledger
          </Link>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-[1.1rem] bg-slate-50 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Expense
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {formatCurrency(selectedSummary.expense, currency, locale)}
            </p>
          </div>
          <div className="rounded-[1.1rem] bg-slate-50 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Income
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {formatCurrency(selectedSummary.income, currency, locale)}
            </p>
          </div>
          <div className="rounded-[1.1rem] bg-slate-50 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Activity
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-950">
              {selectedSummary.count} transaction
              {selectedSummary.count === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {selectedSummary.transactions.length === 0 ? (
            <p className="text-sm text-slate-500">No transactions on this date.</p>
          ) : (
            selectedSummary.transactions.map((transaction) => (
              <article
                key={transaction.id}
                className="rounded-[1.2rem] border border-slate-900/8 bg-slate-50 px-4 py-3"
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
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {transaction.type}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
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
