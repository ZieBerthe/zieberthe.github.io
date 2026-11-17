import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Posts collection — write posts as Markdown files in `src/content/posts/`.
 * Every post needs the frontmatter fields below.
 */
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** Optional PDF (path under /public, e.g. '/posts/wavelets.pdf') shown on the post page. */
    pdf: z.string().optional(),
    /** Set to true to hide a post from the production build. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
