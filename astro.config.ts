import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { LOCALES, DEFAULT_LOCALE, localeMeta } from './src/config/locales';

const sitemapLocales = Object.fromEntries(
  LOCALES.map((locale) => [locale, localeMeta[locale].hreflang])
);

export default defineConfig({
  site: 'https://tipza.app',
  trailingSlash: 'always',
  // The ported markup was hand-written under HTML whitespace rules, so keep the
  // HTML-aware compressor rather than Astro 7's JSX default.
  compressHTML: true,

  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: [...LOCALES],
    routing: { prefixDefaultLocale: true },
  },

  // Cloudflare Pages turns this into a real 301 via public/_redirects; the page
  // Astro emits here is only a fallback for previews and other hosts.
  redirects: {
    '/': `/${DEFAULT_LOCALE}/`,
  },

  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: DEFAULT_LOCALE, locales: sitemapLocales },
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
