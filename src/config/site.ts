export const site = {
  url: 'https://tipza.app',
  name: 'Tipza',
  supportEmail: 'support@tipza.app',
  appStoreUrl: 'https://apps.apple.com/us/app/tipza-tip-split-made-easy/id6756809306',
  appleAppId: '6756809306',
  googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.tipza.app',
  /** Smart download entry point used by QR codes and /download redirects. */
  downloadPageUrl: 'https://tipza.app/download',
  defaultOgImage: '/assets/images/website-hero-image.png',
} as const;

export const storeLinks = {
  apple: site.appStoreUrl,
  google: site.googlePlayUrl,
} as const;
