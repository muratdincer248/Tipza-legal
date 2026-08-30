import { getCollection, type CollectionEntry } from 'astro:content';
import { isLocale, localePath, type Locale } from '~/config/locales';
import type { Category } from '~/config/taxonomy';
import { readingTime } from './readingTime';
import { asymmetricAlternates, type Alternate } from './translations';

export type ArticleEntry = CollectionEntry<'blog'>;

/** An article plus everything derived from it, so routes stay declarative. */
export interface Article {
  entry: ArticleEntry;
  locale: Locale;
  /** Filename without extension, which is the URL segment. */
  slug: string;
  /** Locale-relative path, e.g. `blog/how-to-split-tips/`. */
  path: string;
  /** Root-relative URL, e.g. `/en/blog/how-to-split-tips/`. */
  href: string;
  /** Minutes, computed from the body. */
  readingTime: number;
  category: Category;
  translationKey: string;
  publishedAt: Date;
  updatedAt?: Date;
}

/** Locale-relative path of a locale's blog index — also the fallback for untranslated articles. */
export const BLOG_INDEX_PATH = 'blog/';

/** Articles per listing page. Pagination costs nothing now and avoids a rewrite later. */
export const BLOG_PAGE_SIZE = 12;

export const blogIndexHref = (locale: Locale): string => localePath(locale, BLOG_INDEX_PATH);

/** Locale-relative path of a listing page; page 1 is the bare index. */
export const listingPath = (pageNumber: number): string =>
  pageNumber === 1 ? BLOG_INDEX_PATH : `${BLOG_INDEX_PATH}${pageNumber}/`;

export const articleHref = (locale: Locale, slug: string): string =>
  localePath(locale, `${BLOG_INDEX_PATH}${slug}/`);

/**
 * Drafts are visible while writing and invisible everywhere else — listings,
 * routes and the sitemap all read from this one function, so a draft cannot leak
 * into production through a surface someone forgot about.
 */
const isVisible = (entry: ArticleEntry): boolean =>
  entry.data.status === 'published' || import.meta.env.DEV;

const toArticle = (entry: ArticleEntry): Article => {
  const [dir, ...rest] = entry.id.split('/');
  const slug = rest.join('/');

  if (!dir || !slug || !isLocale(dir)) {
    throw new Error(
      `Article "${entry.id}" must live in a locale directory, e.g. src/content/blog/en/${entry.id}.mdx`
    );
  }
  if (entry.data.locale !== dir) {
    throw new Error(
      `Article "${entry.id}" declares locale "${entry.data.locale}" but sits in "${dir}/". ` +
        'The directory decides the language; fix the frontmatter or move the file.'
    );
  }

  return {
    entry,
    locale: dir,
    slug,
    path: `${BLOG_INDEX_PATH}${slug}/`,
    href: articleHref(dir, slug),
    readingTime: readingTime(entry.body ?? ''),
    category: entry.data.category,
    translationKey: entry.data.translationKey,
    publishedAt: entry.data.publishedAt,
    updatedAt: entry.data.updatedAt,
  };
};

const newestFirst = (a: Article, b: Article): number =>
  b.publishedAt.getTime() - a.publishedAt.getTime();

let cache: Promise<Article[]> | undefined;

/** Every visible article across all locales, newest first. */
export const allArticles = (): Promise<Article[]> => {
  cache ??= getCollection('blog', isVisible).then((entries) => {
    const articles = entries.map(toArticle).sort(newestFirst);

    const seen = new Map<string, string>();
    for (const article of articles) {
      const key = `${article.locale}:${article.translationKey}`;
      const existing = seen.get(key);
      if (existing) {
        throw new Error(
          `translationKey "${article.translationKey}" is used twice in ${article.locale}: ` +
            `"${existing}" and "${article.entry.id}". It must identify one article per locale.`
        );
      }
      seen.set(key, article.entry.id);
    }

    return articles;
  });
  return cache;
};

export const articlesIn = async (locale: Locale): Promise<Article[]> =>
  (await allArticles()).filter((article) => article.locale === locale);

export const articlesInCategory = (articles: Article[], category: Category): Article[] =>
  articles.filter((article) => article.category === category);

/**
 * The one article to lead the index with: an explicitly featured one, otherwise
 * simply the newest.
 */
export const leadArticle = (articles: Article[]): Article | undefined =>
  articles.find((article) => article.entry.data.featured) ?? articles[0];

/**
 * Locale-relative paths for one article's translations, keyed by locale. Feeds
 * both the `hreflang` tags and the language switcher, so the two cannot drift.
 */
export const translationPaths = (
  articles: Article[],
  translationKey: string
): Partial<Record<Locale, string>> =>
  Object.fromEntries(
    articles
      .filter((article) => article.translationKey === translationKey)
      .map((article) => [article.locale, article.path])
  );

/**
 * A locale with no translation of this article falls back to its blog index and
 * is flagged untranslated, which keeps it out of `hreflang` and stops us
 * inventing a URL that does not exist.
 */
export const articleAlternates = (articles: Article[], translationKey: string): Alternate[] =>
  asymmetricAlternates(translationPaths(articles, translationKey), BLOG_INDEX_PATH);

/**
 * Manual relations win, since an editor's judgement beats a heuristic. Because
 * they are `translationKey`s, a relation written once in English resolves to the
 * German sibling automatically. Same-category articles fill any remaining slots,
 * then the newest of anything else rather than leaving the row short.
 */
export const relatedArticles = (article: Article, pool: Article[], limit = 3): Article[] => {
  const candidates = pool.filter(
    (candidate) =>
      candidate.locale === article.locale && candidate.translationKey !== article.translationKey
  );

  const picked: Article[] = [];
  const take = (next: Article[]) => {
    for (const candidate of next) {
      if (picked.length >= limit) return;
      if (!picked.includes(candidate)) picked.push(candidate);
    }
  };

  for (const key of article.entry.data.relatedArticles) {
    take(candidates.filter((candidate) => candidate.translationKey === key));
  }
  take(candidates.filter((candidate) => candidate.category === article.category));
  take(candidates);

  return picked;
};
