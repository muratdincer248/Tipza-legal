import type { Dictionary } from '~/i18n/types';

export interface NavLink {
  href: string;
  label: string;
}

/**
 * Navigation is built from a locale base path (`/en/`) so the landing-page
 * anchors keep working from subpages, where a bare `#purpose` would not.
 */
export const primaryNav = (dict: Dictionary, base: string): NavLink[] => [
  { href: `${base}#purpose`, label: dict.nav.purpose },
  { href: `${base}#how`, label: dict.nav.how },
  { href: `${base}#benefits`, label: dict.nav.benefits },
  { href: `${base}#pro`, label: dict.nav.pro },
  { href: `${base}#faq`, label: dict.nav.faq },
  { href: `${base}#contact`, label: dict.nav.contact },
];

export const footerNav = (dict: Dictionary, base: string): NavLink[] => [
  { href: `${base}#purpose`, label: dict.nav.purpose },
  { href: `${base}#how`, label: dict.nav.how },
  { href: `${base}#pro`, label: dict.nav.pro },
  { href: `${base}#faq`, label: dict.nav.faq },
  { href: `${base}privacy/`, label: dict.footer.privacy },
  { href: `${base}terms/`, label: dict.footer.terms },
  { href: `${base}account-deletion/`, label: dict.footer.accountDeletion },
];
