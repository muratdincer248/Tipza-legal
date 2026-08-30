// Compares the built site against a reference server at several viewports and
// reports the differing pixel count plus the rows the differences fall in.
// Migration aid: run two static servers (8081 = build, 8082 = reference).
//
//   npm i --no-save playwright pngjs   # kept out of package.json so Cloudflare
//                                      # builds do not download browsers
//   node scripts/visual-diff.mjs /en/ /
//
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const [newPath = '/', oldPath = newPath] = process.argv.slice(2);
const VIEWPORTS = [390, 768, 1024, 1440];

mkdirSync('/tmp/visual', { recursive: true });
const browser = await chromium.launch();

const shoot = async (url, width) => {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const buffer = await page.screenshot({ fullPage: true });
  await page.close();
  return { png: PNG.sync.read(buffer), buffer };
};

for (const width of VIEWPORTS) {
  const a = await shoot(`http://localhost:8081${newPath}`, width);
  const b = await shoot(`http://localhost:8082${oldPath}`, width);

  if (a.png.width !== b.png.width || a.png.height !== b.png.height) {
    console.log(
      `${width}px: size mismatch ${a.png.width}x${a.png.height} vs ${b.png.width}x${b.png.height}`
    );
    writeFileSync(`/tmp/visual/diff-new-${width}.png`, a.buffer);
    writeFileSync(`/tmp/visual/diff-old-${width}.png`, b.buffer);
    continue;
  }

  let diff = 0;
  const rowCounts = new Map();
  for (let y = 0; y < a.png.height; y++) {
    let inRow = 0;
    for (let x = 0; x < a.png.width; x++) {
      const i = (y * a.png.width + x) * 4;
      const changed =
        Math.abs(a.png.data[i] - b.png.data[i]) > 8 ||
        Math.abs(a.png.data[i + 1] - b.png.data[i + 1]) > 8 ||
        Math.abs(a.png.data[i + 2] - b.png.data[i + 2]) > 8;
      if (changed) inRow++;
    }
    if (inRow) rowCounts.set(y, inRow);
    diff += inRow;
  }

  /* Contiguous bands of differing rows, so two small intentional edits read
     differently from one page-wide layout shift. */
  const bands = [];
  for (const y of [...rowCounts.keys()].sort((p, q) => p - q)) {
    const last = bands.at(-1);
    if (last && y - last.end <= 8) {
      last.end = y;
      last.px += rowCounts.get(y);
    } else {
      bands.push({ start: y, end: y, px: rowCounts.get(y) });
    }
  }

  const total = a.png.width * a.png.height;
  console.log(
    `${width}px: ${diff} px (${((diff / total) * 100).toFixed(3)}%) of ${a.png.height} rows`
  );
  for (const band of bands) {
    console.log(`    rows ${band.start}-${band.end}: ${band.px} px`);
  }
}

await browser.close();
