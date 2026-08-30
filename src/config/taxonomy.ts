import { LOCALES, localePath, type Locale } from './locales';

/**
 * Deliberately few categories. Country and theme granularity (`germany`,
 * `foh-boh`, `software-comparison`) belongs in an article's `tags`, which can be
 * given their own routes later without touching the content model.
 */
export const CATEGORIES = ['tip-splitting', 'operations', 'compliance', 'guides'] as const;

export type Category = (typeof CATEGORIES)[number];

interface CategoryCopy {
  /** Short label for pills and filter rows. */
  label: string;
  /**
   * URL segment. Localized on purpose: German readers search German words, and
   * a category URL is one of the few things that is cheap to get right up front.
   */
  slug: string;
  /** `<h1>` and page title for the category listing. */
  heading: string;
  /** Intro paragraph, reused as the category page's meta description. */
  description: string;
}

export const categoryCopy: Record<Category, Record<Locale, CategoryCopy>> = {
  'tip-splitting': {
    en: {
      label: 'Tip splitting & pooling',
      slug: 'tip-splitting',
      heading: 'Tip splitting and pooling',
      description:
        'How teams divide tips: equal splits, hours-weighted shares, points systems and pooled tronc arrangements, with worked examples you can copy.',
    },
    de: {
      label: 'Trinkgeld aufteilen & Tronc',
      slug: 'trinkgeld-aufteilen',
      heading: 'Trinkgeld aufteilen und Tronc',
      description:
        'Wie Teams Trinkgeld aufteilen: gleichmäßig, nach Stunden, nach Punkten oder über eine Tronc-Kasse – mit Rechenbeispielen, die du direkt übernehmen kannst.',
    },
  },
  operations: {
    en: {
      label: 'Restaurant operations',
      slug: 'restaurant-operations',
      heading: 'Restaurant operations',
      description:
        'Shift handovers, rota planning and the day-to-day routines that decide whether a tip split takes two minutes or twenty.',
    },
    de: {
      label: 'Restaurantbetrieb',
      slug: 'restaurantbetrieb',
      heading: 'Restaurantbetrieb',
      description:
        'Schichtübergaben, Dienstplanung und die täglichen Abläufe, die entscheiden, ob eine Trinkgeldabrechnung zwei Minuten oder zwanzig dauert.',
    },
  },
  compliance: {
    en: {
      label: 'Rules & compliance',
      slug: 'rules-and-compliance',
      heading: 'Rules and compliance',
      description:
        'What the law says about tips in Germany and across Europe: tax treatment, payroll, record keeping and where the lines actually sit.',
    },
    de: {
      label: 'Regeln & Compliance',
      slug: 'regeln-und-compliance',
      heading: 'Regeln und Compliance',
      description:
        'Was für Trinkgeld in Deutschland und Europa gilt: Steuern, Lohnabrechnung, Aufzeichnungspflichten – und wo die Grenzen tatsächlich verlaufen.',
    },
  },
  guides: {
    en: {
      label: 'Product guides',
      slug: 'product-guides',
      heading: 'Product guides',
      description:
        'Step-by-step walkthroughs for setting up splits, teams and recurring rules in Tipza.',
    },
    de: {
      label: 'Produkt-Guides',
      slug: 'produkt-guides',
      heading: 'Produkt-Guides',
      description:
        'Schritt-für-Schritt-Anleitungen, um Aufteilungen, Teams und wiederkehrende Regeln in Tipza einzurichten.',
    },
  },
};

export const isCategory = (value: string): value is Category =>
  CATEGORIES.includes(value as Category);

export const categoryLabel = (category: Category, locale: Locale): string =>
  categoryCopy[category][locale].label;

export const categorySlug = (category: Category, locale: Locale): string =>
  categoryCopy[category][locale].slug;

/** Reverse lookup for `getStaticPaths`, which only receives the URL segment. */
export const categoryFromSlug = (slug: string, locale: Locale): Category | undefined =>
  CATEGORIES.find((category) => categorySlug(category, locale) === slug);

/** Locale-relative path, e.g. `blog/category/tip-splitting/`. */
export const categoryRelativePath = (category: Category, locale: Locale): string =>
  `blog/category/${categorySlug(category, locale)}/`;

export const categoryHref = (category: Category, locale: Locale): string =>
  localePath(locale, categoryRelativePath(category, locale));

/**
 * Every category exists in every locale, but at a different slug, so hreflang
 * needs the per-locale paths rather than one shared path.
 */
export const categoryPaths = (category: Category): Record<Locale, string> =>
  Object.fromEntries(
    LOCALES.map((locale) => [locale, categoryRelativePath(category, locale)])
  ) as Record<Locale, string>;
