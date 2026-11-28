import React, {useEffect, useRef, useState} from 'react';
import {Reveal, Sequence, Item} from '../lib/motion.jsx';
import {profile} from '../content/site.js';
import {Arrow, SocialIcon} from '../components/icons.jsx';
import {EnquiryButton} from '../components/Enquiry.jsx';
import {SpecularLight} from '../components/SpecularButton.jsx';
import Ribbons from '../components/Ribbons.jsx';
import SplitText from '../components/SplitText.jsx';
import {SectionFade} from '../components/FadeContent.jsx';

function SocialLinks() {
  const [notice,setNotice] = useState('');
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3000);return()=>clearTimeout(timer);},[notice]);
  return <div className="social-links" aria-label="Social profiles">{[['GitHub',profile.github],['LinkedIn',profile.linkedin]].map(([name,url])=>{
    const contents = <><SocialIcon name={name} /><span>{name}</span>{url && <Arrow />}</>;
    return url ? <a key={name} className="social-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} profile`}>{contents}</a> : <button type="button" key={name} className="social-link pending" onClick={()=>setNotice(`${name} profile link hasn’t been added yet.`)} aria-label={`${name} profile link coming soon`} title={`${name} profile link coming soon`}>{contents}<small>Coming soon</small></button>;
  })}{notice && <span className="social-notice" role="status">{notice}</span>}</div>;
}
// Ribbons in the site's highlight colours trail the pointer while it is over the contact section. The canvas reaches up
// over the bottom of the section above, so the trails can sweep across it; only the contact section steers them.
export function Contact() {
  const section = useRef(null);
  return <Sequence as="section" className="contact" id="contact" aria-labelledby="contact-title" amount={.25} ref={section}>
    <div className="contact-ribbons" aria-hidden="true">
      <Ribbons trackRef={section} colors={['#d4e62d', '#a8ed7d', '#ffdc3d']} thickness={30} length={1.4} shape="lens"
        spread={18} stiffness={0.5} bounce={0.5} wave={0} softness={0} opacity={1} fade={false}/>
    </div>
    <div className="section-wrap">
    <SectionFade className="contact-top"><p className="eyebrow"><span className="status-dot" />AVAILABLE FOR ROLES & PROJECTS</p><span className="eyebrow">GOT SOMETHING IN MIND?</span></SectionFade>
    <SplitText as="h2" className="contact-headline" id="contact-title">LET’S MAKE<br /><Item as="mark" variant="wipe">IT HAPPEN.</Item></SplitText>
    <Reveal className="contact-socials" delay={.08}><SocialLinks /></Reveal>
    <Sequence className="contact-bottom" gap={.12} delay={.1}><SectionFade as="p">A role on your team. A new web application. <br />I’d love to hear what you’re working on.</SectionFade><Item as="svg" variant="wipe" className="contact-long-arrow" viewBox="0 0 240 240" fill="currentColor" aria-hidden="true"><path transform="translate(0 240) scale(1 -1)" d="M24 216C92 196 145 142 185 72L165 61L224 24L221 94L202 83C154 160 96 207 24 216Z" /></Item><EnquiryButton className="button primary-button" variant="rise" data-magnetic="0.35" data-magnetic-max="10"><SpecularLight/>Let’s talk <Arrow direction="→" /></EnquiryButton></Sequence>
    <Footer />
  </div></Sequence>;
}

function Footer() {
  return <SectionFade as="footer" className="contact-footer"><span>© {new Date().getFullYear()} Arjun Sathia</span><p>SOFTWARE ENGINEER / FULL-STACK DEVELOPER</p></SectionFade>;
}
