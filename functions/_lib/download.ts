import { detectPlatform, type Platform } from '../../src/lib/platform';
import { storeLinks } from '../../src/config/site';

export { detectPlatform, type Platform };

export function storeUrlForPlatform(platform: Platform): string | null {
  if (platform === 'ios') return storeLinks.apple;
  if (platform === 'android') return storeLinks.google;
  return null;
}

export function shouldRedirectFromDownload(platform: Platform): boolean {
  return platform === 'ios' || platform === 'android';
}
