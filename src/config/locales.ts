/**
 * Single source of truth for supported languages. Adding French or Spanish
 * later means appending here, adding the matching `src/i18n/<locale>.ts`
 * dictionary, and adding per-locale content directories — no routing changes.
 */
export const LOCALES = ['en', 'de'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

interface LocaleMeta {
  /** Full name, shown in the language menu in its own language. */
  label: string;
  /** Compact code for the closed language selector. */
  short: string;
  /** `<html lang>` value. */
  htmlLang: string;
  /** `hreflang` value. */
  hreflang: string;
  /** Open Graph `og:locale` value. */
  ogLocale: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: { label: 'English', short: 'EN', htmlLang: 'en', hreflang: 'en', ogLocale: 'en_US' },
  de: { label: 'Deutsch', short: 'DE', htmlLang: 'de', hreflang: 'de', ogLocale: 'de_DE' },
};

export const isLocale = (value: string): value is Locale => LOCALES.includes(value as Locale);

/** Root path for a locale, always with both slashes: `/en/`. */
export const localeBase = (locale: Locale): string => `/${locale}/`;

/** Builds a locale-prefixed path from a locale-relative one. */
export const localePath = (locale: Locale, path = ''): string =>
  `${localeBase(locale)}${path.replace(/^\/+/, '')}`;

/**
 * Reads the locale back out of a path. Pages are handed their locale as a prop;
 * this is for components too deep to thread it through — an editorial block
 * imported inside an article body, for instance.
 */
export const localeFromPath = (pathname: string): Locale => {
  const segment = pathname.split('/').filter(Boolean)[0] ?? '';
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
};
