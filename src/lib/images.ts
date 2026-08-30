import type { ImageMetadata } from 'astro';

/**
 * Caps a srcset ladder at the source's own width. Asking Astro for a 1600px
 * variant of a 658px original produces an upscaled, softer file that is larger
 * than the original for no gain, so candidates above the source are dropped and
 * the source width is used as the top rung.
 */
export const coverWidths = (image: ImageMetadata, candidates: number[]): number[] => {
  const fitting = candidates.filter((width) => width < image.width);
  return [...fitting, image.width];
};
