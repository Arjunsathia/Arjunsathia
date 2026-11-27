import React, {useState} from 'react';
import {Sequence, Item, Reveal} from '../lib/motion.jsx';
import {processSteps} from '../content/site.js';
import {Arrow, ServiceDoodle} from '../components/icons.jsx';
import {SectionHeading} from '../components/SectionHeading.jsx';
import {EnquiryButton} from '../components/Enquiry.jsx';
import {SpecularLight} from '../components/SpecularButton.jsx';
import FlowingMenu from '../components/FlowingMenu.jsx';
import SplitText from '../components/SplitText.jsx';
import understandImage from '../assets/process/understand.svg';
import planImage from '../assets/process/plan.svg';
import buildImage from '../assets/process/build.svg';
import handoverImage from '../assets/process/handover.svg';

// The four steps as a flowing list: the step under the pointer (or tapped) fills with a lime band that runs its
// outcome and an illustration of the step. Clicking a step opens its details under it (one at a time, like an
// accordion); clicking it again closes it.
const stepImages = [understandImage, planImage, buildImage, handoverImage];
const stepItems = processSteps.map((step,i)=>({
  text: step.title,
  marquee: step.outcome,
  image: stepImages[i % stepImages.length],
  ariaLabel: `Step ${i+1}, ${step.title}`,
}));

export function Process() {
  const [open,setOpen] = useState(null);
  return <section className="process-section" id="process" aria-labelledby="process-title"><div className="section-wrap"><SectionHeading number="05" id="process-title" title={<><span className="process-title-lead">How I </span><Item as="span" variant="wipe" className="process-title-mark">work.</Item></>} note="A CLEAR PATH FROM START TO SHIP" /><div className="process-grid"><Sequence className="process-intro" gap={.1}><SplitText as="h3" startDelay={.1}><span className="process-statement-lead" data-split-skip>Good work starts<br /> with a </span><Item as="mark" variant="wipe">clear plan.</Item><ServiceDoodle type="burst" className="process-statement-doodle"/></SplitText><Item as="p">A practical process, open communication, and progress you can follow.</Item><EnquiryButton className="button primary-button" variant="rise"><SpecularLight/>Start a conversation <Arrow direction="→" /></EnquiryButton></Sequence>
    <Reveal className="process-flow" fadeOnly delay={.1}>
      <div className="process-flow-list">
        <FlowingMenu className="process-flowing-menu" items={stepItems} ariaLabel="How I work, step by step"
          align="left" showIndex dividers intro imageShape="pill" direction="left" speed={55} stretch={.6} magnet={.25} followCursor={.4} duration={.5}
          textColor="var(--on-band)" bgColor="transparent" marqueeBgColor="var(--accent)" marqueeTextColor="var(--on-accent)" borderColor="color-mix(in srgb, var(--accent) 32%, transparent)"
          expandedIndex={open} onItemClick={(item,index)=>setOpen(current=>current===index?null:index)}
          renderDetails={(item,index)=><div className="process-flow-panel"><p>{processSteps[index].description}</p><span className="process-flow-outcome"><b>THE OUTCOME</b>{processSteps[index].outcome}</span></div>}/>
      </div>
    </Reveal>
  </div></div></section>;
}
