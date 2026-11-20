import React, {useEffect, useRef, useState} from 'react';
import {motion, useReducedMotion} from 'motion/react';
import {Entrance, motionEase} from '../lib/motion.jsx';
import {Arrow, Asterisk} from '../components/icons.jsx';
import {EnquiryButton} from '../components/Enquiry.jsx';
import {DogTag} from '../components/DogTag.jsx';
import {TagSwitch} from '../components/ThemeSwitch.jsx';
import portrait from '../assets/images/portrait-warm-lighting.webp';
import {aboutCard} from '../content/site.js';

// Once per visit on desktop, the photo card tilts slightly to hint that it flips.
function usePeek(card, reduce) {
  useEffect(() => {
    const el = card.current;
    if (!el || reduce || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    try { if (sessionStorage.getItem('card-peek')) return; } catch {}
    const done = event => { if (event.animationName === 'card-peek') el.classList.remove('is-peeking'); };
    const timer = setTimeout(() => {
      if (el.matches(':hover') || el.classList.contains('is-flipped')) return;
      el.addEventListener('animationend', done);
      el.classList.add('is-peeking');
      try { sessionStorage.setItem('card-peek', '1'); } catch {}
    }, 1600);
    return () => { clearTimeout(timer); el.removeEventListener('animationend', done); el.classList.remove('is-peeking'); };
  }, [card, reduce]);
}

export function Hero() {
  const reduce=useReducedMotion();
  const [flipped,setFlipped]=useState(false);
  const card=useRef(null);
  usePeek(card, reduce);
  return <section className="hero" id="home" aria-labelledby="hero-title">
    <Entrance className="hero-meta" delay={.04}><span>SOFTWARE ENGINEER / FULL STACK</span><span><span className="status-dot" /> OPEN TO WORK & FREELANCE</span></Entrance>
    <div className="name-stage"><h1 id="hero-title">{['Arjun','Sathia'].map((name,i)=><span className="hero-name-word" key={name}><motion.span className="hero-name-text" initial={reduce?false:{clipPath:'inset(100% 0 0 0)',opacity:0}} animate={{clipPath:'inset(0% 0 0 0)',opacity:1}} transition={{duration:reduce?0:.55,delay:.08+i*.1,ease:motionEase}}>{name}</motion.span>{i===0&&<DogTag/>}</span>)}</h1><TagSwitch/>
      <div ref={card} className={`hero-portrait${flipped?' is-flipped':''}`}>
        <div className="portrait-card">
          <div className="portrait-face portrait-front">
            <motion.img className="portrait" src={portrait} alt="Seated portrait with warm studio lighting" fetchPriority="high" width="941" height="1672" initial={reduce?false:{opacity:0,scale:1.025}} animate={{opacity:1,scale:1}} transition={{duration:reduce?0:.55,delay:.22,ease:motionEase}}/>
            <Entrance as="span" className="portrait-caption" delay={.5}>// Thoughtful code. Useful software.</Entrance>
          </div>
          <div className="portrait-face portrait-back" id="about-card">
            <div className="card-panel">
              <div className="card-top"><span className="card-spark" aria-hidden="true"><Asterisk/></span></div>
              <div><p className="portrait-back-title">{aboutCard.role.map(line=><span key={line}>{line}</span>)}</p><p className="card-lede">{aboutCard.lede}</p></div>
            </div>
            <ol className="card-list">{aboutCard.details.map(([label,value],i)=><li key={label}><span>0{i+1}</span><b>{value}</b><small>{label}</small></li>)}</ol>
          </div>
        </div>
        <button type="button" className="portrait-flip-toggle" aria-pressed={flipped} aria-controls="about-card" aria-label="Show details about me" onClick={()=>setFlipped(f=>!f)}/>
      </div>
    </div>
    <div className="hero-bottom"><Entrance className="hero-actions" delay={.52}><EnquiryButton className="button primary-button" topic="Project enquiry">Discuss a project <Arrow direction="→" /></EnquiryButton><a className="button secondary-button" href="#work">View projects <Arrow /></a></Entrance></div>
  </section>;
}
