import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BLOG_DIR = 'src/content/blog';
const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

/**
 * Build a `route slug -> ISO date` map for the blog collection, for use by
 * `@astrojs/sitemap`'s `serialize` hook.
 *
 * The sitemap integration runs outside the module graph that can `import
 * 'astro:content'`, so the frontmatter is parsed straight off disk here.
 * The two id rules below must stay in sync with how the entries are routed:
 *
 *   1. Astro's `glob()` loader uses the frontmatter `slug` as the entry id
 *      when present, otherwise the filename without its extension.
 *   2. `slugFromId()` (src/lib/posts.ts) strips the leading `YYYY-MM-DD-`
 *      to get the route slug used by /posts/<slug>/.
 *
 * Drafts are skipped — they are never routed, so they never reach the sitemap.
 */
export function postDatesBySlug(root = process.cwd()) {
  const dir = join(root, BLOG_DIR);
  const dates = new Map();

  for (const file of readdirSync(dir)) {
    if (!/\.(md|html)$/.test(file)) continue;

    const match = FRONTMATTER.exec(readFileSync(join(dir, file), 'utf-8'));
    if (!match) continue;
    const frontmatter = match[1];

    if (/^draft:\s*true\s*$/m.test(frontmatter)) continue;

    const dateLine = /^date:\s*['"]?(\d{4}-\d{2}-\d{2})/m.exec(frontmatter);
    if (!dateLine) continue;

    const slugLine = /^slug:\s*['"]?([A-Za-z0-9-]+)/m.exec(frontmatter);
    const id = slugLine ? slugLine[1] : file.replace(/\.(md|html)$/, '');

    dates.set(id.replace(DATE_PREFIX, ''), dateLine[1]);
  }

  return dates;
}

/**
 * `serialize` hook for @astrojs/sitemap: stamps `<lastmod>` on every entry.
 *
 * Post URLs get the post's own date; every other page (home, /posts/ pages,
 * topics, tags, archive) gets the newest post date, since those listings are
 * exactly what changes when a post is published. Without this the sitemap is
 * 500 bare <loc>s and a crawler has no way to tell a post from last week
 * apart from one from 2013.
 */
export function sitemapSerializer(root = process.cwd()) {
  const dates = postDatesBySlug(root);
  const newest = [...dates.values()].sort().pop();

  return (item) => {
    const slug = /\/posts\/([^/]+)\/?$/.exec(new URL(item.url).pathname)?.[1];
    const date = (slug && dates.get(slug)) || newest;
    return date ? { ...item, lastmod: new Date(`${date}T00:00:00Z`).toISOString() } : item;
  };
}
