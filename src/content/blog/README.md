# Writing a Tipza article

Everything a writer needs is in this directory and the frontmatter of an existing
article. This file is the reference for the parts that are not obvious.

## Where files go

```
src/content/blog/
  en/how-to-split-tips-fairly.mdx
  de/trinkgeld-fair-aufteilen.mdx
```

The **directory** decides the language. The **filename** is the URL slug, so the
two files above publish at `/en/blog/how-to-split-tips-fairly/` and
`/de/blog/trinkgeld-fair-aufteilen/`.

Translations are **not** paired by filename. They are paired by `translationKey`,
which is why each language can have a slug written for the phrases people
actually search in that language rather than a transliteration of the English
one. Give both files the same `translationKey` and the language switcher, the
`hreflang` tags and the canonical URLs all follow.

Cover images live in `src/assets/blog/<translationKey>/cover.png` and are shared
between translations. `scripts/make-cover.mjs` crops a source photo to the 16:9
the layout expects.

## Frontmatter

`src/content.config.ts` is the enforced contract — a missing or misspelled field
fails the build with the file and field named, so it is safe to learn by doing.
The fields that need explaining:

| Field | Why it exists |
| --- | --- |
| `translationKey` | Identity across languages. Never appears in a URL. Do not change it after publishing. |
| `title` | The `<h1>`. Written for a reader. |
| `seoTitle` | The `<title>` tag, when it should differ from the `<h1>`. Ends with `— Tipza`. |
| `description` | Meta description, capped at 160 characters because that is roughly what search results show. |
| `excerpt` | Used on cards and teasers. Longer and more conversational than `description`. |
| `category` | One of the keys in `src/config/taxonomy.ts`. Each has its own localized label and slug. |
| `status` | `draft` keeps a file out of every listing, sitemap and build. Set `published` when it is ready. |
| `featured` | Promotes the article to the large card at the top of the blog index. |
| `relatedArticles` | `translationKey`s, not slugs, so a relation written once resolves in both languages. |
| `keywords` | The queries the article is meant to answer. Not emitted as a meta tag; they exist to keep the brief honest. |
| `faq` | Question-and-answer pairs. See below. |
| `sources` | Citations. See below. |

Reading time and the last-updated line are computed. Do not write them into the
article.

### `faq`

FAQs live in frontmatter rather than being written inline, so the visible Q&A and
the `FAQPage` structured data come from one source and cannot disagree.

```yaml
faq:
  - question: What is the fairest way to split tips?
    answer: >-
      For most teams, splitting in proportion to hours worked is the fairest
      starting point: the hours are already tracked and anyone can check the
      arithmetic.
```

Use the `>-` block scalar for answers. It folds the lines into one paragraph and
means colons, quotes and apostrophes need no escaping — the most common reason a
new article fails to build is an unquoted colon in a plain YAML string.

Answers should read as complete sentences that stand on their own, because an
answer engine will quote one without the question around it.

### `sources`

```yaml
sources:
  - id: estg-3-51
    title: 'Einkommensteuergesetz § 3 Nr. 51'
    publisher: Bundesministerium der Justiz
    url: https://www.gesetze-im-internet.de/estg/__3.html
```

The `id` is what an inline `<SourceRef>` points at. The numbered Sources section
at the foot of the article is generated from this list, so the marker in the text
and the entry it refers to can never drift apart.

## The body

Ordinary Markdown needs no imports. Headings, links, tables and blockquotes are
mapped to the styled components when the article renders, so a plain article is a
plain file:

- `##` and `###` become headings with a hover permalink. `##` sections also
  populate the table of contents, which appears once an article has four or more.
- `[text](url)` marks external links and opens them in a new tab.
- Pipe tables get a scroll container, so a wide table scrolls inside the column
  instead of pushing the page sideways.
- `>` becomes a styled quotation.

Do not write `#` — the `<h1>` comes from `title`.

### Blocks

Anything richer is imported in one line at the top of the body, after the
frontmatter:

```jsx
import { Callout, CalculationExample, FaqBlock } from '~/components/content';
```

| Block | Use it for |
| --- | --- |
| `Callout` | An aside. `tone` of `note`, `tip` or `warning`. |
| `TipBox` / `WarningBox` | The same thing with the intent named instead of the colour. |
| `CalculationExample` | A worked sum: `steps` then a `result`. The shape readers screenshot. |
| `Formula` | A named formula as text, with a `note` explaining the terms. |
| `ComparisonTable` | A matrix. `columns` plus `rows`; booleans render as a tick or a dash with hidden text. |
| `StatGrid` + `StatCard` | Two to four headline numbers. Every card takes a `source`. |
| `BarChart` / `DonutChart` | Comparing magnitudes or shares. Text-based, not images. |
| `ProcessSteps` | An ordered procedure with a title and body per step. |
| `Timeline` | Dated events, oldest first. |
| `Figure` / `FullWidthFigure` | A photo or diagram. `alt` is required. |
| `PullQuote` | A line from the article lifted out for emphasis. |
| `Quote` | An actual quotation from a source. |
| `SourceRef` | An inline citation marker. |
| `FaqBlock` | Renders the `faq` frontmatter. |

Three conventions worth following:

**Write the FAQ heading in Markdown, not as a prop.** `FaqBlock` renders no
heading of its own, because a heading emitted from inside a component is missing
from the table of contents and has no permalink:

```mdx
## Frequently asked questions

<FaqBlock items={frontmatter.faq} />
```

**Give every number a source.** `StatCard` has a `source` field and
`ComparisonTable` has a `note` for exactly this. A statistic without one is an
assertion.

**Prefer text blocks to images of text.** A `ComparisonTable` and a `BarChart`
can be read by a screen reader, translated, and quoted by an answer engine. An
exported chart cannot be read by any of them.

### Charts and tables in translation

The blocks take data, not markup, so a translation swaps the labels and leaves
the structure alone. Localize the numbers too: German articles use `1.800,00 €`
and `0,7`, English ones `€1,800.00` and `0.7`.

Text the blocks generate themselves — the hidden "Yes" and "No" behind a
comparison table's ticks, for instance — comes from `src/i18n/<locale>.ts` under
`blocks`, resolved from the article's own URL. There is nothing to pass and
nothing to forget.

## Before opening a pull request

```bash
npm run build     # schema errors name the file and the field
npm run check     # types across .astro and .ts
```

Then look at the article at two widths. Blocks are the part most likely to be
wrong at one and right at the other:

```bash
npx http-server dist -p 8081 --silent
node scripts/shoot.mjs /en/blog/<slug>/ 1440 desktop --full
node scripts/shoot.mjs /en/blog/<slug>/ 390 mobile --full
node scripts/overflow.mjs /en/blog/<slug>/ 390   # nothing should be listed
```

`scripts/shoot.mjs` needs Playwright, which is deliberately not a dependency:
`npm i --no-save playwright && npx playwright install chromium`.
