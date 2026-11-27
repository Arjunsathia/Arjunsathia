import React, {useEffect, useRef} from 'react';
import {useReducedMotion} from 'motion/react';
import {Reveal} from '../lib/motion.jsx';
import {Asterisk} from '../components/icons.jsx';
import RotatingText from '../components/RotatingText.jsx';
import CircularText from '../components/CircularText.jsx';
import {useCompactMotion} from '../lib/motion.jsx';

// The manifesto: each highlighted word rotates through what that line covers. Every list starts with the original
// word and stays within the width of "EVERYTHING." so no line outgrows a phone screen.
const LINES = [
  {lead: 'I BUILD', mark: 'front-mark', words: ['FRONT.', 'PRODUCTS.', 'APPS.', 'SITES.']},
  {lead: 'I CONNECT', mark: 'back-mark', words: ['BACK.', 'APIS.', 'DATA.', 'SYSTEMS.']},
  {lead: 'I TEST', mark: 'test-mark', words: ['EVERYTHING.', 'EDGE CASES.', 'EVERY FLOW.', 'RELEASES.']},
];
// The lines change one after another (a cascade down the manifesto), each every LINE_STEP * 3 ms.
const LINE_STEP = 1200;

export function Intro() {
  const section = useRef(null);
  const rotators = useRef([]);
  const reduce = useReducedMotion();
  const compact = useCompactMotion();
  // Rotate only while the section is on screen (and not with reduced motion), so it starts on the original words.
  useEffect(() => {
    const node = section.current;
    if (!node || reduce) return undefined;
    let timer = 0;
    let line = 0;
    const tick = () => {
      rotators.current[line]?.next();
      line = (line + 1) % LINES.length;
      timer = setTimeout(tick, LINE_STEP);
    };
    const observer = new IntersectionObserver(([entry]) => {
      clearTimeout(timer);
      if (entry.isIntersecting) timer = setTimeout(tick, LINE_STEP * 1.5);
    }, {threshold: .35});
    observer.observe(node);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, [reduce]);
  return <section className="intro-section" aria-labelledby="intro-title" ref={section}><div className="section-wrap"><p className="eyebrow">ONE DEVELOPER. THE WHOLE PICTURE.</p><h2 id="intro-title">
    {LINES.map((line, i) => <Reveal as="span" className="manifesto-line" distance={24} delay={i*.08} style={{'--line-index':i}} key={line.lead}>{line.lead} <mark className={line.mark}>
      <RotatingText ref={el => { rotators.current[i] = el; }} texts={line.words} auto={false} highlight highlightColor="transparent"
        mainClassName="manifesto-rotate" splitLevelClassName="manifesto-rotate-word" effect="slide" direction="up"
        staggerFrom="last" staggerDuration={0.025} animatePresenceMode="popLayout"/>
    </mark></Reveal>)}
  </h2><div className="intro-bottom">
    <p>Good software should feel simple. I work across interfaces, APIs, and databases to make that happen.</p>
    {/* A spinning badge on the right: the manifesto's verbs around the asterisk.
        Faster on hover, tilts towards the mouse and can be spun by dragging (not on touch screens, so scrolling is never
        blocked). */}
    <CircularText className="intro-badge" text="BUILD • CONNECT • TEST • SHIP • " size={compact ? 108 : 168}
      fontSize={compact ? 9.5 : 13} fontWeight={700} spinDuration={22} onHover="speedUp" hoverTilt={compact ? 0 : 14}
      draggable={!compact} ring ringColor="color-mix(in srgb, var(--accent-on-dark) 28%, transparent)">
      <Asterisk className="code-flower"/>
    </CircularText>
  </div></div></section>;
}
