import React, {useContext, useEffect, useRef, useState} from 'react';
import {profile, toplineItems, navItems} from '../content/site.js';
import {Arrow, Asterisk, SocialIcon} from '../components/icons.jsx';
import {EnquiryButton} from '../components/Enquiry.jsx';
import GooeyNav from '../components/GooeyNav.jsx';
import StaggeredMenu from '../components/StaggeredMenu.jsx';
import {SpecularLight} from '../components/SpecularButton.jsx';
import {useTheme} from '../components/ThemeSwitch.jsx';
import {IntroContext} from '../components/SiteIntro.jsx';

// The liquid pill in the desktop navigation uses the site's accent, and its droplets the accent's own shades
// (the lime-to-yellow of the buttons in light mode, the greens in dark mode). Text on the pill is ink.
// Hovering another item shows a dark pill under it (ink in light mode, a lifted dark green in dark mode).
const NAV_COLOURS = {
  light: {pill:'#d4e62d', ink:'#13170d', drops:['#d4e62d','#e5ee83','#ecd953'], hover:'#13170d',
    frame:{'--gn-frame':'rgba(255, 253, 248, 0.72)','--gn-frame-edge':'rgba(19, 23, 13, 0.12)','--gn-frame-highlight':'rgba(255, 255, 255, 0.9)','--gn-frame-shadow':'0 14px 30px -20px rgba(19, 23, 13, 0.35), 0 4px 10px -8px rgba(19, 23, 13, 0.2)','--gn-ink':'#13170d','--gn-muted':'#3d4331'}},
  dark: {pill:'#9fe05a', ink:'#0b1006', drops:['#9fe05a','#b7ec78','#7fc63f'], hover:'#3a4530',
    frame:{'--gn-frame':'rgba(23, 27, 20, 0.72)','--gn-frame-edge':'rgba(255, 255, 255, 0.09)','--gn-frame-highlight':'rgba(255, 255, 255, 0.06)','--gn-frame-shadow':'0 16px 34px -20px rgba(0, 0, 0, 0.85), 0 4px 12px -8px rgba(0, 0, 0, 0.6)','--gn-ink':'#f2f4ea','--gn-muted':'rgba(242, 244, 234, 0.68)'}},
};
const navLinks = navItems.map(([id,label])=>({label, href:`#${id}`}));

// Which navigation item is current: the section in view, or, for a section with no item of its own (Process),
// the item before it. Nothing is current at the top of the page (the hero).
const navIndexFor = (sectionId, order) => {
  for (let i = order.indexOf(sectionId); i >= 0; i--) {
    if (order[i] === 'home') return -1;
    const index = navItems.findIndex(([id]) => id === order[i]);
    if (index >= 0) return index;
  }
  return -1;
};

// The phone and tablet menu: every section, numbered, with the one in view marked as current; then the profiles.
const menuItems = current => navItems.map(([id,label],i)=>({label, link:`#${id}`, ariaLabel:`Go to ${label}`, current:i===current?'location':undefined}));
// The phone menu's links: GitHub and LinkedIn, then email and phone, all the same way (an icon and a short label).
// Email and phone open the mail app / dialler; the full address and number are read out to screen readers.
const contactIcon = d => <svg className="sm-social-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={d} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const socialLinks = [
  ...['GitHub','LinkedIn'].map(label=>({label, link:label==='GitHub'?profile.github:profile.linkedin, icon:<SocialIcon name={label} className="sm-social-icon"/>})),
  {label:'Email', link:`mailto:${profile.email}`, ariaLabel:`Email ${profile.email}`, icon:contactIcon('M3 6h18v12H3V6Zm0 1 9 6 9-6')},
  {label:'Call', link:`tel:${profile.phone}`, ariaLabel:`Call ${profile.phone}`, icon:contactIcon('m7 3 3 5-3 3c2 3 3 4 6 6l3-3 5 3c-1 4-3 5-6 4C8 19 5 16 3 9 2 6 3 4 7 3Z')},
];
// True at phone and tablet widths, where the Menu button replaces the navigation bar. Above that the menu isn't
// rendered at all, so an open menu can never be left behind when a window is widened.
const smallQuery = '(max-width: 1000px)';
function useSmallScreen() {
  const [small,setSmall]=useState(()=>window.matchMedia(smallQuery).matches);
  useEffect(()=>{const media=window.matchMedia(smallQuery);const update=()=>setSmall(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  return small;
}

const Wordmark = () => <a className="wordmark" href="#home" aria-label={`${profile.name}, home`}>{profile.name}<span>.</span></a>;
export function Header() {
  const small = useSmallScreen();
  const [navIndex, setNavIndex] = useState(-1);
  // After a click, the pill goes straight to that item and stays there while the page scrolls to the section,
  // instead of stepping through every section on the way.
  const heading = useRef(null);
  const colours = NAV_COLOURS[useTheme() === 'dark' ? 'dark' : 'light'];
  const header = useRef(null);
  // Hidden behind the opening screen; when it clears, the bar arrives (see 'Header entrance' in main.css).
  const revealed = useContext(IntroContext);
  useEffect(()=>{
    const update=()=>document.documentElement.style.setProperty('--site-header-height',`${header.current.offsetHeight}px`);
    const observer=new ResizeObserver(update);
    observer.observe(header.current);
    update();
    return()=>{observer.disconnect();document.documentElement.style.removeProperty('--site-header-height');};
  },[]);
  // At the top of the page (within 40px, which includes the #home position with the strip scrolled away) the bar has no background (large screens, see main.css), so the hero ID card's strap
  // shows running up to the top strip; once the page scrolls, the background returns.
  const [atTop,setAtTop] = useState(()=>window.scrollY<40);
  useEffect(()=>{
    const update=()=>setAtTop(window.scrollY<40);
    update();
    window.addEventListener('scroll',update,{passive:true});
    return()=>window.removeEventListener('scroll',update);
  },[]);
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('main > section[id]'));
    const order = sections.map(section => section.id);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const index = navIndexFor(entry.target.id, order);
      const goal = heading.current;
      if (goal) {
        if (index !== goal.index && performance.now() < goal.until) return;
        heading.current = null;
      }
      setNavIndex(index);
    }), {rootMargin: '-20% 0px -50% 0px'});
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  const choose = index => { heading.current = {index, until: performance.now() + 1600}; setNavIndex(index); };
  return <header className={`header ${revealed ? 'header-enter' : 'header-waiting'}${atTop ? ' is-at-top' : ''}`} ref={header}>
    <div className="topline" aria-hidden="true"><div>{[0,1].map(i=><span key={i}>{toplineItems.map(item=><React.Fragment key={item}>{item} <b><Asterisk/></b> </React.Fragment>)}</span>)}</div></div>
    <div className="header-inner"><Wordmark />
      <GooeyNav className="desktop-nav gooey-desktop-nav" aria-label="Main navigation" items={navLinks} activeIndex={navIndex} onChange={choose} ariaCurrent="location"
        theme={colours === NAV_COLOURS.dark ? 'dark' : 'light'} color={colours.pill} activeTextColor={colours.ink} colors={colours.drops} hoverColor={colours.hover} style={colours.frame}
        size="md" frame shadow={0} particleCount={12} spread={30} animationTime={560} timeVariance={260} gooeyness={.55} wobble={.45} hoverEffect/>
      <EnquiryButton className="button primary-button header-cta"><SpecularLight/>Let’s talk <Arrow direction="↗" /></EnquiryButton>
      {/* Phones and tablets: the round two-line menu button opens a full-screen panel. Lime and ink layers sweep in, then the
          panel in the page colour, then each section link rises into place (numbered, the current one marked). */}
      {small&&<StaggeredMenu className="mobile-menu" overlayClassName="mobile-menu-overlay" portal position="right"
        items={menuItems(navIndex)} socialItems={socialLinks} displaySocials displayItemNumbering socialsTitle="Get in touch"
        colors={['var(--accent)', 'var(--bg-band)']} accentColor="var(--accent-text)" menuButtonColor={null} changeMenuColorOnOpen={false} toggleStyle="lines"/>}
    </div>
  </header>;
}
