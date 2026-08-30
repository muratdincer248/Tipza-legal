// Screenshot helper for eyeballing a page from the local build on :8081.
// Requires `npm i --no-save playwright`, kept out of package.json so Cloudflare
// builds do not download browsers.
//
//   node scripts/shoot.mjs <path> [width] [tag] [--open-lang] [--full]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const [path = '/', width = '1440', tag = 'shot', ...flags] = process.argv.slice(2);
const viewportWidth = Number(width);
const file = `/tmp/visual/${tag}.png`;
mkdirSync('/tmp/visual', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: viewportWidth, height: 900 } });
await page.goto(`http://localhost:8081${path}`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

if (flags.includes('--open-lang')) {
  await page.click('[data-lang-switcher] summary');
  await page.waitForTimeout(300);
}

/* Lazy images below the fold never load in a capture of a page nobody scrolled,
   so a full-page shot shows empty cover slots that are fine in a browser. Making
   them eager and waiting for them is more reliable than scrolling and hoping. */
if (flags.includes('--full')) {
  await page.evaluate(async () => {
    const images = [...document.querySelectorAll('img[loading="lazy"]')];
    for (const image of images) image.loading = 'eager';
    const settled = (image) =>
      new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 4000);
      });

    await Promise.all(images.filter((image) => !image.complete).map(settled));
  });
}

await page.waitForTimeout(500);
await page.screenshot({ path: file, fullPage: flags.includes('--full') });
await browser.close();

/* Chromium reports `documentElement.scrollWidth` as wide as the widest box
   inside a horizontal scroll container, even though the page itself does not
   scroll, and a full-page capture inherits that width. Trimming keeps the image
   the width a reader actually sees. */
const meta = await sharp(file).metadata();
if (meta.width > viewportWidth) {
  const trimmed = await sharp(file)
    .extract({ left: 0, top: 0, width: viewportWidth, height: meta.height })
    .toBuffer();
  await sharp(trimmed).toFile(file);
  console.log(`${file} (trimmed from ${meta.width}px to ${viewportWidth}px)`);
} else {
  console.log(file);
}
