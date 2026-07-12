# Sean Jho

Personal writing site published at `https://arthaszyb.github.io`.

## Stack

- [Astro 5](https://astro.build) (static output, zero default client JS) + TypeScript (strict)
- Content Collections (`src/content/blog/`) with a custom loader for reading-time
- [Pagefind](https://pagefind.app) for static full-text search (Chinese-aware)
- `@astrojs/sitemap` + `@astrojs/rss` for `sitemap-index.xml` / `rss.xml`
- Deployed via GitHub Actions (`withastro/action`) → GitHub Pages

## Directory structure

```
astro.config.mjs        Site config (site URL, sitemap integration, Shiki themes)
src/
  content.config.ts      Blog collection schema (see below)
  content/blog/          Article source, one Markdown file per post
  data/                  Site metadata, category display names, giscus config
  layouts/                BaseLayout.astro (head/nav/footer), PostLayout.astro
  lib/                    blog-loader.ts (content loader), posts.ts (slug/listing helpers)
  pages/                  Routes: /, /posts/, /posts/<slug>/, /topics/, /tags/<tag>/,
                           /archive/, /about/, /search/, /404, /rss.xml
  styles/                 global.css (design tokens, light/dark theme)
  components/             Shared UI (nav, post card, TOC, tag chips, etc.)
public/
  images/legacy/          Images carried over from the old Evernote-exported posts
  images/samples/         Misc sample images used by a few posts
  favicon.svg, robots.txt
docs/
  modernization-plan.md   Original migration plan (Phase 1-4)
  migration-notes.md      Running log of edge cases / deviations from the plan
  migration-report.json   Machine-readable report from the last content migration run
scripts/
  migrate-content.mjs     One-off migration tool (see below) — not part of the build
```

## Local development

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build      # astro build && pagefind --site dist
npm run preview    # serve the built dist/ locally
```

`npm run build` produces `dist/`, including the Pagefind search index. There is
no separate "build" vs "index" step — `pagefind --site dist` always runs as
part of `npm run build`.

## Deployment

`.github/workflows/pages.yml` builds and deploys on every push to `master`
(and via manual `workflow_dispatch`). The `withastro/action` step installs
dependencies and runs `npm run build`, then `actions/deploy-pages` publishes
`dist/` to GitHub Pages. There is no separate CI/lint workflow beyond this.

## Writing a new post

Add a new Markdown file under `src/content/blog/`, e.g.:

```
src/content/blog/2026-07-12-my-new-post.md
```

with front matter matching the schema in `src/content.config.ts`:

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `date` | date (ISO string) | required |
| `description` | string | optional; shown in listings, RSS, and meta tags |
| `category` | string | required; one of the slugs in `src/data/categories.ts` (add a new display name there if introducing a new category) |
| `tags` | string[] | optional, defaults to `[]` |
| `draft` | boolean | optional, defaults to `false`; drafts are excluded from listings, RSS, and the sitemap |
| `source` | string | optional provenance marker (e.g. `evernote-local-db` for migrated posts); omit for new posts |
| `lang` | `'zh' \| 'en'` | optional, defaults to `'zh'` |

`minutesRead` is **not** a field you write by hand — it's computed at build
time from the post body by `src/lib/blog-loader.ts` and injected into the
collection entry.

The route slug is derived from the filename (the `YYYY-MM-DD-` prefix is
stripped); see `src/lib/posts.ts` for the exact logic. Keep filenames
ASCII/lowercase/hyphenated and globally unique once the date prefix is
removed.

## `scripts/migrate-content.mjs`

This is the one-time tool used to migrate the original 398 Jekyll/Evernote
posts (previously in `_posts/`) into the current `src/content/blog/` format —
HTML-dump extraction, Markdown conversion, front matter normalization, slug
generation, and image path rewriting to `public/images/legacy/`. It is kept
in the repo for reference and because it's idempotent (safe to re-run), but
it is **not** part of the normal build or authoring workflow. See
`docs/modernization-plan.md` (Phase 2) and `docs/migration-notes.md` for how
it works and the edge cases it handles.
