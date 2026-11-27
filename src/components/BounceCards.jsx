import React, { Children, useEffect, useRef } from 'react';

import './BounceCards.css';

// React Bits BounceCards, extended for this site:
// - `children`: each child becomes a card (instead of an image), for cards with real content.
// - `layout="flow"`: the cards stay where the page's own CSS puts them (a grid, a column) at their own size; the
//   springs only add the tilt, the pop-in, the hover lift and the push on top of that place.
// - In flow layout the neighbours are pushed aside only while the cards sit in a row (never when they're stacked in a
//   column, where a push would shove them over each other or off a narrow screen).
// - `appearOnView`: each card pops in when it scrolls into view, rather than when the page loads.
// - Hover follows a mouse or pen only; on touch screens a tap gives the card a little bounce, and scrolling with a
//   finger over the cards doesn't set them moving.

const PATTERN = [1, 0.5, -0.3, -1, 0.2, 0.75, -0.6, 0.35, -0.85, 0.1];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseTransform = value => {
  if (typeof value !== 'string') return null;
  const rotate = value.match(/rotate\(\s*(-?[\d.]+)deg\s*\)/);
  const translate = value.match(/translate\(\s*(-?[\d.]+)px(?:\s*,\s*(-?[\d.]+)px)?\s*\)/);
  return {
    x: translate ? Number(translate[1]) : 0,
    y: translate && translate[2] ? Number(translate[2]) : 0,
    rotate: rotate ? Number(rotate[1]) : 0
  };
};

const toCard = item => (typeof item === 'string' ? { src: item, alt: '' } : { src: item?.src, alt: item?.alt ?? '' });

export default function BounceCards({
  images = [],
  children,
  layout = 'stack',
  appearOnView = false,
  className = '',
  cardClassName = '',
  style,
  containerWidth = 400,
  containerHeight = 400,
  cardSize = 200,
  spread = 85,
  rotation = 10,
  arc = 0,
  animationDelay = 0.5,
  animationStagger = 0.06,
  bounciness = 0.6,
  enableHover = true,
  pushDistance = 160,
  hoverScale = 1.06,
  hoverLift,
  borderWidth = 5,
  borderColor = '#ffffff',
  radius = 25,
  shadow = true,
  transformStyles,
  onCardClick
}) {
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const wakeRef = useRef(null);
  const flow = layout === 'flow';
  const content = children == null ? null : Children.toArray(children);
  const cards = content ? content.map(() => ({ src: null, alt: '' })) : images.map(toCard);
  const count = cards.length;
  const middle = (count - 1) / 2;
  const reach = Math.max(1, middle);
  const slots = cards.map((_, i) => {
    const custom = transformStyles ? parseTransform(transformStyles[i]) : null;
    if (custom) return custom;
    const offset = i - middle;
    const rotate = rotation * PATTERN[i % PATTERN.length];
    // In flow layout the page places the cards; the slot is only their resting tilt.
    if (flow) return { x: 0, y: 0, rotate };
    return { x: offset * spread, y: arc * (offset / reach) ** 2, rotate };
  });
  const settings = {
    slots,
    flow,
    appearOnView,
    cardSize: Math.max(10, cardSize),
    lift: hoverLift ?? Math.max(10, cardSize) * 0.04,
    delay: Math.max(0, animationDelay),
    stagger: Math.max(0, animationStagger),
    bounciness: clamp(bounciness, 0, 1),
    enableHover,
    pushDistance,
    hoverScale: clamp(hoverScale, 0.5, 2),
    clickable: typeof onCardClick === 'function'
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const clickRef = useRef(onCardClick);
  clickRef.current = onCardClick;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const bodies = [];
    // `shown[i]`: when card i may start to pop in (null until it has been seen, with appearOnView).
    const shown = [];
    const state = { hovered: -1, time: 0, layer: -1 };
    let raf = 0;
    let last = performance.now();
    let alive = true;

    const body = i => {
      if (!bodies[i]) {
        const slot = settingsRef.current.slots[i] ?? { x: 0, y: 0, rotate: 0 };
        bodies[i] = {
          x: slot.x,
          y: slot.y,
          rotate: slot.rotate,
          scale: reduce ? 1 : 0,
          vx: 0,
          vy: 0,
          vr: 0,
          vs: 0
        };
        if (!settingsRef.current.appearOnView && shown[i] == null) shown[i] = state.time + i * settingsRef.current.stagger;
      }
      return bodies[i];
    };

    // Whether the (flow) cards sit side by side: then a hover pushes the neighbours aside.
    const inRow = () => {
      const [a, b] = cardRefs.current;
      if (!a || !b) return true;
      return Math.abs(a.offsetTop - b.offsetTop) < a.offsetHeight / 2;
    };

    const step = (value, velocity, target, stiffness, damping, dt) => {
      const next = velocity + ((target - value) * stiffness - velocity * damping) * dt;
      return [value + next * dt, next];
    };

    const frame = now => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
      last = now;
      state.time += dt;

      const hovered = s.enableHover ? state.hovered : -1;
      const push = !s.flow || inRow() ? s.pushDistance : 0;
      const popStiffness = 170;
      const popDamping = 2 * (1 - 0.85 * s.bounciness) * Math.sqrt(popStiffness);
      const moveStiffness = 210;
      const moveDamping = 2 * (reduce ? 1 : 0.72) * Math.sqrt(moveStiffness);
      const substeps = Math.ceil(dt / (1 / 240));
      const h = dt / substeps;
      let moving = 0;

      for (let i = 0; i < s.slots.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const card = body(i);
        const slot = s.slots[i];
        const waiting = !reduce && shown[i] == null;
        const appeared = reduce || (!waiting && state.time - shown[i] >= s.delay);
        let targetX = slot.x;
        let targetY = slot.y;
        let targetRotate = slot.rotate;
        let targetScale = appeared ? 1 : 0;
        if (hovered >= 0 && appeared) {
          if (i === hovered) {
            targetY = slot.y - s.lift;
            targetRotate = 0;
            targetScale = s.hoverScale;
          } else {
            targetX = slot.x + Math.sign(i - hovered) * push;
          }
        }
        for (let k = 0; k < substeps; k++) {
          [card.x, card.vx] = step(card.x, card.vx, targetX, moveStiffness, moveDamping, h);
          [card.y, card.vy] = step(card.y, card.vy, targetY, moveStiffness, moveDamping, h);
          [card.rotate, card.vr] = step(card.rotate, card.vr, targetRotate, moveStiffness, moveDamping, h);
          if (reduce) {
            card.scale = targetScale;
            card.vs = 0;
          } else {
            [card.scale, card.vs] = step(card.scale, card.vs, targetScale, popStiffness, popDamping, h);
          }
        }
        // A card still waiting to be seen doesn't keep the loop running (the observer wakes it).
        moving += waiting
          ? 0
          : Math.abs(card.vx) +
            Math.abs(card.vy) +
            Math.abs(card.vr) +
            Math.abs(card.vs) * 100 +
            Math.abs(targetX - card.x) +
            Math.abs(targetY - card.y) +
            Math.abs(targetRotate - card.rotate) +
            Math.abs(targetScale - card.scale) * 100 +
            (appeared ? 0 : 1);
        const centre = s.flow ? '' : 'translate(-50%, -50%) ';
        el.style.transform = `${centre}translate3d(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px, 0) rotate(${card.rotate.toFixed(3)}deg) scale(${Math.max(0, card.scale).toFixed(4)})`;
      }

      if (state.layer !== hovered) {
        state.layer = hovered;
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          el.style.zIndex = i === hovered ? String(s.slots.length + 1) : String(i + 1);
          el.toggleAttribute('data-active', i === hovered);
        });
      }

      if (moving > 0.02) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    wakeRef.current = wake;

    // Cards pop in as they come into view; those arriving together still pop one after another.
    let observer = null;
    if (settingsRef.current.appearOnView && !reduce) {
      if (typeof IntersectionObserver === 'function') {
        observer = new IntersectionObserver(
          entries => {
            const arriving = entries
              .filter(entry => entry.isIntersecting)
              .map(entry => cardRefs.current.indexOf(entry.target))
              .filter(i => i >= 0 && shown[i] == null)
              .sort((a, b) => a - b);
            arriving.forEach((i, k) => {
              shown[i] = state.time + k * settingsRef.current.stagger;
              observer.unobserve(cardRefs.current[i]);
            });
            if (arriving.length) wake();
          },
          { threshold: 0.18 }
        );
        cardRefs.current.forEach(el => el && observer.observe(el));
      } else {
        cardRefs.current.forEach((_, i) => {
          shown[i] = 0;
        });
      }
    }

    const pick = event => {
      const s = settingsRef.current;
      if (s.flow) {
        const inside = el => {
          if (!el) return false;
          const r = el.getBoundingClientRect();
          return event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
        };
        // Keep the hovered card while the pointer is still over it (it grows over its neighbours).
        if (state.hovered >= 0 && inside(cardRefs.current[state.hovered])) return state.hovered;
        return cardRefs.current.findIndex(inside);
      }
      const rect = root.getBoundingClientRect();
      const px = event.clientX - rect.left - rect.width / 2;
      const py = event.clientY - rect.top - rect.height / 2;
      let best = -1;
      let distance = Infinity;
      s.slots.forEach((slot, i) => {
        const gap = Math.abs(px - slot.x);
        if (gap < distance) {
          distance = gap;
          best = i;
        }
      });
      if (best < 0) return -1;
      const slot = s.slots[best];
      const half = s.cardSize / 2;
      if (Math.abs(py - slot.y) > half + 12 || distance > half + 12) return -1;
      if (state.hovered >= 0 && state.hovered !== best) {
        const current = s.slots[state.hovered];
        if (current && Math.abs(px - current.x) - distance < 6) return state.hovered;
      }
      return best;
    };

    const onMove = event => {
      if (event.pointerType === 'touch') return;
      const next = pick(event);
      if (next !== state.hovered) {
        state.hovered = next;
        wake();
      }
    };
    const onLeave = () => {
      if (state.hovered !== -1) {
        state.hovered = -1;
        wake();
      }
    };
    const onClick = event => {
      const index = pick(event);
      if (index < 0) return;
      const card = bodies[index];
      if (card && !reduce) card.vs -= 2.2;
      wake();
      clickRef.current?.(index);
    };
    const cardOf = target => cardRefs.current.findIndex(el => el && el.contains(target));
    const onFocus = event => {
      const index = cardOf(event.target);
      if (index >= 0) {
        state.hovered = index;
        wake();
      }
    };
    const onKey = event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const index = cardRefs.current.indexOf(event.target);
      if (index < 0 || !settingsRef.current.clickable) return;
      event.preventDefault();
      if (bodies[index] && !reduce) bodies[index].vs -= 2.2;
      wake();
      clickRef.current?.(index);
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerdown', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('click', onClick);
    root.addEventListener('focusin', onFocus);
    root.addEventListener('focusout', onLeave);
    root.addEventListener('keydown', onKey);
    wake();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      raf = 0;
      observer?.disconnect();
      wakeRef.current = null;
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerdown', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('click', onClick);
      root.removeEventListener('focusin', onFocus);
      root.removeEventListener('focusout', onLeave);
      root.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

  return (
    <div
      ref={rootRef}
      className={`bounce-cards${flow ? ' bounce-cards--flow' : ''}${className ? ` ${className}` : ''}`}
      style={{
        ...(flow ? null : { width: containerWidth, height: containerHeight }),
        '--bounce-cards-size': `${settings.cardSize}px`,
        '--bounce-cards-border': `${Math.max(0, borderWidth)}px`,
        '--bounce-cards-border-color': borderColor,
        '--bounce-cards-radius': `${Math.max(0, radius)}px`,
        '--bounce-cards-shadow': shadow
          ? '0 1px 2px rgba(0, 0, 0, 0.12), 0 10px 28px -6px rgba(0, 0, 0, 0.32)'
          : 'none',
        '--bounce-cards-shadow-active': shadow
          ? '0 2px 4px rgba(0, 0, 0, 0.14), 0 22px 44px -10px rgba(0, 0, 0, 0.42)'
          : 'none',
        ...style
      }}
    >
      {cards.map((card, i) => (
        <div
          key={content ? (content[i].key ?? i) : i}
          ref={el => {
            cardRefs.current[i] = el;
          }}
          className={`bounce-cards__card${settings.clickable ? ' bounce-cards__card--clickable' : ''}${cardClassName ? ` ${cardClassName}` : ''}`}
          style={{ zIndex: i + 1 }}
          {...(settings.clickable ? { role: 'button', tabIndex: 0, 'aria-label': card.alt || `Card ${i + 1}` } : null)}
        >
          {content ? content[i] : card.src && <img src={card.src} alt={card.alt} draggable={false} />}
        </div>
      ))}
    </div>
  );
}
