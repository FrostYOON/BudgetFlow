export type HolidayRegion = "NONE" | "ON";

export type HolidayInfo = {
  name: string;
  shortName: string;
};

export type HolidayContext = {
  region: HolidayRegion;
  label: string | null;
  timeZone: string | null;
};

const ONTARIO_TIME_ZONES = new Set([
  "America/Toronto",
  "America/Nipigon",
  "America/Thunder_Bay",
  "America/Rainy_River",
]);

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return {
    year,
    month,
    day,
  };
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getNthWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
  occurrence: number,
) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const firstWeekdayOffset = (weekday - firstDay.getUTCDay() + 7) % 7;
  const day = 1 + firstWeekdayOffset + (occurrence - 1) * 7;

  return new Date(Date.UTC(year, monthIndex, day));
}

function getLastWeekdayOnOrBefore(
  year: number,
  monthIndex: number,
  dayOfMonth: number,
  weekday: number,
) {
  const date = new Date(Date.UTC(year, monthIndex, dayOfMonth));
  const offset = (date.getUTCDay() - weekday + 7) % 7;
  date.setUTCDate(date.getUTCDate() - offset);

  return date;
}

function getEasterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(Date.UTC(year, month - 1, day));
}

function buildOntarioHolidayMap(year: number) {
  const easterSunday = getEasterSunday(year);
  const goodFriday = new Date(easterSunday);
  goodFriday.setUTCDate(easterSunday.getUTCDate() - 2);

  return new Map<string, HolidayInfo>([
    [toDateKey(new Date(Date.UTC(year, 0, 1))), { name: "New Year's Day", shortName: "New Year" }],
    [toDateKey(getNthWeekdayOfMonth(year, 1, 1, 3)), { name: "Family Day", shortName: "Family" }],
    [toDateKey(goodFriday), { name: "Good Friday", shortName: "Good Fri" }],
    [toDateKey(getLastWeekdayOnOrBefore(year, 4, 24, 1)), { name: "Victoria Day", shortName: "Victoria" }],
    [toDateKey(new Date(Date.UTC(year, 6, 1))), { name: "Canada Day", shortName: "Canada" }],
    [toDateKey(getNthWeekdayOfMonth(year, 7, 1, 1)), { name: "Civic Holiday", shortName: "Civic" }],
    [toDateKey(getNthWeekdayOfMonth(year, 8, 1, 1)), { name: "Labour Day", shortName: "Labour" }],
    [toDateKey(getNthWeekdayOfMonth(year, 9, 1, 2)), { name: "Thanksgiving", shortName: "Thanks" }],
    [toDateKey(new Date(Date.UTC(year, 11, 25))), { name: "Christmas Day", shortName: "Xmas" }],
    [toDateKey(new Date(Date.UTC(year, 11, 26))), { name: "Boxing Day", shortName: "Boxing" }],
  ]);
}

export function detectHolidayContext({
  locale,
  timeZone,
}: {
  locale?: string | null;
  timeZone?: string | null;
}) {
  const normalizedLocale = locale?.toLowerCase() ?? "";

  if (
    (timeZone && ONTARIO_TIME_ZONES.has(timeZone)) ||
    normalizedLocale === "en-ca" ||
    normalizedLocale.endsWith("-ca")
  ) {
    return {
      region: "ON" satisfies HolidayRegion,
      label: "Ontario holidays",
      timeZone: timeZone ?? null,
    } satisfies HolidayContext;
  }

  return {
    region: "NONE" satisfies HolidayRegion,
    label: null,
    timeZone: timeZone ?? null,
  } satisfies HolidayContext;
}

export function getHolidayInfo(
  dateKey: string,
  region: HolidayRegion,
) {
  if (region === "NONE") {
    return null;
  }

  const { year } = parseDateKey(dateKey);

  if (region === "ON") {
    return buildOntarioHolidayMap(year).get(dateKey) ?? null;
  }

  return null;
}
