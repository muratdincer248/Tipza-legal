// Derives an article cover from a source photo, cropped to the 16:9 ratio the
// cards and the article header display it at, so the browser is not asked to
// download pixels that CSS then crops away.
//
//   node scripts/make-cover.mjs <source> <translationKey> [gravity]
//
// sharp comes with Astro's image pipeline, so there is nothing extra to install.
//
// `gravity` is a sharp position (centre, top, bottom, …); pick whichever keeps
// the subject in frame. Source photos should be at least 1536px wide: that is
// 2x the widest the cover is ever displayed at, and comfortably above the
// 1200px an `og:image` needs, so nothing downstream has to upscale.
//
// The committed cover is JPEG rather than PNG because these are photographs —
// PNG stores them losslessly at ten times the size, and Astro re-encodes to
// AVIF/WebP for delivery anyway, so the extra bytes would only bloat the repo.
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';

const [source, key, gravity = 'centre'] = process.argv.slice(2);
if (!source || !key) throw new Error('usage: make-cover.mjs <source> <translationKey> [gravity]');

const dir = `src/assets/blog/${key}`;
mkdirSync(dir, { recursive: true });

const { width = 0 } = await sharp(source).metadata();
const target = Math.min(1536, width);
if (width < 1536) console.warn(`warning: ${source} is only ${width}px wide; covers want 1536px.`);

const out = `${dir}/cover.jpg`;
await sharp(source)
  .resize(target, Math.round((target * 9) / 16), { fit: 'cover', position: gravity })
  .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
  .toFile(out);

const meta = await sharp(out).metadata();
console.log(`${out}  ${meta.width}x${meta.height}  ${Math.round(statSync(out).size / 1024)} KB`);
