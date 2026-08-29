// Screenshots the ported build against the pre-Astro original at several
// viewports and reports per-viewport pixel differences. Migration aid only.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 900 },
  { name: 'tablet', width: 768, height: 1000 },
  { name: 'laptop', width: 1024, height: 1000 },
  { name: 'desktop', width: 1440, height: 1000 },
];

const PAGES = process.argv[2] ? [process.argv[2]] : ['/'];

mkdirSync('/tmp/visual', { recursive: true });

const browser = await chromium.launch();

const shoot = async (base, path, vp, file) => {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto(`${base}${path}`, { waitUntil: 'load' });
  // Let fonts settle so text metrics match between runs.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
};

const compare = (a, b) => {
  const pa = PNG.sync.read(readFileSync(a));
  const pb = PNG.sync.read(readFileSync(b));
  if (pa.width !== pb.width || pa.height !== pb.height) {
    return { sizeMismatch: `${pa.width}x${pa.height} vs ${pb.width}x${pb.height}` };
  }
  let diff = 0;
  for (let i = 0; i < pa.data.length; i += 4) {
    if (
      Math.abs(pa.data[i] - pb.data[i]) > 8 ||
      Math.abs(pa.data[i + 1] - pb.data[i + 1]) > 8 ||
      Math.abs(pa.data[i + 2] - pb.data[i + 2]) > 8
    )
      diff++;
  }
  const total = pa.width * pa.height;
  return { diff, total, pct: ((diff / total) * 100).toFixed(3) };
};

for (const path of PAGES) {
  for (const vp of VIEWPORTS) {
    const tag = `${path.replace(/\W+/g, '_')}-${vp.name}`;
    const fileNew = `/tmp/visual/new-${tag}.png`;
    const fileOld = `/tmp/visual/old-${tag}.png`;
    await shoot('http://localhost:8081', path, vp, fileNew);
    await shoot('http://localhost:8082', path, vp, fileOld);
    const result = compare(fileNew, fileOld);
    console.log(`${path} ${vp.name.padEnd(8)}`, JSON.stringify(result));
  }
}

await browser.close();
