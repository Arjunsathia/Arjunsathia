import React from 'react';
import {motion, useReducedMotion} from 'motion/react';
import {Entrance, motionEase} from '../lib/motion.jsx';
import {Arrow} from '../components/icons.jsx';
import {EnquiryButton} from '../components/Enquiry.jsx';
import {DogTag} from '../components/DogTag.jsx';
import {TagSwitch} from '../components/ThemeSwitch.jsx';
import portrait from '../assets/images/portrait-warm-lighting.webp';

export function Hero() {
  const reduce=useReducedMotion();
  return <section className="hero" id="home" aria-labelledby="hero-title">
    <Entrance className="hero-meta" delay={.04}><span>SOFTWARE ENGINEER / FULL STACK</span><span><span className="status-dot" /> OPEN TO WORK & FREELANCE</span></Entrance>
    <div className="name-stage"><h1 id="hero-title">{['Arjun','Sathia'].map((name,i)=><span className="hero-name-word" key={name}><motion.span className="hero-name-text" initial={reduce?false:{clipPath:'inset(100% 0 0 0)',opacity:0}} animate={{clipPath:'inset(0% 0 0 0)',opacity:1}} transition={{duration:reduce?0:.55,delay:.08+i*.1,ease:motionEase}}>{name}</motion.span>{i===0&&<DogTag/>}</span>)}</h1><TagSwitch/>
      <div className="hero-portrait"><motion.img className="portrait" src={portrait} alt="Seated portrait with warm studio lighting" fetchPriority="high" width="941" height="1672" initial={reduce?false:{opacity:0,scale:1.025}} animate={{opacity:1,scale:1}} transition={{duration:reduce?0:.55,delay:.22,ease:motionEase}}/><Entrance as="span" className="portrait-caption" delay={.5}>// Thoughtful code. Useful software.</Entrance></div>
    </div>
    <div className="hero-bottom"><Entrance className="hero-actions" delay={.52}><EnquiryButton className="button primary-button" topic="Project enquiry">Discuss a project <Arrow direction="→" /></EnquiryButton><a className="button secondary-button" href="#work">View projects <Arrow /></a></Entrance></div>
  </section>;
}
