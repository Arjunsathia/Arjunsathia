import React, {useEffect, useRef, useState} from 'react';
import {MotionConfig} from 'motion/react';
import {EnquiryContext, EnquiryDialog} from './components/Enquiry.jsx';
import {PremiumCursor} from './components/PremiumCursor.jsx';
import {Header} from './sections/Header.jsx';
import {Hero} from './sections/Hero.jsx';
import {Intro} from './sections/Intro.jsx';
import {Work} from './sections/Work.jsx';
import {Services} from './sections/Services.jsx';
import {Skills} from './sections/Skills.jsx';
import {Experience} from './sections/Experience.jsx';
import {Process} from './sections/Process.jsx';
import {About} from './sections/About.jsx';
import {Testimonials} from './sections/Testimonials.jsx';
import {Contact} from './sections/Contact.jsx';

export function App() {
  const [enquiry,setEnquiry] = useState(null);
  const enquiryTrigger = useRef(null);
  const openEnquiry = (request, trigger) => {enquiryTrigger.current=trigger;setEnquiry(request);};
  const closeEnquiry = () => {setEnquiry(null);requestAnimationFrame(()=>enquiryTrigger.current?.focus({preventScroll:true}));};
  // Links such as /#contact arrive before React has rendered the section, so scroll to it once it exists.
  useEffect(()=>{
    const id=decodeURIComponent(window.location.hash.slice(1));
    const target=id&&document.getElementById(id);
    if(target)requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant'}));
  },[]);
  return <MotionConfig reducedMotion="user"><EnquiryContext.Provider value={openEnquiry}><PremiumCursor /><a className="skip" href="#work">Skip to work</a><Header /><main><Hero /><Intro /><Work /><Services /><Skills /><Experience /><Process /><About /><Testimonials /><Contact /></main>{enquiry && <EnquiryDialog request={enquiry} onClose={closeEnquiry} />}</EnquiryContext.Provider></MotionConfig>;
}
