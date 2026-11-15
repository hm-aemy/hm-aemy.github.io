import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://aemy.cs.hm.edu',
  // Keep the Jekyll URL layout: /legal.html, /open-positions/index.html, ...
  build: { format: 'preserve' },
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
  redirects: {
    '/jobs': '/open-positions/',
  },
});
