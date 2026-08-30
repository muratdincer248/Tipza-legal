interface CardItem {
  image: string;
  imageAlt: string;
  heading: string;
  body: string;
}

interface Step {
  heading: string;
  body: string;
}

interface FaqItem {
  question: string;
  /** May contain inline HTML (<strong>, <em>). */
  answer: string;
}

/**
 * Every locale must provide this exact shape, so a missing translation is a
 * type error rather than a silently untranslated string at runtime.
 */
export interface Dictionary {
  htmlLang: string;
  ogLocale: string;

  meta: {
    homeTitle: string;
    homeDescription: string;
    homeOgDescription: string;
  };

  nav: {
    purpose: string;
    how: string;
    benefits: string;
    pro: string;
    faq: string;
    contact: string;
    blog: string;
    menu: string;
    skipToContent: string;
  };

  hero: {
    heading: string;
    lead: string;
    imageAlt: string;
  };

  purpose: {
    heading: string;
    items: CardItem[];
  };

  how: {
    heading: string;
    lead: string;
    stepsLabel: string;
    steps: Step[];
    note: { heading: string; body: string };
  };

  benefits: {
    heading: string;
    lead: string;
    listLabel: string;
    items: CardItem[];
  };

  pro: {
    badgeAlt: string;
    heading: string;
    lead: string;
    benefits: string[];
  };

  faq: {
    heading: string;
    lead: string;
    items: FaqItem[];
  };

  downloadCta: {
    heading: string;
    body: string;
  };

  contact: {
    heading: string;
    lead: string;
    cardsLabel: string;
    privacy: { heading: string; body: string };
    terms: { heading: string; body: string };
    accountDeletion: { heading: string; body: string };
    supportEmail: { heading: string };
  };

  footer: {
    fineprint: string;
    privacy: string;
    terms: string;
    accountDeletion: string;
  };

  blog: {
    meta: {
      indexTitle: string;
      indexDescription: string;
      /** `<title>` for a category page; the category name is appended. */
      categoryTitleSuffix: string;
      /** `<title>` for pages 2+ of a listing, appended after the heading. */
      pageSuffix: string;
    };

    heading: string;
    lead: string;
    /** Empty-state copy for a locale with no published articles yet. */
    empty: string;

    /** Label on the lead article's card. */
    featuredLabel: string;
    /** Heading above the category filter row. */
    topicsLabel: string;
    /** Filter pill that clears the category filter. */
    allTopics: string;
    /** Link back from a category page to the full listing. */
    allArticles: string;
    /** Accessible label for the article grid. */
    articlesLabel: string;

    /** Byline prefix, e.g. `By Tipza Team`. */
    byPrefix: string;
    /** Prefix before the publication date, e.g. `Published 5 March 2026`. */
    publishedPrefix: string;
    /** Prefix before the revision date. */
    updatedPrefix: string;
    /** Unit appended to the reading-time number, e.g. `6 min read`. */
    minRead: string;

    breadcrumbLabel: string;
    home: string;

    pagination: {
      label: string;
      previous: string;
      next: string;
    };
  };

  languageSwitcher: {
    /** Accessible label for the selector control. */
    label: string;
    /** Suffix announced for the language that is already active. */
    currentSuffix: string;
    /** Hint shown for a language this page has no translation in. */
    notTranslated: string;
  };

  legal: {
    lastUpdatedLabel: string;
  };

  notFound: {
    title: string;
    heading: string;
    body: string;
    cta: string;
  };
}
