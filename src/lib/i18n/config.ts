/**
 * Localization foundation.
 *
 * Spanish is the default and authoritative language for Business AI Manager
 * (per the Project Constitution). English is available through an instant
 * toggle. This module intentionally has zero framework dependencies so it
 * can be reused from server components, client components, and services.
 */
export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export const localeLabels: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

export const localeCookieName = "bam-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
