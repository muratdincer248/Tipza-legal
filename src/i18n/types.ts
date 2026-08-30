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
