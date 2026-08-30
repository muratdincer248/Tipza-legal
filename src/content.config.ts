import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';
import { LOCALES } from '~/config/locales';
import { CATEGORIES } from '~/config/taxonomy';

const localeEnum = z.enum(LOCALES);

/** Localized string, one entry per supported locale. */
const localized = z.object(
  Object.fromEntries(LOCALES.map((locale) => [locale, z.string()])) as Record<
    (typeof LOCALES)[number],
    z.ZodString
  >
);

/**
 * Long-form legal copy. One file per locale per document, so each translation
 * is a real document rather than a string table.
 */
const legal = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    heading: z.string(),
    /** Meta description; the cap is roughly what search engines will show. */
    description: z.string().max(160),
    lastUpdated: z.string(),
  }),
});

/**
 * Bylines, defined once and referenced by articles. `type` decides whether the
 * JSON-LD author becomes a `Person` or an `Organization`, so a house byline does
 * not have to masquerade as a named individual.
 */
const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      type: z.enum(['Person', 'Organization']).default('Person'),
      /**
       * True when the byline is Tipza itself. Structured data then credits the
       * site's own Organization rather than minting a second, identical company
       * beside it — one entity saying it wrote the article, not two.
       */
      isPublisher: z.boolean().default(false),
      name: z.string(),
      role: localized,
      bio: localized,
      avatar: image().optional(),
      url: z.url().optional(),
      sameAs: z.array(z.url()).default([]),
    }),
});

/**
 * Articles live at `blog/<locale>/<slug>.mdx`: the directory decides the
 * language, the filename is the URL slug, and `translationKey` — not the
 * filename — ties a German article to its English sibling. That is what lets
 * each language own an independently optimized slug.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      /** Stable identity across locales. Never appears in a URL. */
      translationKey: z.string(),
      /** Must match the containing directory; `src/lib/blog.ts` enforces it. */
      locale: localeEnum,

      /** The `<h1>`. */
      title: z.string(),
      /** Used for `<title>` when it should differ from the `<h1>`. */
      seoTitle: z.string().optional(),
      /** Meta description; the cap is roughly what search engines will show. */
      description: z.string().max(160),
      /** Summary used on cards and teasers. */
      excerpt: z.string(),

      category: z.enum(CATEGORIES),
      tags: z.array(z.string()).default([]),
      author: reference('authors'),

      publishedAt: z.date(),
      updatedAt: z.date().optional(),

      coverImage: image(),
      coverImageAlt: z.string(),

      featured: z.boolean().default(false),
      /** `translationKey`s, so a relation written once resolves in every locale. */
      relatedArticles: z.array(z.string()).default([]),
      showProductCta: z.boolean().default(true),
      status: z.enum(['draft', 'published']).default('draft'),
      keywords: z.array(z.string()).default([]),

      /**
       * Question-and-answer pairs for `<FaqBlock items={frontmatter.faq} />`.
       * Kept in frontmatter rather than written inline so the visible Q&A and
       * the FAQPage structured data are generated from one source. Answers may
       * contain inline HTML.
       */
      faq: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .default([]),

      /**
       * Structured rather than prose, so one entry can render as an inline
       * citation, as a Sources section, and as JSON-LD `citation`.
       */
      sources: z
        .array(
          z.object({
            id: z.string(),
            title: z.string(),
            publisher: z.string(),
            url: z.url(),
            accessedAt: z.date().optional(),
          })
        )
        .default([]),
    }),
});

export const collections = { legal, authors, blog };
