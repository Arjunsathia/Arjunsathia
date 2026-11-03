import React, {useEffect, useRef, useState} from 'react';
import {motion, AnimatePresence, useReducedMotion} from 'motion/react';
import {motionEase} from '../lib/motion.jsx';
import {profile, toplineItems, navItems} from '../content/site.js';
import {Arrow, Asterisk} from '../components/icons.jsx';
import {EnquiryButton} from '../components/Enquiry.jsx';

const Wordmark = () => <a className="wordmark" href="#home" aria-label={`${profile.name}, home`}>{profile.name}<span>.</span></a>;
export function Header() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const [active, setActive] = useState('home');
  const header = useRef(null);
  const toggle = useRef(null);
  useEffect(()=>{
    const update=()=>document.documentElement.style.setProperty('--site-header-height',`${header.current.offsetHeight}px`);
    const observer=new ResizeObserver(update);
    observer.observe(header.current);
    update();
    return()=>{observer.disconnect();document.documentElement.style.removeProperty('--site-header-height');};
  },[]);
  useEffect(() => {
    const close = (event) => {
      if (event.type === 'keydown' && event.key === 'Escape' && toggle.current?.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.current?.focus(); }
      if (event.type === 'pointerdown' && !header.current?.contains(event.target)) setOpen(false);
    };
    const resize = () => { if (window.innerWidth > 1000) setOpen(false); };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    window.addEventListener('resize', resize);
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close); window.removeEventListener('resize', resize); };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), {rootMargin: '-20% 0px -50% 0px'});
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <header className="header" ref={header}>
    <div className="topline" aria-hidden="true"><div>{[0,1].map(i=><span key={i}>{toplineItems.map(item=><React.Fragment key={item}>{item} <b><Asterisk/></b> </React.Fragment>)}</span>)}</div></div>
    <div className="header-inner"><Wordmark />
      <nav className="desktop-nav" aria-label="Main navigation">{navItems.map(([id,label])=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined}>{label}</a>)} </nav><EnquiryButton className="button primary-button header-cta">Let’s talk <Arrow direction="↗" /></EnquiryButton>
      <button ref={toggle} className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}><span /><span /></button>
      <AnimatePresence>{open&&<motion.nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:reduce?0:.22,ease:motionEase}}>{navItems.map(([id,label],i)=><motion.a key={id} href={`#${id}`} onClick={()=>setOpen(false)} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.24,delay:reduce?0:.04+i*.035,ease:motionEase}}>{label}<span>0{i+1}</span></motion.a>)}</motion.nav>}</AnimatePresence>
    </div>
  </header>;
}
