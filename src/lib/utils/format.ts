import type { AppLocale } from "@/lib/content/locale";

/**
 * Master plan Section 8.1: `ar-MA`, `fr-FR`, `en-GB`, Gregorian calendar,
 * Western numerals in every locale.
 */
const intlLocale: Record<AppLocale, string> = {
  fr: "fr-FR",
  ar: "ar-MA",
  en: "en-GB",
};

export function formatDate(date: Date, locale: AppLocale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    calendar: "gregory",
    numberingSystem: "latn",
  }).format(date);
}
