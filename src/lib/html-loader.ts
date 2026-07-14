import type { LoaderContext } from 'astro/loaders';
import getReadingTime from 'reading-time';
import matter from 'gray-matter';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface HtmlHeading {
  depth: number;
  slug: string;
  text: string;
}

/**
 * 把 src/content/blog 下的 *.html 文件作为文章加载进 blog 集合。
 *
 * 文件格式：顶部与 markdown 一样写一段 YAML frontmatter（title/date/
 * category/tags…，由 gray-matter 解析并走同一套 zod schema 校验），
 * frontmatter 之后是 HTML 正文，构建时**原样**注入文章页（不做
 * markdown 转换）。通过 Content Layer 的 `rendered.html` 通道交给
 * `render(entry)`，因此列表、标签、RSS、相关文章、Pagefind 搜索等
 * 全部与 markdown 文章一致。
 *
 * 额外处理两件事：
 * 1. 若上传的是完整 HTML 文档（含 <html>/<head>/<body>），只取
 *    <body> 内的内容，避免破坏站点页面结构；
 * 2. 给缺少 id 的 h2/h3 注入 id 并收集为 headings，供目录（Toc）使用。
 */
export async function loadHtmlPosts(context: LoaderContext, blogDir: string): Promise<void> {
  const dir = fileURLToPath(new URL(blogDir, context.config.root));

  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return;
  }

  for (const file of files.filter((f) => f.endsWith('.html')).sort()) {
    const absPath = path.join(dir, file);
    const raw = await fs.readFile(absPath, 'utf-8');
    const { data, content } = matter(raw);

    const bodyHtml = extractBody(content);
    const { html, headings } = ensureHeadingIds(bodyHtml);

    const plainText = stripTags(html);
    const minutesRead = Math.max(1, Math.ceil(getReadingTime(plainText).minutes));

    const id = file.replace(/\.html$/, '');
    const filePath = path
      .relative(fileURLToPath(context.config.root), absPath)
      .split(path.sep)
      .join('/');

    const parsed = await context.parseData({
      id,
      data: { ...data, minutesRead },
      filePath,
    });

    context.store.set({
      id,
      data: parsed,
      body: content,
      filePath,
      digest: context.generateDigest(raw),
      rendered: { html, metadata: { headings } },
    });
  }
}

/** 完整 HTML 文档只保留 <body> 内容；片段原样返回。 */
function extractBody(html: string): string {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return (match ? match[1] : html).trim();
}

/** 去除 script/style 与标签，得到用于计算阅读时长的纯文本。 */
function stripTags(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 收集 h2/h3 为目录项；没有 id 的补上由标题文本生成的 id。 */
function ensureHeadingIds(html: string): { html: string; headings: HtmlHeading[] } {
  const headings: HtmlHeading[] = [];
  const used = new Set<string>();

  const out = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (full, level: string, attrs: string, inner: string) => {
      const text = stripTags(inner);
      if (!text) return full;

      const existing = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
      let slug = existing ? existing[1] : slugify(text);
      while (used.has(slug)) slug = `${slug}-1`;
      used.add(slug);

      headings.push({ depth: Number(level), slug, text });
      if (existing) return full;
      return `<h${level}${attrs} id="${slug}">${inner}</h${level}>`;
    }
  );

  return { html: out, headings };
}

/** 中英文通用的锚点 id：保留 Unicode 字母数字，其余折叠为连字符。 */
function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'section';
}
