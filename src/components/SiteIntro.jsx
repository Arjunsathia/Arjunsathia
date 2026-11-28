import React, {createContext, useEffect, useRef, useState} from 'react';
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
// `gone` leaves time for the hero's settle (0.9s, starting just after the zoom) to finish before its class goes.
const TIMING = {full: {step: 1500, leave: 4500, gone: 5500}, reduced: {step: 0, leave: 1000, gone: 1300}};

// Sent just after the first word appears: the hero then builds its 3D card while that word stands still, so the
// setup never stalls the letters sliding in.
export const INTRO_QUIET_EVENT = 'site-intro-quiet';

export const introSkipped = () => typeof window === 'undefined' || Boolean(window.location.hash.slice(1));

export function SiteIntro({onReveal}) {
  const [phase, setPhase] = useState('working');
  const words = useRef(null);
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
    // Every change is timed from the first word on one clock, so if the page is busy for a moment, only the change due
    // then waits: the later words keep their times and "Welcome." always gets its full turn.
    const timers = [
      ...(reduce ? [] : WORDS.slice(1).map((_, i) => setTimeout(() => words.current?.jumpTo(i + 1), t.step * (i + 1)))),
      // Sent early: the card takes a few hundred milliseconds to start building, so its heavy step lands once "Loading"
      // has settled and ends before "Crafting" is due.
      setTimeout(() => window.dispatchEvent(new Event(INTRO_QUIET_EVENT)), reduce ? 0 : 250),
      setTimeout(() => {
        // The zoom-out starts on its own, clean frame. Unlocking the page (which re-lays it out) and the hero's settle
        // follow two frames later, and the hero's own work (its animations, the ID card's first frame) a frame after
        // that, so none of it can hold up or skip the start of the zoom, which then runs on the graphics layer.
        setPhase('leaving');
        requestAnimationFrame(() => requestAnimationFrame(() => {
          root.classList.remove('intro-running', 'intro-boot');
          root.classList.add('intro-revealing');
          requestAnimationFrame(() => onReveal());
        }));
      }, t.leave),
      setTimeout(() => {
        setPhase('gone');
        root.classList.remove('intro-revealing');
      }, t.gone),
    ];
    return () => {
      timers.forEach(clearTimeout);
      root.classList.remove('intro-running', 'intro-revealing', 'intro-boot');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontReady]);
  if (phase === 'gone') return null;
  return <div className="site-intro" data-phase={phase} role="status" aria-label="Loading portfolio" aria-hidden={phase === 'leaving' ? true : undefined}>
    {/* The dots and the first word appear together once the display face is ready, so nothing shifts sideways. */}
    <div className="site-intro-inner" data-ready={fontReady ? '' : undefined}>
      {fontReady && <Dots/>}
      {/* The word in 3D (main.css, "Opening screen ... 3D style"): violet depth behind each letter, and a slow tilt. */}
      {fontReady && <span className="site-intro-depth"><span className="site-intro-tilt"><RotatingText ref={words} texts={reduce ? WORDS.slice(0, 1) : WORDS} loop={false} auto={false}
        highlight highlightColor="transparent" mainClassName="site-intro-word" effect="slide" direction="up"
        staggerFrom="last" staggerDuration={0.03} animatePresenceMode="popLayout" animatePresenceInitial/></span></span>}
    </div>
  </div>;
}
