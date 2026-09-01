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

  /** Shared copy for QR + store download blocks. */
  appDownload: {
    qrHeadline: string;
    qrScanLabel: string;
    qrSupporting: string;
    storeBadgesLabel: string;
  };

  /** Utility /download landing page (English-first; not locale-prefixed). */
  downloadPage: {
    title: string;
    heading: string;
    body: string;
    homeCta: string;
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
    /** Heading above the sibling categories at the foot of a category page. */
    otherTopicsLabel: string;
    /** Filter pill that clears the category filter. */
    allTopics: string;
    /** Link back from a category page to the full listing. */
    allArticles: string;
    /** Accessible label for the article grid. */
    articlesLabel: string;

    /** Byline prefix, e.g. `By Tipza Team`. */
    byPrefix: string;
    /** Prefix before the revision date. */
    updatedPrefix: string;
    /** Unit appended to the reading-time number, e.g. `6 min read`. */
    minRead: string;

    /** Heading for the table of contents. */
    tocLabel: string;
    /** Heading for the references section. */
    sourcesLabel: string;
    /** Prefix before a source access date. */
    accessedLabel: string;
    breadcrumbLabel: string;
    home: string;

    /** Heading above the further-reading cards at the foot of an article. */
    relatedLabel: string;

    /** The landing page's blog section. */
    teaser: {
      heading: string;
      lead: string;
      /** Link from the teaser through to the blog index. */
      cta: string;
    };

    /**
     * In-article CTA heading and fallback body. An article can override `body`
     * via `productCtaBody` so the pitch matches the piece; the heading stays
     * shared so the card is recognisable from one article to the next.
     */
    productCta: {
      heading: string;
      body: string;
      cta: string;
    };

    pagination: {
      label: string;
      previous: string;
      next: string;
    };

    /**
     * The rating widget at the foot of an article. `reasons` keys match
     * `FEEDBACK_REASONS` in `src/lib/feedback.ts`.
     */
    feedback: {
      question: string;
      yes: string;
      no: string;
      /** Asked only after a negative rating. */
      followUp: string;
      reasons: {
        'not-what-i-searched': string;
        'too-general': string;
        'something-wrong': string;
        'hard-to-follow': string;
      };
      skip: string;
      thanks: string;
    };
  };

  /**
   * Text emitted by editorial blocks inside article bodies. Blocks are imported
   * into MDX and cannot be handed a locale as a prop, so they read it back from
   * the URL and look it up here — otherwise every German article would have to
   * remember to pass "Ja" and "Nein" by hand.
   */
  blocks: {
    /** Hidden text behind a comparison table's tick. */
    supported: string;
    /** Hidden text behind a comparison table's dash. */
    notSupported: string;
    /** Heads the direct answer near the top of an article. */
    answerLabel: string;
    /** Heads the summary bullets above an article. */
    takeawaysLabel: string;
    /** Accessible label on a heading's copy-link control. */
    copyLinkLabel: string;
    /** Confirmation after the section URL is copied. */
    linkCopied: string;
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
