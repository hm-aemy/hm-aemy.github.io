import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://aemy.cs.hm.edu',
  // Keep the Jekyll URL layout: /legal.html, /open-positions/index.html, ...
  build: { format: 'preserve' },
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  redirects: {
    '/jobs': '/open-positions/',
    // Topics merged in the topic restructuring
    '/topics/formal-embedded': '/topics/verification',
    '/topics/wasm4iot': '/topics/risc-v-extensions',
  },
});
