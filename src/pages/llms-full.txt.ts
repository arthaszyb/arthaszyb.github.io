import type { APIRoute } from 'astro';
import { getPublishedPosts, slugFromId } from '../lib/posts';
import { categoryNames } from '../data/categories';
import { site } from '../data/site';

/**
 * llms-full.txt — 全量文章索引（llms.txt 的扩展文件）。
 * 每篇一条：标题、URL、日期、主题、摘要，按主题分组，便于大模型
 * 爬虫一次抓取即可获得全站内容地图。
 */
export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const byCategory = new Map<string, typeof posts>();
  for (const p of posts) {
    const list = byCategory.get(p.data.category) ?? [];
    list.push(p);
    byCategory.set(p.data.category, list);
  }
  const groups = [...byCategory.entries()].sort((a, b) => b[1].length - a[1].length);

  const lines: string[] = [
    `# ${site.title} — 全部文章索引`,
    '',
    `> 共 ${posts.length} 篇。站点导览见 ${site.url}/llms.txt`,
    '',
  ];

  for (const [slug, list] of groups) {
    lines.push(`## ${categoryNames[slug] ?? slug}（${list.length} 篇）`, '');
    for (const p of list) {
      const date = p.data.date.toISOString().slice(0, 10);
      const desc = p.data.description ? `：${p.data.description}` : '';
      lines.push(`- [${p.data.title}](${site.url}/posts/${slugFromId(p.id)}/)（${date}）${desc}`);
    }
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
