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
index.html                 Page shell, meta tags
public/favicon.svg         Favicon
fonts.css                  @font-face declarations (self-hosted WOFF2)
styles.css                 All site styles
src/main.jsx               Content data and every section component
src/motion.jsx             Shared reveal/entrance animations and the centered-scroll list hook
src/cursor.jsx             Custom pointer overlay (mouse only; touch, keyboard, and forced-colors keep the native cursor)
src/scroll-boundary.js     Hands wheel scrolling from an inner list to the page at its edges
tests/                     Tests for the scroll-boundary logic
assets/                    Portraits, fonts, and font licenses (SIL OFL 1.1)
assets/project-previews/   Illustrative screens for each project: overview, detail, and mobile
```

## Content to personalize

- **Contact details:** the `profile` object at the top of `src/main.jsx` holds sample `email` and `phone` values, shown in the enquiry dialog and labeled as samples there. `github` and `linkedin` are empty; until they are filled in, the Contact section shows a "coming soon" notice instead of a link.
- **Enquiry form:** the "Let's talk" and "Discuss a project" buttons open a demo form. It validates input but sends nothing ("Demo mode"). Connect it to a form service or API before relying on it.
- **Sample content:** the five projects (Orbit, DevNotes, Stack, Pulse, Draft), the two company roles, the freelance year, and the four testimonials are illustrative and labeled as samples on the page. Replace them with real projects, employment, and approved feedback before publishing.
- **Project previews:** each project shows three screens from `assets/project-previews/` named `<project>-overview.svg`, `<project>-detail.svg`, and `<project>-mobile.svg`.
- **Images:** the hero portrait is `assets/portrait-warm-lighting.webp`; the About portrait is `assets/arjun-about.jpeg`.
- **Project colors:** each project's `accent` field sets the color of its card and its detail dialog.
- **Social previews:** `index.html` has Open Graph title and description tags. Once the site has a public URL, add `og:url` and an `og:image` (an absolute URL to a 1200×630 image).

## Behavior notes

- Page scrolling is native. The Projects and Experience lists scroll inside their panels, and once a list reaches its first or last item, further wheel movement scrolls the page instead (`src/scroll-boundary.js`). Testimonials scroll horizontally as a looping carousel.
- Every dialog (project details, preview viewer, experience details, enquiry) is a native `<dialog>` using one hook, `useModalDialog`: Escape and backdrop clicks close it, focus stays inside while it is open and returns to the trigger afterwards, and the page behind cannot scroll.
- Project dialogs have Overview, Previews, Approach, Development, and Stack tabs; the preview viewer steps through screens with the arrow keys. On small screens the experience dialog splits into Overview, Responsibilities, and Tools tabs. All tab lists respond to the arrow, Home, and End keys.
- Animations follow the visitor's reduced-motion setting: with it on, movement is disabled and dialogs close instantly.
