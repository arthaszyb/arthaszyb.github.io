Sean Jho

Personal writing site published at `https://arthaszyb.github.io`.

Stack

- Jekyll
- GitHub Pages
- Custom warm-light theme in `css/site-modern.css`

Content structure

- `_posts/`: dated articles in Markdown
- `html/`: raw HTML documents published directly
- `assets/evernote/`: static assets referenced by historical posts
- `_includes/`, `_layouts/`: shared navigation, templates, and page chrome

Local preview

1. Install Jekyll and its runtime dependencies.
2. Run `jekyll serve` from the repo root.
3. Open `http://127.0.0.1:4000/`.

Publishing notes

- GitHub Pages publishes from the repository branch configuration in GitHub settings.
- Any `.html` file placed under `html/` will be published as-is.
- Markdown posts and raw HTML pages can coexist without separate pipelines.

Design goals

- Reader-facing information architecture: `Home`, `Works`, `About`
- Warm, light visual language instead of legacy template styling
- Good rendering for both Markdown articles and standalone HTML pages
