export const APP_DATE_LOCALE = "en-CA";

export function getDateDisplayLocale() {
  return APP_DATE_LOCALE;
}

export function getNumberDisplayLocale(locale?: string | null) {
  return locale === "ko-KR" ? "ko-KR" : "en-CA";
}
