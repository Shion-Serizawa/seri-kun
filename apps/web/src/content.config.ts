import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    description: z.string().min(1),
  }),
});

export const collections = { blog };
