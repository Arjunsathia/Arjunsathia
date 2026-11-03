import React, {useRef, useState} from 'react';
import {Reveal, Sequence, Item, useCompactMotion, useCenteredScroll} from '../lib/motion.jsx';
import {experienceItems, experienceDetails} from '../content/site.js';
import {Arrow, ServiceDoodle} from '../components/icons.jsx';
import {SectionHeading} from '../components/SectionHeading.jsx';
import {useModalDialog} from '../hooks/useModalDialog.js';

function ExperienceDialog({ item, index, onClose }) {
  const {ref,closing,close,dialogProps}=useModalDialog(onClose);
  const compact=useCompactMotion();
  const [tab,setTab]=useState(0);
  const tabs=['Overview','Responsibilities','Tools'];
  const details=experienceDetails[index];
  const tabKey=event=>{
    const next={ArrowLeft:(tab+tabs.length-1)%tabs.length,ArrowRight:(tab+1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
    if(next!==undefined){event.preventDefault();setTab(next);ref.current.querySelector(`#role-tab-${next}`).focus();}
  };
  return <dialog {...dialogProps} className={`experience-dialog ${closing ? 'is-closing' : ''}`} aria-labelledby="experience-dialog-title" aria-describedby={!compact||tab===0?'experience-dialog-summary':undefined}>
    <div className="role-details-closebar"><button className="enquiry-close" type="button" onClick={close} aria-label="Close experience details" autoFocus>×</button></div>
    <aside className="enquiry-aside role-details-aside">
      <span className="eyebrow">EXPERIENCE / 0{index+1}</span>
      <h2 id="experience-dialog-title">{item.role}</h2>
      <p className="role-details-company">{item.company}</p>
      <dl className="role-details-meta"><div><dt>Period</dt><dd>{item.period}</dd></div><div><dt>Duration</dt><dd>{item.duration}</dd></div></dl>
      <small>{item.freelance ? 'Sample freelance work' : 'Sample company & role'} · Illustrative experience</small>
    </aside>
    <div className="role-details-main">
      <span className="eyebrow">THE ROLE</span>
      <h3 className="role-details-title">Work &amp; contribution.</h3>
      {compact&&<div className="role-details-tabs" role="tablist" aria-label="Experience details" onKeyDown={tabKey}>{tabs.map((label,i)=><button key={label} type="button" role="tab" id={`role-tab-${i}`} aria-selected={tab===i} aria-controls="role-details-panel" tabIndex={tab===i?0:-1} onClick={()=>setTab(i)}>{label}</button>)}</div>}
      <div className="role-details-panel" {...(compact?{role:'tabpanel',id:'role-details-panel','aria-labelledby':`role-tab-${tab}`,tabIndex:0}:{})}>
        {(!compact||tab===0)&&<p className="role-details-summary" id="experience-dialog-summary">{item.summary}</p>}
        {(!compact||tab===1)&&<section className="role-details-section" aria-labelledby="role-responsibilities"><h3 id="role-responsibilities">Responsibilities</h3><ul>{details.responsibilities.map(text=><li key={text}>{text}</li>)}</ul></section>}
        {(!compact||tab===0)&&<section className="role-details-section" aria-labelledby="role-deliverables"><h3 id="role-deliverables">Work delivered</h3><ul>{details.delivered.map(text=><li key={text}>{text}</li>)}</ul></section>}
        {(!compact||tab===2)&&<section className="role-details-section" aria-labelledby="role-skills"><h3 id="role-skills">Skills &amp; tools</h3><ul className="role-details-tools">{details.skills.map(skill=><li key={skill}>{skill}</li>)}</ul></section>}
      </div>
    </div>
  </dialog>;
}

export function Experience() {
  const [selected,setSelected]=useState(null);
  const panel=useRef(null);
  const {onKeyDown}=useCenteredScroll(panel,'.role-entry',experienceItems.length);
  const closeDetails=()=>{const trigger=selected?.trigger;setSelected(null);requestAnimationFrame(()=>trigger?.focus({preventScroll:true}));};
  return <section className="experience-section" id="experience" aria-labelledby="experience-title"><div className="section-wrap">
    <SectionHeading number="04" id="experience-title" title={<Item as="span" variant="wipe" className="experience-title-mark">Experience.</Item>} note="THE WORK BEHIND THE SKILLS"/>
    <Reveal as="span" className="experience-heading-note" aria-hidden="true" delay={.3}>Building skills.<br/>Shipping work.<ServiceDoodle type="burst"/><ServiceDoodle/></Reveal>
    <div className="experience-layout"><Sequence className="experience-overview" gap={.1}><Item variant="line" className="experience-metric"><strong>03<span aria-hidden="true">.</span></strong><span>YEARS / TWO COMPANIES + FREELANCE</span></Item><Item as="p">From focused interfaces<br/>to complete applications.</Item><Item as="span" variant="fade" className="eyebrow experience-scroll-hint">EXPLORE MY ROLES <Arrow/></Item></Sequence>
      <Reveal className="experience-browser" distance={28} delay={.15}>
        <div className="role-timeline" ref={panel} role="region" aria-label="Experience roles, scroll vertically to browse" tabIndex={0} onKeyDown={onKeyDown}>{experienceItems.map((item,i)=><article className="role-entry" key={item.company}>
          <div className="role-card-top"><span className="eyebrow">0{i+1} / {i===0?'MOST RECENT':'PREVIOUSLY'}</span><span className="role-card-period">{item.period}<small>{item.duration}</small></span></div>
          <div className="role-card-heading"><h3>{item.role}</h3><p>{item.company}<small>{item.freelance?'Sample freelance work':'Sample company'}</small></p></div>
          <p className="role-card-summary">{item.summary}</p>
          <div className="role-card-footer"><span className="role-card-tools">{experienceDetails[i].skills.slice(0,3).join(' / ')}</span><span className="role-card-link" aria-hidden="true">View role <Arrow /></span></div>
          <button className="role-entry-open" aria-label={`View experience: ${item.role} at ${item.company}`} aria-haspopup="dialog" onClick={event=>setSelected({item,index:i,trigger:event.currentTarget})} />
        </article>)}</div>

      </Reveal>
    </div><p className="sample-note">Illustrative roles and companies for layout preview. Replace with your actual employment details.</p>{selected&&<ExperienceDialog item={selected.item} index={selected.index} onClose={closeDetails}/>}
  </div></section>;
}
