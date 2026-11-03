import React from 'react';
import {Reveal, Item, useCompactMotion} from '../lib/motion.jsx';
import {serviceItems} from '../content/site.js';
import {Arrow, Asterisk, ServiceDoodle} from '../components/icons.jsx';
import {SectionHeading} from '../components/SectionHeading.jsx';

function ServiceLaptop() {
  return <svg className="service-laptop-real" viewBox="0 0 340 260" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="service-metal" x1="170" y1="178" x2="170" y2="237" gradientUnits="userSpaceOnUse"><stop stopColor="#b7bfc2"/><stop offset=".6" stopColor="#e2e6e7"/><stop offset="1" stopColor="#9aa4a9"/></linearGradient>
      <linearGradient id="service-bezel" x1="45" y1="16" x2="295" y2="180" gradientUnits="userSpaceOnUse"><stop stopColor="#616c70"/><stop offset=".25" stopColor="#242e32"/><stop offset="1" stopColor="#121b1e"/></linearGradient>
    </defs>
    <ellipse cx="170" cy="241" rx="150" ry="8" fill="#13170d" opacity=".13"/>
    <rect x="45" y="16" width="250" height="165" rx="8" fill="url(#service-bezel)" stroke="#78858a"/>
    <rect x="51" y="22" width="238" height="151" rx="3" fill="#0c120f"/>
    <circle cx="170" cy="19" r="1.3" fill="#8f9c9d"/>
    <text x="64" y="37" fill="#d4e62d" fontSize="5" fontFamily="monospace">{"✳︎ NORTH / STUDIO"}</text>
    <text x="239" y="37" fill="#a9b1a5" fontSize="3.5" fontFamily="monospace">WORK · ABOUT</text>
    <path d="M64 45H276" stroke="#ffffff15"/>
    <text x="67" y="75" fill="#f6f0e8" fontSize="24" fontFamily="Anton">MODERN WEBSITES.</text>
    <text x="67" y="104" fill="#d4e62d" fontSize="24" fontFamily="Anton">REAL RESULTS.</text>
    <text x="68" y="124" fill="#b1bc9f" fontSize="4.5" fontFamily="monospace">Thoughtful design. Built to work.</text>
    <rect x="67" y="139" width="62" height="15" rx="7.5" fill="#d4e62d"/>
    <text x="77" y="148.5" fill="#13170d" fontSize="4" fontFamily="monospace">{"EXPLORE WORK ↗︎"}</text>
    <path d="m247 105 3 13 13-5-8 12 12 6-15 1 2 14-9-10-10 11 4-15-14-3 14-5-7-12 12 7Z" fill="#f6f0e8" opacity=".8"/>
    <path d="M45 180H295L330 230H10Z" fill="url(#service-metal)" stroke="#8c989c" strokeWidth=".7"/>
    <path d="M54 184H286L303 211H37Z" fill="#8e989e"/>
    {Array.from({length:4},(_,row)=>Array.from({length:13},(_,col)=>{
      const start=54-row*4.5, step=17.4+row*.68, x=start+col*step, y=186+row*6;
      return <path key={`${row}-${col}`} d={`M${x} ${y}h${step-3}l1.5 4H${x-1.5}Z`} fill="#2c373c"/>;
    }))}
    <path d="M142 214H198L204 225H136Z" fill="#b8c0c4" stroke="#879499" strokeWidth=".6"/>
    <path d="M10 230H330V233Q328 238 318 238H22Q12 238 10 233Z" fill="#7e8b91"/>
    <path d="M10 230H330" stroke="#edf0f1" strokeWidth="1.5"/>
    <path d="M147 231H193L189 234H151Z" fill="#56666d"/>
  </svg>;
}

function ServiceIllustration({index}) {
  return <Reveal className={`service-illustration service-illustration-${index}`} aria-hidden="true" distance={16} scale={.94} delay={.25}>
    {index>0&&<div className={`service-art-stamp service-art-stamp-${index}`}><span className="service-art-stamp-label">{index===1?'IDEA → PRODUCT':'FIX / REFINE'}</span>{index===1?<Arrow className="service-art-stamp-mark"/>:<Asterisk className="service-art-stamp-mark"/>}</div>}
    {index===0?<><div className="service-tape"/><ServiceDoodle type="burst" className="service-device-burst"/><ServiceLaptop/></>:index===1?<div className="service-phone"><div className="service-phone-notch"/><small>your workspace</small><span className="service-phone-label">A little more clarity.</span><strong>All in one<span>place.</span></strong><svg viewBox="0 0 170 70" fill="none"><path d="M0 63 24 45 44 50 65 29 85 35 112 12 136 20 170 0" stroke="currentColor" strokeWidth="3"/><path d="M0 63 24 45 44 50 65 29 85 35 112 12 136 20 170 0V70H0Z" fill="currentColor" opacity=".12"/></svg><div className="service-phone-task"><i/>Design system<span>Ready</span></div><div className="service-phone-task"><i/>Application<span>In progress</span></div><div className="service-phone-task"><i/>Next release<span>On track</span></div></div>:<><div className="service-code"><div><i/><i/><i/></div><pre><span>const</span> improve = <span>async</span> () =&gt; {'{'}{'\n'}  await fixBugs();{'\n'}  await optimize();{'\n'}  await deploy();{'\n'}  <span>return</span> 'Better.';{'\n'}{'}'}</pre></div><div className="service-performance"><small>Performance</small><div><strong>98</strong><span>Looking good <Arrow/></span></div></div></>}
    {index===1&&<ServiceDoodle className="service-phone-doodle"/>}
  </Reveal>;
}
export function Services() {
  const compact=useCompactMotion();
  return <section className="services-section" id="services" aria-labelledby="services-title"><div className="section-wrap">
    <SectionHeading number="02" id="services-title" title={<><span className="service-title-lead">How I can </span><Item as="span" variant="wipe" className="service-title-help">help.</Item></>} /><Reveal className="services-section-intro"><p>A focused feature, a fresh website, or a complete application. Here’s where I can contribute.</p><span className="services-heading-note" aria-hidden="true"><ServiceDoodle type="burst"/>Ideas into<br/>working software.<ServiceDoodle/></span></Reveal>
    <div className="service-grid">{serviceItems.map((service,i)=><Reveal as="article" className={`service-card service-card-${i}`} key={service.title} distance={compact?12:20} delay={i*.08}>
      <div className="service-card-top"><strong>0{i+1}</strong><span className="service-number-line"/><span className="eyebrow">Service</span></div>
      {i===2&&<div className="service-top-note" aria-hidden="true"><ServiceDoodle/>Faster<br/>smoother<br/>better.</div>}
      <div className="service-card-body"><div className="service-copy"><h3>{service.title}</h3><p>{service.description}</p><div className="service-copy-note"><svg className="service-doodle" viewBox="0 0 100 65" fill="none" aria-hidden="true"><path d={['M12 8C5 39 43 55 83 28M65 28 85 25 81 44','M12 12C12 42 49 49 85 26M69 25 85 26 81 42','M10 14C22 45 58 47 85 24M69 24 85 24 82 40'][i]}/></svg><p className="service-outcome">{service.outcome}</p></div></div><ServiceIllustration index={i}/></div>
    </Reveal>)}</div>
  </div></section>;
}
