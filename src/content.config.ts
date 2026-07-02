import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog collection — write posts as Markdown files in `src/content/blog/`.
 * Every post needs the frontmatter fields below.
 */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** Set to true to hide a post from the production build. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
