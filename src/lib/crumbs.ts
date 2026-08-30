/**
 * One breadcrumb trail per page, rendered by `Breadcrumbs.astro` and serialized
 * as `BreadcrumbList` by `lib/schema.ts`. Shared so the visible trail and the
 * structured one are the same array rather than two lists that drift apart.
 */
export interface Crumb {
  label: string;
  /** Root-relative href. Omitted on the final crumb, which is the current page. */
  href?: string;
}
