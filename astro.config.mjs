import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://tipza.app',
  trailingSlash: 'always',
  // The markup here was hand-written under HTML whitespace rules, so keep the
  // HTML-aware compressor rather than Astro 7's JSX default.
  compressHTML: true,
  integrations: [mdx()],
});
