import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Written by scripts/extract-content.mjs. Each file's path under src/content/pages
// matches its URL path, so practice/mediation.md is served at /practice/mediation/.
const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    route: z.string(),
    modified: z.string(),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    route: z.string(),
    date: z.string(),
    modified: z.string(),
  }),
});

export const collections = { pages, blog };
