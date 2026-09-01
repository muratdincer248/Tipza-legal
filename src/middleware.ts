import { defineMiddleware } from 'astro:middleware';
import { redirectToDefaultLocale } from 'astro:i18n';
import { LOCALES } from './config/locales';

/**
 * Routes that intentionally sit outside the /[locale]/ prefix. With
 * prefixDefaultLocale enabled, Astro's built-in i18n middleware returns 404
 * for these in dev even though they build correctly. Manual routing with this
 * allowlist keeps /download and /ios working locally and in production.
 */
const UNLOCALIZED = ['/download', '/ios'] as const;

const isUnlocalized = (pathname: string): boolean =>
  UNLOCALIZED.some((route) => pathname === route || pathname === `${route}/`);

const hasLocalePrefix = (pathname: string): boolean => {
  const segment = pathname.split('/').filter(Boolean)[0] ?? '';
  return (LOCALES as readonly string[]).includes(segment);
};

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (pathname === '/download') {
    return context.redirect('/download/', 301);
  }

  if (isUnlocalized(pathname)) return next();

  if (pathname === '/' || pathname === '') {
    return redirectToDefaultLocale(context, 302);
  }

  if (hasLocalePrefix(pathname)) return next();

  // Static assets, Astro chunks, and other non-page paths.
  if (pathname.startsWith('/_astro') || pathname.startsWith('/assets') || /\.\w+$/.test(pathname)) {
    return next();
  }

  return next();
});
