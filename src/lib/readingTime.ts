/**
 * Reading time is derived from the body at build time rather than authored,
 * because an authored number goes stale the moment anyone edits a paragraph.
 */
const WORDS_PER_MINUTE = 200;

/**
 * Strips the MDX scaffolding that a reader never reads — imports, JSX tags,
 * code fences, link targets — so the word count reflects prose. Text held in
 * component props (a callout body, a table cell) is deliberately not counted:
 * over-counting markup would inflate every estimate.
 */
const toProse = (body: string): string =>
  body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/^import\s.+$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~|-]/g, ' ');

export const readingTime = (body: string): number => {
  const words = toProse(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};
