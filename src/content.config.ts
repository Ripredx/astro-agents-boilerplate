import { defineCollection, z } from 'astro:content';

const sampleCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: z.date().optional(),
  }),
});

export const collections = {
  sample: sampleCollection,
};
