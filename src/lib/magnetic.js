// Magnetic buttons: an element marked data-magnetic leans towards the pointer while the pointer is over it, then
// springs back when it leaves. The value is the strength (share of the pointer's distance from the centre), e.g.
// data-magnetic="0.3"; data-magnetic-max caps the pull in pixels (default 8).
// It moves the element with the CSS `translate` property, which adds to (and never replaces) the hover lift and
// entrance animations that use `transform`. Mouse and trackpad only, never with reduced motion; touch screens and
// keyboard users get the buttons exactly as before.

const QUERY = '(hover: hover) and (pointer: fine)';
const REDUCE = '(prefers-reduced-motion: reduce)';

export function initMagnetic(root = document) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const fine = window.matchMedia(QUERY);
  const reduce = window.matchMedia(REDUCE);
  const states = new Map();
  let frame = 0;

  const enabled = () => fine.matches && !reduce.matches;
  const tick = () => {
    frame = 0;
    let moving = false;
    states.forEach((state, element) => {
      // Ease towards the target (about 18% of the way per frame): soft on the way in, a gentle spring back.
      state.x += (state.tx - state.x) * .18;
      state.y += (state.ty - state.y) * .18;
      if (Math.abs(state.tx - state.x) < .05 && Math.abs(state.ty - state.y) < .05) { state.x = state.tx; state.y = state.ty; }
      else moving = true;
      element.style.translate = state.x || state.y ? `${state.x.toFixed(2)}px ${state.y.toFixed(2)}px` : '';
    });
    if (moving) frame = requestAnimationFrame(tick);
  };
  const run = () => { if (!frame) frame = requestAnimationFrame(tick); };
  const release = () => { states.forEach(state => { state.tx = 0; state.ty = 0; state.rect = null; }); run(); };

  const cleanups = [...root.querySelectorAll('[data-magnetic]')].map(element => {
    const state = {x: 0, y: 0, tx: 0, ty: 0, rect: null};
    states.set(element, state);
    const strength = Math.min(1, Math.max(0, parseFloat(element.dataset.magnetic) || .3));
    const max = parseFloat(element.dataset.magneticMax) || 8;
    const move = event => {
      if (event.pointerType !== 'mouse' || !enabled()) return;
      // The resting box (the element's own pull taken out), read once per visit, so the pull never feeds back on itself.
      if (!state.rect) {
        const box = element.getBoundingClientRect();
        state.rect = {cx: box.left + box.width / 2 - state.x, cy: box.top + box.height / 2 - state.y};
      }
      const clamp = value => Math.max(-max, Math.min(max, value));
      state.tx = clamp((event.clientX - state.rect.cx) * strength);
      state.ty = clamp((event.clientY - state.rect.cy) * strength);
      run();
    };
    const leave = () => { state.tx = 0; state.ty = 0; state.rect = null; run(); };
    element.addEventListener('pointermove', move, {passive: true});
    element.addEventListener('pointerleave', leave, {passive: true});
    return () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
      element.style.translate = '';
    };
  });

  // Scrolling moves the page under a still pointer, and a changed setting turns the effect off: let go in both cases.
  window.addEventListener('scroll', release, {passive: true});
  fine.addEventListener('change', release);
  reduce.addEventListener('change', release);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', release);
    fine.removeEventListener('change', release);
    reduce.removeEventListener('change', release);
    cleanups.forEach(cleanup => cleanup());
    states.clear();
  };
}
