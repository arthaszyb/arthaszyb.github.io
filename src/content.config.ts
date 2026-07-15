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
    origin_url: z.string().optional(), // 摘录/转载笔记的原文链接，文章页会渲染出处提示
    lang: z.enum(['zh', 'en']).default('zh'),
    // Pages CMS 新建文章时用于生成文件名（.pages.yml 的 filename 模板），
    // 路由 slug 实际取自文件名（见 src/lib/posts.ts），此字段仅存档。
    slug: z.string().optional(),
    // 由 blogLoader（src/lib/blog-loader.ts）在同步阶段计算注入，非作者手写字段。
    minutesRead: z.number().optional(),
  }),
});

export const collections = { blog };
