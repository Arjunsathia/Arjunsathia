import React, {useLayoutEffect, useRef} from 'react';
import {gsap} from 'gsap';

import './SplitText.css';

// React Bits SplitText, "rise" effect with the "lift" hover, for the site's headings. Site changes:
// - It splits the heading's own text in place (children, not a `text` string), so the coloured marks, line breaks and
//   doodles inside a heading keep working: only text nodes are split, and each word stays unbreakable. Text inside
//   an svg or an element marked data-split-skip is left as it is.
// - Splitting keeps React's own text nodes aside and puts them back on cleanup, so React never loses track of them.
// - Letters rise in once the heading scrolls into view (IntersectionObserver, threshold 0.1, -100px bottom margin),
//   with the per-letter delay capped so long headings still finish in good time.
// - The hover lift (letters near the pointer spring up) runs for a mouse or pen only. Reduced motion: no split at all.
const STIFFNESS = 180;
const DAMPING = 19;

const splitInto = root => {
  const restore = [];
  const chars = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: node => (node.parentElement?.closest('svg, [data-split-skip]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const text = node.nodeValue;
    if (!text || !text.trim()) return;
    const fragment = document.createDocumentFragment();
    text.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        fragment.append(document.createTextNode(part));
        return;
      }
      const word = document.createElement('span');
      word.className = 'split-word';
      Array.from(part).forEach(letter => {
        const char = document.createElement('span');
        char.className = 'split-char';
        char.textContent = letter;
        word.append(char);
        chars.push(char);
      });
      fragment.append(word);
    });
    const marker = fragment.firstChild;
    node.parentNode.insertBefore(fragment, node);
    const added = [];
    for (let el = marker; el && el !== node; el = el.nextSibling) added.push(el);
    node.remove();
    restore.push({node, added});
  });
  return {
    chars,
    revert: () => restore.forEach(({node, added}) => {
      const first = added[0];
      if (first?.parentNode) first.parentNode.insertBefore(node, first);
      added.forEach(el => el.remove());
    })
  };
};

export default function SplitText({
  as: Tag = 'p',
  children,
  className = '',
  delay = 50,
  maxStagger = 0.9,
  startDelay = 0,
  duration = 1.25,
  ease = 'power3.out',
  distance = 40,
  threshold = 0.1,
  rootMargin = '-100px',
  hoverEffect = 'lift',
  ...props
}) {
  const ref = useRef(null);
  const label = useRef('');

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const copy = el.cloneNode(true);
    copy.querySelectorAll('br').forEach(br => br.replaceWith(' '));
    copy.querySelectorAll('svg').forEach(svg => svg.remove());
    label.current = copy.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', label.current);
    const {chars, revert} = splitInto(el);
    chars.forEach(char => char.setAttribute('aria-hidden', 'true'));
    if (!chars.length) return revert;

    const each = Math.min(delay / 1000, maxStagger / Math.max(chars.length - 1, 1));
    gsap.set(chars, {opacity: 0, y: distance, willChange: 'transform, opacity'});
    let revealed = false;
    let tween = null;
    const play = () => {
      tween = gsap.to(chars, {
        opacity: 1, y: 0, duration, ease, delay: startDelay, stagger: each,
        onComplete: () => {
          revealed = true;
          el.dataset.split = 'done';
          gsap.set(chars, {clearProps: 'transform,opacity,willChange'});
        }
      });
    };
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      play();
    }, {threshold, rootMargin: `0px 0px ${rootMargin} 0px`});
    observer.observe(el);

    // Hover lift: each letter springs up by up to 0.2em, most under the pointer, easing off with distance.
    let raf = 0;
    let last = 0;
    let centers = null;
    const springs = chars.map(() => ({y: 0, v: 0}));
    const pointer = {x: 0, y: 0, inside: false};
    const em = () => parseFloat(getComputedStyle(el).fontSize) || 16;
    let size = 16;
    const measure = () => {
      const box = el.getBoundingClientRect();
      size = em();
      centers = chars.map((char, i) => {
        const rect = char.getBoundingClientRect();
        return {x: rect.left + rect.width / 2 - box.left, y: rect.top + rect.height / 2 - box.top - springs[i].y};
      });
    };
    const tick = now => {
      raf = 0;
      const dt = Math.min(0.032, Math.max(0.001, (now - last) / 1000));
      last = now;
      const radius = size * 1.15;
      const lift = size * 0.2;
      let moving = false;
      chars.forEach((char, i) => {
        const spring = springs[i];
        const spot = pointer.inside && revealed ? centers?.[i] : null;
        let target = 0;
        if (spot) {
          const dx = (spot.x - pointer.x) / radius;
          const dy = (spot.y - pointer.y) / (radius * 1.4);
          target = -lift * Math.exp(-(dx * dx + dy * dy) * 0.5);
        }
        spring.v += (STIFFNESS * (target - spring.y) - DAMPING * spring.v) * dt;
        spring.y += spring.v * dt;
        if (Math.abs(target - spring.y) < 0.02 && Math.abs(spring.v) < 0.05) {
          spring.y = target;
          spring.v = 0;
        } else moving = true;
        char.style.translate = Math.abs(spring.y) > 0.01 ? `0 ${spring.y.toFixed(2)}px` : '';
      });
      if (moving) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const locate = e => {
      const box = el.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = e.clientY - box.top;
    };
    const onEnter = e => {
      if (e.pointerType === 'touch' || !revealed) return;
      locate(e);
      pointer.inside = true;
      measure();
      wake();
    };
    const onMove = e => {
      if (e.pointerType === 'touch' || !revealed) return;
      locate(e);
      pointer.inside = true;
      if (!centers) measure();
      wake();
    };
    const onLeave = () => {
      pointer.inside = false;
      centers = null;
      wake();
    };
    const hover = hoverEffect === 'lift';
    if (hover) {
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
    }

    return () => {
      observer.disconnect();
      tween?.kill();
      cancelAnimationFrame(raf);
      if (hover) {
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      }
      gsap.set(chars, {clearProps: 'all'});
      revert();
      el.removeAttribute('aria-label');
      delete el.dataset.split;
    };
  }, [delay, maxStagger, startDelay, duration, ease, distance, threshold, rootMargin, hoverEffect]);

  return <Tag ref={ref} className={`split-parent ${className}`.trim()} {...props}>{children}</Tag>;
}
