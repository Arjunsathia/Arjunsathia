import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {motion, MotionConfig, useReducedMotion} from 'motion/react';
import {Reveal, Entrance, motionEase, useCompactMotion, useCenteredScroll} from './motion.jsx';
import { siJavascript, siTypescript, siPython, siReact, siNextdotjs, siTailwindcss, siNodedotjs, siDjango, siGraphql, siMongodb, siPostgresql, siDocker, siGit, siGithub } from 'simple-icons';
import portrait from '../assets/portrait-warm-lighting.png';
import aboutPortrait from '../assets/arjun-about.jpeg';
import '../fonts.css';
import '../styles.css';

const profile = { name: 'Arjun Sathia', email: '', github: '', linkedin: '', available: true };
const projects = [
  { name: 'Orbit', accent: '#d4e62d', summary: 'A clear view of traffic, trends, and engagement.', type: 'dashboard', title: 'Analytics dashboard', description: 'An analytics dashboard concept with reusable charts, useful filters, and a focused, responsive interface.', tags: ['React', 'TypeScript', 'Data visualization'], note: 'ANALYTICS WORKSPACE', direction: 'A component-driven dashboard concept that makes dense information easier to explore. The interface separates the overview, trends, and individual records.', details: 'Proposed implementation: typed data models, accessible filtering controls, reusable chart components, and explicit loading, empty, and error states.' },
  { name: 'DevNotes', accent: '#a8ed7d', summary: 'A focused home for code snippets and ideas.', type: 'editor', title: 'Developer notebook', description: 'A developer notebook concept for collecting code snippets, organizing ideas, and finding the useful bits later.', tags: ['React', 'Markdown', 'Local storage'], note: 'A HOME FOR YOUR IDEAS', direction: 'A distraction-free workspace concept with a clear split between navigation, editing, and preview. Search and tags keep a growing collection approachable.', details: 'Proposed implementation: a Markdown editor, local persistence, keyboard-accessible navigation, and an export workflow. This is an illustrative portfolio case study, not a live product.' },
  { name: 'Stack', accent: '#ffdc3d', summary: 'A simple board for projects and priorities.', type: 'board', title: 'Project workspace', description: 'A project workspace concept that turns a busy backlog into a clear view of what to build next.', tags: ['Next.js', 'Node.js', 'PostgreSQL'], note: 'PLAN. BUILD. SHIP.', direction: 'A lightweight planning tool concept organized around a simple board. Small, readable task cards keep status, ownership, and priority in view.', details: 'Proposed implementation: a relational task model, validated API endpoints, optimistic updates, and keyboard-accessible task movement. No production usage or results are claimed.' },
  { name: 'Pulse', accent: '#9edbc9', summary: 'A simple overview of service health and uptime.', type: 'dashboard', title: 'Service monitoring', description: 'A sample monitoring dashboard concept for checking service status, recent incidents, and uptime in one place.', tags: ['React', 'Python', 'PostgreSQL'], direction: 'Group service health, incident history, and recent activity into a readable overview, with clear status labels that do not rely on color alone.', details: 'Proposed implementation: scheduled health checks, a Python API, persistent incident records, accessible status indicators, and explicit loading and failure states. This is a sample concept, not a production service.' },
  { name: 'Draft', accent: '#edc88f', summary: 'A quiet workspace for writing and publishing.', type: 'editor', title: 'Publishing workspace', description: 'A sample publishing workspace concept for organizing articles, editing drafts, and preparing content for release.', tags: ['Next.js', 'TypeScript', 'MongoDB'], direction: 'Keep the writing experience focused, with drafts and publishing controls close at hand. Separate editing from preview so each task stays clear.', details: 'Proposed implementation: authenticated draft management, autosave, Markdown previews, validated publishing endpoints, and keyboard-accessible controls. All features describe a concept implementation.' },
];
const Arrow = ({ direction = '↗', ...props }) => <span aria-hidden="true" {...props}>{direction}</span>;
const Wordmark = () => <a className="wordmark" href="#home" aria-label={`${profile.name}, home`}>{profile.name}<span>.</span></a>;
function SocialLinks({ compact = false }) {
  const [notice,setNotice] = useState('');
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3000);return()=>clearTimeout(timer);},[notice]);
  return <div className={`social-links ${compact ? 'compact' : ''}`} aria-label="Social profiles">{[['GitHub',profile.github],['LinkedIn',profile.linkedin]].map(([name,url])=>{
    const contents = <><svg viewBox="0 0 24 24" aria-hidden="true">{name === 'GitHub' ? <path d={siGithub.path} fill="currentColor" /> : <><rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" /><circle cx="7" cy="7" r="1.3" fill="var(--social-cutout, var(--paper))" /><path d="M6 10h2v8H6zm4 0h2v1c1-2 6-2 6 2v5h-2v-5c0-2-4-2-4 0v5h-2z" fill="var(--social-cutout, var(--paper))" /></>}</svg>{!compact && <span>{name}</span>}{url && !compact && <Arrow />}</>;
    return url ? <a key={name} className="social-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} profile`}>{contents}</a> : <button type="button" key={name} className="social-link pending" onClick={()=>setNotice(`${name} profile link hasn’t been added yet.`)} aria-label={`${name} profile link coming soon`} title={`${name} profile link coming soon`}>{contents}{!compact && <small>Coming soon</small>}</button>;
  })}{notice && <span className="social-notice" role="status">{notice}</span>}</div>;
}
function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const header = useRef(null);
  const toggle = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (event.type === 'keydown' && event.key === 'Escape' && toggle.current?.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.current?.focus(); }
      if (event.type === 'pointerdown' && !header.current?.contains(event.target)) setOpen(false);
    };
    const resize = () => { if (window.innerWidth > 1000) setOpen(false); };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    window.addEventListener('resize', resize);
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close); window.removeEventListener('resize', resize); };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), {rootMargin: '-20% 0px -50% 0px'});
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <header className="header" ref={header}>
    <div className="topline" aria-hidden="true"><div>{[0,1,2,3].map(i=><span key={i}>FRONTEND <b>✳</b> BACKEND <b>✳</b> WRITING CODE <b>✳</b> SOLVING PROBLEMS <b>✳</b> BUILDING FOR THE WEB <b>✳</b> OPEN TO OPPORTUNITIES <b>✳</b> </span>)}</div></div>
    <div className="header-inner"><Wordmark />
      <nav className="desktop-nav" aria-label="Main navigation">{[['work','Projects'],['services','Services'],['skills','Stack'],['experience','Experience'],['about','About me'],['contact','Contact']].map(([id,label])=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined}>{label}</a>)} </nav><a className="button primary-button header-cta" href="#contact">Let’s talk <Arrow direction="↗" /></a>
      <button ref={toggle} className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}><span /><span /></button>
      <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" hidden={!open}>{[['work','Projects'],['services','Services'],['skills','Stack'],['experience','Experience'],['about','About me'],['contact','Contact']].map(([id,label],i)=><a key={id} href={`#${id}`} onClick={()=>setOpen(false)}>{label}<span>0{i+1}</span></a>)}</nav>
    </div>
  </header>;
}
function Hero() {
  const reduce=useReducedMotion();
  return <section className="hero" id="home" aria-labelledby="hero-title">
    <Entrance className="hero-meta" delay={.04}><span>SOFTWARE ENGINEER / FULL STACK</span><span><span className="status-dot" /> OPEN TO WORK & FREELANCE</span></Entrance>
    <div className="name-stage"><h1 id="hero-title">{['Arjun','Sathia'].map((name,i)=><motion.span key={name} initial={reduce?false:{clipPath:'inset(100% 0 0 0)',opacity:0}} animate={{clipPath:'inset(0% 0 0 0)',opacity:1}} transition={{duration:reduce?0:.55,delay:.08+i*.1,ease:motionEase}}>{name}</motion.span>)}</h1>
      <Entrance className="dev-stamp label-stamp" delay={.43} aria-hidden="true"><span className="label-stamp-code">&lt;/&gt;</span><span className="label-stamp-copy"><small>FULL STACK</small><strong>DEV</strong></span></Entrance>
      <div className="hero-portrait"><motion.img className="portrait" src={portrait} alt="Seated portrait with warm studio lighting" fetchPriority="high" width="1024" height="1536" initial={reduce?false:{opacity:0,scale:1.025}} animate={{opacity:1,scale:1}} transition={{duration:reduce?0:.55,delay:.22,ease:motionEase}}/><Entrance as="span" className="portrait-caption" delay={.5}>// Thoughtful code. Useful software.</Entrance></div>
    </div>
    <div className="hero-bottom"><Entrance className="hero-actions" delay={.52}><a className="button primary-button" href="#contact">Discuss a project <Arrow direction="→" /></a><a className="button secondary-button" href="#work">View projects <Arrow /></a></Entrance></div>
  </section>;
}
function Intro() {
  return <section className="intro-section" aria-labelledby="intro-title"><div className="section-wrap"><p className="eyebrow">ONE DEVELOPER. THE WHOLE PICTURE.</p><h2 id="intro-title"><Reveal as="span" className="manifesto-line" distance={24} delay={0*.08} style={{'--line-index':0}}>I BUILD <mark className="front-mark">FRONT.</mark></Reveal><Reveal as="span" className="manifesto-line" distance={24} delay={1*.08} style={{'--line-index':1}}>I CONNECT <mark className="back-mark">BACK.</mark></Reveal><Reveal as="span" className="manifesto-line" distance={24} delay={2*.08} style={{'--line-index':2}}>I TEST <mark className="test-mark">EVERYTHING.</mark></Reveal></h2><div className="intro-bottom"><p>Good software should feel simple. I work across interfaces, APIs, and databases to make that happen.</p><span className="code-flower" aria-hidden="true">✳</span></div></div></section>;
}
function ProjectArt({ project, index, onClick, decorative = false }) {
  const contents = <><div className="mock-window"><div className="mock-toolbar"><span /><span /><span /><b>{project.name.toLowerCase()}.app</b></div><div className="mock-content"><aside className="mock-sidebar"><strong>{project.name}<span> /</span></strong><span className="mock-nav active">Overview</span><span className="mock-nav">{project.type === 'editor' ? 'My snippets' : 'Workspace'}</span><span className="mock-nav">Activity</span><span className="mock-nav">Settings</span><small>PERSONAL WORKSPACE</small></aside><div className="mock-main"><div className="mock-heading"><span>{project.type === 'editor' ? 'Your second brain.' : project.type === 'board' ? 'Make room for progress.' : 'A view of what matters.'}</span><small>Workspace / Overview</small></div>{project.type === 'dashboard' ? <><div className="mock-stats"><div><small>Total visitors</small><strong>12,846</strong><em>+18.6% this month</em></div><div><small>Engagement</small><strong>68.4<span>%</span></strong><em>+4.2% this month</em></div></div><div className="mock-chart"><small>Activity overview <span>Last 12 months</span></small><div className="chart-bars">{[30,46,38,58,51,72,62,83,74,91,81,98].map((height,i)=><span key={i} style={{height:`${height}%`}} />)}</div></div></> : project.type === 'editor' ? <div className="mock-editor"><div>getting-started.tsx <span>×</span></div><pre><span>// A little clarity goes a long way.</span>{'\n\n'}<i>export default function</i> Workspace() {'{'}{'\n'}  <i>return</i> ({'\n'}    &lt;Idea{'\n'}      title=<em>"Make something useful"</em>{'\n'}      status=<em>"in progress"</em>{'\n'}    /&gt;{'\n'}  );{'\n'}{'}'}</pre></div> : <div className="mock-board">{['To build', 'In progress', 'Shipped'].map((title,i)=><div key={title}><small>{title} <span>02</span></small>{[0,1].map((n)=><div className="task-card" key={n}><span className="task-label">{['Interface','Development','Release'][i]}</span><strong>{[['Explore the brief','Map the user flow'],['Build components','Connect the API'],['Set up the project','Define the system']][i][n]}</strong><div><span>ST–0{i*2+n+1}</span><b>YN</b></div></div>)}</div>)}</div>}</div></div></div><span className="art-index">0{index + 1} / CONCEPT</span><span className="art-open"><Arrow /></span></>;
  return decorative ? <div className={`project-image ${project.type}`} aria-hidden="true">{contents}</div> : <button className={`project-image ${project.type}`} onClick={onClick} aria-label={`Explore ${project.name} concept`}>{contents}</button>;
}
function ProjectDialog({project,index,onClose}) {
  const ref=useRef(null),timer=useRef(null);
  const [closing,setClosing]=useState(false),[tab,setTab]=useState(0);
  const reduce=useReducedMotion();
  const tabs=['Overview','Approach','Development','Stack'];
  useEffect(()=>{
    const previous=document.body.style.overflow;
    if(!ref.current.open)ref.current.showModal();
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previous;clearTimeout(timer.current);};
  },[]);
  const close=()=>{if(closing)return;setClosing(true);timer.current=setTimeout(onClose,reduce?0:180);};
  const trapFocus=event=>{
    if(event.key!=='Tab')return;
    const elements=Array.from(ref.current.querySelectorAll('button,[tabindex="0"],a[href]')).filter(element=>element.tabIndex>=0&&!element.disabled);
    const first=elements[0],last=elements[elements.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  const tabKey=event=>{
    const next={ArrowLeft:(tab+3)%4,ArrowRight:(tab+1)%4,Home:0,End:3}[event.key];
    if(next!==undefined){event.preventDefault();setTab(next);ref.current.querySelector(`#project-tab-${next}`).focus();}
  };
  return <dialog ref={ref} className={`case-dialog project-modal ${closing?'is-closing':''}`} style={{'--project-accent':project.accent}} aria-labelledby="case-title" aria-describedby="case-summary" onClose={onClose} onCancel={event=>{event.preventDefault();close();}} onKeyDown={trapFocus} onClick={event=>{
    if(event.target===ref.current){const r=ref.current.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}
  }}>
    <header className="project-modal-bar"><span className="eyebrow"><i aria-hidden="true"/>PROJECT / 0{index+1}<span>CONCEPT</span></span><button className="project-modal-close" aria-label="Close project" onClick={close} autoFocus>×</button></header>
    <div className="project-modal-heading"><h2 id="case-title">{project.name}<span>.</span></h2><p>{project.title}</p><p id="case-summary" className="sr-only">{project.summary}</p></div>
    <div className="project-modal-tabs" role="tablist" aria-label="Project details" onKeyDown={tabKey}>{tabs.map((label,i)=><button key={label} role="tab" id={`project-tab-${i}`} aria-selected={tab===i} aria-controls="project-detail-panel" tabIndex={tab===i?0:-1} onClick={()=>setTab(i)}>{label}</button>)}</div>
    <motion.div key={tab} className={`project-modal-page ${tab===0?'is-overview':''}`} role="tabpanel" id="project-detail-panel" aria-labelledby={`project-tab-${tab}`} tabIndex={0} initial={reduce?false:{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.18,ease:motionEase}}>
      {tab===0?<><div className="project-modal-visual"><ProjectArt project={project} index={index} decorative/></div><div className="project-modal-reading"><span className="eyebrow">01 / OVERVIEW</span><h3>{project.summary}</h3><p>{project.description}</p></div></>:<div className="project-modal-reading"><span className="eyebrow">0{tab+1} / {tabs[tab].toUpperCase()}</span><h3>{['','The approach.','How it’s built.','The toolset.'][tab]}</h3>{tab===3?<><p>Proposed tools for this project concept.</p><ul className="project-modal-stack">{project.tags.map(tag=><li key={tag}>{tag}</li>)}</ul></>:<p>{tab===1?project.direction:project.details}</p>}</div>}
    </motion.div>
    <footer className="project-modal-footer"><span>ILLUSTRATIVE PROJECT · PROPOSED IMPLEMENTATION</span><span>0{tab+1} / 04</span></footer>
  </dialog>;
}
function ProjectEntry({project,index,onOpen}) {
  return <article className={`work-entry work-entry-${project.name.toLowerCase()}`} style={{'--project-highlight':project.accent}} aria-labelledby={`work-entry-title-${index}`}>
    <div className="work-entry-name"><span className="eyebrow">0{index+1} / {project.title}</span><h3 id={`work-entry-title-${index}`}><button onClick={event=>onOpen(index,event)} aria-haspopup="dialog" aria-label={`View ${project.name} project`}>{project.name}<span>.</span></button></h3></div>
    <div className="work-entry-parallax"><div className="work-entry-art"><ProjectArt project={project} index={index} onClick={event=>onOpen(index,event)}/></div></div>
    <div className="work-entry-info"><p>{project.summary}</p><span className="work-entry-tech">{project.tags.slice(0,2).join(' / ')}</span><button className="work-entry-link" onClick={event=>onOpen(index,event)} aria-haspopup="dialog" aria-label={`Read ${project.name} details`}>Project details <Arrow/></button></div>
  </article>;
}
function Work() {
  const [selected,setSelected]=useState(null);
  const trigger=useRef(null), projectList=useRef(null);
  const {active,goTo,onKeyDown}=useCenteredScroll(projectList,'.work-entry',projects.length);
  const openProject=(index,event)=>{trigger.current=event.currentTarget;setSelected(index);};
  const closeProject=()=>{setSelected(null);requestAnimationFrame(()=>trigger.current?.focus({preventScroll:true}));};
  return <section className="work section-wrap" id="work" aria-labelledby="work-title">
    <SectionHeading number="01" id="work-title" title="Selected work." note="INTERFACES / TOOLS / APPLICATIONS" />
    <div className="project-stack-intro"><p>A few selected project concepts.</p><span className="eyebrow">05 / PROJECT CONCEPTS</span></div>
    <Reveal className="project-browser"><div className="work-index project-wheel" ref={projectList} role="region" aria-label="Selected projects, scroll vertically to browse" tabIndex={0} onKeyDown={onKeyDown}>{projects.map((project,index)=><ProjectEntry key={project.name} project={project} index={index} onOpen={openProject}/>)}</div><div className="project-wheel-controls"><button aria-label="Previous project" disabled={active===0} onClick={()=>goTo(active-1)}>←</button><span aria-live="polite" aria-atomic="true">0{active+1} / 0{projects.length}<span className="sr-only"> {projects[active].name}</span></span><button aria-label="Next project" disabled={active===projects.length-1} onClick={()=>goTo(active+1)}>→</button></div></Reveal>
    <p className="sample-note project-stack-note">Illustrative project concepts · Full details inside each project.</p>
    {selected!==null && <ProjectDialog project={projects[selected]} index={selected} onClose={closeProject} />}
  </section>;
}
const stackGroups = [
  { name: 'Frontend', description: 'Responsive interfaces with clear structure, useful details, and a focus on the person using them.', tools: [['JavaScript',siJavascript],['TypeScript',siTypescript],['React',siReact],['Next.js',siNextdotjs],['Tailwind',siTailwindcss]] },
  { name: 'Backend', description: 'The APIs, application logic, and databases that keep everything connected behind the screen.', tools: [['Node.js',siNodedotjs],['Python',siPython],['Django',siDjango],['GraphQL',siGraphql],['MongoDB',siMongodb],['PostgreSQL',siPostgresql]] },
  { name: 'Testing & quality', description: 'Checking the important flows, across screen sizes, keyboard interactions, and API responses.', tools: [['UI checks','check'],['API validation','check'],['Accessibility','check']] },
  { name: 'Deployment', description: 'Version control, containers, and cloud tools to take an application from local development to release.', tools: [['Docker',siDocker],['AWS',null],['Git',siGit]] },
];
function SkillIcon({ icon }) {
  return icon === 'check' ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l4 4L19 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg> : icon ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} fill="currentColor" /></svg> : <svg viewBox="0 0 32 32" aria-hidden="true"><text x="2" y="18" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="600">aws</text><path d="M4 23q12 7 24-1m-4-1 5 .3-2 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
function Skills() {
  return <section id="skills" className="skills-section" aria-labelledby="skills-title"><div className="section-wrap"><SectionHeading number="03" id="skills-title" title="What I work with." note="FROM INTERFACE TO RELEASE"/><div className="skills-rows">{stackGroups.map((group,i)=><Reveal className="skill-row" key={group.name} distance={0} delay={i*.08}><span className="skill-row-number">0{i+1}</span><div className="skill-row-copy"><h3>{group.name}</h3><p>{group.description}</p></div><div className="skill-pills">{group.tools.map(([name,icon])=><div className="skill-pill" key={name}><SkillIcon icon={icon} /><span>{name}</span></div>)}</div></Reveal>)}</div></div></section>;
}
function SectionHeading({ number, id, title, note }) {
  return <Reveal className="section-heading"><span className="eyebrow">({number})</span><h2 id={id}>{title}</h2>{note && <span className="heading-note">// {note}</span>}</Reveal>;
}
const serviceItems = [
  {title:'Websites that work',icon:'↗',description:'A clear, considered website for your business, portfolio, or next launch. Built around your content and the people you want to reach.',outcome:'From first idea to launch.'},
  {title:'Ideas into products',icon:'↔',description:'Turn an idea into a working application, or add the next feature to an existing product. A focused scope, regular updates, and a useful result.',outcome:'A product ready for real users.'},
  {title:'Care & improvements',icon:'✳',description:'Fix the frustrating parts, improve slow pages, and keep your application running well as your needs change.',outcome:'A better experience, over time.'},
];
function Services() {
  const compact=useCompactMotion();
  return <section className="services-section" id="services" aria-labelledby="services-title"><div className="section-wrap"><SectionHeading number="02" id="services-title" title="How I can help." note="IDEAS INTO WORKING SOFTWARE" /><p className="section-intro">A focused feature, a fresh website, or a complete application.<br />Here’s where I can contribute.</p><div className="service-grid">{serviceItems.map((service,i)=><Reveal as="a" className="service-card" href="#contact" key={service.title} axis="x" distance={compact?-12:-20} delay={i*.1}><div className="service-card-top"><span className="eyebrow">0{i+1} / SERVICE</span><span aria-hidden="true">{service.icon}</span></div><h3>{service.title}</h3><p>{service.description}</p><p className="service-outcome">{service.outcome}</p><span className="service-card-action">Let’s discuss <Arrow direction="→" /></span></Reveal>)}</div></div></section>;
}
const experienceItems = [
  {role:'Full-stack Developer',company:'Northline Studio',period:'Oct 2025 — Sep 2026',duration:'1 year',initials:'NS',summary:'Worked across React interfaces, Node.js APIs, and PostgreSQL integrations for web applications.',details:['Built reusable interface components and connected frontend features to backend services.','Worked on API behavior, data handling, testing, and release preparation.']},
  {role:'Frontend Developer',company:'Oakbyte Digital',period:'Oct 2024 — Sep 2025',duration:'1 year',initials:'OD',summary:'Focused on responsive interfaces and turning design ideas into usable, consistent web pages.',details:['Developed responsive screens with React, JavaScript, and Tailwind.','Collaborated on component structure, accessibility, and browser testing.']},
  {role:'Freelance Developer',company:'Independent projects',period:'Oct 2023 — Sep 2024',duration:'1 year',summary:'Built websites and small web applications, working from project briefs through development, feedback, and handover.',freelance:true},
];
const experienceDetails = [
  {responsibilities:['Developed interface features and the backend services supporting them.','Connected application data, handled API states, and prepared changes for release.','Reviewed key user flows and worked through issues before handover.'],delivered:['Reusable application screens and shared UI components.','Connected API endpoints and database-backed features.'],skills:['React','Node.js','PostgreSQL','API integration','Testing','Git']},
  {responsibilities:['Translated design layouts into responsive web interfaces.','Built reusable components and managed loading, empty, and error states.','Checked keyboard access, browser behavior, and layouts across screen sizes.'],delivered:['Responsive application screens and a consistent component library.','Interface refinements based on design reviews and browser checks.'],skills:['React','JavaScript','Tailwind','Responsive UI','Accessibility','Git']},
  {responsibilities:['Clarified project requirements and agreed on scope with clients.','Built websites and small applications, sharing progress and incorporating feedback.','Prepared deployment, documentation, and a practical handover.'],delivered:['Business websites and small application features.','Project documentation and launch support.'],skills:['JavaScript','React','Python','Web development','Deployment','Client communication']},
];
function ExperienceDialog({ item, index, onClose }) {
  const ref = useRef(null), timer = useRef(null);
  const [closing, setClosing] = useState(false);
  const details = experienceDetails[index];
  useEffect(()=>{
    const previousOverflow = document.body.style.overflow;
    if (!ref.current.open) ref.current.showModal();
    document.body.style.overflow = 'hidden';
    return ()=>{document.body.style.overflow = previousOverflow;clearTimeout(timer.current);};
  },[]);
  const close = ()=>{
    if (closing) return;
    setClosing(true);
    timer.current = setTimeout(onClose,180);
  };
  return <dialog ref={ref} className={`experience-dialog ${closing ? 'is-closing' : ''}`} aria-labelledby="experience-dialog-title" aria-describedby="experience-dialog-summary" onCancel={event=>{event.preventDefault();close();}} onClose={onClose} onKeyDown={event=>{
    if(event.key!=='Tab') return;
    const controls=Array.from(ref.current.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]'));
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
  }} onClick={event=>{
    if(event.target===ref.current){const box=ref.current.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom) close();}
  }}>
    <div className="experience-dialog-header"><span className="eyebrow">EXPERIENCE / 0{index+1}</span><button className="experience-dialog-close" onClick={close} aria-label="Close experience details" autoFocus>×</button></div>
    <div className="experience-dialog-heading"><h2 id="experience-dialog-title">{item.role}</h2><p>{item.company}</p><div className="experience-dialog-meta"><span>{item.period}</span><span>{item.duration}</span><span className="sample-label">{item.freelance ? 'Sample freelance work' : 'Sample company'}</span></div></div>
    <p className="experience-dialog-summary" id="experience-dialog-summary">{item.summary}</p>
    <div className="experience-dialog-work"><section aria-labelledby="role-responsibilities"><h3 id="role-responsibilities">Responsibilities</h3><ul>{details.responsibilities.map(text=><li key={text}>{text}</li>)}</ul></section><section aria-labelledby="role-deliverables"><h3 id="role-deliverables">Work delivered</h3><ul>{details.delivered.map(text=><li key={text}>{text}</li>)}</ul></section></div>
    <section className="experience-dialog-skills" aria-labelledby="role-skills"><h3 id="role-skills">Skills & tools</h3><ul>{details.skills.map(skill=><li key={skill}>{skill}</li>)}</ul></section>
    <p className="experience-dialog-note">Illustrative experience details for preview. Replace with your actual work.</p>
  </dialog>;
}
function Experience() {
  const [selected,setSelected]=useState(null);
  const panel=useRef(null);
  const {onKeyDown}=useCenteredScroll(panel,'.role-entry',experienceItems.length);
  const closeDetails=()=>{const trigger=selected?.trigger;setSelected(null);requestAnimationFrame(()=>trigger?.focus({preventScroll:true}));};
  return <section className="experience-section" id="experience" aria-labelledby="experience-title"><div className="section-wrap">
    <SectionHeading number="04" id="experience-title" title="Experience." note="THE WORK BEHIND THE SKILLS"/>
    <div className="experience-layout"><div className="experience-overview"><div className="experience-metric"><strong>03<span aria-hidden="true">.</span></strong><span>YEARS / TWO COMPANIES + FREELANCE</span></div><p>From focused interfaces<br/>to complete applications.</p><span className="eyebrow experience-scroll-hint">EXPLORE MY ROLES <span aria-hidden="true">↗</span></span></div>
      <div className="experience-browser">
        <div className="role-timeline" ref={panel} role="region" aria-label="Experience roles, scroll vertically to browse" tabIndex={0} onKeyDown={onKeyDown}>{experienceItems.map((item,i)=><article className="role-entry" key={item.company}>
          <div className="role-entry-meta"><span className="eyebrow">0{i+1} / {i===0?'MOST RECENT':'PREVIOUSLY'}</span><span>{item.period}</span></div><h3>{item.role}</h3><div className="role-entry-company"><span>{item.company}</span><small>{item.freelance?'Sample freelance work':'Sample company'}</small><span className="role-tenure">{item.duration}</span></div><p>{item.summary}</p><button className="role-entry-open" aria-label={`View experience: ${item.role} at ${item.company}`} aria-haspopup="dialog" onClick={event=>setSelected({item,index:i,trigger:event.currentTarget})}><span>Details ↗</span></button>
        </article>)}</div>

      </div>
    </div><p className="sample-note">Illustrative roles and companies for layout preview. Replace with your actual employment details.</p>{selected&&<ExperienceDialog item={selected.item} index={selected.index} onClose={closeDetails}/>}
  </div></section>;
}
const processSteps = [
  {title:'Understand',description:'We start with the problem, the people using the product, and what a good outcome looks like.',outcome:'A clear brief and shared priorities.'},
  {title:'Plan',description:'I break the work into a practical scope, map the key screens and data, and agree on the next steps.',outcome:'A focused plan with manageable milestones.'},
  {title:'Build',description:'I develop the interface and backend in small, reviewable pieces, with regular updates along the way.',outcome:'Working features you can see and try.'},
  {title:'Test & hand over',description:'I check the important flows, refine the details, and prepare the application and documentation for handover.',outcome:'A considered release and a clear next step.'},
];
function Process() {
  const [openStep, setOpenStep] = useState(0);
  return <section className="process-section" id="process" aria-labelledby="process-title"><div className="section-wrap"><SectionHeading number="05" id="process-title" title="How I work." note="A CLEAR PATH FROM START TO SHIP" /><div className="process-grid"><div className="process-intro"><h3>Good work starts<br />with a <mark>clear plan.</mark></h3><p>A practical process, open communication, and progress you can follow.</p><a className="button primary-button" href="#contact">Start a conversation <Arrow direction="→" /></a></div><div className="process-steps">{processSteps.map((step,i)=><div className="process-step" key={step.title} data-open={openStep===i}>
        <h4><button className="process-trigger" id={`process-trigger-${i}`} aria-expanded={openStep===i} aria-controls={`process-panel-${i}`} onClick={()=>setOpenStep(current=>current===i ? null : i)}><span>0{i+1}</span><span>{step.title}</span><span className="process-plus" aria-hidden="true">+</span></button></h4>
        <div className="process-panel" id={`process-panel-${i}`} role="region" aria-labelledby={`process-trigger-${i}`} aria-hidden={openStep!==i} inert={openStep!==i}><div className="process-panel-inner"><div className="process-step-body"><p>{step.description}</p><span><b>THE OUTCOME</b>{step.outcome}</span></div></div></div>
      </div>)}</div></div></div></section>;
}
const sampleTestimonials = [
  {quote:'Clear communication, thoughtful implementation, and a smooth handover. The whole process felt easy to follow.',name:'Alex Morgan',role:'Sample client',initials:'AM'},
  {quote:'Arjun worked through the details carefully and kept the project moving. The result was straightforward to use and maintain.',name:'Priya Shah',role:'Sample teammate',initials:'PS'},
];
function Testimonials() {
  return <section className="testimonials-section section-wrap" id="testimonials" aria-labelledby="testimonials-title"><SectionHeading number="07" id="testimonials-title" title="In their words." note="FEEDBACK & COLLABORATION"/><div className="testimonials-meta"><p className="section-intro">A little perspective from the other side of the project.</p><span className="sample-label">Sample testimonials</span></div><div className="testimonial-grid">{sampleTestimonials.map((item,i)=><Reveal as="figure" className="testimonial-card" key={item.name} delay={i*.1}><span className="editorial-quote-mark" aria-hidden="true">“</span><blockquote>{item.quote}</blockquote><figcaption><strong>{item.name}</strong><small>{item.role} · Illustrative quote</small></figcaption></Reveal>)}</div><p className="sample-note">Sample quotes and names for design preview. Replace with real feedback and permission to publish.</p></section>;
}
function About() {
  return <section className="about" id="about" aria-labelledby="about-title"><div className="section-wrap"><div className="section-heading"><span className="eyebrow">(06)</span><h2 id="about-title">More than a stack.</h2><span className="heading-note">// A LITTLE ABOUT ME</span></div>
    <div className="about-grid">
      <Reveal className="about-name">HI, I’M<br /><span className="about-highlight">ARJUN.</span><span className="about-code-mark" aria-hidden="true">&lt;/&gt;</span></Reveal>
      <Reveal className="about-profile" delay={.08}><figure className="about-photo"><div className="about-photo-frame"><img src={aboutPortrait} alt="Arjun Sathia wearing glasses and a suit" loading="lazy" width="1173" height="1536" /></div><figcaption><span><strong>ARJUN SATHIA</strong><small>SOFTWARE ENGINEER / FULL STACK</small></span></figcaption></figure><div className="about-copy"><p>I’m a software engineer who enjoys figuring out how things work — and making them work better.</p><p>I build across the full stack, from React interfaces to backend services and databases. I care about clear code, useful details, and the person on the other side of the screen.</p><p>I’m looking for a team to grow with, and I’m available for freelance projects too.</p></div></Reveal>
    </div>
  </div></section>;
}
function Contact() {
  return <section className="contact" id="contact" aria-labelledby="contact-title"><div className="section-wrap"><div className="contact-top"><p className="eyebrow"><span className="status-dot" />AVAILABLE FOR ROLES & PROJECTS</p><span className="eyebrow">GOT SOMETHING IN MIND?</span></div><Reveal as="h2" id="contact-title">LET’S MAKE<br /><span>IT HAPPEN.</span><Arrow /></Reveal><Reveal className="contact-socials" delay={.08}><SocialLinks /></Reveal><Reveal className="contact-bottom" delay={.12}><p>A role on your team. A new web application.<br />I’d love to hear what you’re working on.</p>{profile.email ? <a className="button primary-button" href={`mailto:${profile.email}`}>Say hello <Arrow direction="→" /></a> : <p className="contact-placeholder">Contact details coming soon.</p>}</Reveal><Footer /></div></section>;
}
function Footer() {
  return <footer className="contact-footer"><span>© {new Date().getFullYear()} Arjun Sathia</span><p>SOFTWARE ENGINEER / FULL-STACK DEVELOPER</p></footer>;
}

function App() {
  return <MotionConfig reducedMotion="user"><a className="skip" href="#work">Skip to work</a><Header /><main><Hero /><Intro /><Work /><Services /><Skills /><Experience /><Process /><About /><Testimonials /><Contact /></main></MotionConfig>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
