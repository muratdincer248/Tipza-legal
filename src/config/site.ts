export const site = {
  url: 'https://tipza.app',
  name: 'Tipza',
  supportEmail: 'support@tipza.app',
  appStoreUrl: 'https://apps.apple.com/us/app/tipza-tip-split-made-easy/id6756809306',
  appleAppId: '6756809306',
  /** Google Play listing is not live yet; buttons point at the download anchor. */
  googlePlayUrl: '#download',
  /** Smart download entry point used by QR codes and /download redirects. */
  downloadPageUrl: 'https://tipza.app/download',
  defaultOgImage: '/assets/images/website-hero-image.png',
} as const;

export const storeLinks = {
  apple: site.appStoreUrl,
  google: site.googlePlayUrl,
} as const;
