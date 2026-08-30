// Derives an article cover from a source photo, cropped to the 16:9 ratio the
// cards and the article header display it at, so the browser is not asked to
// download pixels that CSS then crops away.
//
//   node scripts/make-cover.mjs <source> <translationKey> [gravity]
//
// sharp comes with Astro's image pipeline, so there is nothing extra to install.
//
// `gravity` is a sharp position (centre, top, bottom, …); pick whichever keeps
// the subject in frame. Source photos should be at least 1600px wide.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { statSync } from 'node:fs';

const [source, key, gravity = 'centre'] = process.argv.slice(2);
if (!source || !key) throw new Error('usage: make-cover.mjs <source> <translationKey> [gravity]');

const dir = `src/assets/blog/${key}`;
mkdirSync(dir, { recursive: true });

const { width = 0 } = await sharp(source).metadata();
const target = Math.min(1600, width);

const out = `${dir}/cover.png`;
await sharp(source)
  .resize(target, Math.round((target * 9) / 16), { fit: 'cover', position: gravity })
  .png({ compressionLevel: 9 })
  .toFile(out);

const meta = await sharp(out).metadata();
console.log(`${out}  ${meta.width}x${meta.height}  ${Math.round(statSync(out).size / 1024)} KB`);
