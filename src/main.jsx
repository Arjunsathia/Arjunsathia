import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {motion, MotionConfig, useReducedMotion} from 'motion/react';
import {Reveal, Entrance, Sequence, Item, revealVariants, motionEase, useCompactMotion, useCenteredScroll} from './motion.jsx';
import { siJavascript, siTypescript, siPython, siReact, siNextdotjs, siTailwindcss, siNodedotjs, siDjango, siGraphql, siMongodb, siPostgresql, siDocker, siGit, siGithub } from 'simple-icons';
import portrait from '../assets/portrait-warm-lighting.webp';
import aboutPortrait from '../assets/arjun-about.jpeg';
import {PremiumCursor} from './cursor.jsx';
import '../fonts.css';
import '../styles.css';

const previewImages = import.meta.glob('../assets/project-previews/*.svg', {eager:true, query:'?url', import:'default'});
const projectPreviewList = project => [['overview','Workspace overview'],['detail','A closer look'],['mobile','Mobile layout']].map(([view,title])=>({title,src:previewImages[`../assets/project-previews/${project.name.toLowerCase()}-${view}.svg`]}));

const profile = { name: 'Arjun Sathia', email: 'hello.arjun@example.com', phone: '+1 (202) 555-0147', github: '', linkedin: '' };
const projects = [
  { name: 'Orbit', accent: '#d4e62d', summary: 'A clear view of traffic, trends, and engagement.', type: 'dashboard', title: 'Analytics dashboard', description: 'An analytics dashboard concept with reusable charts, useful filters, and a focused, responsive interface.', tags: ['React', 'TypeScript', 'Data visualization'], direction: 'A component-driven dashboard concept that makes dense information easier to explore. The interface separates the overview, trends, and individual records.', details: 'Proposed implementation: typed data models, accessible filtering controls, reusable chart components, and explicit loading, empty, and error states.' },
  { name: 'DevNotes', accent: '#a8ed7d', summary: 'A focused home for code snippets and ideas.', type: 'editor', title: 'Developer notebook', description: 'A developer notebook concept for collecting code snippets, organizing ideas, and finding the useful bits later.', tags: ['React', 'Markdown', 'Local storage'], direction: 'A distraction-free workspace concept with a clear split between navigation, editing, and preview. Search and tags keep a growing collection approachable.', details: 'Proposed implementation: a Markdown editor, local persistence, keyboard-accessible navigation, and an export workflow. This is an illustrative portfolio case study, not a live product.' },
  { name: 'Stack', accent: '#ffdc3d', summary: 'A simple board for projects and priorities.', type: 'board', title: 'Project workspace', description: 'A project workspace concept that turns a busy backlog into a clear view of what to build next.', tags: ['Next.js', 'Node.js', 'PostgreSQL'], direction: 'A lightweight planning tool concept organized around a simple board. Small, readable task cards keep status, ownership, and priority in view.', details: 'Proposed implementation: a relational task model, validated API endpoints, optimistic updates, and keyboard-accessible task movement. No production usage or results are claimed.' },
  { name: 'Pulse', accent: '#9edbc9', summary: 'A simple overview of service health and uptime.', type: 'dashboard', title: 'Service monitoring', description: 'A sample monitoring dashboard concept for checking service status, recent incidents, and uptime in one place.', tags: ['React', 'Python', 'PostgreSQL'], direction: 'Group service health, incident history, and recent activity into a readable overview, with clear status labels that do not rely on color alone.', details: 'Proposed implementation: scheduled health checks, a Python API, persistent incident records, accessible status indicators, and explicit loading and failure states. This is a sample concept, not a production service.' },
  { name: 'Draft', accent: '#edc88f', summary: 'A quiet workspace for writing and publishing.', type: 'editor', title: 'Publishing workspace', description: 'A sample publishing workspace concept for organizing articles, editing drafts, and preparing content for release.', tags: ['Next.js', 'TypeScript', 'MongoDB'], direction: 'Keep the writing experience focused, with drafts and publishing controls close at hand. Separate editing from preview so each task stays clear.', details: 'Proposed implementation: authenticated draft management, autosave, Markdown previews, validated publishing endpoints, and keyboard-accessible controls. All features describe a concept implementation.' },
];
const navItems = [['work','Projects'],['services','Services'],['skills','Stack'],['experience','Experience'],['about','About me'],['contact','Contact']];
const Arrow = ({ direction = '↗', ...props }) => <span aria-hidden="true" {...props}>{direction}</span>;
// Shared modal behavior: open on mount, lock page scroll, contain focus, and close on Escape or backdrop click.
function useModalDialog(onClose) {
  const ref=useRef(null),timer=useRef(null);
  const [closing,setClosing]=useState(false);
  const reduce=useReducedMotion();
  useEffect(()=>{
    const previous=document.body.style.overflow;
    if(!ref.current.open)ref.current.showModal();
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previous;clearTimeout(timer.current);};
  },[]);
  // Close the native dialog first: it fires the close event (and onClose) only once the page is no longer inert, so focus can return to the trigger.
  const close=()=>{if(closing)return;setClosing(true);timer.current=setTimeout(()=>ref.current?.open?ref.current.close():onClose(),reduce?0:180);};
  const onKeyDown=event=>{
    if(event.key!=='Tab')return;
    const elements=Array.from(ref.current.querySelectorAll('button,input,select,textarea,[tabindex="0"],a[href]')).filter(element=>element.tabIndex>=0&&!element.disabled&&element.getClientRects().length);
    const first=elements[0],last=elements[elements.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  const onClick=event=>{
    if(event.target===ref.current){const r=ref.current.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}
  };
  return {ref,closing,close,reduce,dialogProps:{ref,onClose,onCancel:event=>{event.preventDefault();close();},onKeyDown,onClick}};
}
const EnquiryContext = createContext(null);
function EnquiryButton({topic='General enquiry', variant, children, ...props}) {
  const open = useContext(EnquiryContext);
  const Button = variant ? motion.button : 'button';
  return <Button type="button" {...(variant ? {variants:revealVariants[variant]} : {})} {...props} aria-haspopup="dialog" onClick={event=>open({topic}, event.currentTarget)}>{children}</Button>;
}
function EnquiryDialog({request, onClose}) {
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
      <address><strong>{profile.name}</strong><span>Software engineer &amp; freelance developer</span><span className="enquiry-contact-row"><svg className="enquiry-contact-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></svg><span>{profile.email}</span></span><span className="enquiry-contact-row"><svg className="enquiry-contact-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 3 3 5-3 3c2 3 3 4 6 6l3-3 5 3c-1 4-3 5-6 4C8 19 5 16 3 9 2 6 3 4 7 3Z" /></svg><span>{profile.phone}</span></span><span className="enquiry-contact-row"><svg className="enquiry-contact-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 0 1 14 0Z" /><circle cx="12" cy="10" r="2" /></svg><span>Remote · Worldwide</span></span></address>
      <small>Contact details shown are samples.</small>
      <svg className="enquiry-spark" viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M32 4v56M4 32h56M12 12l40 40M12 52l40-40" /></svg>
    </aside>
    <div className="enquiry-main">
      <div className="enquiry-heading"><span className="eyebrow">YOUR ENQUIRY</span><h3 id="enquiry-form-title">Let’s talk<span className="enquiry-title-period">.</span></h3><p id="enquiry-form-description">A few details to get the conversation started.</p></div>
      <form onSubmit={event=>{event.preventDefault();setSubmitted(true);}} onChange={()=>setSubmitted(false)}>
        <div className="enquiry-field-row"><label>Your name<input name="name" autoComplete="name" required maxLength={100} placeholder="Alex Morgan" /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="alex@example.com" /></label></div>
        <label>What’s on your mind?<select name="topic" value={topic} onChange={event=>setTopic(event.target.value)}><option>General enquiry</option><option>Project enquiry</option><option>Job opportunity</option><option>Freelance collaboration</option></select></label>
        <label>Your message<textarea name="message" required minLength={10} maxLength={4000} rows={4} placeholder="What are you working on, and how can I help?" /></label>
        <p className="enquiry-demo">Demo mode · No message will be sent.</p>
        {submitted ? <div className="enquiry-confirmation" role="status" tabIndex={-1} ref={confirmation}><strong>Demo enquiry complete.</strong><p>No message was sent. Edit the form to try again, or close this window.</p></div> : <button className="button primary-button enquiry-submit" type="submit">Send demo enquiry <Arrow direction="↗" /></button>}
      </form>
    </div>
  </dialog>;
}
const Wordmark = () => <a className="wordmark" href="#home" aria-label={`${profile.name}, home`}>{profile.name}<span>.</span></a>;
function SocialLinks() {
  const [notice,setNotice] = useState('');
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3000);return()=>clearTimeout(timer);},[notice]);
  return <div className="social-links" aria-label="Social profiles">{[['GitHub',profile.github],['LinkedIn',profile.linkedin]].map(([name,url])=>{
    const contents = <><svg viewBox="0 0 24 24" aria-hidden="true">{name === 'GitHub' ? <path d={siGithub.path} fill="currentColor" /> : <><rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" /><circle cx="7" cy="7" r="1.3" fill="var(--social-cutout, var(--paper))" /><path d="M6 10h2v8H6zm4 0h2v1c1-2 6-2 6 2v5h-2v-5c0-2-4-2-4 0v5h-2z" fill="var(--social-cutout, var(--paper))" /></>}</svg><span>{name}</span>{url && <Arrow />}</>;
    return url ? <a key={name} className="social-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} profile`}>{contents}</a> : <button type="button" key={name} className="social-link pending" onClick={()=>setNotice(`${name} profile link hasn’t been added yet.`)} aria-label={`${name} profile link coming soon`} title={`${name} profile link coming soon`}>{contents}<small>Coming soon</small></button>;
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
      <nav className="desktop-nav" aria-label="Main navigation">{navItems.map(([id,label])=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined}>{label}</a>)} </nav><EnquiryButton className="button primary-button header-cta">Let’s talk <Arrow direction="↗" /></EnquiryButton>
      <button ref={toggle} className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}><span /><span /></button>
      <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" hidden={!open}>{navItems.map(([id,label],i)=><a key={id} href={`#${id}`} onClick={()=>setOpen(false)}>{label}<span>0{i+1}</span></a>)}</nav>
    </div>
  </header>;
}
function Hero() {
  const reduce=useReducedMotion();
  return <section className="hero" id="home" aria-labelledby="hero-title">
    <Entrance className="hero-meta" delay={.04}><span>SOFTWARE ENGINEER / FULL STACK</span><span><span className="status-dot" /> OPEN TO WORK & FREELANCE</span></Entrance>
    <div className="name-stage"><h1 id="hero-title">{['Arjun','Sathia'].map((name,i)=><motion.span key={name} initial={reduce?false:{clipPath:'inset(100% 0 0 0)',opacity:0}} animate={{clipPath:'inset(0% 0 0 0)',opacity:1}} transition={{duration:reduce?0:.55,delay:.08+i*.1,ease:motionEase}}>{name}</motion.span>)}</h1>
      <Entrance className="dev-stamp label-stamp" delay={.43} aria-hidden="true"><span className="label-stamp-code">&lt;/&gt;</span><span className="label-stamp-copy"><small>FULL STACK</small><strong>DEV</strong></span></Entrance>
      <div className="hero-portrait"><motion.img className="portrait" src={portrait} alt="Seated portrait with warm studio lighting" fetchPriority="high" width="941" height="1672" initial={reduce?false:{opacity:0,scale:1.025}} animate={{opacity:1,scale:1}} transition={{duration:reduce?0:.55,delay:.22,ease:motionEase}}/><Entrance as="span" className="portrait-caption" delay={.5}>// Thoughtful code. Useful software.</Entrance></div>
    </div>
    <div className="hero-bottom"><Entrance className="hero-actions" delay={.52}><EnquiryButton className="button primary-button" topic="Project enquiry">Discuss a project <Arrow direction="→" /></EnquiryButton><a className="button secondary-button" href="#work">View projects <Arrow /></a></Entrance></div>
  </section>;
}
function Intro() {
  return <section className="intro-section" aria-labelledby="intro-title"><div className="section-wrap"><p className="eyebrow">ONE DEVELOPER. THE WHOLE PICTURE.</p><h2 id="intro-title"><Reveal as="span" className="manifesto-line" distance={24} delay={0*.08} style={{'--line-index':0}}>I BUILD <mark className="front-mark">FRONT.</mark></Reveal><Reveal as="span" className="manifesto-line" distance={24} delay={1*.08} style={{'--line-index':1}}>I CONNECT <mark className="back-mark">BACK.</mark></Reveal><Reveal as="span" className="manifesto-line" distance={24} delay={2*.08} style={{'--line-index':2}}>I TEST <mark className="test-mark">EVERYTHING.</mark></Reveal></h2><div className="intro-bottom"><p>Good software should feel simple. I work across interfaces, APIs, and databases to make that happen.</p><span className="code-flower" aria-hidden="true">✳</span></div></div></section>;
}
function ProjectPreviewDialog({project, previews, initialIndex, onClose}) {
  const {closing,close,dialogProps} = useModalDialog(onClose);
  const [current,setCurrent] = useState(initialIndex);
  const move = direction => setCurrent(index=>(index + direction + previews.length) % previews.length);
  return <dialog {...dialogProps} className={`project-preview-dialog ${closing?'is-closing':''}`} aria-labelledby="preview-title" aria-describedby="preview-caption" onKeyDown={event=>{
    dialogProps.onKeyDown(event);
    if(event.key==='ArrowRight' || event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
  }}>
    <div className="preview-viewer-header"><div><span className="eyebrow">{project.name} / SCREEN PREVIEW</span><h2 id="preview-title">{previews[current].title}</h2></div><button type="button" className="preview-viewer-close" onClick={close} aria-label="Close preview" autoFocus>×</button></div>
    <figure className="preview-viewer-image"><img src={previews[current].src} alt={`${project.name}: ${previews[current].title}, illustrative interface`} width="1200" height="800" /></figure>
    <div className="preview-viewer-footer"><p id="preview-caption">Illustrative interface mockup</p><div className="preview-viewer-controls"><button type="button" onClick={()=>move(-1)} aria-label="Previous preview">←</button><span aria-live="polite" aria-atomic="true">{current+1} / {previews.length}</span><button type="button" onClick={()=>move(1)} aria-label="Next preview">→</button></div></div>
  </dialog>;
}
function ProjectDialog({project,index,onClose}) {
  const {ref,closing,close,reduce,dialogProps}=useModalDialog(onClose);
  const [tab,setTab]=useState(0);
  const [lightbox,setLightbox]=useState(null);
  const previews=projectPreviewList(project);
  const openPreview=(previewIndex,event)=>setLightbox({index:previewIndex,trigger:event.currentTarget});
  const closePreview=()=>{const trigger=lightbox?.trigger;setLightbox(null);requestAnimationFrame(()=>trigger?.focus({preventScroll:true}));};
  const tabs=['Overview','Previews','Approach','Development','Stack'];
  const tabKey=event=>{
    const next={ArrowLeft:(tab+tabs.length-1)%tabs.length,ArrowRight:(tab+1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
    if(next!==undefined){event.preventDefault();setTab(next);ref.current.querySelector(`#project-tab-${next}`).focus();}
  };
  return <><dialog {...dialogProps} className={`project-modal ${closing?'is-closing':''}`} style={{'--project-accent':project.accent}} aria-labelledby="case-title" aria-describedby="case-summary">
    <div className="project-detail-closebar"><button className="enquiry-close" type="button" aria-label="Close project" onClick={close} autoFocus>×</button></div>
    <aside className="enquiry-aside project-detail-aside">
      <span className="eyebrow">PROJECT / 0{index+1}</span>
      <h2 id="case-title">{project.name}<span>.</span></h2>
      <p className="project-detail-category">{project.title}</p>
      <p id="case-summary">{project.summary}</p>
      <div className="project-detail-toolset"><span className="eyebrow">PROPOSED STACK</span><ul>{project.tags.map(tag=><li key={tag}>{tag}</li>)}</ul></div>
      <small>Illustrative project concept.</small>
    </aside>
    <div className="project-detail-main">
      <div className="project-detail-heading"><span className="eyebrow">A CLOSER LOOK</span><h3>Project details.</h3></div>
      <div className="project-modal-tabs" role="tablist" aria-label="Project details" onKeyDown={tabKey}>{tabs.map((label,i)=><button type="button" key={label} role="tab" id={`project-tab-${i}`} aria-selected={tab===i} aria-controls="project-detail-panel" tabIndex={tab===i?0:-1} onClick={()=>setTab(i)}>{label}</button>)}</div>
      <motion.div key={tab} className="project-modal-page" role="tabpanel" id="project-detail-panel" aria-labelledby={`project-tab-${tab}`} tabIndex={0} initial={reduce?false:{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.18,ease:motionEase}}>
        {tab===0?<><button type="button" className="project-modal-visual" onClick={event=>openPreview(0,event)} aria-label={`Open ${project.name} workspace preview`}><img src={previews[0].src} alt={`${project.name} workspace concept`} width="1200" height="800" /><span>View screen <Arrow /></span></button><div className="project-modal-reading"><h4>{project.summary}</h4><p>{project.description}</p><button type="button" className="project-browse-previews" onClick={()=>{setTab(1);ref.current.querySelector('#project-tab-1').focus();}}>Browse all 3 previews <Arrow direction="→" /></button></div></>:tab===1?<div className="project-preview-gallery"><div className="project-modal-reading"><h4>A look around the interface.</h4><p>Explore the desktop, detail, and mobile concepts. Select a screen to view it larger.</p></div>{previews.map((preview,i)=><button type="button" className="project-preview-thumb" key={preview.title} onClick={event=>openPreview(i,event)} aria-label={`Open ${project.name} ${preview.title.toLowerCase()} preview`}><img src={preview.src} alt={`${project.name} ${preview.title.toLowerCase()} concept`} width="1200" height="800" loading="lazy" /><span><strong>{preview.title}</strong><Arrow /></span></button>)}</div>:<div className="project-modal-reading"><h4>{['','','The approach.','How it’s built.','The toolset.'][tab]}</h4>{tab===4?<><p>Proposed tools for this project concept.</p><ul className="project-modal-stack">{project.tags.map(tag=><li key={tag}>{tag}</li>)}</ul></>:<p>{tab===2?project.direction:project.details}</p>}</div>}
      </motion.div>
      <div className="project-detail-note"><span>Concept &amp; proposed implementation</span><span>0{tab+1} / 0{tabs.length}</span></div>
    </div>
  </dialog>{lightbox && <ProjectPreviewDialog project={project} previews={previews} initialIndex={lightbox.index} onClose={closePreview} />}</>;
}
function ProjectEntry({project,index,onOpen,compact}) {
  const open=event=>onOpen(index,event);
  const cover=projectPreviewList(project)[0].src;
  return <article className={`work-entry work-entry-${project.name.toLowerCase()}`} style={{'--project-highlight':project.accent}} aria-labelledby={`work-entry-title-${index}`}>
    <div className="project-card-copy">
      <div className="project-card-category"><strong>0{index+1}</strong><span aria-hidden="true"/><span className="eyebrow">{project.tags.includes('Node.js')?'Full stack':'Web application'} / {project.type==='dashboard'?'Dashboard':project.type==='editor'?'Workspace':'Productivity'}</span></div>
      <div className="work-entry-name"><h3 id={`work-entry-title-${index}`}><button onClick={open} aria-haspopup="dialog" aria-label={`View ${project.name} project`}>{project.name}</button></h3><p className="project-card-subtitle">{project.title}</p></div>
      <p className="project-card-summary">{project.description}</p>
      {!compact&&<ul className="project-card-tags" aria-label="Technologies">{project.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>}
      <div className="project-card-footer"><button className="work-entry-link" onClick={open} aria-haspopup="dialog" aria-label={`Read ${project.name} details`}>View project <Arrow/></button></div>
    </div>
    {compact
      ? <div className="project-card-art project-card-demo-art"><button className="project-card-demo-image" onClick={open} aria-haspopup="dialog" aria-label={`Explore ${project.name} project`}><img src={cover} alt={`${project.name} project preview`} width="1200" height="800" loading="lazy" /></button></div>
      : <div className="project-card-art"><span className="project-preview-paper" aria-hidden="true"/><button className="project-card-screen" onClick={open} aria-haspopup="dialog" aria-label={`Explore ${project.name} project`}><img src={cover} alt={`${project.name} workspace concept`} width="1200" height="800" loading="lazy" /></button><ServiceDoodle type="burst" className="project-preview-burst"/></div>}
  </article>;
}

function ProjectBrowser({entries,onOpen,compact}) {
  const projectList=useRef(null);
  const {active,goTo,onKeyDown}=useCenteredScroll(projectList,'.work-entry',entries.length);
  return <Reveal className="project-browser" distance={28} delay={.12}><div className="work-index project-wheel" ref={projectList} role="region" aria-label="Selected projects, scroll vertically to browse" tabIndex={0} onKeyDown={onKeyDown}>{entries.map(({project,index})=><ProjectEntry key={project.name} project={project} index={index} onOpen={onOpen} compact={compact}/>)}</div>{!compact&&<div className="project-wheel-controls"><button aria-label="Previous project" disabled={active===0} onClick={()=>goTo(active-1)}>←</button><span aria-live="polite" aria-atomic="true">0{active+1} / 0{entries.length}<span className="sr-only"> {entries[active]?.project.name}</span></span><button aria-label="Next project" disabled={active===entries.length-1} onClick={()=>goTo(active+1)}>→</button></div>}</Reveal>;
}
function Work() {
  const [selected,setSelected]=useState(null);
  const compact=useCompactMotion();
  const trigger=useRef(null);
  const entries=projects.map((project,index)=>({project,index}));
  const openProject=(index,event)=>{trigger.current=event.currentTarget;setSelected(index);};
  const closeProject=()=>{setSelected(null);requestAnimationFrame(()=>trigger.current?.focus({preventScroll:true}));};
  return <section className="work section-wrap" id="work" aria-labelledby="work-title">
    {compact?<><Sequence className="work-section-heading" gap={.1}><div><Item as="span" variant="fade" className="eyebrow">(01)</Item><Item as="h2" variant="line" id="work-title">Selected<br/><Item as="mark" variant="wipe">work.<ServiceDoodle type="burst"/></Item></Item></div><Item className="work-section-description"><p>A collection of project concepts, turning ideas into useful interfaces, workspaces, and tools.</p></Item></Sequence>
</>:<><SectionHeading number="01" id="work-title" title="Selected work." note="INTERFACES / TOOLS / APPLICATIONS" /><Reveal className="project-stack-intro" delay={.1}><p>A few selected project concepts.</p><span className="eyebrow">05 / PROJECT CONCEPTS</span></Reveal></>}
    <ProjectBrowser key={compact?'mobile':'desktop'} entries={entries} onOpen={openProject} compact={compact}/>
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
function StackIllustration({index}) {
  return <Reveal className="stack-illustration" aria-hidden="true" fadeOnly delay={.3}><svg viewBox="0 0 100 100" fill="none">
    <defs><linearGradient id={`stack-depth-${index}`} x1="18" y1="12" x2="85" y2="92" gradientUnits="userSpaceOnUse"><stop stopColor="#fffdf4"/><stop offset="1" stopColor="#d4d4b7"/></linearGradient></defs>
    <circle cx="55" cy="51" r="39" fill="#e6edb6" opacity=".45"/>
    {index===0?<g transform="rotate(9 50 50)"><rect x="23" y="17" width="63" height="68" rx="11" fill="#cbdc69"/><rect x="16" y="22" width="63" height="68" rx="11" fill={`url(#stack-depth-${index})`}/><path d="M16 33q0-11 11-11h41q11 0 11 11v10H16Z" fill="#d4e62d"/>{[25,35,45].map(x=><ellipse key={x} cx={x} cy="33" rx="2.5" ry="3" fill="#fffdf1"/>)}<rect x="24" y="51" width="47" height="24" rx="5" fill="#fffdf4"/><path d="m49 62 22 15-10 2-4 10Z" fill="#172012"/><path d="m61 76 6 12" stroke="#172012" strokeWidth="5"/></g>:index===1?<g transform="rotate(7 50 50)">{[20,42,64].map((y,j)=><g key={y}><path d={`M18 ${y} 31 ${y-6} 81 ${y+2} 69 ${y+9}Z`} fill="#65734a"/><rect x="18" y={y} width="63" height="19" rx="5" fill={j===1?'#26311e':'#172012'}/><path d={`M22 ${y+19}H75`} stroke="#c6dc46" strokeWidth="2"/>{[25,32,39].map(x=><circle key={x} cx={x} cy={y+7} r="1.6" fill="#d4e62d"/>)}</g>)}<circle cx="78" cy="73" r="18" fill="#e9f697"/><path d="M68 78h17a5 5 0 0 0 0-10 7 7 0 0 0-13-1 6 6 0 0 0-4 11Z" stroke="#182410" strokeWidth="2"/></g>:index===2?<g transform="rotate(8 50 50)"><rect x="30" y="15" width="48" height="74" rx="9" fill="#d4df8b"/><rect x="22" y="17" width="48" height="74" rx="9" fill={`url(#stack-depth-${index})`}/>{[35,53,71].map(y=><g key={y}><circle cx="35" cy={y} r="6" fill="#e2ed9d"/><path d={`m32 ${y} 2 2 4-5`} stroke="#26311e" strokeWidth="2" strokeLinecap="round"/><path d={`M46 ${y}h13`} stroke="#7d846a" strokeWidth="3" strokeLinecap="round"/></g>)}</g>:<><circle cx="64" cy="35" r="24" fill="#d4e62d"/><path d="m55 37 8-9 5 10 8-4" stroke="#b2c72a" strokeWidth="4" strokeLinecap="round"/><path d="M23 83h50a15 15 0 0 0 0-30 23 23 0 0 0-43-4 18 18 0 0 0-7 34Z" fill={`url(#stack-depth-${index})`}/><path d="M47 74V54m-8 9 8-9 8 9" stroke="#25301f" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/></>}
  </svg><ServiceDoodle type="burst"/></Reveal>;
}
function Skills() {
  return <section id="skills" className="skills-section" aria-labelledby="skills-title"><div className="section-wrap">
    <SectionHeading number="03" id="skills-title" title={<><span className="stack-title-lead">What I work </span><Item as="span" variant="wipe" className="stack-title-mark">with.</Item></>} note="FROM INTERFACE TO RELEASE"/>
    <Reveal className="stack-mobile-intro" delay={.1}><p>Tools, technologies, and practices I use to turn ideas into useful software.</p><span className="stack-heading-note" aria-hidden="true">From interface<br/>to release.<ServiceDoodle type="burst"/><ServiceDoodle/></span></Reveal>
    <div className="skills-rows">{stackGroups.map((group,i)=><Reveal className="skill-row" key={group.name} axis="x" distance={-28} delay={i*.1}>
      <span className="skill-row-number">0{i+1}</span><span className="skill-row-dash" aria-hidden="true"/>
      <div className="skill-row-copy"><h3>{group.name}</h3><p>{group.description}</p></div>
      <span className="skill-row-arrow" aria-hidden="true">↗</span><StackIllustration index={i}/>
      <div className="skill-pills">{group.tools.map(([name,icon])=><div className="skill-pill" key={name} data-tool={name} style={{'--skill-brand':icon && icon!=='check'?`#${icon.hex}`:undefined}}><SkillIcon icon={icon}/><span>{name}</span></div>)}{i===3&&<div className="skill-pill skill-mobile-only"><SkillIcon icon="check"/><span>CI/CD</span></div>}</div>
    </Reveal>)}</div>
  </div></section>;
}

function SectionHeading({ number, id, title, note }) {
  return <Sequence className="section-heading" gap={.1}><Item as="span" variant="fade" className="eyebrow">({number})</Item><Item as="h2" variant="line" id={id}>{title}</Item>{note && <Item as="span" variant="fade" className="heading-note">// {note}</Item>}</Sequence>;
}
const serviceItems = [
  {title:'Websites that work',icon:'↗',description:'A clear, considered website for your business, portfolio, or next launch. Built around your content and the people you want to reach.',outcome:'From first idea to launch.'},
  {title:'Ideas into products',icon:'↔',description:'Turn an idea into a working application, or add the next feature to an existing product. A focused scope, regular updates, and a useful result.',outcome:'A product ready for real users.'},
  {title:'Care & improvements',icon:'✳',description:'Fix the frustrating parts, improve slow pages, and keep your application running well as your needs change.',outcome:'A better experience, over time.'},
];
function ServiceDoodle({type='arrow',className=''}) {
  return <svg className={`service-doodle ${className}`} viewBox={type==='burst'?'0 0 80 60':'0 0 100 65'} fill="none" aria-hidden="true">{type==='burst'?<path d="M15 42 6 20M37 30 39 5M57 36 73 17"/>:<path d="M8 8C-3 40 37 60 81 26M62 25 84 23 81 45"/>}</svg>;
}
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
    <text x="64" y="37" fill="#d4e62d" fontSize="5" fontFamily="monospace">✳ NORTH / STUDIO</text>
    <text x="239" y="37" fill="#a9b1a5" fontSize="3.5" fontFamily="monospace">WORK · ABOUT</text>
    <path d="M64 45H276" stroke="#ffffff15"/>
    <text x="67" y="75" fill="#f6f0e8" fontSize="24" fontFamily="Anton">MODERN WEBSITES.</text>
    <text x="67" y="104" fill="#d4e62d" fontSize="24" fontFamily="Anton">REAL RESULTS.</text>
    <text x="68" y="124" fill="#b1bc9f" fontSize="4.5" fontFamily="monospace">Thoughtful design. Built to work.</text>
    <rect x="67" y="139" width="62" height="15" rx="7.5" fill="#d4e62d"/>
    <text x="77" y="148.5" fill="#13170d" fontSize="4" fontFamily="monospace">EXPLORE WORK ↗</text>
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
    {index===0?<><div className="service-tape"/><ServiceDoodle type="burst" className="service-device-burst"/><ServiceLaptop/></>:index===1?<div className="service-phone"><div className="service-phone-notch"/><small>your workspace</small><span className="service-phone-label">A little more clarity.</span><strong>All in one<span>place.</span></strong><svg viewBox="0 0 170 70" fill="none"><path d="M0 63 24 45 44 50 65 29 85 35 112 12 136 20 170 0" stroke="currentColor" strokeWidth="3"/><path d="M0 63 24 45 44 50 65 29 85 35 112 12 136 20 170 0V70H0Z" fill="currentColor" opacity=".12"/></svg><div className="service-phone-task"><i/>Design system<span>Ready</span></div><div className="service-phone-task"><i/>Application<span>In progress</span></div><div className="service-phone-task"><i/>Next release<span>On track</span></div></div>:<><div className="service-code"><div><i/><i/><i/></div><pre><span>const</span> improve = <span>async</span> () =&gt; {'{'}{'\n'}  await fixBugs();{'\n'}  await optimize();{'\n'}  await deploy();{'\n'}  <span>return</span> 'Better.';{'\n'}{'}'}</pre></div><div className="service-performance"><small>Performance</small><div><strong>98</strong><span>Looking good ↗</span></div></div></>}
    {index===1&&<ServiceDoodle className="service-phone-doodle"/>}
  </Reveal>;
}
function Services() {
  const compact=useCompactMotion();
  return <section className="services-section" id="services" aria-labelledby="services-title"><div className="section-wrap">
    <SectionHeading number="02" id="services-title" title={<><span className="service-title-lead">How I can </span><Item as="span" variant="wipe" className="service-title-help">help.</Item></>} /><Reveal className="services-section-intro"><p>A focused feature, a fresh website, or a complete application. Here’s where I can contribute.</p><span className="services-heading-note" aria-hidden="true"><ServiceDoodle type="burst"/>Ideas into<br/>working software.<ServiceDoodle/></span></Reveal>
    <div className="service-grid">{serviceItems.map((service,i)=><Reveal as="article" className={`service-card service-card-${i}`} key={service.title} distance={compact?12:20} delay={i*.08}>
      <div className="service-card-top"><strong>0{i+1}</strong><span className="service-number-line"/><span className="eyebrow">Service</span></div>
      {i===2&&<div className="service-top-note" aria-hidden="true"><ServiceDoodle/>Faster<br/>smoother<br/>better.</div>}
      <div className="service-card-body"><div className="service-copy"><h3>{service.title}</h3><p>{service.description}</p></div><ServiceIllustration index={i}/></div>
      <div className="service-card-ending"><ServiceDoodle/><p className="service-outcome">{service.outcome}</p></div>
    </Reveal>)}</div>
  </div></section>;
}

const experienceItems = [
  {role:'Full-stack Developer',company:'Northline Studio',period:'Oct 2025 — Sep 2026',duration:'1 year',summary:'Worked across React interfaces, Node.js APIs, and PostgreSQL integrations for web applications.'},
  {role:'Frontend Developer',company:'Oakbyte Digital',period:'Oct 2024 — Sep 2025',duration:'1 year',summary:'Focused on responsive interfaces and turning design ideas into usable, consistent web pages.'},
  {role:'Freelance Developer',company:'Independent projects',period:'Oct 2023 — Sep 2024',duration:'1 year',summary:'Built websites and small web applications, working from project briefs through development, feedback, and handover.',freelance:true},
];
const experienceDetails = [
  {responsibilities:['Developed interface features and the backend services supporting them.','Connected application data, handled API states, and prepared changes for release.','Reviewed key user flows and worked through issues before handover.'],delivered:['Reusable application screens and shared UI components.','Connected API endpoints and database-backed features.'],skills:['React','Node.js','PostgreSQL','API integration','Testing','Git']},
  {responsibilities:['Translated design layouts into responsive web interfaces.','Built reusable components and managed loading, empty, and error states.','Checked keyboard access, browser behavior, and layouts across screen sizes.'],delivered:['Responsive application screens and a consistent component library.','Interface refinements based on design reviews and browser checks.'],skills:['React','JavaScript','Tailwind','Responsive UI','Accessibility','Git']},
  {responsibilities:['Clarified project requirements and agreed on scope with clients.','Built websites and small applications, sharing progress and incorporating feedback.','Prepared deployment, documentation, and a practical handover.'],delivered:['Business websites and small application features.','Project documentation and launch support.'],skills:['JavaScript','React','Python','Web development','Deployment','Client communication']},
];
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

function Experience() {
  const [selected,setSelected]=useState(null);
  const panel=useRef(null);
  const {onKeyDown}=useCenteredScroll(panel,'.role-entry',experienceItems.length);
  const closeDetails=()=>{const trigger=selected?.trigger;setSelected(null);requestAnimationFrame(()=>trigger?.focus({preventScroll:true}));};
  return <section className="experience-section" id="experience" aria-labelledby="experience-title"><div className="section-wrap">
    <SectionHeading number="04" id="experience-title" title={<Item as="span" variant="wipe" className="experience-title-mark">Experience.</Item>} note="THE WORK BEHIND THE SKILLS"/>
    <Reveal as="span" className="experience-heading-note" aria-hidden="true" delay={.3}>Building skills.<br/>Shipping work.<ServiceDoodle type="burst"/><ServiceDoodle/></Reveal>
    <div className="experience-layout"><Sequence className="experience-overview" gap={.1}><Item variant="line" className="experience-metric"><strong>03<span aria-hidden="true">.</span></strong><span>YEARS / TWO COMPANIES + FREELANCE</span></Item><Item as="p">From focused interfaces<br/>to complete applications.</Item><Item as="span" variant="fade" className="eyebrow experience-scroll-hint">EXPLORE MY ROLES <span aria-hidden="true">↗</span></Item></Sequence>
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
const processSteps = [
  {title:'Understand',description:'We start with the problem, the people using the product, and what a good outcome looks like.',outcome:'A clear brief and shared priorities.'},
  {title:'Plan',description:'I break the work into a practical scope, map the key screens and data, and agree on the next steps.',outcome:'A focused plan with manageable milestones.'},
  {title:'Build',description:'I develop the interface and backend in small, reviewable pieces, with regular updates along the way.',outcome:'Working features you can see and try.'},
  {title:'Test & hand over',description:'I check the important flows, refine the details, and prepare the application and documentation for handover.',outcome:'A considered release and a clear next step.'},
];
function Process() {
  const [openStep, setOpenStep] = useState(0);
  return <section className="process-section" id="process" aria-labelledby="process-title"><div className="section-wrap"><SectionHeading number="05" id="process-title" title={<><span className="process-title-lead">How I </span><Item as="span" variant="wipe" className="process-title-mark">work.</Item></>} note="A CLEAR PATH FROM START TO SHIP" /><div className="process-grid"><Sequence className="process-intro" gap={.1}><Item as="h3" variant="line"><span className="process-statement-lead">Good work starts<br /> with a </span><Item as="mark" variant="wipe">clear plan.</Item><ServiceDoodle type="burst" className="process-statement-doodle"/></Item><Item as="p">A practical process, open communication, and progress you can follow.</Item><EnquiryButton className="button primary-button" variant="rise">Start a conversation <Arrow direction="→" /></EnquiryButton></Sequence><Sequence className="process-steps" gap={.09} delay={.15} amount={.15}>{processSteps.map((step,i)=><Item variant="slide" className="process-step" key={step.title} data-open={openStep===i}>
        <h4><button className="process-trigger" id={`process-trigger-${i}`} aria-expanded={openStep===i} aria-controls={`process-panel-${i}`} onClick={()=>setOpenStep(current=>current===i ? null : i)}><span>0{i+1}</span><span>{step.title}</span><span className="process-plus" aria-hidden="true">+</span></button></h4>
        <div className="process-panel" id={`process-panel-${i}`} role="region" aria-labelledby={`process-trigger-${i}`} aria-hidden={openStep!==i} inert={openStep!==i}><div className="process-panel-inner"><div className="process-step-body"><p>{step.description}</p><span><b>THE OUTCOME</b>{step.outcome}</span></div></div></div>
      </Item>)}</Sequence></div></div></section>;
}
const sampleTestimonials = [
  {quote:'Clear communication, thoughtful implementation, and a smooth handover. The whole process felt easy to follow.',name:'Alex Morgan',role:'Sample client',initials:'AM'},
  {quote:'Arjun worked through the details carefully and kept the project moving. The result was straightforward to use and maintain.',name:'Priya Shah',role:'Sample teammate',initials:'PS'},
  {quote:'It was easy to share ideas and work through changes together. The small details received as much care as the bigger picture.',name:'Sam Taylor',role:'Sample collaborator',initials:'ST'},
  {quote:'Arjun took time to understand what we needed and explained the options clearly. Feedback was easy to share and put into practice.',name:'Jordan Lee',role:'Sample project partner',initials:'JL'},
];
function Testimonials() {
  const track = useRef(null);
  const count = sampleTestimonials.length;
  const middle = count * 2;
  const current = useRef(middle + 1);
  const [active, setActive] = useState(1);
  const reducedMotion = useReducedMotion();
  function moveTo(index, behavior = reducedMotion ? 'instant' : 'smooth') {
    const panel = track.current;
    const card = panel?.children[index];
    if (card) panel.scrollTo({left:card.offsetLeft - (panel.clientWidth - card.offsetWidth) / 2, behavior});
  }
  function recenter() {
    const panel = track.current;
    const index = current.current;
    const target = middle + index % count;
    if (index === target) return;
    const shift = panel.children[target].offsetLeft - panel.children[index].offsetLeft;
    current.current = target;
    panel.scrollTo({left:panel.scrollLeft + shift, behavior:'instant'});
  }
  useEffect(() => {
    const panel = track.current;
    const observer = new ResizeObserver(() => {
      current.current = middle + current.current % count;
      moveTo(current.current, 'instant');
    });
    observer.observe(panel);
    panel.addEventListener('scrollend', recenter);
    return () => {observer.disconnect();panel.removeEventListener('scrollend', recenter);};
  }, []);
  function syncActive() {
    const panel = track.current;
    const center = panel.scrollLeft + panel.clientWidth / 2;
    const cards = Array.from(panel.children);
    const closest = cards.reduce((best, card, i) => Math.abs(card.offsetLeft + card.offsetWidth / 2 - center) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - center) ? i : best, 0);
    current.current = closest;
    setActive(closest % count);
    // Extra copies leave room for momentum; recycle before reaching an outer edge.
    if (closest < count || closest >= count * 4) recenter();
  }
  return <section className="testimonials-section section-wrap" id="testimonials" aria-labelledby="testimonials-title">
    <SectionHeading number="07" id="testimonials-title" title={<><span className="testimonials-title-lead">In their </span><Item as="span" variant="wipe" className="testimonials-title-mark">words.</Item></>} note="FEEDBACK & COLLABORATION" />
    <Reveal as="p" className="testimonials-intro" delay={.1}>A few words from the people I work with.</Reveal>
    <Reveal className="testimonials-carousel" distance={28} delay={.15}>
      <div className="testimonial-track" ref={track} onScroll={syncActive} role="region" aria-label="Testimonials, scroll horizontally to explore" aria-roledescription="carousel" tabIndex={0} onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          moveTo(current.current + (event.key === 'ArrowRight' ? 1 : -1));
        }
      }}>
        {Array.from({length:5},(_,copy)=>sampleTestimonials.map((item,i)=><figure className="testimonial-slide" key={`${copy}-${item.name}`} data-tone={i} data-active={active === i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} aria-hidden={copy !== 2 ? true : undefined}>
          <figcaption><span className="testimonial-initials" aria-hidden="true">{item.initials}</span><div><strong>{item.name}</strong><span>{item.role}</span></div></figcaption>
          <blockquote><p>“{item.quote}”</p></blockquote>
        </figure>))}
      </div>
    </Reveal>
  </section>;
}

function About() {
  return <section className="about" id="about" aria-labelledby="about-title"><div className="section-wrap"><SectionHeading number="06" id="about-title" title={<><span className="about-title-lead">More than a </span><Item as="span" variant="wipe" className="about-title-mark">stack.</Item></>} note="A LITTLE ABOUT ME" />
    <div className="about-grid">
      <div className="about-portrait">
        <figure className="about-photo"><img src={aboutPortrait} alt="Arjun Sathia wearing glasses and a suit" loading="lazy" width="1173" height="1536" /><figcaption className="about-photo-caption"><span className="about-caption-name">// Arjun Sathia</span><span className="about-caption-divider"> · </span><span className="about-caption-role">Software engineer &amp; freelancer</span></figcaption></figure>
      </div>
      <Sequence className="about-content" gap={.1} delay={.08}>
        <Item as="h3" variant="line" className="about-name">HI, I’M<br /><Item as="mark" variant="wipe">ARJUN.</Item></Item>
        <Item as="p" className="about-lead">I’m a software engineer who enjoys figuring out how things work — and making them work better.</Item>
        <Item className="about-copy"><p>I build across the full stack, from React interfaces to backend services and databases. I care about clear code, useful details, and the person on the other side of the screen.</p><p>I’m looking for a team to grow with, and I’m available for freelance projects too.</p></Item>
      </Sequence>
    </div>
  </div></section>;
}
function Contact() {
  return <Sequence as="section" className="contact" id="contact" aria-labelledby="contact-title" amount={.25}><div className="section-wrap">
    <Reveal className="contact-top" fadeOnly><p className="eyebrow"><span className="status-dot" />AVAILABLE FOR ROLES & PROJECTS</p><span className="eyebrow">GOT SOMETHING IN MIND?</span></Reveal>
    <Item as="h2" variant="line" className="contact-headline" id="contact-title">LET’S MAKE<br /><Item as="mark" variant="wipe">IT HAPPEN.</Item></Item>
    <Reveal className="contact-socials" delay={.08}><SocialLinks /></Reveal>
    <Sequence className="contact-bottom" gap={.12} delay={.1}><Item as="p">A role on your team. A new web application.<br />I’d love to hear what you’re working on.</Item><Item as="svg" variant="wipe" className="contact-long-arrow" viewBox="0 0 240 240" fill="currentColor" aria-hidden="true"><path transform="translate(0 240) scale(1 -1)" d="M24 216C92 196 145 142 185 72L165 61L224 24L221 94L202 83C154 160 96 207 24 216Z" /></Item><EnquiryButton className="button primary-button" variant="rise">Let’s talk <Arrow direction="→" /></EnquiryButton></Sequence>
    <Footer />
  </div></Sequence>;
}

function Footer() {
  return <footer className="contact-footer"><span>© {new Date().getFullYear()} Arjun Sathia</span><p>SOFTWARE ENGINEER / FULL-STACK DEVELOPER</p></footer>;
}

function App() {
  const [enquiry,setEnquiry] = useState(null);
  const enquiryTrigger = useRef(null);
  const openEnquiry = (request, trigger) => {enquiryTrigger.current=trigger;setEnquiry(request);};
  const closeEnquiry = () => {setEnquiry(null);requestAnimationFrame(()=>enquiryTrigger.current?.focus({preventScroll:true}));};
  return <MotionConfig reducedMotion="user"><EnquiryContext.Provider value={openEnquiry}><PremiumCursor /><a className="skip" href="#work">Skip to work</a><Header /><main><Hero /><Intro /><Work /><Services /><Skills /><Experience /><Process /><About /><Testimonials /><Contact /></main>{enquiry && <EnquiryDialog request={enquiry} onClose={closeEnquiry} />}</EnquiryContext.Provider></MotionConfig>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
