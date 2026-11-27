import React, {Suspense, lazy, useEffect, useRef, useState} from 'react';
import {Reveal, Item, useCompactMotion} from '../lib/motion.jsx';
import {stackGroups, toolNotes} from '../content/site.js';
import {ServiceDoodle} from '../components/icons.jsx';
import {SectionHeading} from '../components/SectionHeading.jsx';
import {useTheme} from '../components/ThemeSwitch.jsx';
import {stackCardArt} from '../lib/stack-card-art.js';
import JellyRadio from '../components/JellyRadio.jsx';

// The gallery (WebGL) loads separately, so it never holds up the page.
const CircularGallery = lazy(() => import('../components/CircularGallery.jsx'));
// The practice without a logo, shown with a check in the Deployment group.
const EXTRA_TOOLS = {3: [['CI/CD', 'check']]};
const GROUP_SIZES = stackGroups.map((group, i) => group.tools.length + (EXTRA_TOOLS[i]?.length ?? 0));
const TOOL_COUNT = GROUP_SIZES.reduce((sum, size) => sum + size, 0);
// Where each group's first card sits in the gallery, and which group a card belongs to.
const GROUP_STARTS = GROUP_SIZES.map((_, i) => GROUP_SIZES.slice(0, i).reduce((sum, size) => sum + size, 0));
const groupOf = index => GROUP_STARTS.findLastIndex(start => index >= start);
// Short names for the group switch under the gallery.
const GROUP_LABELS = stackGroups.map(group => (group.name === 'Testing & quality' ? 'Testing' : group.name));
// The gallery needs WebGL 2. Checking for the API is instant; actually creating (and throwing away) a context to test
// it cost about a third of a second, right as the section scrolled into view. The gallery copes on its own if a
// context can't be made after all.
const hasWebGL2 = () => typeof window !== 'undefined' && 'WebGL2RenderingContext' in window;

// The tools as a curved, draggable gallery of cards (CircularGallery): drag, swipe or use a sideways wheel to move
// through them; it drifts on its own when left alone. Tap or click a card to open it large, with a short note on the
// tool; tap it again (or press Escape) to put it back. Under the arch, a jelly switch of the groups
// (JellyRadio) glides the gallery to a group's first card; it follows the group in the middle as the cards move.
function StackGallery({compact}) {
  const theme = useTheme() === 'dark' ? 'dark' : 'light';
  const [items, setItems] = useState(null);
  const [group, setGroup] = useState(0);
  // While a card is open its caption sits where the group switch is, so the switch steps aside.
  const [opened, setOpened] = useState(false);
  const api = useRef(null);
  const box = useRef(null);
  // The cards are drawn only once the gallery is within about two screens, so the work never competes with the
  // hero's intro on load.
  const [near, setNear] = useState(false);
  useEffect(() => {
    const node = box.current;
    if (!node || near) return undefined;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setNear(true); }, {rootMargin: '200% 0px'});
    observer.observe(node);
    return () => observer.disconnect();
  }, [near]);
  useEffect(() => {
    if (!near) return undefined;
    let live = true;
    stackCardArt(theme, stackGroups, EXTRA_TOOLS, toolNotes).then(next => { if (live) setItems(next); });
    return () => { live = false; };
  }, [theme, near]);
  return <><Reveal className={`stack-gallery${opened ? " is-open" : ""}`} fadeOnly delay={.1} ref={box}>
    {items && <Suspense fallback={null}><CircularGallery items={items} apiRef={api} onOpenChange={setOpened} onActiveChange={index => setGroup(groupOf(index))} ariaLabel={`Tools and technologies, ${TOOL_COUNT} cards`}
      textColor={theme === 'dark' ? '#f2f4ea' : '#13170d'} font="400 30px Anton" showTitles={false}
      bend={compact ? 2 : 3} borderRadius={0.06} itemSize={compact ? 0.94 : 1} itemAspect={0.78} gap={compact ? 0.16 : 0.24}
      scrollEase={0.07} scrollSpeed={2.4} wave={1} fadeEdges={compact ? 0.05 : 0.1} shadow={theme === 'dark' ? 0.5 : 0.22}
      autoScroll={compact ? 0.3 : 0.42} snap openOnClick intro/></Suspense>}
  </Reveal>
  <Reveal className={`stack-filters${opened ? " is-hidden" : ""}`} delay={.2} distance={12}>
    <JellyRadio ariaLabel="Show a group of tools" items={GROUP_LABELS.map((label, i) => ({value: i, label}))} value={group}
      onChange={next => { setGroup(next); api.current?.goTo(GROUP_STARTS[next]); }}
      chipColor="var(--jelly-chip)" activeColor="var(--accent)" textColor="var(--text-strong)" activeTextColor="var(--on-accent)"
      size={compact ? 'sm' : 'md'} gap={compact ? 5 : 8} radius={999} swell={compact ? 0.12 : 0.18} barge={compact ? 3 : 6}/>
  </Reveal></>;
}

export function Skills() {
  const compact = useCompactMotion();
  const [gallery] = useState(hasWebGL2);
  const toolsOf = i => [...stackGroups[i].tools.map(([name]) => name), ...(EXTRA_TOOLS[i] ?? []).map(([name]) => name)];
  return <section id="skills" className="skills-section" aria-labelledby="skills-title"><div className="section-wrap">
    <SectionHeading number="03" id="skills-title" title={<><span className="stack-title-lead">What I work </span><Item as="span" variant="wipe" className="stack-title-mark">with.</Item></>} note="FROM INTERFACE TO RELEASE"/>
    {/* The wrapper doesn't move (the note is placed against the section, so a moving wrapper would make it jump);
        the line of copy and the side note each rise in on their own, like the other sections' side notes. */}
    <div className="stack-mobile-intro"><Reveal as="p" fadeOnly delay={.1}>Tools, technologies, and practices I use to turn ideas into useful software.</Reveal><Reveal as="span" className="stack-heading-note" aria-hidden="true" delay={.3}>From interface<br/>to release.<ServiceDoodle type="burst"/><ServiceDoodle/></Reveal></div>
    {gallery && <StackGallery compact={compact}/>}
    {/* What the gallery shows: read by screen readers, and shown as a plain list where WebGL2 isn't available. */}
    <ul className={gallery ? 'sr-only' : 'stack-fallback'}>{stackGroups.map((group,i)=><li key={group.name}><strong>{group.name}</strong> {group.description} <span>{toolsOf(i).join(' · ')}</span></li>)}</ul>
  </div></section>;
}
