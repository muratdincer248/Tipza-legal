/**
 * Device / OS detection shared by the download route, edge function, and
 * client-side CTA switching. Keep heuristics in one place so marketing pages
 * and redirects stay aligned.
 */
export type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

/** True when the UA looks like a phone or tablet rather than a laptop/desktop. */
export const isMobilePlatform = (platform: Platform): boolean =>
  platform === 'ios' || platform === 'android';

/**
 * Detect the visitor platform from a User-Agent string (and optional touch hint
 * for iPadOS desktop-mode UAs, which only exist in the browser).
 */
export function detectPlatform(
  userAgent: string,
  maxTouchPoints = 0,
): Platform {
  const ua = userAgent.toLowerCase();

  if (/android/.test(ua)) return 'android';

  if (/iphone|ipod|ipad/.test(ua)) return 'ios';

  // iPadOS 13+ may report a Mac desktop UA while still being touch-first iOS.
  if (/macintosh/.test(ua)) {
    if (maxTouchPoints > 1) return 'ios';
    // Safari on iPadOS often keeps a Mobile token in the UA string.
    if (/mobile/.test(ua)) return 'ios';
  }

  if (!userAgent.trim()) return 'unknown';

  return 'desktop';
}

/** Minified platform detection for an inline head script (no build step). */
export const platformDetectScript = `(function(){try{var ua=navigator.userAgent||'';var tp=navigator.maxTouchPoints||0;var p='desktop';var l=ua.toLowerCase();if(/android/.test(l))p='android';else if(/iphone|ipod|ipad/.test(l))p='ios';else if(/macintosh/.test(l)&&(tp>1||/mobile/.test(l)))p='ios';document.documentElement.dataset.platform=p;}catch(e){}})();`;
