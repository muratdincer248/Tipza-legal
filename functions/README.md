# Cloudflare Pages Functions

Two endpoints, both write-only, both silent by design. They live here rather than
in `src/` because Pages compiles this directory into Workers; everything under
`_lib/` is shared code, and the leading underscore keeps it out of the router.

| Route | Stores | Binding |
| --- | --- | --- |
| `POST /api/event` | The seven events in `src/lib/events.ts` | `EVENTS` (Analytics Engine) |
| `POST /api/feedback` | "Was this article helpful?" | `FEEDBACK_DB` (D1) |

Both answer `204` whether or not their binding exists. The site therefore works
before any of the setup below is done — beacons are dropped and ratings are
accepted and discarded, rather than the reader seeing a control that errors.

## Setup

Everything here is done once, in the Cloudflare dashboard or with `wrangler`.
There is deliberately no `wrangler.toml`: adding one makes Pages ignore the
bindings configured in the dashboard, which is a surprising way to break a
deployment that is otherwise configured there.

### 1. Web Analytics (page views)

Cloudflare dashboard › Web Analytics › add `tipza.app`, then copy the token out
of the snippet it shows and set it as an environment variable on the Pages
project:

```
PUBLIC_CF_BEACON_TOKEN = <token>
```

`PUBLIC_` is required — Astro only exposes prefixed variables to the browser.
Set it on Production only, so preview deployments do not report into the same
numbers.

### 2. Analytics Engine (interaction events)

Create a dataset binding on the Pages project:

```
Variable name: EVENTS
Dataset:       tipza_events
```

Query it with the [Analytics Engine SQL API]. `blob1` is the event name, `blob2`
the path, `blob3` the label; `double1` is the count.

```sql
SELECT blob1 AS event, blob3 AS label, sum(_sample_interval) AS count
FROM tipza_events
WHERE timestamp > now() - INTERVAL '30' DAY
GROUP BY event, label
ORDER BY count DESC
```

[Analytics Engine SQL API]: https://developers.cloudflare.com/analytics/analytics-engine/sql-api/

### 3. D1 (article feedback)

```sh
wrangler d1 create tipza-feedback
wrangler d1 execute tipza-feedback --remote --file=migrations/0001_article_feedback.sql
```

Bind it to the Pages project as `FEEDBACK_DB`, and add a secret:

```
FEEDBACK_SALT = <any long random string>
```

The salt is what makes the per-visitor dedupe key unguessable. Changing it is
harmless — it only resets the one-vote-per-day window.

Reading the results:

```sql
SELECT article,
       sum(helpful)     AS helpful,
       sum(1 - helpful) AS unhelpful,
       count(*)         AS total
FROM article_feedback
GROUP BY article
ORDER BY unhelpful DESC;

SELECT article, reason, count(*) AS n
FROM article_feedback
WHERE helpful = 0 AND reason IS NOT NULL
GROUP BY article, reason
ORDER BY n DESC;
```

The second query is the one to act on: it names the article and what was wrong
with it.

## Checking types

Functions are type-checked separately, because the Workers runtime redefines
`Request`, `Response` and friends and those definitions would be wrong for the
browser code in `src/`:

```sh
npm run check:functions
```
