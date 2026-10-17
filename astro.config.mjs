// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://sayeedahmad.com',
  trailingSlash: 'never',
  // CSS always ships as hashed files. The home sheet adopts a case page's
  // stylesheets by URL, which breaks if Astro inlines some of them.
  build: { format: 'file', inlineStylesheets: 'never' },
});
