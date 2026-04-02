export type MonthRange = {
  start: Date;
  endInclusive: Date;
  endExclusive: Date;
};

export function getMonthRange(year: number, month: number): MonthRange {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const endExclusive = new Date(Date.UTC(year, month, 1));
  const endInclusive = new Date(Date.UTC(year, month, 0));

  return {
    start,
    endInclusive,
    endExclusive,
  };
}

export function getPreviousMonthPeriod(
  year: number,
  month: number,
): {
  year: number;
  month: number;
} {
  if (month === 1) {
    return {
      year: year - 1,
      month: 12,
    };
  }

  return {
    year,
    month: month - 1,
  };
}
