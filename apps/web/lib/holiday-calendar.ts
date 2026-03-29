export type HolidayRegion = "NONE" | "ON" | "KR";

export type HolidayInfo = {
  name: string;
  shortName: string;
};

export type HolidayContext = {
  region: HolidayRegion;
  label: string | null;
  timeZone: string | null;
  language: string;
};

const ONTARIO_TIME_ZONES = new Set([
  "America/Toronto",
  "America/Nipigon",
  "America/Thunder_Bay",
  "America/Rainy_River",
]);

function normalizeLocale(locale?: string | null) {
  return locale?.toLowerCase() ?? "";
}

function toShortHolidayName(name: string) {
  if (name.length <= 10) {
    return name;
  }

  const compact = name
    .replace(/\s+Day$/i, "")
    .replace(/\s+Holiday$/i, "")
    .trim();

  if (compact.length <= 10) {
    return compact;
  }

  const [firstWord] = compact.split(" ");
  return firstWord.slice(0, 10);
}

export function detectHolidayContext({
  locale,
  timeZone,
}: {
  locale?: string | null;
  timeZone?: string | null;
}) {
  const normalizedLocale = normalizeLocale(locale);
  const language = normalizedLocale.startsWith("ko") ? "ko" : "en";

  if (timeZone === "Asia/Seoul") {
    return {
      region: "KR" satisfies HolidayRegion,
      label: "Korea holidays",
      timeZone: timeZone ?? null,
      language,
    } satisfies HolidayContext;
  }

  if (timeZone && ONTARIO_TIME_ZONES.has(timeZone)) {
    return {
      region: "ON" satisfies HolidayRegion,
      label: "Ontario holidays",
      timeZone: timeZone ?? null,
      language,
    } satisfies HolidayContext;
  }

  if (normalizedLocale === "ko-kr" || normalizedLocale.endsWith("-kr")) {
    return {
      region: "KR" satisfies HolidayRegion,
      label: "Korea holidays",
      timeZone: timeZone ?? null,
      language,
    } satisfies HolidayContext;
  }

  if (normalizedLocale === "en-ca" || normalizedLocale.endsWith("-ca")) {
    return {
      region: "ON" satisfies HolidayRegion,
      label: "Ontario holidays",
      timeZone: timeZone ?? null,
      language,
    } satisfies HolidayContext;
  }

  return {
    region: "NONE" satisfies HolidayRegion,
    label: null,
    timeZone: timeZone ?? null,
    language,
  } satisfies HolidayContext;
}

export async function loadHolidayMap({
  context,
  years,
}: {
  context: HolidayContext;
  years: number[];
}) {
  const holidayMap = new Map<string, HolidayInfo>();

  if (context.region === "NONE" || years.length === 0) {
    return holidayMap;
  }

  const { default: Holidays } = await import("date-holidays");
  const holidays =
    context.region === "KR"
      ? new Holidays("KR", {
          languages: [context.language],
          timezone: context.timeZone ?? undefined,
          types: ["public", "bank"],
        })
      : new Holidays("CA", "ON", {
          languages: [context.language],
          timezone: context.timeZone ?? undefined,
          types: ["public", "bank"],
        });

  for (const year of years) {
    for (const holiday of holidays.getHolidays(year, context.language)) {
      const dateKey = holiday.start.toISOString().slice(0, 10);

      if (!holidayMap.has(dateKey)) {
        holidayMap.set(dateKey, {
          name: holiday.name,
          shortName: toShortHolidayName(holiday.name),
        });
      }
    }
  }

  return holidayMap;
}
