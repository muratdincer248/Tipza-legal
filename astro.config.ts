import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from './src/integrations/sitemap';
import { LOCALES, DEFAULT_LOCALE } from './src/config/locales';

export default defineConfig({
  site: 'https://tipza.app',
  trailingSlash: 'always',
  // The ported markup was hand-written under HTML whitespace rules, so keep the
  // HTML-aware compressor rather than Astro 7's JSX default.
  compressHTML: true,

  // Opt-in rather than `prefetchAll`: the topic chips are the only links worth
  // fetching ahead of the click, since they stand in for a filter and a reader
  // works through several of them. `viewport` is the one strategy that also
  // fires on touch, where there is no hover to trigger on.
  prefetch: {
    defaultStrategy: 'viewport',
  },

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

  integrations: [mdx(), sitemap()],
});
