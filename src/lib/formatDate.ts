import { localeMeta, type Locale } from '~/config/locales';

/** Long form for bylines: `5 March 2026` / `5. März 2026`. */
export const formatDate = (date: Date, locale: Locale): string =>
  new Intl.DateTimeFormat(localeMeta[locale].hreflang, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

/** The `datetime` attribute value for `<time>`, and JSON-LD dates. */
export const isoDate = (date: Date): string => date.toISOString().slice(0, 10);
