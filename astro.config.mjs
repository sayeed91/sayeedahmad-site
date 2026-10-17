// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://sayeedahmad.com',
  trailingSlash: 'never',
  // CSS always ships as hashed files. The home sheet adopts a case page's
  // stylesheets by URL, which breaks if Astro inlines some of them.
  build: { format: 'file', inlineStylesheets: 'never' },
  // Every page is still static. Only the admin panel (/keystatic and its API)
  // runs as a Netlify function, which is why the adapter is here.
  integrations: [react(), keystatic()],
  // imageCDN off: images stay optimised at build time, as before the adapter.
  adapter: netlify({ imageCDN: false, devFeatures: false }),
});
