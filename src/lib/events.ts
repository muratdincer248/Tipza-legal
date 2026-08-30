/**
 * The events worth measuring on a content site, named once.
 *
 * Seven, and deliberately no more: a site that measures everything ends up
 * reading nothing, and each of these has a decision attached to it.
 *
 *   article_read           did anyone reach the end, or do they leave halfway
 *   article_feedback       did the article answer the question it promised to
 *   store_button_click     which surface actually sends people to the App Store
 *   language_switch        is the German site found by people who wanted German
 *   related_article_click  is the further-reading row worth its space
 *   toc_click              are articles long enough that people navigate them
 *   source_click           do citations get followed, or are they decoration
 *
 * This module holds nothing but the list, so the browser bundle in `track.ts`
 * and the Worker in `functions/api/event.ts` can agree on it without either
 * pulling in the other's runtime.
 */
export const TRACKED_EVENTS = [
  'article_read',
  'article_feedback',
  'store_button_click',
  'language_switch',
  'related_article_click',
  'toc_click',
  'source_click',
] as const;

export type TrackedEvent = (typeof TRACKED_EVENTS)[number];

export const isTrackedEvent = (value: unknown): value is TrackedEvent =>
  typeof value === 'string' && (TRACKED_EVENTS as readonly string[]).includes(value);
