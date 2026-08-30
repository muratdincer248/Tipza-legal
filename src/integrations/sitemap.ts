import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { AstroIntegration } from 'astro';

/**
 * Builds the sitemap from the pages Astro just wrote, rather than from a second
 * model of the site.
 *
 * `@astrojs/sitemap`'s i18n support pairs translations by swapping the locale
 * segment, which works only when every language uses the same slug. Tipza
 * articles deliberately do not — `/en/blog/how-to-split-tips-fairly/` pairs with
 * `/de/blog/trinkgeld-fair-aufteilen/` so each language can own a slug written
 * for the phrases people search in it — and the integration silently emitted no
 * alternates for exactly those pages.
 *
 * Every page already carries its canonical URL, its hreflang alternates and its
 * modification date in `<head>`, all from one component. Reading them back out
 * means the sitemap cannot contradict the pages, and there is no separate page
 * inventory to keep in step with the routes.
 */

interface PageEntry {
  loc: string;
  lastmod?: string;
  alternates: { hreflang: string; href: string }[];
}

/** Matches `<link>`/`<meta>` tags without assuming attribute order. */
const tags = (html: string, name: 'link' | 'meta'): string[] =>
  html.match(new RegExp(`<${name}\\s[^>]*>`, 'gi')) ?? [];

const attr = (source: string, name: string): string | undefined =>
  source.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];

const XML_ESCAPES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
};

const escapeXml = (value: string): string => value.replace(/[<>&'"]/g, (char) => XML_ESCAPES[char]!);

function readPage(html: string): PageEntry | undefined {
  const links = tags(html, 'link');
  const metas = tags(html, 'meta');

  const robots = metas.find((meta) => attr(meta, 'name')?.toLowerCase() === 'robots');
  if (robots && /noindex/i.test(attr(robots, 'content') ?? '')) return undefined;

  const canonical = links.find((link) => attr(link, 'rel')?.toLowerCase() === 'canonical');
  const loc = canonical && attr(canonical, 'href');
  if (!loc) return undefined;

  const modified = metas.find(
    (meta) => attr(meta, 'property')?.toLowerCase() === 'article:modified_time'
  );

  return {
    loc,
    lastmod: modified ? attr(modified, 'content')?.slice(0, 10) : undefined,
    alternates: links
      .filter((link) => attr(link, 'rel')?.toLowerCase() === 'alternate' && attr(link, 'hreflang'))
      .map((link) => ({ hreflang: attr(link, 'hreflang')!, href: attr(link, 'href') ?? '' }))
      .filter((alternate) => alternate.href),
  };
}

function urlset(pages: PageEntry[]): string {
  const entries = pages.map((page) => {
    const parts = [`<loc>${escapeXml(page.loc)}</loc>`];
    if (page.lastmod) parts.push(`<lastmod>${page.lastmod}</lastmod>`);
    for (const { hreflang, href } of page.alternates) {
      parts.push(
        `<xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}"/>`
      );
    }
    return `  <url>${parts.join('')}</url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

/** Kept so robots.txt and anything already submitted to Search Console resolve. */
const sitemapIndex = (sitemapUrl: string): string => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${escapeXml(sitemapUrl)}</loc></sitemap>
</sitemapindex>
`;

export default function sitemap(): AstroIntegration {
  let site: URL | undefined;

  return {
    name: 'tipza:sitemap',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = config.site ? new URL(config.site) : undefined;
      },

      'astro:build:done': async ({ pages, dir, logger }) => {
        if (!site) {
          logger.warn('No `site` configured, so no sitemap was written.');
          return;
        }

        const root = fileURLToPath(dir);
        const entries: PageEntry[] = [];

        for (const { pathname } of pages) {
          /* `pathname` is directory-shaped under trailingSlash: 'always', but a
             route that opts out of it lands as a bare filename. */
          const candidates = [
            path.join(root, pathname, 'index.html'),
            path.join(root, `${pathname.replace(/\/$/, '')}.html`),
          ];

          let html: string | undefined;
          for (const candidate of candidates) {
            html = await readFile(candidate, 'utf8').catch(() => undefined);
            if (html) break;
          }

          if (!html) {
            logger.warn(`No HTML found for /${pathname}; leaving it out of the sitemap.`);
            continue;
          }

          const entry = readPage(html);
          if (entry) entries.push(entry);
        }

        entries.sort((a, b) => a.loc.localeCompare(b.loc));

        await writeFile(path.join(root, 'sitemap.xml'), urlset(entries), 'utf8');
        await writeFile(
          path.join(root, 'sitemap-index.xml'),
          sitemapIndex(new URL('sitemap.xml', site).href),
          'utf8'
        );

        logger.info(`sitemap.xml written with ${entries.length} page(s)`);
      },
    },
  };
}
