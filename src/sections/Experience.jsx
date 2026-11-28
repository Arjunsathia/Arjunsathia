import React, {useLayoutEffect, useRef, useState} from 'react';
import {motion} from 'motion/react';
import {Reveal, Sequence, Item, motionEase, useCompactMotion} from '../lib/motion.jsx';
import Carousel from '../components/Carousel.jsx';
import {useTheme} from '../components/ThemeSwitch.jsx';
import {experienceItems, experienceDetails} from '../content/site.js';
import {Arrow, ServiceDoodle} from '../components/icons.jsx';
import {SectionHeading} from '../components/SectionHeading.jsx';
import {useModalDialog} from '../hooks/useModalDialog.js';
import {TechIcon, techStyle} from '../components/TechIcon.jsx';
import {Rich} from '../components/Rich.jsx';
import {ResultTiles} from '../components/ResultTiles.jsx';
import {plainText} from '../lib/rich-text.js';
import {SpecularLight} from '../components/SpecularButton.jsx';

function ExperienceDialog({ item, index, onClose }) {
  const {ref,closing,close,reduce,dialogProps}=useModalDialog(onClose,{phoneLook:'tilt'});
  const [tab,setTab]=useState(0);
  // The details are split into tabs on every screen size, like the project popup.
  const tabs=['Overview','Responsibilities','Work delivered','Stack'];
  const details=experienceDetails[index];
  const tabKey=event=>{
    const next={ArrowLeft:(tab+tabs.length-1)%tabs.length,ArrowRight:(tab+1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
    if(next!==undefined){event.preventDefault();setTab(next);ref.current.querySelector(`#role-tab-${next}`).focus();}
  };
  return <dialog {...dialogProps} className={`experience-dialog ${closing ? 'is-closing' : ''}`} aria-labelledby="experience-dialog-title" aria-describedby={tab===0?'experience-dialog-summary':undefined}>
    <div className="role-details-closebar"><button className="enquiry-close" type="button" onClick={close} aria-label="Close experience details" autoFocus>×</button></div>
    <aside className="enquiry-aside role-details-aside">
      <span className="eyebrow">EXPERIENCE / 0{index+1}</span>
      <h2 id="experience-dialog-title">{item.role}</h2>
      <p className="role-details-company">{item.company}{item.location&&<> · {item.location}</>}</p>
      <dl className="role-details-meta"><div><dt>Period</dt><dd>{item.period}</dd></div><div><dt>Duration</dt><dd>{item.duration}</dd></div></dl>
    </aside>
    <div className="role-details-main">
      <span className="eyebrow">THE ROLE</span>
      <h3 className="role-details-title">Work &amp; contribution.</h3>
      <div className="role-details-tabs project-modal-tabs" role="tablist" aria-label="Experience details" onKeyDown={tabKey}>{tabs.map((label,i)=><button key={label} type="button" role="tab" id={`role-tab-${i}`} aria-selected={tab===i} aria-controls="role-details-panel" tabIndex={tab===i?0:-1} onClick={()=>setTab(i)}>{label}</button>)}</div>
      {/* Each tab change fades in, matching the project popup. */}
      <motion.div key={tab} className="role-details-panel" role="tabpanel" id="role-details-panel" aria-labelledby={`role-tab-${tab}`} tabIndex={0} initial={reduce?false:{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.18,ease:motionEase}}>
        {tab===0&&<p className="role-details-summary" id="experience-dialog-summary"><Rich text={item.summary}/></p>}
        {tab===0&&details.results&&<ResultTiles results={details.results} note={details.resultsNote} label="Key results from the WhatsApp CRM"/>}
        {tab===1&&<section className="role-details-section" aria-labelledby="role-responsibilities"><h3 id="role-responsibilities">Responsibilities</h3><ul>{details.responsibilities.map(text=><li key={text}><Rich text={text}/></li>)}</ul></section>}
        {tab===2&&<section className="role-details-section" aria-labelledby="role-deliverables"><h3 id="role-deliverables">Work delivered</h3><ul>{details.delivered.map(text=><li key={text}><Rich text={text}/></li>)}</ul></section>}
        {tab===3&&<section className="role-details-section" aria-labelledby="role-skills"><h3 id="role-skills">Stack</h3><ul className="role-details-tools">{details.skills.map(skill=><li key={skill} style={techStyle(skill)}><TechIcon tag={skill}/>{skill}</li>)}</ul></section>}
      </motion.div>
    </div>
  </dialog>;
}

// The icon on each role card (phones only): layers for the full-time role, a screen for the internship.
const roleIcons = ['M12 3 3 8l9 5 9-5-9-5ZM3 12.500l9 5 9-5M3 17l9 5 9-5', 'M3 4h18v12H3V4ZM8 21h8M12 16v5', 'M3 8h18v12H3V8ZM8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 13h18'];
const RoleIcon = ({index}) => <span className="role-card-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={roleIcons[index % roleIcons.length]}/></svg></span>;

// The carousel frame and controls in the site's colours.
const CAROUSEL_COLOURS = {
  light: {
    '--carousel-frame': 'rgba(255, 253, 248, 0.72)',
    '--carousel-frame-edge': 'rgba(19, 23, 13, 0.1)',
    '--carousel-frame-highlight': '#ffffff',
    '--carousel-frame-shadow': '0 26px 50px -28px rgba(19, 23, 13, 0.34), 0 8px 18px -12px rgba(19, 23, 13, 0.18)',
    '--carousel-tile': '#fffdf8',
    '--carousel-tile-edge': 'rgba(19, 23, 13, 0.12)',
    '--carousel-tile-highlight': '#ffffff',
    '--carousel-tile-shadow': '0 4px 10px -5px rgba(19, 23, 13, 0.25)',
    '--carousel-ink': '#13170d',
    '--carousel-muted': 'rgba(19, 23, 13, 0.6)',
    '--carousel-faint': 'rgba(19, 23, 13, 0.18)',
    '--carousel-soft': 'rgba(19, 23, 13, 0.36)',
  },
  dark: {
    '--carousel-frame': 'rgba(23, 27, 20, 0.72)',
    '--carousel-frame-edge': 'rgba(255, 255, 255, 0.09)',
    '--carousel-frame-highlight': 'rgba(255, 255, 255, 0.07)',
    '--carousel-frame-shadow': '0 26px 50px -24px rgba(0, 0, 0, 0.85), 0 8px 18px -10px rgba(0, 0, 0, 0.55)',
    '--carousel-tile': '#252b20',
    '--carousel-tile-edge': 'rgba(255, 255, 255, 0.08)',
    '--carousel-tile-highlight': 'rgba(255, 255, 255, 0.1)',
    '--carousel-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
    '--carousel-ink': '#f2f4ea',
    '--carousel-muted': 'rgba(242, 244, 234, 0.6)',
    '--carousel-faint': 'rgba(255, 255, 255, 0.22)',
    '--carousel-soft': 'rgba(255, 255, 255, 0.42)',
  },
};

// The roles as a carousel (React Bits Carousel, tilt effect): one role at a time in a soft frame; swipe or drag it,
// use the dots, or the arrow keys. The carousel is as tall as the tallest role card at the current width,
// so every card shows in full on any screen; tapping a card opens its details, as before.
function RoleCarousel({cards, compact}) {
  const box = useRef(null);
  const theme = useTheme()==='dark'?'dark':'light';
  const [ratio,setRatio] = useState(compact?1.3:3.4);
  useLayoutEffect(()=>{
    const node = box.current;
    if(!node) return undefined;
    const measure = () => {
      let tallest = 0, width = 0;
      node.querySelectorAll('.role-entry').forEach(card => {
        // Its natural height (the card's own minimum height still applies), then back to filling the slide.
        card.style.height = 'auto';
        tallest = Math.max(tallest, card.offsetHeight);
        width = Math.max(width, card.offsetWidth);
        card.style.height = '';
      });
      if(tallest && width) setRatio(prev => Math.abs(prev - width/tallest) > .004 ? width/tallest : prev);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    let live = true;
    document.fonts?.ready.then(()=>{ if(live) measure(); });
    return () => { live = false; observer.disconnect(); };
  },[]);
  return <div className="role-timeline role-stack role-carousel" ref={box}>
    <Carousel items={cards} ariaLabel="Experience roles" baseWidth="100%" aspectRatio={ratio} effect="tilt" indicator="dots"
      frame arrows={false} loop={false} autoplay={false} draggable round={false} theme={theme} peek={0} gap={16} radius={compact?20:24}
      style={CAROUSEL_COLOURS[theme]}/>
  </div>;
}

export function Experience() {
  const [selected,setSelected]=useState(null);
  const compact=useCompactMotion();
  const closeDetails=()=>{const trigger=selected?.trigger;setSelected(null);requestAnimationFrame(()=>trigger?.focus({preventScroll:true}));};
  return <section className="experience-section" id="experience" aria-labelledby="experience-title"><div className="section-wrap">
    <SectionHeading number="04" id="experience-title" title={<Item as="span" variant="wipe" className="experience-title-mark">Experience.</Item>} note="THE WORK BEHIND THE SKILLS"/>
    <Reveal as="span" className="experience-heading-note" aria-hidden="true" delay={.3}>Building skills.<br/>Shipping work.<ServiceDoodle type="burst"/><ServiceDoodle/></Reveal>
    <div className="experience-layout"><Sequence className="experience-overview" gap={.1}><Item variant="line" className="experience-metric"><strong>0{experienceItems.length}<span aria-hidden="true">.</span></strong><span>ROLES SINCE 2025</span></Item><Item as="p">From REST APIs<br/>to production CRMs.</Item><Item as="span" variant="fade" className="eyebrow experience-scroll-hint">EXPLORE MY ROLES <Arrow/></Item></Sequence>
      {/* The roles as a carousel. Every role is in the accent colour (tinted per role on phones). */}
      <Reveal className="experience-browser" fadeOnly delay={.15}>
        <RoleCarousel compact={compact} cards={experienceItems.map((item,i)=><article key={item.company} className={`role-entry role-tone-${i%3}`} data-active="true">
          <RoleIcon index={i}/>
          <div className="role-card-top"><span className="eyebrow">0{i+1} / {/present/i.test(item.period)?'CURRENT ROLE':'PREVIOUSLY'}</span><span className="role-card-period">{item.period}<small>{item.duration}</small></span></div>
          <div className="role-card-heading"><h3>{item.role}</h3><p>{item.company}</p></div>
          <p className="role-card-summary">{compact&&item.brief?item.brief:plainText(item.summary)}</p>
          <div className="role-card-footer"><span className="role-card-tools">{experienceDetails[i].skills.slice(0,3).map((skill,j)=><React.Fragment key={skill}>{j>0&&<i> / </i>}<span>{skill}</span></React.Fragment>)}</span><span className="role-card-link" aria-hidden="true"><SpecularLight/>View role <Arrow /></span></div>
          <button className="role-entry-open" aria-label={`View experience: ${item.role} at ${item.company}`} aria-haspopup="dialog" onClick={event=>setSelected({item,index:i,trigger:event.currentTarget})} />
        </article>)}/>
      </Reveal>
    </div>{selected&&<ExperienceDialog item={selected.item} index={selected.index} onClose={closeDetails}/>}
  </div></section>;
}
