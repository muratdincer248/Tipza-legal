// Checks the built site against the SEO contract the blog depends on.
//
//   npm run check:seo        (after npm run build)
//
// Most of what makes a multilingual site rank is invisible in the browser: a
// canonical that points at the wrong URL, an hreflang pair where only one side
// links back, a JSON-LD reference to a node that is not in the graph. None of
// these break a page, so nothing catches them until traffic quietly does not
// arrive. This reads the generated HTML and fails the build if any of them slip.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST = 'dist';
const SITE = 'https://tipza.app';

/* ------------------------------------------------------------------- parsing */

const tags = (html, name) => html.match(new RegExp(`<${name}\\s[^>]*>`, 'gi')) ?? [];
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1];

const links = (html, rel) =>
  tags(html, 'link').filter((tag) => attr(tag, 'rel')?.toLowerCase() === rel);

const meta = (html, key, value) =>
  tags(html, 'meta').filter((tag) => attr(tag, key)?.toLowerCase() === value);

const content = (tag) => (tag ? attr(tag, 'content') : undefined);

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

const exists = (file) =>
  stat(file).then(
    () => true,
    () => false
  );

/** `dist/en/blog/x/index.html` is served as `/en/blog/x/`. */
const urlFor = (file) => {
  const rel = path.relative(DIST, file).split(path.sep).join('/');
  return new URL(rel === 'index.html' ? '/' : `/${rel.replace(/index\.html$/, '')}`, SITE).href;
};

/* ---------------------------------------------------------------- json-ld */

/** Every `@id` a node in this graph defines, including nested ones. */
const definedIds = (value, into = new Set()) => {
  if (Array.isArray(value)) value.forEach((item) => definedIds(item, into));
  else if (value && typeof value === 'object') {
    if (typeof value['@id'] === 'string' && Object.keys(value).length > 1) into.add(value['@id']);
    Object.values(value).forEach((child) => definedIds(child, into));
  }
  return into;
};

/** `{ "@id": … }` on its own is a reference and must resolve inside the graph. */
const referencedIds = (value, into = new Set()) => {
  if (Array.isArray(value)) value.forEach((item) => referencedIds(item, into));
  else if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 1 && keys[0] === '@id') into.add(value['@id']);
    Object.values(value).forEach((child) => referencedIds(child, into));
  }
  return into;
};

/* ------------------------------------------------------------------- checks */

const problems = [];
const fail = (file, message) => problems.push(`${path.relative(DIST, file)}: ${message}`);

const pages = [];

for await (const file of htmlFiles(DIST)) {
  const html = await readFile(file, 'utf8');
  const url = urlFor(file);
  const noindex = /noindex/i.test(content(meta(html, 'name', 'robots')[0]) ?? '');

  const titles = html.match(/<title>([\s\S]*?)<\/title>/g) ?? [];
  if (titles.length !== 1) fail(file, `expected exactly one <title>, found ${titles.length}`);
  else if (!titles[0].replace(/<\/?title>/g, '').trim()) fail(file, '<title> is empty');

  // Astro writes a redirect stub for `/`; it is meant to be thin.
  if (noindex) continue;

  const canonicals = links(html, 'canonical');
  if (canonicals.length !== 1) {
    fail(file, `expected exactly one canonical, found ${canonicals.length}`);
    continue;
  }
  const canonical = attr(canonicals[0], 'href');
  if (canonical !== url) fail(file, `canonical is ${canonical}, but the page is served at ${url}`);

  const descriptions = meta(html, 'name', 'description');
  if (descriptions.length !== 1) {
    fail(file, `expected exactly one meta description, found ${descriptions.length}`);
  } else if ((content(descriptions[0]) ?? '').length > 160) {
    fail(file, `meta description is ${content(descriptions[0]).length} characters, over 160`);
  }

  const ogImage = content(meta(html, 'property', 'og:image')[0]);
  if (!ogImage) fail(file, 'no og:image');
  else if (!ogImage.startsWith('https://')) fail(file, `og:image is not absolute: ${ogImage}`);
  else if (!(await exists(path.join(DIST, new URL(ogImage).pathname)))) {
    fail(file, `og:image is not in the build: ${ogImage}`);
  }

  const alternates = links(html, 'alternate')
    .filter((tag) => attr(tag, 'hreflang'))
    .map((tag) => ({ hreflang: attr(tag, 'hreflang'), href: attr(tag, 'href') }));

  const translated = alternates.filter((alternate) => alternate.hreflang !== 'x-default');
  if (translated.length && !alternates.some((alternate) => alternate.hreflang === 'x-default')) {
    fail(file, 'has hreflang alternates but no x-default');
  }
  if (translated.length && !translated.some((alternate) => alternate.href === canonical)) {
    fail(file, 'hreflang set does not include a self-reference');
  }

  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (scripts.length !== 1) fail(file, `expected exactly one JSON-LD block, found ${scripts.length}`);

  for (const [, json] of scripts) {
    let graph;
    try {
      graph = JSON.parse(json);
    } catch (error) {
      fail(file, `JSON-LD does not parse: ${error.message}`);
      continue;
    }

    if (graph['@context'] !== 'https://schema.org') fail(file, 'JSON-LD @context is not schema.org');

    const defined = definedIds(graph);
    for (const id of referencedIds(graph)) {
      if (!defined.has(id)) fail(file, `JSON-LD references "${id}", which no node defines`);
    }
  }

  pages.push({ file, canonical, alternates: translated });
}

/* hreflang is a mutual declaration: a page claiming a translation that does not
   claim it back is ignored by every engine that reads it. */
const byUrl = new Map(pages.map((page) => [page.canonical, page]));

for (const page of pages) {
  for (const { hreflang, href } of page.alternates) {
    if (href === page.canonical) continue;

    const other = byUrl.get(href);
    if (!other) {
      fail(page.file, `hreflang="${hreflang}" points at ${href}, which the build does not contain`);
      continue;
    }
    if (!other.alternates.some((alternate) => alternate.href === page.canonical)) {
      fail(page.file, `hreflang="${hreflang}" points at ${href}, which does not link back`);
    }
  }
}

/* The sitemap is generated from these same pages, so a mismatch means one of the
   two readings of the build is wrong. */
const sitemap = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc));

for (const page of pages) {
  if (!listed.has(page.canonical)) problems.push(`sitemap.xml is missing ${page.canonical}`);
}
for (const loc of listed) {
  if (!byUrl.has(loc)) problems.push(`sitemap.xml lists ${loc}, which is not an indexable page`);
}

/* -------------------------------------------------------------------- report */

if (problems.length) {
  console.error(`${problems.length} SEO problem(s):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(`SEO checks passed on ${pages.length} indexable page(s).`);
