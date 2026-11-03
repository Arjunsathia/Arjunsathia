import React, {useRef, useState} from 'react';
import {motion} from 'motion/react';
import {Reveal, Sequence, Item, motionEase, useCompactMotion, useCenteredScroll} from '../lib/motion.jsx';
import {projects, projectPreviewList} from '../content/site.js';
import {Arrow, ServiceDoodle} from '../components/icons.jsx';
import {SectionHeading} from '../components/SectionHeading.jsx';
import {useModalDialog} from '../hooks/useModalDialog.js';

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
    <div className="preview-viewer-footer"><p id="preview-caption">Illustrative interface mockup</p><div className="preview-viewer-controls"><button type="button" onClick={()=>move(-1)} aria-label="Previous preview"><Arrow direction="←"/></button><span aria-live="polite" aria-atomic="true">{current+1} / {previews.length}</span><button type="button" onClick={()=>move(1)} aria-label="Next preview"><Arrow direction="→"/></button></div></div>
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
  return <Reveal className="project-browser" distance={28} delay={.12}><div className="work-index project-wheel" ref={projectList} role="region" aria-label="Selected projects, scroll vertically to browse" tabIndex={0} onKeyDown={onKeyDown}>{entries.map(({project,index})=><ProjectEntry key={project.name} project={project} index={index} onOpen={onOpen} compact={compact}/>)}</div>{!compact&&<div className="project-wheel-controls"><button aria-label="Previous project" disabled={active===0} onClick={()=>goTo(active-1)}><Arrow direction="←"/></button><span aria-live="polite" aria-atomic="true">0{active+1} / 0{entries.length}<span className="sr-only"> {entries[active]?.project.name}</span></span><button aria-label="Next project" disabled={active===entries.length-1} onClick={()=>goTo(active+1)}><Arrow direction="→"/></button></div>}</Reveal>;
}
export function Work() {
  const [selected,setSelected]=useState(null);
  const compact=useCompactMotion();
  const trigger=useRef(null);
  const entries=projects.map((project,index)=>({project,index}));
  const openProject=(index,event)=>{trigger.current=event.currentTarget;setSelected(index);};
  const closeProject=()=>{setSelected(null);requestAnimationFrame(()=>trigger.current?.focus({preventScroll:true}));};
  return <section className="work section-wrap" id="work" aria-labelledby="work-title">
    {compact?<><Sequence className="work-section-heading" gap={.1}><div><Item as="span" variant="fade" className="eyebrow">(01)</Item><Item as="h2" variant="line" id="work-title">Selected<br/><Item as="mark" variant="wipe">work.<ServiceDoodle type="burst"/></Item></Item></div><Item className="work-section-description"><p>A collection of project concepts, turning ideas into useful interfaces, workspaces, and tools.</p></Item></Sequence>
</>:<><SectionHeading number="01" id="work-title" title={<><span className="work-title-lead">Selected </span><Item as="span" variant="wipe" className="work-title-mark">work.</Item></>} note="INTERFACES / TOOLS / APPLICATIONS" /><Reveal className="project-stack-intro" delay={.1}><p>A few selected project concepts.</p><span className="eyebrow">05 / PROJECT CONCEPTS</span></Reveal></>}
    <ProjectBrowser key={compact?'mobile':'desktop'} entries={entries} onOpen={openProject} compact={compact}/>
    <p className="sample-note project-stack-note">Illustrative project concepts · Full details inside each project.</p>
    {selected!==null && <ProjectDialog project={projects[selected]} index={selected} onClose={closeProject} />}
  </section>;
}
