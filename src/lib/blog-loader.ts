import { glob } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import getReadingTime from 'reading-time';

/**
 * Wraps the built-in glob loader to inject a computed `minutesRead` field.
 *
 * Astro's official "inject via remark plugin" reading-time recipe relies on
 * the collection being fully rendered (and thus running remark plugins)
 * *before* frontmatter schema validation — true for the legacy content
 * collections API, but not for the Content Layer `glob()` loader used here:
 * the loader only reads raw frontmatter at sync time, and markdown
 * rendering (where remark plugins run) happens lazily per-page via
 * `render(entry)`. So a remark-plugin-injected field is never visible on
 * `entry.data`.
 *
 * Instead we compute reading time here, directly from each entry's raw
 * markdown body, right after the underlying glob loader populates the
 * store, and write it back into that entry's `data`.
 */
export function blogLoader(): Loader {
  const base = glob({ pattern: '**/*.md', base: './src/content/blog' });

  return {
    name: 'blog-loader',
    load: async (context: LoaderContext) => {
      await base.load(context);

      for (const entry of context.store.values()) {
        const body = entry.body ?? '';
        const readingTime = getReadingTime(body);
        const minutesRead = Math.max(1, Math.ceil(readingTime.minutes));
        // Deliberately omit `digest`: the store's set() short-circuits as a
        // no-op when the digest is unchanged from the existing entry, which
        // would silently drop this data-only update.
        context.store.set({
          id: entry.id,
          data: { ...entry.data, minutesRead },
          body: entry.body,
          filePath: entry.filePath,
          rendered: entry.rendered,
          assetImports: entry.assetImports,
          deferredRender: entry.deferredRender,
        });
      }
    },
  };
}
