import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { site } from '~/config/site';

/**
 * Social previews are derived from the article's own cover rather than drawn as
 * a separate asset. One image per article, cropped once at build time, and
 * nothing extra for a writer to produce or keep in step with the headline.
 */
export interface OgImage {
  /** Root-relative or absolute; `BaseHead` resolves it against the site URL. */
  url: string;
  width: number;
  height: number;
  alt?: string;
}

/** What Facebook, LinkedIn, Slack and X all render at, so nothing is cropped twice. */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const defaultOgImage: OgImage = {
  url: site.defaultOgImage,
  width: OG_WIDTH,
  height: OG_HEIGHT,
};

/**
 * JPEG rather than WebP on purpose: several link unfurlers still fetch the
 * `og:image` with a client that will not decode WebP, and a preview that fails
 * to render is worse than one that is 40 KB larger.
 */
export async function coverOgImage(cover: ImageMetadata, alt?: string): Promise<OgImage> {
  const image = await getImage({
    src: cover,
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fit: 'cover',
    position: 'center',
    format: 'jpeg',
    quality: 82,
  });

  return { url: image.src, width: OG_WIDTH, height: OG_HEIGHT, alt };
}
