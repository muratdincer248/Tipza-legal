#!/usr/bin/env node
/**
 * Generates the permanent download QR asset. The code always points at the smart
 * /download route so store destinations can change without replacing the image.
 *
 * Keep in sync with `site.downloadPageUrl` in src/config/site.ts.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const url = 'https://tipza.app/download';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/assets/images');
const pngPath = join(outDir, 'download-qr.png');
const svgPath = join(outDir, 'download-qr.svg');

await mkdir(outDir, { recursive: true });

await QRCode.toFile(pngPath, url, {
  type: 'png',
  width: 400,
  margin: 1,
  color: { dark: '#0A0705', light: '#FFFFFF' },
});

const svg = await QRCode.toString(url, {
  type: 'svg',
  margin: 1,
  color: { dark: '#0A0705', light: '#FFFFFF' },
});

await writeFile(svgPath, svg, 'utf8');

console.log(`Wrote ${pngPath} and ${svgPath} → ${url}`);
