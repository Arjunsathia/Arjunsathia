import React, {useEffect, useState} from 'react';
import {Reveal, Sequence, Item} from '../lib/motion.jsx';
import {siGithub} from 'simple-icons';
import {profile} from '../content/site.js';
import {Arrow} from '../components/icons.jsx';
import {EnquiryButton} from '../components/Enquiry.jsx';

function SocialLinks() {
  const [notice,setNotice] = useState('');
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3000);return()=>clearTimeout(timer);},[notice]);
  return <div className="social-links" aria-label="Social profiles">{[['GitHub',profile.github],['LinkedIn',profile.linkedin]].map(([name,url])=>{
    const contents = <><svg viewBox="0 0 24 24" aria-hidden="true">{name === 'GitHub' ? <path d={siGithub.path} fill="currentColor" /> : <><rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" /><circle cx="7" cy="7" r="1.3" fill="var(--social-cutout, var(--paper))" /><path d="M6 10h2v8H6zm4 0h2v1c1-2 6-2 6 2v5h-2v-5c0-2-4-2-4 0v5h-2z" fill="var(--social-cutout, var(--paper))" /></>}</svg><span>{name}</span>{url && <Arrow />}</>;
    return url ? <a key={name} className="social-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} profile`}>{contents}</a> : <button type="button" key={name} className="social-link pending" onClick={()=>setNotice(`${name} profile link hasn’t been added yet.`)} aria-label={`${name} profile link coming soon`} title={`${name} profile link coming soon`}>{contents}<small>Coming soon</small></button>;
  })}{notice && <span className="social-notice" role="status">{notice}</span>}</div>;
}
export function Contact() {
  return <Sequence as="section" className="contact" id="contact" aria-labelledby="contact-title" amount={.25}><div className="section-wrap">
    <Reveal className="contact-top" fadeOnly><p className="eyebrow"><span className="status-dot" />AVAILABLE FOR ROLES & PROJECTS</p><span className="eyebrow">GOT SOMETHING IN MIND?</span></Reveal>
    <Item as="h2" variant="line" className="contact-headline" id="contact-title">LET’S MAKE<br /><Item as="mark" variant="wipe">IT HAPPEN.</Item></Item>
    <Reveal className="contact-socials" delay={.08}><SocialLinks /></Reveal>
    <Sequence className="contact-bottom" gap={.12} delay={.1}><Item as="p">A role on your team. A new web application. <br />I’d love to hear what you’re working on.</Item><Item as="svg" variant="wipe" className="contact-long-arrow" viewBox="0 0 240 240" fill="currentColor" aria-hidden="true"><path transform="translate(0 240) scale(1 -1)" d="M24 216C92 196 145 142 185 72L165 61L224 24L221 94L202 83C154 160 96 207 24 216Z" /></Item><EnquiryButton className="button primary-button" variant="rise">Let’s talk <Arrow direction="→" /></EnquiryButton></Sequence>
    <Footer />
  </div></Sequence>;
}

function Footer() {
  return <footer className="contact-footer"><span>© {new Date().getFullYear()} Arjun Sathia</span><p>SOFTWARE ENGINEER / FULL-STACK DEVELOPER</p></footer>;
}
