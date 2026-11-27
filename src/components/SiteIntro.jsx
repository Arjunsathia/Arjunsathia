import React, {createContext, useEffect, useState} from 'react';
import RotatingText from './RotatingText.jsx';

// The opening screen: the nine-dot loader (a lime dot orbiting the 3×3 grid) beside one word at a time on the plain dark band, each sliding up letter by letter like the
// manifesto's rotating words ("Loading" → "Crafting" → "Welcome."), with no box, border or other text. At five seconds
// the last word zooms out towards the viewer as the screen fades, and the hero settles in behind it. The hero's own
// animations (the name drawing in, the ID card dropping) wait for `IntroContext` to say the page is revealed.
// Links straight to a section (/#contact) skip it, and reduced motion keeps it short and still.
export const IntroContext = createContext(true);

// The dot loader's orbit: each outer dot lights in turn round the ring (the centre stays empty), 108ms apart.
const ORBIT = [0, 1, 2, 7, null, 3, 6, 5, 4];
const DOT_STEP = 108;
const Dots = () => <span className="site-intro-dots" aria-hidden="true">
  {ORBIT.map((unit, i) => <span key={i} data-hole={unit == null ? '' : undefined} style={unit == null ? undefined : {animationDelay: `${unit * DOT_STEP}ms`}}/>)}
</span>;

const WORDS = ['Loading', 'Crafting', 'Welcome.'];
const TIMING = {full: {step: 1500, leave: 4500, gone: 5300}, reduced: {step: 0, leave: 1000, gone: 1300}};

export const introSkipped = () => typeof window === 'undefined' || Boolean(window.location.hash.slice(1));

export function SiteIntro({onReveal}) {
  const [phase, setPhase] = useState('working');
  const [reduce] = useState(() => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  // The first word waits for the display face (at most 0.6s), so it slides in at its final width instead of jumping.
  const [fontReady, setFontReady] = useState(() => !document.fonts || document.fonts.check('400 1em Anton'));
  useEffect(() => {
    if (fontReady) return undefined;
    const ready = () => setFontReady(true);
    const timer = setTimeout(ready, 600);
    document.fonts?.load('400 1em Anton').then(ready, ready);
    return () => clearTimeout(timer);
  }, [fontReady]);
  // The page stays locked from the start; the clock to the zoom-out starts with the first word.
  useEffect(() => {
    document.documentElement.classList.add('intro-running');
  }, []);
  useEffect(() => {
    if (!fontReady) return undefined;
    const t = reduce ? TIMING.reduced : TIMING.full;
    const root = document.documentElement;
    root.classList.add('intro-running');
    const timers = [
      setTimeout(() => {
        setPhase('leaving');
        root.classList.remove('intro-running');
        root.classList.add('intro-revealing');
        onReveal();
      }, t.leave),
      setTimeout(() => {
        setPhase('gone');
        root.classList.remove('intro-revealing');
      }, t.gone),
    ];
    return () => {
      timers.forEach(clearTimeout);
      root.classList.remove('intro-running', 'intro-revealing');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontReady]);
  if (phase === 'gone') return null;
  return <div className="site-intro" data-phase={phase} role="status" aria-label="Loading portfolio" aria-hidden={phase === 'leaving' ? true : undefined}>
    <div className="site-intro-inner">
      <Dots/>
      {fontReady && <RotatingText texts={reduce ? WORDS.slice(0, 1) : WORDS} rotationInterval={TIMING.full.step} loop={false} auto={!reduce}
        highlight highlightColor="transparent" mainClassName="site-intro-word" effect="slide" direction="up"
        staggerFrom="last" staggerDuration={0.03} animatePresenceMode="popLayout" animatePresenceInitial/>}
    </div>
  </div>;
}
