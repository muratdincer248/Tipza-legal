import type { ImageMetadata } from 'astro';

/**
 * Caps a srcset ladder at the source's own width. A candidate wider than the
 * original produces an upscaled, softer file that is larger than the original
 * for no gain, so those rungs are dropped and the source width becomes the top
 * one. Covers are authored at 1536px, but this keeps a smaller file that slips
 * in from degrading rather than failing.
 */
export const coverWidths = (image: ImageMetadata, candidates: number[]): number[] => {
  const fitting = candidates.filter((width) => width < image.width);
  return [...fitting, image.width];
};
