import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const journal = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/journal",
  }),

  schema: z.object({
    title: z.string(),

    excerpt: z.string(),

    category: z.enum([
      "Wedding Stories",
      "Behind The Scene",
      "MC Journal",
      "Wedding Tips",
      "MC Class",
    ]),

    publishedAt: z.coerce.date(),

    updatedAt: z.coerce
      .date()
      .optional(),

    cover: z.string(),

    featured: z
      .boolean()
      .default(false),

    draft: z
      .boolean()
      .default(false),

    readTime: z
      .string()
      .optional(),

    author: z
      .string()
      .default("Kang Denz"),
  }),
});

export const collections = {
  journal,
};