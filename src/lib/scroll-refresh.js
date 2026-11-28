import { ScrollTrigger } from 'gsap/ScrollTrigger';

// This page keeps changing height after load (lazy 3D parts, the stack gallery, images), which leaves scroll-linked
// positions (the FadeContent reveals) stale: a block near the end of the page could wait for a scroll position the
// page no longer reaches, and never appear (the footer on phones did). Re-measure them, debounced, whenever the
// page's height changes. Set up once, for every user.
if (typeof window !== 'undefined' && typeof ResizeObserver !== 'undefined' && !window.__scrollTriggerRefresher) {
  let timer = 0;
  let height = 0;
  window.__scrollTriggerRefresher = new ResizeObserver(() => {
    const next = document.documentElement.scrollHeight;
    if (Math.abs(next - height) < 2) return;
    height = next;
    clearTimeout(timer);
    timer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });
  window.__scrollTriggerRefresher.observe(document.body);
}
