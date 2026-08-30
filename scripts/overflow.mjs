// Finds the elements that make a page scroll sideways at a given width, which is
// the only reliable way to locate the one box that is 20px too wide.
//
// Boxes inside a horizontal scroll container are skipped: they are meant to
// overflow, and Chromium's own scrollWidth reporting counts them anyway.
//
//   node scripts/overflow.mjs <path> [width]
import { chromium } from 'playwright';

const [path = '/', width = '390'] = process.argv.slice(2);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(`http://localhost:8081${path}`, { waitUntil: 'load' });

const report = await page.evaluate((viewportWidth) => {
  const inScroller = (el) => {
    for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
      if (getComputedStyle(node).overflowX !== 'visible') return true;
    }
    return false;
  };

  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const box = el.getBoundingClientRect();
    if (box.width === 0 || inScroller(el)) continue;
    if (box.right > viewportWidth + 1 || box.left < -1) {
      offenders.push({
        selector:
          el.tagName.toLowerCase() +
          (el.id ? `#${el.id}` : '') +
          (typeof el.className === 'string' && el.className.trim()
            ? `.${el.className.trim().split(/\s+/).join('.')}`
            : ''),
        left: Math.round(box.left),
        right: Math.round(box.right),
      });
    }
  }

  /* body, not documentElement: Chromium inflates the latter to the width of the
     widest box inside any scroller, so it reports overflow that cannot be
     scrolled to. */
  return { bodyScrollWidth: document.body.scrollWidth, viewportWidth, offenders };
}, Number(width));

console.log(JSON.stringify(report, null, 2));
await browser.close();
