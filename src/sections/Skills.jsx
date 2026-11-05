import React, {useEffect, useRef} from 'react';
import {Reveal, Item, useCompactMotion} from '../lib/motion.jsx';
import {stackGroups} from '../content/site.js';
import {Arrow, ServiceDoodle} from '../components/icons.jsx';
import {SectionHeading} from '../components/SectionHeading.jsx';

function SkillIcon({ icon }) {
  return icon === 'check' ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg> : icon ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} fill="currentColor" /></svg> : <svg viewBox="0 0 32 32" aria-hidden="true"><text x="2" y="18" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="600">aws</text><path d="M4 23q12 7 24-1m-4-1 5 .3-2 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function StackIllustration({index}) {
  return <Reveal className="stack-illustration" aria-hidden="true" fadeOnly delay={.3}><svg viewBox="0 0 100 100" fill="none">
    <defs><linearGradient id={`stack-depth-${index}`} x1="18" y1="12" x2="85" y2="92" gradientUnits="userSpaceOnUse"><stop stopColor="#fffdf4"/><stop offset="1" stopColor="#d4d4b7"/></linearGradient></defs>
    <circle cx="55" cy="51" r="39" fill="var(--stack-glow,#e6edb6)" opacity=".45"/>
    {index===0?<g transform="rotate(9 50 50)"><rect x="23" y="17" width="63" height="68" rx="11" fill="#cbdc69"/><rect x="16" y="22" width="63" height="68" rx="11" fill={`url(#stack-depth-${index})`}/><path d="M16 33q0-11 11-11h41q11 0 11 11v10H16Z" fill="#d4e62d"/>{[25,35,45].map(x=><ellipse key={x} cx={x} cy="33" rx="2.5" ry="3" fill="#fffdf1"/>)}<rect x="24" y="51" width="47" height="24" rx="5" fill="#fffdf4"/><path d="m49 62 22 15-10 2-4 10Z" fill="#172012"/><path d="m61 76 6 12" stroke="#172012" strokeWidth="5"/></g>:index===1?<g transform="rotate(7 50 50)">{[20,42,64].map((y,j)=><g key={y}><path d={`M18 ${y} 31 ${y-6} 81 ${y+2} 69 ${y+9}Z`} fill="#65734a"/><rect x="18" y={y} width="63" height="19" rx="5" fill={j===1?'var(--stack-server-mid,#26311e)':'var(--stack-server,#172012)'}/><path d={`M22 ${y+19}H75`} stroke="#c6dc46" strokeWidth="2"/>{[25,32,39].map(x=><circle key={x} cx={x} cy={y+7} r="1.6" fill="#d4e62d"/>)}</g>)}<circle cx="78" cy="73" r="18" fill="#e9f697"/><path d="M68 78h17a5 5 0 0 0 0-10 7 7 0 0 0-13-1 6 6 0 0 0-4 11Z" stroke="#182410" strokeWidth="2"/></g>:index===2?<g transform="rotate(8 50 50)"><rect x="30" y="15" width="48" height="74" rx="9" fill="#d4df8b"/><rect x="22" y="17" width="48" height="74" rx="9" fill={`url(#stack-depth-${index})`}/>{[35,53,71].map(y=><g key={y}><circle cx="35" cy={y} r="6" fill="#e2ed9d"/><path d={`m32 ${y} 2 2 4-5`} stroke="#26311e" strokeWidth="2" strokeLinecap="round"/><path d={`M46 ${y}h13`} stroke="#7d846a" strokeWidth="3" strokeLinecap="round"/></g>)}</g>:<><circle cx="64" cy="35" r="24" fill="#d4e62d"/><path d="m55 37 8-9 5 10 8-4" stroke="#b2c72a" strokeWidth="4" strokeLinecap="round"/><path d="M23 83h50a15 15 0 0 0 0-30 23 23 0 0 0-43-4 18 18 0 0 0-7 34Z" fill={`url(#stack-depth-${index})`}/><path d="M47 74V54m-8 9 8-9 8 9" stroke="#25301f" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/></>}
  </svg><ServiceDoodle type="burst"/></Reveal>;
}
// Touch screens have no hover, so on phones the row crossing the middle of the screen gets the hover look. Rows aren't tappable.
function useSelectedRow(rows, enabled) {
  useEffect(() => {
    if (!enabled) return;
    const list = rows.current;
    const select = row => list.querySelectorAll('.skill-row').forEach(item => { item.dataset.selected = String(item === row); });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) select(entry.target); }), {rootMargin: '-45% 0px -45% 0px'});
    list.querySelectorAll('.skill-row').forEach(row => observer.observe(row));
    return () => { observer.disconnect(); list.querySelectorAll('.skill-row').forEach(item => delete item.dataset.selected); };
  }, [rows, enabled]);
}
export function Skills() {
  const rows = useRef(null);
  useSelectedRow(rows, useCompactMotion());
  return <section id="skills" className="skills-section" aria-labelledby="skills-title"><div className="section-wrap">
    <SectionHeading number="03" id="skills-title" title={<><span className="stack-title-lead">What I work </span><Item as="span" variant="wipe" className="stack-title-mark">with.</Item></>} note="FROM INTERFACE TO RELEASE"/>
    <Reveal className="stack-mobile-intro" delay={.1}><p>Tools, technologies, and practices I use to turn ideas into useful software.</p><span className="stack-heading-note" aria-hidden="true">From interface<br/>to release.<ServiceDoodle type="burst"/><ServiceDoodle/></span></Reveal>
    <div className="skills-rows" ref={rows}>{stackGroups.map((group,i)=><Reveal className="skill-row" key={group.name} axis="x" distance={-28} delay={i*.1}>
      <span className="skill-row-number">0{i+1}</span><span className="skill-row-dash" aria-hidden="true"/>
      <div className="skill-row-copy"><h3>{group.name}</h3><p>{group.description}</p></div>
      <Arrow className="skill-row-arrow"/><StackIllustration index={i}/>
      <div className="skill-pills">{group.tools.map(([name,icon])=><div className="skill-pill" key={name} data-tool={name} style={{'--skill-brand':icon && icon!=='check'?`#${icon.hex}`:undefined}}><SkillIcon icon={icon}/><span>{name}</span></div>)}{i===3&&<div className="skill-pill skill-mobile-only"><SkillIcon icon="check"/><span>CI/CD</span></div>}</div>
    </Reveal>)}</div>
  </div></section>;
}
