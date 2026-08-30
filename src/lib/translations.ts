import { LOCALES, DEFAULT_LOCALE, localePath, type Locale } from '~/config/locales';

export interface Alternate {
  locale: Locale;
  /** Absolute-from-root path for this locale. */
  href: string;
  /**
   * False when the target locale has no equivalent page, so `href` points at a
   * sensible fallback instead. Untranslated alternates are shown in the
   * language menu (flagged) but deliberately excluded from hreflang.
   */
  translated: boolean;
}

/**
 * Pages that exist at the same locale-relative path in every language: the
 * landing page, legal pages, blog index, category pages.
 */
export const symmetricAlternates = (path = ''): Alternate[] =>
  LOCALES.map((locale) => ({ locale, href: localePath(locale, path), translated: true }));

/**
 * Pages whose path differs per locale — blog articles, where each language owns
 * an independently optimized slug. Locales missing from `paths` fall back to
 * `fallbackPath` (the blog index) rather than to a non-existent URL.
 */
export const asymmetricAlternates = (
  paths: Partial<Record<Locale, string>>,
  fallbackPath: string
): Alternate[] =>
  LOCALES.map((locale) => {
    const path = paths[locale];
    return path
      ? { locale, href: localePath(locale, path), translated: true }
      : { locale, href: localePath(locale, fallbackPath), translated: false };
  });

/** Only genuinely translated pages may be advertised via hreflang. */
export const hreflangAlternates = (alternates: Alternate[]): Alternate[] =>
  alternates.filter((alternate) => alternate.translated);

/** The page `x-default` should point at, i.e. the default locale's version. */
export const xDefaultAlternate = (alternates: Alternate[]): Alternate | undefined =>
  hreflangAlternates(alternates).find((alternate) => alternate.locale === DEFAULT_LOCALE);
