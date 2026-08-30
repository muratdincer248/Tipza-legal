// Screenshot helper for eyeballing a page from the local build on :8081.
// Requires `npm i --no-save playwright`, kept out of package.json so Cloudflare
// builds do not download browsers.
//
//   node scripts/shoot.mjs <path> [width] [tag] [--open-lang] [--full]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [path = '/', width = '1440', tag = 'shot', ...flags] = process.argv.slice(2);
mkdirSync('/tmp/visual', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(`http://localhost:8081${path}`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

if (flags.includes('--open-lang')) {
  await page.click('[data-lang-switcher] summary');
  await page.waitForTimeout(300);
}

await page.waitForTimeout(500);
await page.screenshot({
  path: `/tmp/visual/${tag}.png`,
  fullPage: flags.includes('--full'),
});
await browser.close();
console.log(`/tmp/visual/${tag}.png`);
