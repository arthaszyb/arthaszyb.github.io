import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { sitemapSerializer } from './src/lib/sitemap-lastmod.mjs';

export default defineConfig({
  site: 'https://arthaszyb.github.io',
  integrations: [sitemap({ serialize: sitemapSerializer() })],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
