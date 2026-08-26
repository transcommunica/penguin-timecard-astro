import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const manual = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/manual' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['core', 'overview', 'settings', 'behavior', 'billing']),
    itemCode: z.string(),
    // 最終更新日（YYYY-MM-DD）。未設定なら「最終更新」を表示せず、
    // 構造化データにも dateModified を出さない。
    updated: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    isNew: z.boolean().default(false),
    popular: z.boolean().default(false),
    order: z.number().default(999),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    date: z.string(),
    excerptHtml: z.string().default(''),
    description: z.string().default(''),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

export const collections = {
  manual,
  news,
};
