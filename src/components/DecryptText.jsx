import React, {useEffect, useRef, useState} from 'react';

// Text that decodes itself the first time it scrolls into view: each character cycles through random code glyphs,
// then settles on the real one, left to right. Meant for short monospace labels (the section heading notes), so the
// width never changes while it runs. Spaces and punctuation stay put.
// Screen readers get the real text straight away (the scrambled copy is hidden from them); with reduced motion, or
// before JavaScript, it is just the text.
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+<>=';
const isLetter = char => /[A-Za-z0-9]/.test(char);
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
const scramble = text => [...text].map(char => (isLetter(char) ? randomGlyph() : char)).join('');
const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function DecryptText({text, duration = 900, delay = 150, className}) {
  const node = useRef(null);
  // Starts scrambled (the label is still faded out at that point), so the real text never flashes up first.
  const [shown, setShown] = useState(() => (reduced() ? text : scramble(text)));
  useEffect(() => {
    if (reduced()) { setShown(text); return undefined; }
    const element = node.current;
    if (!element || typeof IntersectionObserver === 'undefined') { setShown(text); return undefined; }
    let frame = 0, timer = 0, start = 0, last = 0;
    const chars = [...text];
    const step = now => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      // Change the random glyphs about every 45ms (not every frame), so it reads as decoding, not noise.
      if (progress < 1 && now - last < 45) { frame = requestAnimationFrame(step); return; }
      last = now;
      // Each character settles at its own point, spread over the last 70% of the run, left to right.
      setShown(chars.map((char, i) => (!isLetter(char) || progress >= .3 + .7 * (i / chars.length) ? char : randomGlyph())).join(''));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      timer = setTimeout(() => { frame = requestAnimationFrame(step); }, delay);
    }, {threshold: 1, rootMargin: '0px 0px -6% 0px'});
    observer.observe(element);
    return () => { observer.disconnect(); clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [text, duration, delay]);
  return <span className={['decrypt-text', className].filter(Boolean).join(' ')} ref={node}>
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">{shown}</span>
  </span>;
}
