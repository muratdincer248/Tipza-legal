import { isLocale } from '../../src/config/locales';
import { ARTICLE_PATH, isFeedbackReason } from '../../src/lib/feedback';
import { jsonBody, noContent, rejected, sameOrigin } from '../_lib/http';

/**
 * Stores "was this helpful" for one article.
 *
 * D1 rather than Analytics Engine, unlike `/api/event`: these are a handful of
 * rows a month that someone reads deliberately when deciding what to rewrite,
 * not a stream to aggregate. A table you can open and sort is the right tool for
 * that, and it keeps the answers past the retention window of an analytics
 * dataset.
 *
 * Set up (once, in the Cloudflare dashboard or with wrangler):
 *
 *   wrangler d1 create tipza-feedback
 *   wrangler d1 execute tipza-feedback --remote --file=migrations/0001_article_feedback.sql
 *
 * then bind it to the Pages project as `FEEDBACK_DB`, and set `FEEDBACK_SALT` to
 * any long random string. Until then the endpoint answers 204 and the widget
 * degrades to a thank-you, which is better than a broken control on every page.
 */
interface Env {
  FEEDBACK_DB?: D1Database;
  FEEDBACK_SALT?: string;
}

interface Payload {
  path?: unknown;
  helpful?: unknown;
  reason?: unknown;
}

/**
 * A dedupe key, not an identifier. It exists so one person cannot run the count
 * up on their own, and it is salted with the current date so it stops matching
 * tomorrow — there is no way to follow a visitor from one day to the next, and
 * no IP address is written anywhere.
 */
async function voterKey(request: Request, salt: string): Promise<string> {
  const material = [
    request.headers.get('cf-connecting-ip') ?? '',
    request.headers.get('user-agent') ?? '',
    new Date().toISOString().slice(0, 10),
    salt,
  ].join('|');

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(material));

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return rejected();

  const payload = await jsonBody<Payload>(request);
  if (!payload) return rejected();

  const { path, helpful, reason } = payload;

  if (typeof path !== 'string' || !ARTICLE_PATH.test(path)) return rejected();
  if (!isLocale(path.split('/')[1] ?? '')) return rejected();
  if (typeof helpful !== 'boolean') return rejected();
  if (reason !== undefined && !isFeedbackReason(reason)) return rejected();

  /* No database bound yet: accept the rating and drop it, so the page behaves
     the same before and after the binding exists. */
  if (!env.FEEDBACK_DB) return noContent();

  const locale = path.split('/')[1]!;
  const voter = await voterKey(request, env.FEEDBACK_SALT ?? '');

  /* One row per article per voter per day. A second call carrying the follow-up
     reason updates that row rather than adding a vote. */
  await env.FEEDBACK_DB.prepare(
    `INSERT INTO article_feedback (article, locale, helpful, reason, voter)
     VALUES (?1, ?2, ?3, ?4, ?5)
     ON CONFLICT (article, voter) DO UPDATE SET
       helpful = excluded.helpful,
       reason = COALESCE(excluded.reason, article_feedback.reason)`
  )
    .bind(path, locale, helpful ? 1 : 0, reason ?? null, voter)
    .run();

  return noContent();
};
