/**
 * Barrel for the editorial blocks, so an article needs one import line rather
 * than a preamble:
 *
 *   import { Callout, CalculationExample, FaqBlock } from '~/components/content';
 *
 * Ordinary prose needs no imports at all — headings, links, tables and
 * blockquotes are mapped to styled components when the article is rendered.
 */
export { default as BarChart } from './BarChart.astro';
export { default as CalculationExample } from './CalculationExample.astro';
export { default as Callout } from './Callout.astro';
export { default as ComparisonTable } from './ComparisonTable.astro';
export { default as DonutChart } from './DonutChart.astro';
export { default as FaqBlock } from './FaqBlock.astro';
export { default as Figure } from './Figure.astro';
export { default as Formula } from './Formula.astro';
export { default as FullWidthFigure } from './FullWidthFigure.astro';
export { default as ProcessSteps } from './ProcessSteps.astro';
export { default as PullQuote } from './PullQuote.astro';
export { default as Quote } from './Quote.astro';
export { default as SourceRef } from './SourceRef.astro';
export { default as StatCard } from './StatCard.astro';
export { default as StatGrid } from './StatGrid.astro';
export { default as Timeline } from './Timeline.astro';
export { default as TipBox } from './TipBox.astro';
export { default as WarningBox } from './WarningBox.astro';
