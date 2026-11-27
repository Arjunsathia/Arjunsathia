import React, {useEffect, useRef, useState} from 'react';
import {MotionConfig} from 'motion/react';
import {EnquiryContext, EnquiryDialog} from './components/Enquiry.jsx';
import {PremiumCursor} from './components/PremiumCursor.jsx';
import {IntroContext, SiteIntro, introSkipped} from './components/SiteIntro.jsx';
import {initSmoothScroll} from './lib/smooth-scroll.js';
import {Header} from './sections/Header.jsx';
import {Hero} from './sections/Hero.jsx';
import {Intro} from './sections/Intro.jsx';
import {Work} from './sections/Work.jsx';
import {Services} from './sections/Services.jsx';
import {Skills} from './sections/Skills.jsx';
import {Experience} from './sections/Experience.jsx';
import {Process} from './sections/Process.jsx';
import {About} from './sections/About.jsx';
import {Contact} from './sections/Contact.jsx';

export function App() {
  const [enquiry,setEnquiry] = useState(null);
  // The opening screen (skipped for links straight to a section); the hero's animations wait for it to clear.
  const [intro] = useState(()=>!introSkipped());
  const [revealed,setRevealed] = useState(()=>introSkipped());
  const enquiryTrigger = useRef(null);
  const openEnquiry = (request, trigger) => {enquiryTrigger.current=trigger;setEnquiry(request);};
  const closeEnquiry = () => {setEnquiry(null);requestAnimationFrame(()=>enquiryTrigger.current?.focus({preventScroll:true}));};
  // Links such as /#contact arrive before React has rendered the section, so scroll to it once it exists.
  useEffect(()=>{
    const id=decodeURIComponent(window.location.hash.slice(1));
    const target=id&&document.getElementById(id);
    if(target)requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant'}));
  },[]);
  // Smooth wheel and trackpad scrolling (mouse and trackpad only; touch and reduced motion stay native).
  useEffect(()=>initSmoothScroll(),[]);
  // While the page is moving, <html> carries .is-scrolling, so hover highlights don't flash on rows
  // sliding under a still pointer (used by the dark-mode Stack rows).
  // Only with a mouse or trackpad: touch screens have no hover to protect, and toggling the class restyles the page.
  useEffect(()=>{
    if(!window.matchMedia('(hover: hover)').matches)return undefined;
    const root=document.documentElement;let timer=0;
    const onScroll=()=>{root.classList.add('is-scrolling');clearTimeout(timer);timer=setTimeout(()=>root.classList.remove('is-scrolling'),160);};
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>{clearTimeout(timer);window.removeEventListener('scroll',onScroll);root.classList.remove('is-scrolling');};
  },[]);
  // Endless loops (the top ticker, the code flower) pause while they are off screen, to save battery.
  useEffect(()=>{
    const loops=document.querySelectorAll('.topline, .code-flower');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-offscreen',!entry.isIntersecting)),{rootMargin:'-1px 0px 0px 0px'});
    loops.forEach(loop=>observer.observe(loop));
    return()=>observer.disconnect();
  },[]);
  // Lazy images that are still downloading fade in when they arrive, instead of popping in.
  useEffect(()=>{
    const reveal=event=>event.target.classList.remove('img-pending');
    document.querySelectorAll('main img[loading=lazy]').forEach(img=>{
      if(img.complete)return;
      img.classList.add('img-fade','img-pending');
      img.addEventListener('load',reveal,{once:true});img.addEventListener('error',reveal,{once:true});
    });
  },[]);

  return <MotionConfig reducedMotion="user"><IntroContext.Provider value={revealed}><EnquiryContext.Provider value={openEnquiry}>{intro && <SiteIntro onReveal={()=>setRevealed(true)}/>}<PremiumCursor /><a className="skip" href="#work">Skip to work</a><Header /><main><Hero /><Intro /><Work /><Services /><Skills /><Experience /><Process /><About /><Contact /></main>{enquiry && <EnquiryDialog request={enquiry} onClose={closeEnquiry} />}</EnquiryContext.Provider></IntroContext.Provider></MotionConfig>;
}
