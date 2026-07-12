import { getCollection, type CollectionEntry } from 'astro:content';

const DATE_PREFIX = /^\d{4}-\d{2}-\d{2}-/;

/** Route slug = collection entry id with the leading YYYY-MM-DD- stripped. */
export function slugFromId(id: string): string {
  return id.replace(DATE_PREFIX, '');
}

export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Related posts: same category, ranked by tag-intersection size, then
 * backfilled with the most recent posts in the same category so the
 * list always has up to `limit` entries when the category has enough
 * other posts.
 */
export function relatedPosts(
  current: CollectionEntry<'blog'>,
  all: CollectionEntry<'blog'>[],
  limit = 4
): CollectionEntry<'blog'>[] {
  const sameCategory = all.filter(
    (p) => p.id !== current.id && p.data.category === current.data.category
  );

  const currentTags = new Set(current.data.tags);
  const scored = sameCategory
    .map((p) => {
      const overlap = p.data.tags.filter((t) => currentTags.has(t)).length;
      return { post: p, overlap };
    })
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return b.post.data.date.valueOf() - a.post.data.date.valueOf();
    });

  const picked: CollectionEntry<'blog'>[] = [];
  const seen = new Set<string>();
  for (const { post } of scored) {
    if (picked.length >= limit) break;
    if (seen.has(post.id)) continue;
    picked.push(post);
    seen.add(post.id);
  }
  return picked;
}
