# Arjun Sathia — developer portfolio

React 19, Vite, and Motion for React. The existing cream, dark ink, lime, Anton typography, portraits, and section order are preserved.

## Local development

```sh
npm install
npm run dev
npm run build
```

Vite serves the local preview at http://127.0.0.1:5173/. The build outputs `dist/`.

## Motion and scrolling

- Browser-native page scrolling and native internal project/Experience scrolling, without Lenis or page-wide wheel interception.
- `src/motion.jsx` defines shared 500ms viewport reveals, short entrances, easing, compact-screen detection, and dynamic reduced-motion handling. Motion owns entrance transforms; CSS owns hover feedback on separate elements.
- Home uses rectangular name reveals followed by the unchanged portrait, stamp, and actions. Header height stays stable. Manifesto lines reveal once and keep their original overlap and colors.
- All five project concepts use editorial rows inside a vertically scrollable panel. The centered row uses its own accent: lime, green, yellow, seafoam, or warm apricot, while adjacent rows gently recede. Previous/next project controls, keyboard navigation, native wheel/touch scrolling, and full-details dialogs are retained. No additional preview parallax competes with internal scrolling.
- Services enter from the left with 100ms staggering and 20px desktop / 12px mobile travel. Stack rows fade without movement, staggered by 80ms.
- Experience retains its compact panel, lime selected role, and neighboring previews. It is browsed by native vertical scrolling and keyboard controls; no previous/next buttons are shown. Details remain in native dialogs.
- Process is a single-open animated accordion. About preserves its portrait and wrapping biography. Testimonials are two editorial sample quotes, with no autoplay or decorative avatars. Contact/footer remain dark and integrated.
- Dialogs preserve Escape, focus return, background locking, and mobile content scrolling. Scrollbar space is reserved to avoid layout shifts. Reduced motion disables spatial effects.

## Content to personalize

The `profile` object in `src/main.jsx` has empty email, GitHub, and LinkedIn values; missing links show an honest notice. Replace them with approved contact details.

Orbit, DevNotes, Stack, Pulse, and Draft are explicitly illustrative concepts, including fictional preview data. The two company roles, freelance year, and two testimonials are visibly labeled samples. Replace these with verified projects, actual employment, and approved feedback before presenting them as evidence of real work. The optional Blog is omitted.

The hero uses `assets/portrait-warm-lighting.png`. The About portrait is `assets/arjun-about.jpeg`, copied unchanged from the user-supplied photograph; no facial or hair edits were made.

## Verification

Production build, responsive checks at 360/390/768/1024/1440px, project and Experience dialogs, keyboard role navigation, single-open accordion behavior, and native overflow behavior are checked in the local browser. Temporary PerformanceObserver instrumentation sampled document scrolling through Projects and Services: no long tasks or layout shifts were recorded. The test browser sampled at roughly 30Hz, so these measurements do not establish 60fps on physical devices. Physical trackpad/touch hardware and the system reduced-motion setting were not emulated by the available browser tools; reduced-motion branches are implemented with Motion and CSS. Manual device checks remain useful before publishing.

Internal lists share a passive, animation-frame-batched centered-selection hook. Proximity snapping avoids forced stops, native scroll chaining remains enabled; a shared wheel boundary handler transfers excess vertical motion to the page at either edge, including fractional-pixel boundaries, and buttons use native smooth scrolling (instant with reduced motion). Navigation retains its pill hover feedback with no underlines.

`node --test tests/scroll-boundary.test.mjs` checks interior scrolling, both edge handoffs, partial consumption, fractional boundaries, wheel units, and zoom/horizontal/native-event exclusions. Arrow keys at list boundaries are allowed to fall through to browser scrolling.

Project dialogs now use a dark ink, non-scrolling reader with Overview, Approach, Development, and Stack tabs. All existing description, approach, implementation, and tool content is retained. Tabs support arrow/Home/End keys, with a contained focus loop, Escape/backdrop dismissal, focus return, and reduced-motion-aware transitions. The compact viewport layout omits only the decorative preview on short screens, preserving all text. Checks cover all four tabs at 1440×1000, 390×844, 320×568, and 844×390, and all five project contents at 320px.

Project colors are stored in each project's `accent` field and passed to the active row and its modal. The first three match the Services reference (`#d4e62d`, `#a8ed7d`, `#ffdc3d`); Pulse uses seafoam (`#9edbc9`) and Draft warm apricot (`#edc88f`). Experience styling and the scroll-boundary fix remain unchanged.
