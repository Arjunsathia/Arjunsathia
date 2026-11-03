import React, {useEffect, useRef, useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {Reveal, Item} from '../lib/motion.jsx';
import {sampleTestimonials} from '../content/site.js';
import {SectionHeading} from '../components/SectionHeading.jsx';

export function Testimonials() {
  const track = useRef(null);
  const count = sampleTestimonials.length;
  const middle = count * 2;
  const current = useRef(middle + 1);
  const [active, setActive] = useState(1);
  const reducedMotion = useReducedMotion();
  function moveTo(index, behavior = reducedMotion ? 'instant' : 'smooth') {
    const panel = track.current;
    const card = panel?.children[index];
    if (card) panel.scrollTo({left:card.offsetLeft - (panel.clientWidth - card.offsetWidth) / 2, behavior});
  }
  function recenter() {
    const panel = track.current;
    const index = current.current;
    const target = middle + index % count;
    if (index === target) return;
    const shift = panel.children[target].offsetLeft - panel.children[index].offsetLeft;
    current.current = target;
    panel.scrollTo({left:panel.scrollLeft + shift, behavior:'instant'});
  }
  useEffect(() => {
    const panel = track.current;
    const observer = new ResizeObserver(() => {
      current.current = middle + current.current % count;
      moveTo(current.current, 'instant');
    });
    observer.observe(panel);
    // Safari has no scrollend event; settle the loop shortly after scrolling stops instead.
    let settle = 0;
    const settleSoon = () => {clearTimeout(settle);settle = setTimeout(recenter, 160);};
    const endEvent = 'onscrollend' in window ? 'scrollend' : 'scroll';
    const onEnd = endEvent === 'scrollend' ? recenter : settleSoon;
    panel.addEventListener(endEvent, onEnd, {passive:true});
    return () => {observer.disconnect();clearTimeout(settle);cancelAnimationFrame(frame.current);panel.removeEventListener(endEvent, onEnd);};
  }, []);
  // Measure at most once per frame while swiping, rather than on every scroll event.
  const frame = useRef(0);
  const onScroll = () => {if (!frame.current) frame.current = requestAnimationFrame(() => {frame.current = 0;syncActive();});};
  function syncActive() {
    const panel = track.current;
    const center = panel.scrollLeft + panel.clientWidth / 2;
    const cards = Array.from(panel.children);
    const closest = cards.reduce((best, card, i) => Math.abs(card.offsetLeft + card.offsetWidth / 2 - center) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - center) ? i : best, 0);
    current.current = closest;
    setActive(closest % count);
    // Extra copies leave room for momentum; recycle before reaching an outer edge.
    if (closest < count || closest >= count * 4) recenter();
  }
  return <section className="testimonials-section section-wrap" id="testimonials" aria-labelledby="testimonials-title">
    <SectionHeading number="07" id="testimonials-title" title={<><span className="testimonials-title-lead">In their </span><Item as="span" variant="wipe" className="testimonials-title-mark">words.</Item></>} note="FEEDBACK & COLLABORATION" />
    <Reveal as="p" className="testimonials-intro" delay={.1}>A few words from the people I work with.</Reveal>
    <Reveal className="testimonials-carousel" distance={28} delay={.15}>
      <div className="testimonial-track" ref={track} onScroll={onScroll} role="region" aria-label="Testimonials, scroll horizontally to explore" aria-roledescription="carousel" tabIndex={0} onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          moveTo(current.current + (event.key === 'ArrowRight' ? 1 : -1));
        }
      }}>
        {Array.from({length:5},(_,copy)=>sampleTestimonials.map((item,i)=><figure className="testimonial-slide" key={`${copy}-${item.name}`} data-tone={i} data-active={active === i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} aria-hidden={copy !== 2 ? true : undefined}>
          <figcaption><span className="testimonial-initials" aria-hidden="true">{item.initials}</span><div><strong>{item.name}</strong><span>{item.role}</span></div></figcaption>
          <blockquote><p>“{item.quote}”</p></blockquote>
        </figure>))}
      </div>
    </Reveal>
  </section>;
}
