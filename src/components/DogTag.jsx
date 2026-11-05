import React, {useEffect, useRef} from 'react';
import {useReducedMotion} from 'motion/react';
import {Entrance} from '../lib/motion.jsx';
import {switchTheme} from '../lib/theme.js';
import {createPullSwitch, maxReach} from '../lib/tag-switch.js';
import {useTheme, SunIcon, MoonIcon, TAG_PULL_EVENT} from './ThemeSwitch.jsx';

// The dog tag on the "N" of the hero name, with a ball chain you can grab and pull.
// The chain is a small rope simulation (Verlet integration) in the SVG's own units (viewBox 16×32),
// which scale with the name's font size, so it behaves the same on phones and large screens.
// When left alone it sways very lightly, which hints that it can be moved. The sway stops on hover and while
// held, and only runs while the tag is on screen. Pulling the tag down and letting go switches the theme (lib/tag-switch.js).

const SEGMENTS = 14;
const REST_PATH = 'M11.5 28.5C12.2 19 7.5 8 3 3.5';
const CURVE = [[11.5, 28.5], [12.2, 19], [7.5, 8], [3, 3.5]]; // hole → ring
const bezier = t => {
  const u = 1 - t;
  return [0, 1].map(k => u * u * u * CURVE[0][k] + 3 * u * u * t * CURVE[1][k] + 3 * u * t * t * CURVE[2][k] + t * t * t * CURVE[3][k]);
};
// Index 0 is the ring on the N (fixed); index SEGMENTS is the tag's hole.
const REST = Array.from({length: SEGMENTS + 1}, (_, i) => bezier(1 - i / SEGMENTS));
const LINK = REST.slice(1).map((p, i) => Math.hypot(p[0] - REST[i][0], p[1] - REST[i][1]));
const REST_ANGLE = Math.atan2(REST[SEGMENTS][1] - REST[SEGMENTS - 1][1], REST[SEGMENTS][0] - REST[SEGMENTS - 1][0]);
const TAG_TILT = 9; // the tag's resting rotation (matches the stylesheet)
const SWAY_SPEED = 2 * Math.PI / 3.4; // one sway every 3.4 seconds
const SWAY_TILT = 1.5; // degrees either side
const SWAY_START = 1400; // ms, after the hero's entrance animation
const CHAIN_LENGTH = LINK.reduce((sum, l) => sum + l, 0);
const HINT_KEY = 'tag-hint-seen';

// A smooth curve through the simulated points (Catmull-Rom converted to cubic Béziers).
function smoothPath(points) {
  let d = `M${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i], p1 = points[i], p2 = points[i + 1], p3 = points[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

export function DogTag() {
  const svg = useRef(null), tag = useRef(null), links = useRef(null), beads = useRef(null), grab = useRef(null);
  const reduce = useReducedMotion();
  const dark = useTheme() === 'dark';

  useEffect(() => {
    // Kept for the whole effect: React can clear the refs before the cleanup below runs (StrictMode does at startup).
    const svgEl = svg.current, tagEl = tag.current, linksEl = links.current, beadsEl = beads.current, grabEl = grab.current;
    const pos = REST.map(p => [...p]), prev = REST.map(p => [...p]);
    let frame = 0, held = -1, target = null, offset = [0, 0], pointerId = null, gravity = 0, idle = 0, bounds = null, gap = 0;
    let settling = false, hovering = false, inView = true, ready = false, sway = 0, lastTime = 0;
    const pull = createPullSwitch();
    let pullTimer = 0, hintOn = 0, hintOff = 0;

    const unit = () => svgEl.getBoundingClientRect().width / 16;
    const toUnits = (x, y) => {
      const r = svgEl.getBoundingClientRect(), u = r.width / 16;
      return [(x - r.left) / u, (y - r.top) / u];
    };

    const drawChain = d => { for (const path of [linksEl, beadsEl, grabEl]) path.setAttribute('d', d); };
    const placeTag = (u, rotate) => {
      tagEl.style.translate = `${((pos[SEGMENTS][0] - REST[SEGMENTS][0]) * u).toFixed(2)}px ${((pos[SEGMENTS][1] - REST[SEGMENTS][1]) * u).toFixed(2)}px`;
      tagEl.style.rotate = `${rotate.toFixed(2)}deg`;
    };
    const renderRest = () => {
      REST.forEach((p, i) => { pos[i][0] = prev[i][0] = p[0]; pos[i][1] = prev[i][1] = p[1]; });
      drawChain(REST_PATH);
      tagEl.style.translate = ''; tagEl.style.rotate = '';
    };
    const renderPhysics = () => {
      drawChain(smoothPath([...pos].reverse()));
      const hole = pos[SEGMENTS], before = pos[SEGMENTS - 1];
      let tilt = (Math.atan2(hole[1] - before[1], hole[0] - before[0]) - REST_ANGLE) * 180 / Math.PI;
      tilt = Math.max(-40, Math.min(40, ((tilt + 540) % 360) - 180));
      // Coming to rest, the tilt fades out with the last few pixels, so the final snap to the exact pose can't be seen.
      if (held < 0) tilt *= Math.min(1, gap / 4);
      placeTag(unit(), TAG_TILT + tilt * .7);
    };

    // The idle sway: a soft wave runs down the chain and is largest at the tag (about 2–3px).
    const renderSway = now => {
      const u = unit(), t = now / 1000 * SWAY_SPEED, reach = Math.min(3, Math.max(2, u * 1.5)) / u * sway;
      for (let i = 1; i <= SEGMENTS; i++) {
        const weight = (i / SEGMENTS) ** 1.5, phase = t - i * .2;
        pos[i][0] = prev[i][0] = REST[i][0] + reach * weight * Math.sin(phase);
        pos[i][1] = prev[i][1] = REST[i][1] + reach * .2 * weight * Math.cos(phase);
      }
      drawChain(smoothPath([...pos].reverse()));
      placeTag(u, TAG_TILT + SWAY_TILT * sway * Math.sin(t - SEGMENTS * .2 - .5));
    };

    const step = () => {
      const u = unit();
      // Gravity acts while the chain is held and fades after release; a spring returns every bead to its resting place.
      gravity = held >= 0 ? 1 : gravity * .94;
      const fall = .45 / u * gravity;
      const damping = reduce ? .55 : .962;
      const home = held >= 0 ? 0 : (reduce ? .3 : .034);
      let motion = 0, distance = 0;
      for (let i = 1; i <= SEGMENTS; i++) {
        if (i === held) continue;
        const p = pos[i], q = prev[i];
        const vx = (p[0] - q[0]) * damping, vy = (p[1] - q[1]) * damping;
        q[0] = p[0]; q[1] = p[1];
        const pull = i === SEGMENTS ? 1.5 : 1; // the tag is heavier than a bead
        p[0] += vx + (REST[i][0] - p[0]) * home * pull;
        p[1] += vy + fall * pull + (REST[i][1] - p[1]) * home * pull;
        motion = Math.max(motion, Math.abs(vx) + Math.abs(vy));
        distance = Math.max(distance, Math.abs(p[0] - REST[i][0]) + Math.abs(p[1] - REST[i][1]));
      }
      gap = distance * u; // how far (in px) the chain still is from rest
      if (held >= 0 && target) { pos[held][0] = prev[held][0] = target[0]; pos[held][1] = prev[held][1] = target[1]; }
      // Links: a slack link lets the chain bend; a taut one is pulled back, more softly while held so the chain stretches.
      const stiffness = held >= 0 ? .45 : .9;
      for (let pass = 0; pass < 10; pass++) {
        for (let i = 0; i < SEGMENTS; i++) {
          const a = pos[i], b = pos[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1e-6;
          if (d <= LINK[i]) continue;
          const wa = i === 0 || i === held ? 0 : 1, wb = i + 1 === held ? 0 : 1, total = wa + wb;
          if (!total) continue;
          const fix = (d - LINK[i]) / d * stiffness;
          a[0] += dx * fix * wa / total; a[1] += dy * fix * wa / total;
          b[0] -= dx * fix * wb / total; b[1] -= dy * fix * wb / total;
        }
      }
      // Settled: within half a pixel of rest and barely moving (or very close after ~4 s), so the snap to the exact curve is invisible.
      if (held >= 0) { idle = 0; return false; }
      idle += 1;
      return (gravity < .02 && motion * u < .05 && distance * u < .5) || (idle > 240 && distance * u < 2);
    };

    const loop = now => {
      frame = 0;
      const elapsed = Math.min(50, now - lastTime);
      lastTime = now;
      if (settling) {
        if (step()) { settling = false; sway = 0; renderRest(); } else renderPhysics();
        if (held >= 0) trackPull();
      } else {
        // Ease the sway in slowly and out quickly: hovering stops it almost at once, but never with a jerk.
        const swaying = ready && !reduce && !hovering && inView && !document.hidden;
        sway += ((swaying ? 1 : 0) - sway) * (1 - Math.exp(-elapsed / (swaying ? 800 : 160)));
        if (!swaying && sway < .01) { sway = 0; renderRest(); return; }
        renderSway(now);
      }
      frame = requestAnimationFrame(loop);
    };
    const wake = () => { if (!frame) frame = requestAnimationFrame(loop); };

    // Pull to switch: the tag lights up once it is pulled far enough, and letting go then switches the theme.
    const showArmed = armed => {
      if (armed === tagEl.classList.contains('is-armed')) return;
      tagEl.classList.toggle('is-armed', armed);
      if (armed) navigator.vibrate?.(10);
    };
    const trackPull = () => {
      const u = unit();
      showArmed(pull.move((pos[SEGMENTS][0] - REST[0][0]) * u, (pos[SEGMENTS][1] - REST[0][1]) * u, CHAIN_LENGTH * u));
    };
    const holeOnScreen = () => {
      const s = svgEl.getBoundingClientRect(), u = s.width / 16;
      return {x: s.left + pos[SEGMENTS][0] * u, y: s.top + pos[SEGMENTS][1] * u};
    };
    // From the keyboard or a screen reader: a short automatic pull, then the switch.
    const onAutoPull = () => {
      if (reduce) { switchTheme(); return; }
      pos[SEGMENTS][1] += 34 / unit();
      prev[SEGMENTS][1] = pos[SEGMENTS][1];
      settling = true; sway = 0;
      wake();
      clearTimeout(pullTimer);
      pullTimer = setTimeout(() => switchTheme(holeOnScreen()), 180);
    };

    const start = (event, index) => {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      settling = true; sway = 0; // the physics carries on from wherever the sway had the chain
      held = index; pointerId = event.pointerId;
      const p = toUnits(event.clientX, event.clientY);
      offset = [pos[held][0] - p[0], pos[held][1] - p[1]];
      target = [...pos[held]];
      // How far the tag reaches beyond its hole, so it can be kept on screen while dragged (no sideways overflow).
      const r = tagEl.getBoundingClientRect(), u = unit(), s = svgEl.getBoundingClientRect();
      const holeX = s.left + pos[SEGMENTS][0] * u, holeY = s.top + pos[SEGMENTS][1] * u;
      bounds = {left: holeX - r.left, right: r.right - holeX, top: holeY - r.top, bottom: r.bottom - holeY};
      tagEl.classList.add('is-dragging');
      wake();
    };
    const onTagDown = event => start(event, SEGMENTS);
    const onChainDown = event => {
      const p = toUnits(event.clientX, event.clientY);
      let nearest = 1, best = Infinity;
      for (let i = 1; i <= SEGMENTS; i++) { const d = Math.hypot(pos[i][0] - p[0], pos[i][1] - p[1]); if (d < best) { best = d; nearest = i; } }
      start(event, nearest);
    };
    const onMove = event => {
      if (held < 0 || event.pointerId !== pointerId) return;
      const p = toUnits(event.clientX, event.clientY);
      let t = [p[0] + offset[0], p[1] + offset[1]];
      // The chain stretches, but only so far: at most about 2.4× its length from the ring.
      const scale = unit(), reach = maxReach(LINK.slice(0, held).reduce((sum, l) => sum + l, 0) * scale) / scale;
      const dx = t[0] - REST[0][0], dy = t[1] - REST[0][1], d = Math.hypot(dx, dy);
      if (d > reach) t = [REST[0][0] + dx / d * reach, REST[0][1] + dy / d * reach];
      // Keep the whole tag inside the viewport (8px margin) when it is the part being dragged.
      if (held === SEGMENTS && bounds) {
        const s = svgEl.getBoundingClientRect(), u = s.width / 16, margin = 8;
        const minX = (margin + bounds.left - s.left) / u, maxX = (innerWidth - margin - bounds.right - s.left) / u;
        const minY = (margin + bounds.top - s.top) / u, maxY = (innerHeight - margin - bounds.bottom - s.top) / u;
        t = [Math.min(maxX, Math.max(minX, t[0])), Math.min(maxY, Math.max(minY, t[1]))];
      }
      target = t;
      wake();
    };
    const letGo = () => {
      held = -1; pointerId = null; target = null;
      tagEl.classList.remove('is-dragging');
      showArmed(false);
      wake();
    };
    const onUp = event => {
      if (held < 0 || event.pointerId !== pointerId) return;
      const origin = holeOnScreen();
      const fire = pull.release();
      letGo();
      if (fire) switchTheme(origin);
    };
    // An interrupted touch, or Esc while holding, never switches.
    const onCancel = event => {
      if (held < 0 || event.pointerId !== pointerId) return;
      pull.cancel();
      letGo();
    };
    const onKey = event => {
      if (event.key === 'Escape' && held >= 0) { pull.cancel(); letGo(); }
    };
    // Hover is tracked for a mouse only: a finger has no hover, and holding it down is already a drag.
    const onEnter = event => { if (event.pointerType === 'mouse') { hovering = true; wake(); } };
    const onLeave = event => { if (event.pointerType === 'mouse') { hovering = false; wake(); } };

    const startTimer = setTimeout(() => { ready = true; wake(); }, SWAY_START);
    const watcher = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; wake(); });
    watcher.observe(tagEl);
    document.addEventListener('visibilitychange', wake);
    window.addEventListener(TAG_PULL_EVENT, onAutoPull);
    window.addEventListener('keydown', onKey);
    // Touch screens have no hover, so the "pull" hint shows once on a first visit.
    try {
      if (window.matchMedia('(hover: none)').matches && !reduce && !localStorage.getItem(HINT_KEY)) {
        hintOn = setTimeout(() => {
          tagEl.classList.add('is-hinting');
          try { localStorage.setItem(HINT_KEY, '1'); } catch { /* the hint just shows again next time */ }
          hintOff = setTimeout(() => tagEl.classList.remove('is-hinting'), 4000);
        }, 2200);
      }
    } catch { /* storage blocked: no hint */ }

    for (const el of [tagEl, grabEl]) {
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointerleave', onLeave);
    }
    tagEl.addEventListener('pointerdown', onTagDown);
    grabEl.addEventListener('pointerdown', onChainDown);
    window.addEventListener('pointermove', onMove, {passive: true});
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(startTimer);
      clearTimeout(pullTimer);
      clearTimeout(hintOn);
      clearTimeout(hintOff);
      tagEl.classList.remove('is-hinting', 'is-armed', 'is-dragging');
      window.removeEventListener(TAG_PULL_EVENT, onAutoPull);
      window.removeEventListener('keydown', onKey);
      watcher.disconnect();
      document.removeEventListener('visibilitychange', wake);
      for (const el of [tagEl, grabEl]) {
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
      }
      tagEl.removeEventListener('pointerdown', onTagDown);
      grabEl.removeEventListener('pointerdown', onChainDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      renderRest();
    };
  }, [reduce]);

  return <>
    <Entrance as="svg" ref={svg} className="hero-tag-chain" delay={.43} viewBox="0 0 16 32" aria-hidden="true">
      <defs><linearGradient id="hero-tag-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4f5ef"/><stop offset=".45" stopColor="#a9ae9e"/><stop offset=".7" stopColor="#dfe2d8"/><stop offset="1" stopColor="#7d8274"/></linearGradient></defs>
      <path ref={links} className="hero-tag-links" d={REST_PATH}/>
      <path ref={beads} className="hero-tag-beads" d={REST_PATH}/>
      <path ref={grab} className="hero-tag-grab" d={REST_PATH}/>
      <circle className="hero-tag-ring" cx="3" cy="3.5" r="1.7"/>
    </Entrance>
    <Entrance as="span" ref={tag} className="hero-badge" delay={.43} aria-hidden="true"><span className="hero-badge-top">FULL STACK</span><strong>DEVELOPER</strong><span className="hero-tag-mode">{dark ? <MoonIcon/> : <SunIcon/>}</span><span className="hero-tag-hint"><span className="hero-tag-hint-pull">Pull for {dark ? 'light' : 'dark'}</span><span className="hero-tag-hint-release">Release</span></span></Entrance>
  </>;
}
