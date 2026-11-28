import React, {useEffect, useRef, useState} from 'react';
import {motion} from 'motion/react';
import {Reveal, Sequence, Item, motionEase, useCompactMotion} from '../lib/motion.jsx';
import ScrollStack, {ScrollStackItem, useStackTop} from '../components/ScrollStack.jsx';
import {projects, projectPreviewList} from '../content/site.js';
import {Arrow, ServiceDoodle} from '../components/icons.jsx';
import {SectionHeading} from '../components/SectionHeading.jsx';
import {SectionFade} from '../components/FadeContent.jsx';
import SplitText from '../components/SplitText.jsx';
import {useModalDialog} from '../hooks/useModalDialog.js';
import {TechIcon, techStyle} from '../components/TechIcon.jsx';
import {Rich} from '../components/Rich.jsx';
import {SpecularLight} from '../components/SpecularButton.jsx';
import ZoomImage from '../components/ZoomImage.jsx';
import {ResultTiles} from '../components/ResultTiles.jsx';
import PixelReveal from '../components/PixelReveal.jsx';


// A row of slides that scrolls sideways and snaps to each one: swipe on touch screens, or step with go().
function useSnapStrip(count, initialIndex=0) {
  const ref=useRef(null);
  const [index,setIndex]=useState(initialIndex);
  const step=()=>{const el=ref.current;return (el.children[1]?.offsetLeft??0)-(el.children[0]?.offsetLeft??0)||el.clientWidth;};
  // Runs after the dialog has opened (useModalDialog's effect comes first), so the strip has its width.
  useEffect(()=>{if(initialIndex&&ref.current)ref.current.scrollLeft=initialIndex*step();},[]);
  const onScroll=()=>{const el=ref.current;if(!el.clientWidth)return;const next=Math.min(count-1,Math.max(0,Math.round(el.scrollLeft/step())));setIndex(i=>i===next?i:next);};
  const go=target=>{const next=(target+count)%count;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;ref.current.scrollTo({left:next*step(),behavior:reduce?'auto':'smooth'});setIndex(next);};
  return {ref,index,go,onScroll};
}

function ProjectPreviewDialog({project, previews, initialIndex, onClose}) {
  const {closing,close,dialogProps} = useModalDialog(onClose);
  const strip = useSnapStrip(previews.length, initialIndex);
  const current = strip.index;
  const move = direction => strip.go(current + direction);
  // On touch screens each screen can be zoomed (double-tap or pinch); while zoomed, swiping moves around the image
  // instead of to the next screen.
  const [zoomed, setZoomed] = useState(false);
  return <dialog {...dialogProps} className={`project-preview-dialog ${closing?'is-closing':''}`} aria-labelledby="preview-title" aria-describedby="preview-caption" onKeyDown={event=>{
    dialogProps.onKeyDown(event);
    if(event.key==='ArrowRight' || event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
  }}>
    <div className="preview-viewer-header"><div><span className="eyebrow">{project.name} / SCREEN PREVIEW</span><h2 id="preview-title">{previews[current].title}</h2></div><button type="button" className="preview-viewer-close" onClick={close} aria-label="Close preview" autoFocus>×</button></div>
    <figure className={`preview-viewer-image${zoomed?' is-zoomed':''}`}><div className="preview-viewer-track" ref={strip.ref} onScroll={strip.onScroll}>{previews.map((preview,i)=><div className="preview-viewer-slide" key={preview.title} aria-hidden={i!==current}><ZoomImage src={preview.src} alt={`${project.name}: ${preview.title}, ${preview.screenshot?'screenshot':'illustrative interface'}`} width="1200" height="800" active={i===current} onZoomChange={setZoomed}/></div>)}</div></figure>
    <div className="preview-viewer-footer"><p id="preview-caption">{previews[current].note??(previews[current].screenshot?'Screenshot of the live app':'Illustrative interface mockup')}<span className="preview-zoom-hint"> · Double-tap to zoom</span></p><div className="preview-viewer-controls"><button type="button" onClick={()=>move(-1)} aria-label="Previous preview"><Arrow direction="←"/></button><span aria-live="polite" aria-atomic="true">{current+1} / {previews.length}</span><button type="button" onClick={()=>move(1)} aria-label="Next preview"><Arrow direction="→"/></button></div></div>
  </dialog>;
}
// The popup's overview image. Phones can swipe sideways through every screen; wider screens show only the first.
function ProjectVisualStrip({project,previews,onOpen}) {
  const visualStrip=useSnapStrip(previews.length);
  const openPreview=onOpen;
  return <div className="project-modal-visual-wrap"><div className="project-modal-visual-strip" ref={visualStrip.ref} onScroll={visualStrip.onScroll}>{previews.map((preview,i)=><button type="button" className="project-modal-visual" key={preview.title} onClick={event=>openPreview(i,event)} aria-label={`Open ${project.name} ${preview.title.toLowerCase()} preview`}><img src={preview.src} alt={`${project.name}: ${preview.title}, ${preview.screenshot?'screenshot':'illustrative'}`} width="1200" height="800" loading={i?'lazy':undefined} /><span>View screen <Arrow /></span></button>)}</div><div className="project-modal-visual-dots" aria-hidden="true">{previews.map((preview,i)=><span key={preview.title} data-active={i===visualStrip.index}/>)}</div></div>;
}
// The performance story (Engineering): the problem, its cause, the fixes, and the before → after results.
function ProjectScale({scale}) {
  return <section className="project-scale" aria-labelledby="project-scale-title">
    <span className="eyebrow" id="project-scale-title">PERFORMANCE &amp; SCALE</span>
    <dl>
      <div><dt>Problem</dt><dd><Rich text={scale.problem}/></dd></div>
      <div><dt>Root cause</dt><dd><Rich text={scale.cause}/></dd></div>
    </dl>
    <ul className="project-scale-fixes" aria-label="Fixes">{scale.fixes.map(fix=><li key={fix}>{fix}</li>)}</ul>
    <table className="project-scale-results">
      <caption>{scale.note}</caption>
      <thead><tr><th scope="col">Measure</th><th scope="col">Before</th><th scope="col">After</th></tr></thead>
      <tbody>{scale.results.map(([label,before,after])=><tr key={label}><th scope="row">{label}</th><td>{before}</td><td>{after}</td></tr>)}</tbody>
    </table>
  </section>;
}
function ProjectDialog({project,index,onClose}) {
  const {ref,closing,close,reduce,dialogProps}=useModalDialog(onClose,{phoneLook:'tilt'});
  const [tab,setTab]=useState(0);
  const [lightbox,setLightbox]=useState(null);
  const previews=projectPreviewList(project);
  const openPreview=(previewIndex,event)=>setLightbox({index:previewIndex,trigger:event.currentTarget});
  const closePreview=()=>{const trigger=lightbox?.trigger;setLightbox(null);requestAnimationFrame(()=>trigger?.focus({preventScroll:true}));};
  const tabs=['Overview','Previews','Features','Engineering','Stack'];
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
      {project.link&&<a className="project-detail-live" href={project.link} target="_blank" rel="noopener noreferrer"><SpecularLight/><span className="project-detail-live-dot" aria-hidden="true"/><span className="project-detail-live-text"><strong>Visit live site</strong><small>{new URL(project.link).host}</small></span><Arrow /><span className="sr-only"> (opens in a new tab)</span></a>}
      <div className="project-detail-toolset"><span className="eyebrow">CORE STACK</span><ul>{project.tags.map(tag=><li key={tag} style={techStyle(tag)}><TechIcon tag={tag}/>{tag}</li>)}</ul></div>
      <small>{project.context}</small>
    </aside>
    <div className="project-detail-main">
      <div className="project-detail-heading"><span className="eyebrow">A CLOSER LOOK</span><h3>Project details.</h3></div>
      <div className="project-modal-tabs" role="tablist" aria-label="Project details" onKeyDown={tabKey}>{tabs.map((label,i)=><button type="button" key={label} role="tab" id={`project-tab-${i}`} aria-selected={tab===i} aria-controls="project-detail-panel" tabIndex={tab===i?0:-1} onClick={()=>setTab(i)}>{label}</button>)}</div>
      <motion.div key={tab} className="project-modal-page" role="tabpanel" id="project-detail-panel" aria-labelledby={`project-tab-${tab}`} tabIndex={0} initial={reduce?false:{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.18,ease:motionEase}}>
        {tab===0?<><ProjectVisualStrip project={project} previews={previews} onOpen={openPreview}/><div className="project-modal-reading"><h4>{project.summary}</h4><p><Rich text={project.overview}/></p>{project.results&&<ResultTiles results={project.results} note={project.resultsNote}/>}{project.note&&<p className="project-modal-credit"><Rich text={project.note}/></p>}<button type="button" className="project-browse-previews" onClick={()=>{setTab(1);ref.current.querySelector('#project-tab-1').focus();}}>Browse all {previews.length} previews <Arrow direction="→" /></button></div></>:tab===1?<div className="project-preview-gallery"><div className="project-modal-reading"><h4>A look around the interface.</h4><p>{project.previewIntro??(previews[0].note?`Screens from a demo environment, with sample data rather than live figures`:previews[0].screenshot?'Screenshots from the live app':'Illustrative desktop, detail, and mobile screens')}. Select a screen to view it larger.</p></div>{previews.map((preview,i)=><button type="button" className="project-preview-thumb" key={preview.title} onClick={event=>openPreview(i,event)} aria-label={`Open ${project.name} ${preview.title.toLowerCase()} preview`}><img src={preview.src} alt={`${project.name}: ${preview.title}, ${preview.screenshot?'screenshot':'illustrative'}`} width="1200" height="800" loading="lazy" /><span><strong>{preview.title}</strong><Arrow /></span></button>)}</div>:<div className="project-modal-reading"><h4>{['','','What I built.','Under the hood.','The toolset.'][tab]}</h4>{tab===4?<><p>Technologies used to build {project.name}.</p><ul className="project-modal-stack">{project.stack.map(tag=><li key={tag} style={techStyle(tag)}><TechIcon tag={tag}/>{tag}</li>)}</ul></>:<>{tab===3&&project.scale&&<ProjectScale scale={project.scale}/>}<ul className="project-modal-points">{(tab===2?project.features:project.engineering).map(point=><li key={point}><Rich text={point}/></li>)}</ul></>}</div>}
      </motion.div>
      <div className="project-detail-note"><span>{project.context}</span><span>0{tab+1} / 0{tabs.length}</span></div>
    </div>
  </dialog>{lightbox && <ProjectPreviewDialog project={project} previews={previews} initialIndex={lightbox.index} onClose={closePreview} />}</>;
}
// `short`: the one-line summary instead of the full description (the phone cards).
function ProjectEntry({project,index,onOpen,short=false}) {
  const open=event=>onOpen(index,event);
  const {src:cover,screenshot}=projectPreviewList(project)[0];
  return <article className={`work-entry work-entry-${project.slug}`} data-active="true" style={{'--project-highlight':project.accent}} aria-labelledby={`work-entry-title-${index}`}>
    <div className="project-card-copy">
      <div className="project-card-category"><strong>0{index+1}</strong><span aria-hidden="true"/><span className="eyebrow">{project.category}</span></div>
      <div className="work-entry-name"><h3 id={`work-entry-title-${index}`}><button onClick={open} aria-haspopup="dialog" aria-label={`View ${project.name} project`}>{project.name}</button></h3><p className="project-card-subtitle">{project.title}</p></div>
      <p className="project-card-summary">{short?project.summary:project.description}</p>
      <ul className="project-card-tags" aria-label="Technologies">{project.tags.map(tag=><li key={tag} style={techStyle(tag)}><TechIcon tag={tag}/>{tag}</li>)}</ul>
      <div className="project-card-footer"><button className="work-entry-link" onClick={open} aria-haspopup="dialog" aria-label={`Read ${project.name} details`}><SpecularLight/>View project <Arrow/></button></div>
    </div>
    <div className="project-card-art"><span className="project-preview-paper" aria-hidden="true"/><button className="project-card-screen" onClick={open} aria-haspopup="dialog" aria-label={`Explore ${project.name} project`}><img className={screenshot?'is-screenshot':undefined} src={cover} alt={`${project.name} project preview`} width="1200" height="800" loading="lazy" /><PixelReveal/></button><ServiceDoodle type="burst" className="project-preview-burst"/></div>
  </article>;
}

// Larger screens: the projects pin one after another as the page scrolls, each new card sliding over the last.
// Phones use the same stack, a little tighter, pinned just under the header.
function ProjectBrowser({entries,onOpen,compact=false}) {
  const stack=useRef(null);
  const top=useStackTop(stack,'.work-entry',entries.length,compact);
  return <Reveal className="project-browser" fadeOnly delay={.12}><div ref={stack}><ScrollStack className="work-index project-wheel project-stack" role="list" aria-label="Selected projects" useWindowScroll smoothScroll={false} stackPosition={top} itemDistance={compact?28:64} itemStackDistance={compact?14:24} itemScale={compact?.04:.05} baseScale={.86} dimAmount={.16} holdDistance={compact?40:120}>{entries.map(({project,index})=><ScrollStackItem key={project.name} itemClassName="project-stack-card"><div role="listitem"><ProjectEntry project={project} index={index} onOpen={onOpen} short={compact}/></div></ScrollStackItem>)}</ScrollStack></div></Reveal>;
}
export function Work() {
  const [selected,setSelected]=useState(null);
  const compact=useCompactMotion();
  const trigger=useRef(null);
  const entries=projects.map((project,index)=>({project,index}));
  const openProject=(index,event)=>{trigger.current=event.currentTarget;setSelected(index);};
  const closeProject=()=>{setSelected(null);requestAnimationFrame(()=>trigger.current?.focus?.({preventScroll:true}));};
  return <section className="work section-wrap" id="work" aria-labelledby="work-title">
    {compact?<><Sequence className="work-section-heading" gap={.1}><div><Item as="span" variant="fade" className="eyebrow">(01)</Item><SplitText as="h2" id="work-title" startDelay={.1}>Selected<br/><Item as="mark" variant="wipe">work.<ServiceDoodle type="burst"/></Item></SplitText></div><Item className="work-section-description"><p>Production CRMs I build at Wisbato, and a full-stack trading platform of my own.</p></Item></Sequence>
</>:<><SectionHeading number="01" id="work-title" title={<><span className="work-title-lead">Selected </span><Item as="span" variant="wipe" className="work-title-mark">work.</Item></>} note="CRM / FINTECH / AUTOMATION" /><SectionFade className="project-stack-intro"><p>Client work and a personal build.</p><span className="eyebrow">0{projects.length} / SELECTED PROJECTS</span></SectionFade></>}
    <ProjectBrowser entries={entries} onOpen={openProject} compact={compact}/>
    <p className="sample-note project-stack-note">Client projects at Wisbato and a personal project · Screens are illustrative or from demo builds · Full details inside each project.</p>
    {selected!==null && <ProjectDialog project={projects[selected]} index={selected} onClose={closeProject} />}
  </section>;
}
