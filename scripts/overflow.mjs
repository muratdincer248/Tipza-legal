// Finds the elements that make a page scroll sideways, which is the only
// reliable way to locate the one box that is 20px too wide.
//
// Boxes inside a horizontal scroll container are skipped: they are meant to
// overflow, and Chromium's own scrollWidth reporting counts them anyway.
//
// The containers themselves are reported separately as `scrollers`. A table
// scrolling at 390px is the design working; the same table scrolling at 1440px
// means its content is too wide for the article column, and the reader loses a
// column off the right edge without being told. Only the second is a bug, so a
// scroller is reported as a failure from `DESKTOP` up and as a note below it.
//
// Widths are not a fixed list. A layout breaks inside a band, and a band with
// no sample in it is a bug that ships: `scale(1.18)` on the hero image escaped
// the viewport from 924px to 1160px and survived a sweep that looked at 390px
// and 1440px. So the widths come from the stylesheets themselves — every
// `min-width`/`max-width` in the CSS, each one and the pixel below it, plus the
// container token, which is a breakpoint in everything but syntax.
//
//   node scripts/overflow.mjs                     every page in the sitemap
//   node scripts/overflow.mjs /en/                one page, the same widths
//   node scripts/overflow.mjs /en/ 1024,1100      one page, widths given
//   node scripts/overflow.mjs /en/ --scan         one page, every 4px, prints bands
import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'node:fs';

const ORIGIN = 'http://localhost:8081';
const DESKTOP = 1024;

/** Every width the stylesheets change their mind at, plus the pixel below it. */
function breakpointWidths() {
  const css = readdirSync('src/styles')
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`src/styles/${f}`, 'utf8'))
    .join('\n');

  const widths = new Set([360, 390, 768, 1440, 1920]);
  for (const [, w] of css.matchAll(/\((?:min|max)-width:\s*(\d+)px\)/g)) {
    widths.add(Number(w));
    widths.add(Number(w) - 1);
  }
  /* The container stops growing at its max-width, which redistributes the
     surplus to the margins rather than to the columns — the same kind of
     discontinuity as a media query, and where the hero bug's band ended. */
  for (const [, w] of css.matchAll(/--container:\s*(\d+)px/g)) {
    widths.add(Number(w));
    widths.add(Number(w) - 1);
    widths.add(Number(w) + 80);
  }
  return [...widths].sort((a, b) => a - b);
}

function sitemapPaths() {
  const xml = readFileSync('dist/sitemap.xml', 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

/** Runs in the page. Returns what is escaping and what is scrolling. */
function measure(viewportWidth) {
  const inScroller = (el) => {
    for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
      if (getComputedStyle(node).overflowX !== 'visible') return true;
    }
    return false;
  };

  const describe = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? `#${el.id}` : '') +
    (typeof el.className === 'string' && el.className.trim()
      ? `.${el.className.trim().split(/\s+/).join('.')}`
      : '');

  const offenders = [];
  const scrollers = [];
  for (const el of document.querySelectorAll('body *')) {
    const box = el.getBoundingClientRect();
    if (box.width === 0) continue;

    /* `clientWidth > 40` skips the visually-hidden 1px boxes that clip their own
       text on purpose, which are otherwise the bulk of the matches.

       `clip` is exempt because it is not scrollable and, unlike the rest, it is
       a statement of intent: an author writing it has said this box bleeds and
       stops here. `hidden` stays in — it swallows content the same way but is
       reachable by script, so it is usually somebody's accident. */
    const overflowX = getComputedStyle(el).overflowX;
    if (
      el.clientWidth > 40 &&
      overflowX !== 'visible' &&
      overflowX !== 'clip' &&
      el.scrollWidth > el.clientWidth + 1
    ) {
      scrollers.push({
        selector: describe(el),
        label: el.getAttribute('aria-labelledby')
          ? (document.getElementById(el.getAttribute('aria-labelledby'))?.textContent ?? '').trim()
          : '',
        visible: el.clientWidth,
        content: el.scrollWidth,
      });
    }

    if (inScroller(el)) continue;
    if (box.right > viewportWidth + 1 || box.left < -1) {
      offenders.push({
        selector: describe(el),
        left: Math.round(box.left),
        right: Math.round(box.right),
      });
    }
  }

  /* body, not documentElement: Chromium inflates the latter to the width of the
     widest box inside any scroller, so it reports overflow that cannot be
     scrolled to. */
  return { bodyScrollWidth: document.body.scrollWidth, viewportWidth, offenders, scrollers };
}

const [pathArg, widthArg] = process.argv.slice(2);
const scan = widthArg === '--scan';
const paths = pathArg ? [pathArg] : sitemapPaths();
const widths = scan
  ? Array.from({ length: (1600 - 320) / 4 + 1 }, (_, i) => 320 + i * 4)
  : widthArg
    ? widthArg.split(',').map(Number)
    : breakpointWidths();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: widths[0], height: 900 } });

/* --scan answers "where does it break", not "what is broken": it walks a single
   page in small steps and collapses the failures into the bands they form, so a
   fix can be aimed at the range rather than at the one width that was noticed. */
if (scan) {
  const [only] = paths;
  const bands = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${ORIGIN}${only}`, { waitUntil: 'load' });
    const { bodyScrollWidth } = await page.evaluate(measure, width);
    const over = bodyScrollWidth - width;
    if (over <= 1) continue;
    const last = bands.at(-1);
    if (last && last.to === width - 4) {
      last.to = width;
      last.worst = Math.max(last.worst, over);
    } else {
      bands.push({ from: width, to: width, worst: over });
    }
  }
  console.log(
    bands.length
      ? bands.map((b) => `${only} overflows from ${b.from}px to ${b.to}px, by up to ${b.worst}px`).join('\n')
      : `${only} fits at every width from ${widths[0]}px to ${widths.at(-1)}px.`,
  );
  await browser.close();
  process.exit(bands.length ? 1 : 0);
}

let failures = 0;
for (const width of widths) {
  await page.setViewportSize({ width, height: 900 });
  for (const path of paths) {
    await page.goto(`${ORIGIN}${path}`, { waitUntil: 'load' });
    const report = await page.evaluate(measure, width);

    const escaped = report.bodyScrollWidth > width + 1;
    const wrongScrollers = width >= DESKTOP ? report.scrollers : [];
    if (!escaped && !report.offenders.length && !wrongScrollers.length) continue;

    failures++;
    console.log(`\n${width}px  ${path}`);
    if (escaped) console.log(`  page scrolls sideways to ${report.bodyScrollWidth}px`);
    for (const o of report.offenders) {
      console.log(`  escapes  ${o.selector}  [${o.left}, ${o.right}]`);
    }
    for (const s of wrongScrollers) {
      const label = s.label ? ` (${s.label})` : '';
      console.log(`  scrolls  ${s.selector}${label}  ${s.visible}px shows ${s.content}px`);
    }
  }
}

await browser.close();
console.log(
  failures
    ? `\n${failures} page/width combination(s) with overflow.`
    : `\nNo overflow: ${paths.length} page(s) at ${widths.length} widths (${widths[0]}–${widths.at(-1)}px).`,
);
process.exit(failures ? 1 : 0);
