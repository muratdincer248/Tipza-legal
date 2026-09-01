import { detectPlatform, shouldRedirectFromDownload, storeUrlForPlatform } from './_lib/download';

interface Env {
  EVENTS?: AnalyticsEngineDataset;
}

const redirect = (url: string): Response => Response.redirect(url, 302);

const logRedirect = (env: Env, platform: string): void => {
  env.EVENTS?.writeDataPoint({
    indexes: ['smart_download_redirect'],
    blobs: ['smart_download_redirect', '/download/', platform],
    doubles: [1],
  });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const ua = context.request.headers.get('User-Agent') ?? '';
  const platform = detectPlatform(ua);
  const target = storeUrlForPlatform(platform);

  if (shouldRedirectFromDownload(platform) && target && !target.startsWith('#')) {
    logRedirect(context.env, platform);
    return redirect(target);
  }

  return context.next();
};
