import type { CollectionEntry } from 'astro:content';
import { site } from '~/config/site';
import { localeMeta, localePath, type Locale } from '~/config/locales';
import { categoryLabel } from '~/config/taxonomy';
import type { Article } from './blog';
import type { Crumb } from './crumbs';
import type { OgImage } from './ogImage';
import { wordCount } from './readingTime';

/**
 * Structured data as one `@graph` per page rather than several loose scripts.
 *
 * Nodes carry stable `@id`s and reference each other, so the organisation, the
 * page, its breadcrumb and its article are each stated once and then linked.
 * That is the point of the exercise: a search or answer engine builds one entity
 * for Tipza rather than one per page, and can resolve "who published this"
 * without re-reading the same facts in three places.
 *
 * Everything here is derived from what the page already renders, so the markup
 * and the visible page cannot drift apart.
 */

export type Node = Record<string, unknown>;

const ORGANIZATION_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;
const LOGO_ID = `${site.url}/#logo`;

const absolute = (pathOrUrl: string): string => new URL(pathOrUrl, site.url).href;

const ref = (id: string): Node => ({ '@id': id });

const authorId = (entryId: string): string => `${site.url}/#author-${entryId}`;

/**
 * Stated on every page, not only the home page, so the entity is reinforced by
 * whichever page a crawler happens to reach first.
 */
const organization = (): Node => ({
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: site.name,
  url: `${site.url}/`,
  logo: {
    '@type': 'ImageObject',
    '@id': LOGO_ID,
    url: absolute('/assets/images/Tipza_Logo.svg'),
    caption: site.name,
  },
  image: ref(LOGO_ID),
  email: site.supportEmail,
  sameAs: [site.appStoreUrl],
});

const website = (locale: Locale): Node => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${site.url}/`,
  name: site.name,
  publisher: ref(ORGANIZATION_ID),
  inLanguage: localeMeta[locale].htmlLang,
});

const mobileApplication = (locale: Locale, description: string): Node => ({
  '@type': 'MobileApplication',
  '@id': `${site.url}/#app`,
  name: site.name,
  url: site.appStoreUrl,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'iOS',
  description,
  publisher: ref(ORGANIZATION_ID),
  inLanguage: localeMeta[locale].htmlLang,
});

type Author = CollectionEntry<'authors'>;

/** The house byline is the organisation, so it is credited rather than copied. */
const authorRef = (entry: Author): Node =>
  ref(entry.data.isPublisher ? ORGANIZATION_ID : authorId(entry.id));

const authorNodes = (entry: Author): Node[] =>
  entry.data.isPublisher
    ? []
    : [
        {
          '@type': entry.data.type,
          '@id': authorId(entry.id),
          name: entry.data.name,
          ...(entry.data.url ? { url: entry.data.url } : {}),
          ...(entry.data.sameAs.length ? { sameAs: entry.data.sameAs } : {}),
        },
      ];

const breadcrumbList = (crumbs: Crumb[], pageUrl: string): Node => ({
  '@type': 'BreadcrumbList',
  '@id': `${pageUrl}#breadcrumb`,
  itemListElement: crumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.label,
    ...(crumb.href ? { item: absolute(crumb.href) } : {}),
  })),
});

interface PageOptions {
  locale: Locale;
  /** Locale-relative path, the same value `BaseHead` receives. */
  path: string;
  title: string;
  description?: string;
  hasBreadcrumb?: boolean;
  image?: OgImage;
  /** Q&A pairs; their presence also makes the page a `FAQPage`. */
  faq?: { question: string; answer: string }[];
  /** Extra `@type` values merged onto the page node, e.g. `CollectionPage`. */
  alsoTyped?: string[];
}

/**
 * The page itself. Extra roles are merged into `@type` as an array rather than
 * emitted as a second node claiming the same `@id`, which is how structured data
 * ends up contradicting itself.
 */
const webPage = ({
  locale,
  path,
  title,
  description,
  hasBreadcrumb = false,
  image,
  faq,
  alsoTyped = [],
}: PageOptions): Node => {
  const url = absolute(localePath(locale, path));
  const types = ['WebPage', ...alsoTyped, ...(faq?.length ? ['FAQPage'] : [])];

  return {
    '@type': types.length === 1 ? types[0] : types,
    '@id': url,
    url,
    name: title,
    ...(description ? { description } : {}),
    isPartOf: ref(WEBSITE_ID),
    inLanguage: localeMeta[locale].htmlLang,
    ...(image
      ? {
          primaryImageOfPage: {
            '@type': 'ImageObject',
            '@id': `${url}#primaryimage`,
            url: absolute(image.url),
            width: image.width,
            height: image.height,
            ...(image.alt ? { caption: image.alt } : {}),
          },
        }
      : {}),
    ...(hasBreadcrumb ? { breadcrumb: ref(`${url}#breadcrumb`) } : {}),
    ...(faq?.length
      ? {
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }
      : {}),
  };
};

const graph = (nodes: Node[]): Node => ({ '@context': 'https://schema.org', '@graph': nodes });

/**
 * The graph is written inside a `<script>`, where a literal `</` in any string —
 * an FAQ answer containing `</strong>`, say — would close the element early and
 * spill JSON into the document. Escaping `<` is enough to prevent that and is
 * still valid JSON.
 */
export const serializeSchema = (node: Node): string =>
  JSON.stringify(node).replace(/</g, '\\u003c');

/* ------------------------------------------------------------------ page kinds */

/** Landing page: the site, the organisation behind it, and the app it is for. */
export const homeSchema = (options: {
  locale: Locale;
  title: string;
  description: string;
  faq?: { question: string; answer: string }[];
}): Node =>
  graph([
    organization(),
    website(options.locale),
    mobileApplication(options.locale, options.description),
    webPage({
      locale: options.locale,
      path: '',
      title: options.title,
      description: options.description,
      faq: options.faq,
    }),
  ]);

/** Blog index and category archives: a listing, in the order it is shown. */
export const listingSchema = (options: {
  locale: Locale;
  path: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  articles: Article[];
}): Node => {
  const url = absolute(localePath(options.locale, options.path));
  const crumbs = options.crumbs ?? [];

  return graph([
    organization(),
    website(options.locale),
    webPage({
      locale: options.locale,
      path: options.path,
      title: options.title,
      description: options.description,
      hasBreadcrumb: crumbs.length > 0,
      alsoTyped: ['CollectionPage'],
    }),
    {
      '@type': 'ItemList',
      '@id': `${url}#articles`,
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: options.articles.length,
      itemListElement: options.articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absolute(article.href),
        name: article.entry.data.title,
      })),
    },
    ...(crumbs.length ? [breadcrumbList(crumbs, url)] : []),
  ]);
};

/** Article page: the posting, the page it sits on, and the trail to it. */
export const articleSchema = (options: {
  article: Article;
  author: Author;
  image: OgImage;
  crumbs: Crumb[];
  /** `<title>`, which may differ from the headline. */
  title: string;
}): Node => {
  const { article, author, image, crumbs, title } = options;
  const { data } = article.entry;
  const url = absolute(article.href);

  return graph([
    organization(),
    website(article.locale),
    ...authorNodes(author),
    webPage({
      locale: article.locale,
      path: article.path,
      title,
      description: data.description,
      hasBreadcrumb: crumbs.length > 0,
      image,
      faq: data.faq,
    }),
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      isPartOf: ref(url),
      mainEntityOfPage: ref(url),
      headline: data.title,
      description: data.description,
      abstract: data.excerpt,
      image: ref(`${url}#primaryimage`),
      thumbnailUrl: absolute(image.url),
      author: authorRef(author),
      publisher: ref(ORGANIZATION_ID),
      datePublished: article.publishedAt.toISOString(),
      dateModified: (article.updatedAt ?? article.publishedAt).toISOString(),
      inLanguage: localeMeta[article.locale].htmlLang,
      articleSection: categoryLabel(article.category, article.locale),
      ...(data.keywords.length ? { keywords: data.keywords } : {}),
      wordCount: wordCount(article.entry.body ?? ''),
      timeRequired: `PT${article.readingTime}M`,
      ...(crumbs.length ? { breadcrumb: ref(`${url}#breadcrumb`) } : {}),
      ...(data.sources.length
        ? {
            citation: data.sources.map((source) => ({
              '@type': 'CreativeWork',
              name: source.title,
              url: source.url,
              publisher: { '@type': 'Organization', name: source.publisher },
            })),
          }
        : {}),
    },
    ...(crumbs.length ? [breadcrumbList(crumbs, url)] : []),
  ]);
};

/** Legal documents: a page and its trail, with nothing more to claim. */
export const pageSchema = (options: {
  locale: Locale;
  path: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
}): Node => {
  const url = absolute(localePath(options.locale, options.path));
  const crumbs = options.crumbs ?? [];

  return graph([
    organization(),
    website(options.locale),
    webPage({
      locale: options.locale,
      path: options.path,
      title: options.title,
      description: options.description,
      hasBreadcrumb: crumbs.length > 0,
    }),
    ...(crumbs.length ? [breadcrumbList(crumbs, url)] : []),
  ]);
};
