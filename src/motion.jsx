import React, {useEffect, useState} from 'react';
import {motion, useReducedMotion} from 'motion/react';
import {handoffAtScrollBoundary} from './scroll-boundary.js';

export const motionEase=[.16,1,.3,1];
export function useCompactMotion(){
  const [compact,setCompact]=useState(()=>window.matchMedia('(max-width: 700px)').matches);
  useEffect(()=>{const media=window.matchMedia('(max-width: 700px)');const update=()=>setCompact(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  return compact;
}
export function Reveal({as='div',delay=0,distance=12,axis='y',children,...props}){
  const reduce=useReducedMotion();
  const Element=motion[as];
  return <Element initial={reduce?false:{opacity:0,[axis]:distance}} whileInView={{opacity:1,x:0,y:0}} viewport={{once:true,amount:.15}} transition={{duration:reduce?0:.5,delay:reduce?0:delay,ease:motionEase}} {...props}>{children}</Element>;
}
export function Entrance({as='div',delay=0,children,...props}){
  const reduce=useReducedMotion();const Element=motion[as];
  return <Element initial={reduce?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.45,delay:reduce?0:delay,ease:motionEase}} {...props}>{children}</Element>;
}

// Native scrolling within each list, with explicit wheel handoff at either edge.
export function useCenteredScroll(ref,selector,count){
  const reduce=useReducedMotion();
  const [active,setActive]=useState(0);
  const activeRef=React.useRef(0);
  useEffect(()=>{
    const panel=ref.current;
    const entries=Array.from(panel.querySelectorAll(selector));
    let frame=0;
    const update=()=>{
      frame=0;
      const center=panel.scrollTop+panel.clientHeight/2;
      const positions=entries.map(entry=>({entry,center:entry.offsetTop+entry.offsetHeight/2,height:entry.offsetHeight}));
      let nearest=0,distance=Infinity;
      positions.forEach((item,index)=>{const next=Math.abs(item.center-center);if(next<distance){nearest=index;distance=next;}});
      positions.forEach((item,index)=>{
        const offset=Math.min(1,Math.abs(item.center-center)/item.height);
        item.entry.dataset.active=String(index===nearest);
        item.entry.style.setProperty('--center-scale',reduce?'1':String(1-offset*.04));
        item.entry.style.setProperty('--center-opacity',String(1-offset*.45));
      });
      if(nearest!==activeRef.current){activeRef.current=nearest;setActive(nearest);}
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const resize=new ResizeObserver(schedule);resize.observe(panel);entries.forEach(entry=>resize.observe(entry));
    const onWheel=event=>handoffAtScrollBoundary(event,panel);
    panel.addEventListener('scroll',schedule,{passive:true});
    panel.addEventListener('wheel',onWheel,{passive:false});
    update();
    return()=>{cancelAnimationFrame(frame);resize.disconnect();panel.removeEventListener('scroll',schedule);panel.removeEventListener('wheel',onWheel);};
  },[ref,selector,reduce]);
  const goTo=index=>{
    const panel=ref.current;
    const entry=panel.querySelectorAll(selector)[Math.max(0,Math.min(count-1,index))];
    panel.scrollTo({top:entry.offsetTop-(panel.clientHeight-entry.offsetHeight)/2,behavior:reduce?'instant':'smooth'});
  };
  const onKeyDown=event=>{
    const destinations={ArrowUp:active-1,ArrowLeft:active-1,ArrowDown:active+1,ArrowRight:active+1,Home:0,End:count-1};
    const destination=destinations[event.key];
    if(destination!==undefined&&destination>=0&&destination<count){event.preventDefault();goTo(destination);}
  };
  return {active,goTo,onKeyDown};
}
