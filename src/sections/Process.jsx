import React, {useState} from 'react';
import {Sequence, Item} from '../lib/motion.jsx';
import {processSteps} from '../content/site.js';
import {Arrow, ServiceDoodle} from '../components/icons.jsx';
import {SectionHeading} from '../components/SectionHeading.jsx';
import {EnquiryButton} from '../components/Enquiry.jsx';

export function Process() {
  const [openStep, setOpenStep] = useState(0);
  return <section className="process-section" id="process" aria-labelledby="process-title"><div className="section-wrap"><SectionHeading number="05" id="process-title" title={<><span className="process-title-lead">How I </span><Item as="span" variant="wipe" className="process-title-mark">work.</Item></>} note="A CLEAR PATH FROM START TO SHIP" /><div className="process-grid"><Sequence className="process-intro" gap={.1}><Item as="h3" variant="line"><span className="process-statement-lead">Good work starts<br /> with a </span><Item as="mark" variant="wipe">clear plan.</Item><ServiceDoodle type="burst" className="process-statement-doodle"/></Item><Item as="p">A practical process, open communication, and progress you can follow.</Item><EnquiryButton className="button primary-button" variant="rise">Start a conversation <Arrow direction="→" /></EnquiryButton></Sequence><Sequence className="process-steps" gap={.09} delay={.15} amount={.15}>{processSteps.map((step,i)=><Item variant="slide" className="process-step" key={step.title} data-open={openStep===i}>
        <h4><button className="process-trigger" id={`process-trigger-${i}`} aria-expanded={openStep===i} aria-controls={`process-panel-${i}`} onClick={()=>setOpenStep(current=>current===i ? null : i)}><span>0{i+1}</span><span>{step.title}</span><span className="process-plus" aria-hidden="true">+</span></button></h4>
        <div className="process-panel" id={`process-panel-${i}`} role="region" aria-labelledby={`process-trigger-${i}`} aria-hidden={openStep!==i} inert={openStep!==i}><div className="process-panel-inner"><div className="process-step-body"><p>{step.description}</p><span><b>THE OUTCOME</b>{step.outcome}</span></div></div></div>
      </Item>)}</Sequence></div></div></section>;
}
