# Adding a language

Everything that varies by language is data. Adding a locale means adding entries
to a handful of files and writing the copy; nothing under `src/pages`,
`src/layouts` or `src/components` has to change.

That is a claim worth checking rather than believing, so it was checked. Adding
French as a scratch experiment produced five type errors and one content-schema
error, each naming the exact file and field, plus three broken links that the SEO
check now reports. No route, layout or component needed editing, and the sitemap,
`hreflang` set and JSON-LD graph came out correct on the first build.

## The checklist

In the order the toolchain asks for them.

### 1. `src/config/locales.ts`

Append the code to `LOCALES` and add its `localeMeta` entry:

```ts
export const LOCALES = ['en', 'de', 'fr'] as const;

fr: { label: 'Français', short: 'FR', htmlLang: 'fr', hreflang: 'fr', ogLocale: 'fr_FR' },
```

`label` is shown in the language menu in that language, not in English. The
`hreflang` value is language-only on purpose; if the site ever needs `fr-FR` and
`fr-BE` separately, this field is the only place that decides it.

### 2. `src/i18n/<locale>.ts`

Copy `en.ts` and translate it. The `Dictionary` type in `types.ts` is the
contract, so a missing key is a build error rather than an English string
appearing in a French page.

Translate the `blocks` section too. It holds the text the editorial components
generate themselves — the hidden "Yes" and "No" behind a comparison table's
ticks, the label above the takeaways — which no article passes in and nobody
thinks to check.

### 3. `src/i18n/index.ts`

Add the dictionary to the `dictionaries` record. Missing this is a type error.

### 4. `src/config/taxonomy.ts`

Every category needs a `label`, `slug`, `heading` and `description` in the new
language. Translate the slug: `partage-des-pourboires`, not `tip-splitting`. The
routing already treats category URLs as per-locale, so an asymmetric slug costs
nothing and a transliterated one costs search traffic.

### 5. `src/content/authors/*.json`

Every author file needs `role` and `bio` in the new language. The content schema
enforces this and names the file and the field.

### 6. `src/content/legal/<locale>/`

`privacy.mdx`, `terms.mdx` and `account-deletion.mdx`. **These are not optional.**
The footer links to all three from every locale, so a language without them ships
three 404s on every page.

This is the one requirement nothing used to catch, which is why `npm run
check:seo` now verifies that every internal link lands on something in the build.

### 7. `src/content/blog/<locale>/`

Articles, whenever they are ready. A locale with no articles is a supported
state: the blog index renders its "first articles are on their way" copy, the
language switcher sends readers to the index rather than to a URL that does not
exist, and untranslated articles stay out of the `hreflang` set instead of
pointing at nothing.

Translate slugs the same way as category slugs. Pair translations with
`translationKey`, never by filename — that is what lets each language own a slug
written for the phrases people search in that language.

## What you do not touch

Listed because the temptation to go looking is real:

- **Routes.** `src/pages/[lang]/` generates every locale from `LOCALES`.
- **`hreflang` and canonicals.** `BaseHead` builds them from the alternates each
  page already computes, and `lib/translations.ts` handles the asymmetric case
  where a page exists in one language and not another.
- **The sitemap.** `src/integrations/sitemap.ts` reads the rendered HTML, so it
  learns about a new locale by seeing it.
- **Structured data.** `lib/schema.ts` takes the locale as an argument.
- **The language switcher.** It renders whatever is in `LOCALES`.

## Verifying

```bash
npm run check      # dictionary, taxonomy and author fields
npm run build      # content schemas, with the file and field named
npm run check:seo  # canonicals, hreflang reciprocity, sitemap, internal links
```

Then open the new locale's landing page and blog index and read the footer. The
checks cover the links; only a person notices when a translation is wrong in a
way that parses.
