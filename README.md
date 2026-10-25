# Arjun Sathia — developer portfolio

A single-page portfolio built with React 19, Vite, and Motion for React.

## Getting started

```sh
npm install
npm run dev       # http://127.0.0.1:5173/
npm run build     # production build in dist/
npm run preview   # serve the production build
npm test          # unit tests (node --test)
```

## Project structure

```
index.html              Page shell, meta tags
public/favicon.svg      Favicon
fonts.css               @font-face declarations (self-hosted WOFF2)
styles.css              All site styles
src/main.jsx            Content data and every section component
src/motion.jsx          Shared reveal/entrance animations and the centered-scroll list hook
src/scroll-boundary.js  Hands wheel scrolling from an inner list to the page at its edges
tests/                  Tests for the scroll-boundary logic
assets/                 Portraits, fonts, and font licenses (SIL OFL 1.1)
```

## Content to personalize

- **Contact links:** the `profile` object at the top of `src/main.jsx` has empty `email`, `github`, and `linkedin` values. Until they are filled in, the site shows a "coming soon" notice instead of a link.
- **Sample content:** the five projects (Orbit, DevNotes, Stack, Pulse, Draft), the two company roles, the freelance year, and the two testimonials are illustrative and labeled as samples on the page. Replace them with real projects, employment, and approved feedback before publishing.
- **Images:** the hero portrait is `assets/portrait-warm-lighting.webp`; the About portrait is `assets/arjun-about.jpeg`.
- **Project colors:** each project's `accent` field sets the color of its active row and its detail dialog.
- **Social previews:** `index.html` has Open Graph title and description tags. Once the site has a public URL, add `og:url` and an `og:image` (an absolute URL to a 1200×630 image).

## Behavior notes

- Page scrolling is native. The Projects and Experience lists scroll inside their panels, and once a list reaches its first or last item, further wheel movement scrolls the page instead (`src/scroll-boundary.js`).
- Project and Experience details open in native `<dialog>` elements that share one hook (`useModalDialog`): Escape and backdrop-click close the dialog, focus stays inside while it is open and returns to the trigger afterwards, and the page behind cannot scroll.
- Project dialogs have Overview, Approach, Development, and Stack tabs, which also respond to the arrow, Home, and End keys.
- Animations follow the visitor's reduced-motion setting: with it on, movement is disabled and dialogs close instantly.
