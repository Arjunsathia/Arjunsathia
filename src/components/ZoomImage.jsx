import React, {useEffect, useRef, useState} from 'react';

// An image you can zoom into on a touch screen: double-tap to zoom in 2.5× at that spot (double-tap again to zoom
// back out), pinch to zoom between 1× and 4×, and drag with one finger to look around while zoomed. The image never
// leaves its box. While zoomed, `onZoomChange(true)` lets the viewer stop its sideways swiping between screens.
// It resets when `active` turns false (another screen is showing). With a mouse it behaves like a plain image.
const MAX = 4;
const TAP_ZOOM = 2.5;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function ZoomImage({src, alt, active = true, onZoomChange, ...props}) {
  const box = useRef(null);
  const img = useRef(null);
  const view = useRef({s: 1, x: 0, y: 0});
  const [zoomed, setZoomed] = useState(false);
  const zoomedRef = useRef(false);
  const notify = useRef(onZoomChange);
  notify.current = onZoomChange;

  const apply = (next, animate) => {
    const el = box.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const s = clamp(next.s, 1, MAX);
    // Keep the zoomed image covering its box: no gaps at the edges.
    const x = clamp(next.x, w - w * s, 0);
    const y = clamp(next.y, h - h * s, 0);
    view.current = {s, x, y};
    const node = img.current;
    node.style.transition = animate ? 'transform .32s cubic-bezier(.22,1,.36,1)' : 'none';
    node.style.transform = s === 1 ? '' : `translate(${x}px, ${y}px) scale(${s})`;
    const on = s > 1.01;
    if (on !== zoomedRef.current) {
      zoomedRef.current = on;
      setZoomed(on);
      notify.current?.(on);
    }
  };

  useEffect(() => { if (!active) apply({s: 1, x: 0, y: 0}, false); }, [active]);

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const points = new Map();
    let pinch = null, drag = null, lastTap = null;
    const local = e => { const r = el.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
    const zoomAt = (p, s, animate) => {
      const v = view.current;
      // Keep the content point under `p` in place as the scale changes.
      const cx = (p.x - v.x) / v.s, cy = (p.y - v.y) / v.s;
      apply({s, x: p.x - cx * s, y: p.y - cy * s}, animate);
    };
    const down = e => {
      if (e.pointerType === 'mouse') return;
      points.set(e.pointerId, local(e));
      if (points.size === 2) {
        const [a, b] = [...points.values()];
        pinch = {d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: view.current.s};
        drag = null;
      } else if (points.size === 1) {
        drag = {start: local(e), at: performance.now(), from: {...view.current}, moved: false};
        if (zoomedRef.current) el.setPointerCapture?.(e.pointerId);
      }
    };
    const move = e => {
      if (!points.has(e.pointerId)) return;
      points.set(e.pointerId, local(e));
      if (pinch && points.size >= 2) {
        const [a, b] = [...points.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        zoomAt({x: (a.x + b.x) / 2, y: (a.y + b.y) / 2}, pinch.s * d / pinch.d, false);
        e.preventDefault();
        return;
      }
      if (drag) {
        const p = local(e);
        const dx = p.x - drag.start.x, dy = p.y - drag.start.y;
        if (Math.hypot(dx, dy) > 8) drag.moved = true;
        if (zoomedRef.current) {
          apply({s: view.current.s, x: drag.from.x + dx, y: drag.from.y + dy}, false);
          e.preventDefault();
        }
      }
    };
    const up = e => {
      if (!points.has(e.pointerId)) return;
      points.delete(e.pointerId);
      if (pinch) {
        if (points.size < 2) pinch = null;
        if (view.current.s < 1.05) apply({s: 1, x: 0, y: 0}, true);
        drag = null;
        return;
      }
      if (!drag) return;
      const tap = !drag.moved && performance.now() - drag.at < 300;
      drag = null;
      if (!tap) return;
      const p = local(e);
      const now = performance.now();
      if (lastTap && now - lastTap.at < 320 && Math.hypot(p.x - lastTap.p.x, p.y - lastTap.p.y) < 30) {
        lastTap = null;
        if (zoomedRef.current) apply({s: 1, x: 0, y: 0}, true);
        else zoomAt(p, TAP_ZOOM, true);
      } else {
        lastTap = {at: now, p};
      }
    };
    const cancel = e => { points.delete(e.pointerId); if (points.size < 2) pinch = null; drag = null; };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move, {passive: false});
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancel);
    const resize = () => { if (zoomedRef.current) apply(view.current, false); };
    window.addEventListener('resize', resize);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <div ref={box} className={`zoom-image${zoomed ? ' is-zoomed' : ''}`}>
    <img ref={img} src={src} alt={alt} draggable={false} {...props}/>
  </div>;
}
