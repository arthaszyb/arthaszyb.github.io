import { defineCollection, z } from 'astro:content';
import { blogLoader } from './lib/blog-loader';

const blog = defineCollection({
  loader: blogLoader(),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    category: z.string(), // 单一规范主题，见 Phase 2 映射表 (src/data/categories.ts)
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    source: z.string().optional(), // 保留 "evernote-local-db" 溯源标记
    lang: z.enum(['zh', 'en']).default('zh'),
    // 由 blogLoader（src/lib/blog-loader.ts）在同步阶段计算注入，非作者手写字段。
    minutesRead: z.number().optional(),
  }),
});

export const collections = { blog };
