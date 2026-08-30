// Splits a tall full-page screenshot into viewport-sized slices, because a
// 12000px image reviewed at once is a thumbnail.
//
//   node scripts/slice.mjs /tmp/visual/shot.png [sliceHeight]
import sharp from 'sharp';
import { basename, dirname, join } from 'node:path';

const [file, sliceHeight = '1400'] = process.argv.slice(2);
const height = Number(sliceHeight);
const name = basename(file, '.png');
const dir = dirname(file);

const meta = await sharp(file).metadata();
const count = Math.ceil(meta.height / height);

for (let i = 0; i < count; i += 1) {
  const top = i * height;
  const out = join(dir, `${name}-${String(i).padStart(2, '0')}.png`);
  await sharp(file)
    .extract({ left: 0, top, width: meta.width, height: Math.min(height, meta.height - top) })
    .toFile(out);
  console.log(out);
}
