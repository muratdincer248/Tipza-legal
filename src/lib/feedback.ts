/**
 * The shape of an article rating, shared by the widget that collects it and the
 * function that stores it, so the two cannot drift.
 *
 * The follow-up is a fixed set of reasons rather than a free-text box. Four
 * buttons are answerable in a second where a text field is answerable in a
 * minute, so far more people answer at all; the results are countable instead of
 * needing to be read; and nothing a visitor types about themselves ends up in a
 * database that then has to be governed. "Something is wrong" is the one that
 * matters — it is a bug report for an article.
 */
export const FEEDBACK_REASONS = [
  'not-what-i-searched',
  'too-general',
  'something-wrong',
  'hard-to-follow',
] as const;

export type FeedbackReason = (typeof FEEDBACK_REASONS)[number];

export interface FeedbackPayload {
  /** Root-relative article path, e.g. `/en/blog/how-to-split-tips-fairly/`. */
  path: string;
  helpful: boolean;
  reason?: FeedbackReason;
}

/** Only article URLs are ratable, and the shape is checked before it is stored. */
export const ARTICLE_PATH = /^\/[a-z]{2}\/blog\/[a-z0-9-]{1,120}\/$/;

export const isFeedbackReason = (value: unknown): value is FeedbackReason =>
  typeof value === 'string' && (FEEDBACK_REASONS as readonly string[]).includes(value);

/** Remembers a rated article so the widget does not ask a second time. */
export const feedbackStorageKey = (path: string): string => `tipza:feedback:${path}`;
