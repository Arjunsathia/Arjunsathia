// Smooth page scrolling for mouse wheels and trackpads.
// The page still scrolls natively (window.scrollTo), so sticky elements, scroll-driven CSS, IntersectionObservers,
// find-in-page, the keyboard and the scrollbar all keep working. Only wheel input is eased towards its target.
// Touch screens and people who prefer reduced motion keep fully native scrolling.

// Pure engine (no DOM), so it can be tested: eases the scroll position towards a target, frame-rate independent.
// Long trips (in-page links) use a timed ease that starts and ends gently, instead of the wheel easing.
const easeInOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const tripDuration = distance => Math.max(700, Math.min(1400, 500 + Math.abs(distance) * .12));

export function createSmoothScroller({getScroll, setScroll, getMax, frame, cancelFrame = () => {}, now, smoothness = .1}) {
  let target = getScroll(), current = target, expected = target, running = false, handle = 0, last = 0, trip = null;
  const clamp = value => Math.max(0, Math.min(getMax(), value));
  const step = () => {
    const t = now(), dt = Math.min(64, t - last || 16.7); last = t;
    if (trip) {
      const p = Math.min(1, (t - trip.start) / trip.duration);
      current = trip.from + (target - trip.from) * easeInOut(p);
      if (p >= 1) { current = target; trip = null; }
    } else {
      // Close `smoothness` of the remaining distance per 60fps frame, whatever the real frame rate.
      current += (target - current) * (1 - Math.pow(1 - smoothness, dt / 16.7));
      if (Math.abs(target - current) < .5) current = target;
    }
    expected = Math.round(current * 100) / 100;
    setScroll(expected);
    if (current === target) { running = false; return; }
    handle = frame(step);
  };
  const start = () => { if (!running) { running = true; last = now(); handle = frame(step); } };
  return {
    // Adds a wheel movement to where the page is heading.
    // A wheel movement during a link trip takes over from wherever the page is at that moment.
    scrollBy(delta) { if (!running) current = target = getScroll(); if (trip) { trip = null; target = current; } target = clamp(target + delta); start(); },
    // Glides to a position on a timed ease (in-page links).
    scrollTo(position) {
      if (!running) current = getScroll();
      target = clamp(position);
      trip = {from: current, start: now(), duration: tripDuration(target - current)};
      start();
    },
    // Called on every native scroll event. Anything that moved the page by itself (keyboard, scrollbar,
    // an anchor jump, find-in-page) takes over: the glide stops and the engine adopts the new position.
    sync() {
      const actual = getScroll();
      if (running && Math.abs(actual - expected) <= 2) return;
      if (running) { running = false; cancelFrame(handle); }
      trip = null; current = target = expected = actual;
    },
    stop() { if (running) { running = false; cancelFrame(handle); } trip = null; current = target = expected = getScroll(); },
    get target() { return target; },
    get running() { return running; },
  };
}


// The wheel stays native over anything that should scroll by itself: lists and popups marked with
// data-lenis-prevent, and any other element that can still scroll in that direction.
function scrollsNatively(node, deltaY) {
  for (let el = node; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (el.hasAttribute?.('data-lenis-prevent')) return true;
    const overflow = getComputedStyle(el).overflowY;
    if ((overflow === 'auto' || overflow === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
      if (deltaY > 0 ? el.scrollTop < el.scrollHeight - el.clientHeight - 1 : el.scrollTop > 1) return true;
    }
  }
  return false;
}

function headerOffset() {
  return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
}

function start() {
  const root = document.documentElement;
  const engine = createSmoothScroller({
    getScroll: () => window.scrollY,
    setScroll: y => window.scrollTo({top: y, behavior: 'instant'}),
    getMax: () => root.scrollHeight - window.innerHeight,
    frame: callback => requestAnimationFrame(callback),
    cancelFrame: handle => cancelAnimationFrame(handle),
    now: () => performance.now(),
  });
  const onWheel = event => {
    if (event.defaultPrevented || event.ctrlKey || event.shiftKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (document.body.style.overflow === 'hidden' || document.querySelector('dialog[open]')) return;
    if (scrollsNatively(event.target, event.deltaY)) return;
    event.preventDefault();
    engine.scrollBy(event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1));
  };
  // In-page links glide to their section, landing just below the sticky header. The skip link stays instant.
  const onClick = event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href^="#"]');
    if (!link || link.classList.contains('skip')) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    const section = id ? document.getElementById(id) : null;
    if (!section && id) return;
    event.preventDefault();
    history.pushState(null, '', id ? `#${id}` : location.pathname + location.search);
    engine.scrollTo(section ? section.getBoundingClientRect().top + window.scrollY - headerOffset() : 0);
  };
  const onScroll = () => engine.sync();
  window.addEventListener('wheel', onWheel, {passive: false});
  window.addEventListener('scroll', onScroll, {passive: true});
  document.addEventListener('click', onClick);
  root.classList.add('smooth-scroll');
  return () => {
    engine.stop();
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('click', onClick);
    root.classList.remove('smooth-scroll');
  };
}

// Runs only with a mouse or trackpad and without reduced motion; switches itself on or off if that changes.
export function initSmoothScroll() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let stop = null;
  const update = () => {
    const wanted = fine.matches && !reduced.matches;
    if (wanted && !stop) stop = start();
    else if (!wanted && stop) { stop(); stop = null; }
  };
  update();
  fine.addEventListener('change', update);
  reduced.addEventListener('change', update);
  return () => { fine.removeEventListener('change', update); reduced.removeEventListener('change', update); if (stop) stop(); };
}
