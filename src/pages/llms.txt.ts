import type { APIRoute } from 'astro';
import { getPublishedPosts, slugFromId } from '../lib/posts';
import { categoryNames } from '../data/categories';
import { site } from '../data/site';

/**
 * llms.txt — 面向大模型爬虫的站点导览（llmstxt.org 标准）。
 * 给 LLM 一份简明、纯文本的站点结构说明，便于其理解与引用本站内容。
 * 全量文章索引见 /llms-full.txt。
 */
export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();
  const earliest = posts[posts.length - 1]?.data.date.getFullYear() ?? 2013;

  const counts = new Map<string, number>();
  for (const p of posts) counts.set(p.data.category, (counts.get(p.data.category) ?? 0) + 1);
  const topics = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  const recent = posts.slice(0, 10);

  const lines = [
    `# ${site.title}`,
    '',
    `> ${site.author} 的个人技术博客（中文为主）。自 ${earliest} 年起累计 ${posts.length} 篇笔记，覆盖 Linux、基础设施、数据库、网络、监控与 AI 工具等主题，以一线运维/开发实践与问题排查记录为主。`,
    '',
    `站点：${site.url}`,
    `作者：${site.author}（GitHub: ${site.github}）`,
    '',
    '## 主题分类',
    '',
    ...topics.map(
      ([slug, count]) =>
        `- [${categoryNames[slug] ?? slug}](${site.url}/topics/${slug}/)：${count} 篇`
    ),
    '',
    '## 最新文章',
    '',
    ...recent.map((p) => {
      const desc = p.data.description ? `：${p.data.description}` : '';
      return `- [${p.data.title}](${site.url}/posts/${slugFromId(p.id)}/)（${p.data.date
        .toISOString()
        .slice(0, 10)}）${desc}`;
    }),
    '',
    '## 完整索引',
    '',
    `- [全部文章清单（含日期与摘要）](${site.url}/llms-full.txt)`,
    `- [按年归档页](${site.url}/archive/)`,
    `- [RSS](${site.url}/rss.xml)`,
    `- [Sitemap](${site.url}/sitemap-index.xml)`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
