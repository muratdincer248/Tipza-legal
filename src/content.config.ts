import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

/**
 * Long-form legal copy. One file per locale per document, so each translation
 * is a real document rather than a string table.
 */
const legal = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    heading: z.string(),
    description: z.string().optional(),
    lastUpdated: z.string(),
  }),
});

export const collections = { legal };
