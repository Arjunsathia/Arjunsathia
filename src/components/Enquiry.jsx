import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {motion} from 'motion/react';
import {siGithub} from 'simple-icons';
import {revealVariants} from '../lib/motion.jsx';
import {profile} from '../content/site.js';
import {Arrow} from './icons.jsx';
import {useModalDialog} from '../hooks/useModalDialog.js';

// How to reach me, as icon buttons. Each one names its destination for screen readers and in its tooltip.
const contactLinks = [
  {label: 'GitHub', title: 'GitHub profile', href: profile.github, external: true, icon: <path d={siGithub.path} fill="currentColor" />},
  {label: 'LinkedIn', title: 'LinkedIn profile', href: profile.linkedin, external: true, icon: <path fillRule="evenodd" clipRule="evenodd" d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm1.700 5a1.300 1.300 0 1 0 2.600 0 1.300 1.300 0 0 0-2.600 0ZM6 10v8h2v-8H6Zm4 0v8h2v-5c0-2 4-2 4 0v5h2v-5c0-4-5-4-6-2v-1h-2Z" fill="currentColor" />},
  {label: 'Email', title: `Email ${profile.email}`, href: `mailto:${profile.email}`, icon: <path d="M3 6h18v12H3V6Zm0 1 9 6 9-6" stroke="currentColor" strokeWidth="1.700" strokeLinecap="round" strokeLinejoin="round" />},
  {label: 'Call', title: `Call ${profile.phone}`, href: `tel:${profile.phone}`, icon: <path d="m7 3 3 5-3 3c2 3 3 4 6 6l3-3 5 3c-1 4-3 5-6 4C8 19 5 16 3 9 2 6 3 4 7 3Z" stroke="currentColor" strokeWidth="1.700" strokeLinecap="round" strokeLinejoin="round" />},
];
const ContactLinks = () => <div className="enquiry-links">{contactLinks.map(({label, title, href, external, icon}) => <a key={label} className="enquiry-link" href={href} aria-label={title} title={title} {...(external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true">{icon}</svg></a>)}</div>;

export const EnquiryContext = createContext(null);
export function EnquiryButton({topic='General enquiry', variant, children, ...props}) {
  const open = useContext(EnquiryContext);
  const Button = variant ? motion.button : 'button';
  return <Button type="button" {...(variant ? {variants:revealVariants[variant]} : {})} {...props} aria-haspopup="dialog" onClick={event=>open({topic}, event.currentTarget)}>{children}</Button>;
}
export function EnquiryDialog({request, onClose}) {
  const {ref,closing,close,dialogProps} = useModalDialog(onClose);
  const [submitted,setSubmitted] = useState(false);
  const [topic,setTopic] = useState(request.topic);
  const confirmation = useRef(null);
  useEffect(()=>{ref.current.scrollTop=0;ref.current.querySelector('.enquiry-close')?.focus({preventScroll:true});},[]);
  useEffect(()=>{if(submitted)confirmation.current?.focus();},[submitted]);
  return <dialog {...dialogProps} className={`enquiry-dialog ${closing?'is-closing':''}`} aria-labelledby="enquiry-form-title" aria-describedby="enquiry-form-description">
    <div className="enquiry-close-wrap"><span className="eyebrow">LET’S CONNECT</span><button className="enquiry-close" type="button" onClick={close} aria-label="Close enquiry" autoFocus>×</button></div>
    <aside className="enquiry-aside">
      <span className="eyebrow">LET’S CONNECT</span>
      <h2 id="enquiry-title">Good things <br />start with <br /><span>a hello.</span></h2>
      <p id="enquiry-description">A project, a role, or a quick question. Tell me a little about it.</p>
      <address><span className="enquiry-contact-role">Software engineer &amp; freelance developer</span><ContactLinks /><span className="enquiry-contact-place">Remote · Worldwide</span></address>
      <svg className="enquiry-spark" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M32 4v56M4 32h56M12 12l40 40M12 52l40-40" /></svg>
    </aside>
    <div className="enquiry-main">
      <div className="enquiry-heading"><span className="eyebrow">YOUR ENQUIRY</span><h3 id="enquiry-form-title">Let’s talk<span className="enquiry-title-period">.</span></h3><p id="enquiry-form-description">A few details to get the conversation started.</p></div>
      <form onSubmit={event=>{event.preventDefault();setSubmitted(true);}} onChange={()=>setSubmitted(false)}>
        <div className="enquiry-field-row"><label>Your name<input name="name" autoComplete="name" required maxLength={100} placeholder="Alex Morgan" /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="alex@example.com" /></label></div>
        <label>What’s on your mind?<select name="topic" value={topic} onChange={event=>setTopic(event.target.value)}><option>General enquiry</option><option>Project enquiry</option><option>Job opportunity</option><option>Freelance collaboration</option></select></label>
        <label>Your message<textarea name="message" required minLength={10} maxLength={4000} rows={4} placeholder="What are you working on, and how can I help?" /></label>
        {submitted ? <div className="enquiry-confirmation" role="status" tabIndex={-1} ref={confirmation}><strong>Demo enquiry complete.</strong><p>No message was sent. Edit the form to try again, or close this window.</p></div> : <button className="button primary-button enquiry-submit" type="submit">Send demo enquiry <Arrow direction="↗" /></button>}
      </form>
    </div>
  </dialog>;
}
