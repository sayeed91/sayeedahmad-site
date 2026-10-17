import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Explorations are edited in the admin panel (/keystatic, see keystatic.config.ts),
// which writes one YAML file per exploration. Videos are compressed before the
// build by scripts/prepare-videos.mjs.
const explorations = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/explorations' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      order: z.number().default(99),
      type: z.string().default('Landing page'),
      isNew: z.boolean().default(false),
      video: z.string().nullish(),
      videoSpeed: z.number().nullish(),
      thumbnail: image().nullish(),
      pageTitle: z.string().nullish(),
      tags: z.array(z.string()).default([]),
      lede: z.string().nullish(),
      videoAlt: z.string().nullish(),
      sections: z
        .array(
          z.discriminatedUnion('discriminant', [
            z.object({
              discriminant: z.literal('text'),
              value: z.object({ heading: z.string().default(''), body: z.string().default('') }),
            }),
            z.object({
              discriminant: z.literal('image'),
              value: z.object({ image: image(), alt: z.string().default('') }),
            }),
            z.object({
              discriminant: z.literal('video'),
              value: z.object({ video: z.string(), speed: z.number().nullish(), alt: z.string().default('') }),
            }),
          ]),
        )
        .default([]),
    }),
});

export const collections = { explorations };
