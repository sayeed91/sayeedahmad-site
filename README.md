# sayeedahmad.com (Astro)

Rebuild of the portfolio from the Figma file `KAeOxeRzc2Ju33n8XBCY6s`, page "Sayeed's New Portfolio".

```
npm install
npm run dev       # local dev server
npm run build     # static site in dist/
```

- `src/data/site.ts` — links, nav, case list, experience, recommendations, explorations.
  Explorations only show once there are 3+ entries with real thumbnails.
  `bookCall` is a mailto until a Cal.com link exists.
- `src/pages/work/*.astro` — the three case studies. Copy is taken from Figma as-is.
- `src/assets/<case>/` — figures exported from Figma at 2x (1280px). Re-export when a
  figure changes in Figma; Astro turns them into responsive WebP at build time.
- `src/components/SheetOverlay.astro` — on desktop, case studies open as a routed bottom
  sheet over the home page. Mobile and modified clicks go to the real page.
- `src/components/MessageDialog.astro` — "Message me" form, handled by Netlify Forms.

Deploy: Netlify, `netlify.toml` sets the build. Story, Ask AI and Posts are `#` until designed.
