import type { Dictionary } from './types';

export const en: Dictionary = {
  htmlLang: 'en',
  ogLocale: 'en_US',

  meta: {
    homeTitle: 'Tipza — Fair Tip Splits Made Simple',
    homeDescription:
      'Tipza helps teams split tips fairly and transparently. Add the bill and tip, choose a split method (equal, hours, points, or custom weights), and share the final breakdown.',
    homeOgDescription:
      'Tipza helps teams split tips fairly and transparently. Choose equal, hours, points, or custom weights and share the breakdown.',
  },

  nav: {
    purpose: 'Purpose',
    how: 'How it works',
    benefits: 'Benefits',
    pro: 'Pro',
    faq: 'FAQ',
    contact: 'Contact',
    blog: 'Blog',
    menu: 'Menu',
    skipToContent: 'Skip to content',
  },

  hero: {
    heading: 'Fair tips, no drama',
    lead: "Tipza helps service teams split tips fairly and stress free. Just add the total, choose how you want to split it, and Tipza instantly shows everyone's share clearly and consistently.",
    imageAlt: 'Tipza app preview',
  },

  purpose: {
    heading: 'What Tipza is and why it exists',
    items: [
      {
        image: '/assets/images/Fairness.png',
        imageAlt: 'Fairness',
        heading: "Fair splits that match your team's rules",
        body: 'Every workplace is different. Choose equal, hours-based, points, or weighted splits that reflect how your team actually works.',
      },
      {
        image: '/assets/images/Clarity.png',
        imageAlt: 'Clarity',
        heading: 'Clear calculations everyone can follow',
        body: 'Tipza shows the inputs and final shares, so everyone understands the breakdown at a glance.',
      },
      {
        image: '/assets/images/Speed.png',
        imageAlt: 'Speed',
        heading: 'Done in minutes, not debates',
        body: 'Add the total, pick a method, and share the result. Spend less time calculating and more time closing the shift.',
      },
    ],
  },

  how: {
    heading: 'How Tipza works',
    lead: 'Tipza guides you through a simple flow so tip pools are split the same way every time.',
    stepsLabel: 'How it works steps',
    steps: [
      {
        heading: 'Add the totals',
        body: 'Enter the tip pool amount (and any relevant adjustments your team uses).',
      },
      {
        heading: 'Choose the date or date range for the shift',
        body: 'Select the specific date or range when tips were earned. This helps you organize and track splits by shift or pay period.',
      },
      {
        heading: 'Add team members',
        body: 'Include everyone who shares tips for the shift (e.g., servers, bartenders, support roles).',
      },
      {
        heading: 'Review and share',
        body: 'Tipza calculates each person’s share and presents a clean breakdown you can share with the team.',
      },
    ],
    note: {
      heading: 'Tipza is a calculator and organizer.',
      body: 'It records tip split calculations you enter and doesn’t collect, hold, or distribute funds. Payments, payroll, and tax compliance stay with your team and employer.',
    },
  },

  benefits: {
    heading: 'Benefits of using Tipza',
    lead: 'Tipza helps teams reduce misunderstandings and keep tip splits consistent—even when staffing and shifts vary.',
    listLabel: 'Benefits',
    items: [
      {
        image: '/assets/images/Less-conflict.png',
        imageAlt: 'Less conflict',
        heading: 'Less conflict',
        body: 'Clear inputs + clear outputs means fewer "who got what?" conversations.',
      },
      {
        image: '/assets/images/Consistent.png',
        imageAlt: 'Consistent across shifts',
        heading: 'Consistent across shifts',
        body: 'Use the same split method every night, or switch methods when the situation calls for it.',
      },
      {
        image: '/assets/images/Team-ready-sharing.png',
        imageAlt: 'Team-ready sharing',
        heading: 'Team-ready sharing',
        body: 'Share a simple breakdown so everyone sees the same numbers.',
      },
    ],
  },

  pro: {
    badgeAlt: 'Tipza Pro',
    heading: 'Upgrade to Pro',
    lead: 'Ideal for larger teams and frequent tip pooling—more control, more clarity, less friction.',
    benefits: ['Unlimited team members', 'Detailed statistics', 'Priority support'],
  },

  faq: {
    heading: 'FAQ',
    lead: 'Quick, clear answers about how Tipza works.',
    items: [
      {
        question: 'What is the primary purpose of Tipza?',
        answer:
          'Tipza helps service teams <strong>split tips fairly and consistently</strong>. Enter the total, pick a method, and get a clear breakdown for each person.',
      },
      {
        question: 'How does Tipza calculate a "fair" split?',
        answer:
          'Fair depends on your team’s rules. Tipza supports equal, hours, points, and custom weights—and applies the same method consistently every time.',
      },
      {
        question: 'Does Tipza handle payments or move money?',
        answer:
          'No. Tipza is a calculator and record keeper. It shows the split—payouts happen outside the app based on your workplace process.',
      },
      {
        question: 'Can I share the results with my team?',
        answer:
          'Yes. After you calculate a split, you can share the breakdown so everyone sees the same numbers.',
      },
      {
        question: 'Why does Tipza use Google and Apple Sign-In?',
        answer:
          'These methods help you sign in quickly and keep your data available across devices. Tipza only requests what’s needed for authentication and basic profile info.',
      },
      {
        question: 'What is Tipza Pro?',
        answer:
          'Tipza Pro is an upgraded tier that includes <strong>unlimited team members</strong>, <strong>detailed statistics and reports</strong> (trends, shift comparisons, month-over-month tracking), and <strong>priority support</strong>. You can upgrade from within the app.',
      },
      {
        question: 'How do Pro data insights work in the app?',
        answer:
          'With Pro, you get a dedicated <strong>Insights</strong> section in the app. Choose a time range (e.g. 30 days, 3 months, or 12 months) and see an <strong>overview</strong> of total tips distributed, hours worked, and tips per hour, plus month‑over‑month comparison. You can view <strong>trends by month</strong>, see how tips are distributed across your <strong>team</strong>, and compare <strong>shift types</strong> (e.g. morning vs evening vs weekend) if you add optional shift tags to your splits. Pro also surfaces short <strong>tips and suggestions</strong> to help you spot patterns and improve over time.',
      },
    ],
  },

  downloadCta: {
    heading: "Let's start fair splits now",
    body: 'Download Tipza and make tip splitting simple, fair, and stress-free for your team.',
  },

  contact: {
    heading: 'Contact',
    lead: 'Get in touch with our support team, or review our privacy policy and terms of service.',
    cardsLabel: 'Contact options',
    privacy: { heading: 'Privacy', body: 'Our privacy policy and data practices' },
    terms: { heading: 'Terms', body: 'Terms and conditions for using Tipza' },
    accountDeletion: {
      heading: 'Account and data deletion',
      body: 'How to delete your account and your data',
    },
    supportEmail: { heading: 'Support email' },
  },

  footer: {
    fineprint:
      'Tipza. Tipza helps teams calculate and share transparent tip splits. Tipza does not replace workplace policies—always follow your local rules and employer guidelines.',
    privacy: 'Privacy',
    terms: 'Terms',
    accountDeletion: 'Account deletion',
  },

  blog: {
    meta: {
      indexTitle: 'Tip splitting guides and resources — Tipza Blog',
      indexDescription:
        'Practical guides on splitting tips fairly: split methods, worked examples, German and European rules, and how to run it all without arguments.',
      categoryTitleSuffix: 'Tipza Blog',
      pageSuffix: 'page',
    },

    heading: 'Tipza Blog',
    lead: 'Practical writing about splitting tips fairly — the methods teams actually use, the rules that apply in Germany and across Europe, and the habits that keep a shift handover short.',
    empty: 'The first articles are on their way. In the meantime, English articles are available.',

    featuredLabel: 'Featured',
    topicsLabel: 'Browse by topic',
    allTopics: 'All topics',
    allArticles: 'All articles',
    articlesLabel: 'Articles',

    byPrefix: 'By',
    publishedPrefix: 'Published',
    updatedPrefix: 'Updated',
    minRead: 'min read',

    breadcrumbLabel: 'Breadcrumb',
    home: 'Home',

    pagination: {
      label: 'Pagination',
      previous: 'Newer articles',
      next: 'Older articles',
    },
  },

  languageSwitcher: {
    label: 'Change language',
    currentSuffix: 'current language',
    notTranslated: 'not available in this language',
  },

  legal: {
    lastUpdatedLabel: 'Last updated',
  },

  notFound: {
    title: 'Page not found — Tipza',
    heading: 'Page not found',
    body: 'The page you were looking for does not exist or has moved.',
    cta: 'Back to home',
  },
};
