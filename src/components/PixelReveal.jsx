import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {useCompactMotion} from '../lib/motion.jsx';

// A grid of screen-coloured "pixels" over an image that clear in a scattered, slightly diagonal order the first time
// the image is on screen and loaded, like a display decoding. Put it inside the image's (position: relative,
// overflow: hidden) frame, after the <img>. Opacity only, once, then it removes itself. Larger screens only: phones
// (and reduced motion) keep the plain lazy-image fade, so scrolling there stays light.
const COLS = 12;
const ROWS = 8;

export default function PixelReveal({className}) {
  const node = useRef(null);
  const reduce = useReducedMotion();
  const compact = useCompactMotion();
  const [phase, setPhase] = useState('waiting');
  // Each cell's moment (0-1 of the run) and a slight shade, fixed for the life of the component.
  const cells = useMemo(() => Array.from({length: COLS * ROWS}, (_, i) => {
    const col = i % COLS, row = Math.floor(i / COLS);
    return {at: Math.random() * .6 + ((col / COLS + row / ROWS) / 2) * .4, shade: Math.round(Math.random() * 22)};
  }), []);
  const skip = reduce || compact;
  useEffect(() => {
    if (skip || phase !== 'waiting') return undefined;
    const overlay = node.current;
    const image = overlay?.parentElement?.querySelector('img');
    if (!overlay || !image || typeof IntersectionObserver === 'undefined') { setPhase('done'); return undefined; }
    let seen = false, loaded = image.complete && image.naturalWidth > 0;
    const go = () => { if (seen && loaded) setPhase('running'); };
    const onLoad = () => { loaded = true; go(); };
    image.addEventListener('load', onLoad);
    image.addEventListener('error', () => setPhase('done'), {once: true});
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      seen = true;
      observer.disconnect();
      go();
    }, {threshold: .35});
    observer.observe(overlay);
    return () => { observer.disconnect(); image.removeEventListener('load', onLoad); };
  }, [skip, phase]);
  useEffect(() => {
    if (phase !== 'running') return undefined;
    // The run is 0.75s of staggered starts plus each cell's 0.2s fade.
    const timer = setTimeout(() => setPhase('done'), 1050);
    return () => clearTimeout(timer);
  }, [phase]);
  if (skip || phase === 'done') return null;
  return <span ref={node} className={['pixel-reveal', phase === 'running' && 'is-running', className].filter(Boolean).join(' ')} aria-hidden="true" style={{'--pixel-cols': COLS, '--pixel-rows': ROWS}}>
    {cells.map((cell, i) => <span key={i} style={{'--pixel-at': cell.at.toFixed(3), '--pixel-shade': `${cell.shade}%`}}/>)}
  </span>;
}
