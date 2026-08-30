/**
 * Slug for ids generated inside components (table captions, chart labels).
 * Deterministic so the same content produces the same markup on every build,
 * which keeps diffs between deploys meaningful.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
