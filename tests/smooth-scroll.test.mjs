import test from 'node:test';
import assert from 'node:assert/strict';
import {createSmoothScroller} from '../src/lib/smooth-scroll.js';

// A fake page and clock: frames run only when flushed, so the easing is deterministic.
function fixture({max = 5000, start = 0, smoothness = .1} = {}) {
  let scroll = start, clock = 0;
  const frames = [], positions = [];
  const engine = createSmoothScroller({
    getScroll: () => scroll,
    setScroll: y => { scroll = y; positions.push(y); },
    getMax: () => max,
    frame: callback => frames.push(callback),
    cancelFrame: () => { frames.length = 0; },
    now: () => clock,
    smoothness,
  });
  return {
    engine, positions,
    get scroll() { return scroll; }, set scroll(v) { scroll = v; },
    run(count = Infinity, ms = 16.7) { let n = 0; while (frames.length && n < count) { clock += ms; frames.shift()(); n++; } return n; },
  };
}

test('a wheel movement glides to its target and stops there', () => {
  const f = fixture();
  f.engine.scrollBy(300);
  const frames = f.run();
  assert.equal(f.scroll, 300);
  assert.ok(frames > 10, 'it takes several frames, so it glides');
  assert.equal(f.engine.running, false);
});

test('the glide eases out: big steps first, small steps last', () => {
  const f = fixture();
  f.engine.scrollBy(400); f.run();
  const steps = f.positions.map((y, i) => y - (f.positions[i - 1] ?? 0));
  assert.ok(steps[0] > steps.at(-2), 'starts fast, ends slow');
  assert.ok(f.positions.every((y, i) => i === 0 || y >= f.positions[i - 1]), 'never moves backwards');
});

test('quick wheel movements add up instead of restarting', () => {
  const f = fixture();
  f.engine.scrollBy(100); f.run(3); f.engine.scrollBy(100); f.run(3); f.engine.scrollBy(100); f.run();
  assert.equal(f.scroll, 300);
});

test('the target never goes past the top or the bottom of the page', () => {
  const f = fixture({max: 1000, start: 900});
  f.engine.scrollBy(800); f.run();
  assert.equal(f.scroll, 1000);
  f.engine.scrollBy(-5000); f.run();
  assert.equal(f.scroll, 0);
});

test('it settles in the same time at 60fps and 120fps', () => {
  const at60 = fixture(), at120 = fixture();
  at60.engine.scrollBy(600); at120.engine.scrollBy(600);
  const t60 = at60.run(Infinity, 16.7) * 16.7, t120 = at120.run(Infinity, 8.35) * 8.35;
  assert.ok(Math.abs(t60 - t120) < 60, `60fps ${t60.toFixed(0)}ms vs 120fps ${t120.toFixed(0)}ms`);
});

test('the keyboard, scrollbar or an anchor jump takes over: the glide stops and adopts the new position', () => {
  const f = fixture();
  f.engine.scrollBy(1000); f.run(4);
  f.scroll = 3000; f.engine.sync();
  assert.equal(f.engine.running, false);
  assert.equal(f.engine.target, 3000);
  f.engine.scrollBy(100); f.run();
  assert.equal(f.scroll, 3100, 'the next wheel movement starts from where the page really is');
});

test('its own scroll events do not stop the glide', () => {
  const f = fixture();
  f.engine.scrollBy(500); f.run(3); f.engine.sync();
  assert.equal(f.engine.running, true);
  f.run();
  assert.equal(f.scroll, 500);
});

test('scrollTo glides to an exact position (in-page links)', () => {
  const f = fixture({start: 200});
  f.engine.scrollTo(2400); f.run();
  assert.equal(f.scroll, 2400);
});

test('a long link trip starts gently, ends gently, and takes 0.7–1.4s', () => {
  const f = fixture({max: 20000});
  f.engine.scrollTo(8000);
  const frames = f.run();
  const ms = frames * 16.7;
  assert.ok(ms >= 700 && ms <= 1450, `took ${ms.toFixed(0)}ms`);
  assert.ok(f.positions[3] < 8000 * .02, 'the first frames move only a little (no jump)');
  const steps = f.positions.map((y, i) => y - (f.positions[i - 1] ?? 0));
  assert.ok(steps.at(-2) < steps[Math.floor(steps.length / 2)], 'it slows down before arriving');
  assert.equal(f.scroll, 8000);
});

test('a wheel movement during a link trip takes over smoothly from the current position', () => {
  const f = fixture({max: 20000});
  f.engine.scrollTo(8000); f.run(20);
  const at = f.scroll;
  f.engine.scrollBy(100); f.run();
  assert.equal(f.scroll, Math.min(20000, Math.round((at + 100) * 100) / 100));
});
