import React, {useEffect, useState} from 'react';
import {motion, useReducedMotion} from 'motion/react';

export const motionEase=[.16,1,.3,1];
export function useCompactMotion(){
  const [compact,setCompact]=useState(()=>window.matchMedia('(max-width: 700px)').matches);
  useEffect(()=>{const media=window.matchMedia('(max-width: 700px)');const update=()=>setCompact(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
  return compact;
}
// fadeOnly leaves transform alone, for elements whose stylesheet already transforms them.
export function Reveal({as='div',delay=0,distance=20,axis='y',scale,fadeOnly=false,children,...props}){
  const reduce=useReducedMotion();
  const Element=motion[as];
  const from=fadeOnly?{opacity:0}:{opacity:0,[axis]:distance,...(scale?{scale}:{})};
  const to=fadeOnly?{opacity:1}:{opacity:1,x:0,y:0,...(scale?{scale:1}:{})};
  return <Element initial={reduce?false:from} whileInView={to} viewport={{once:true,amount:.15,margin:'0px 0px -6% 0px'}} transition={{duration:reduce?0:.8,delay:reduce?0:delay,ease:motionEase}} {...props}>{children}</Element>;
}
// Scroll-reveal choreography: a Sequence plays its Items in order once it scrolls into view.
// Items only animate opacity, clip, and transform; clip-path is cleared afterwards so the resting state matches the static design.
export const revealVariants={
  fade:{hidden:{opacity:0},shown:{opacity:1,transition:{duration:.7,ease:motionEase}}},
  rise:{hidden:{opacity:0,y:24},shown:{opacity:1,y:0,transition:{duration:.8,ease:motionEase}}},
  slide:{hidden:{opacity:0,x:28},shown:{opacity:1,x:0,transition:{duration:.75,ease:motionEase}}},
  line:{hidden:{opacity:0,y:28,clipPath:'inset(0% 0% 100% 0%)'},shown:{opacity:1,y:0,clipPath:'inset(0% 0% 0% 0%)',transition:{duration:.85,ease:motionEase},transitionEnd:{clipPath:'none'}}},
  wipe:{hidden:{clipPath:'inset(0% 100% 0% 0%)'},shown:{clipPath:'inset(0% 0% 0% 0%)',transition:{duration:.6,delay:.3,ease:motionEase},transitionEnd:{clipPath:'none'}}},
};
export function Sequence({as='div',gap=.08,delay=0,amount=.2,children,...props}){
  const reduce=useReducedMotion();
  const Element=motion[as];
  const play=reduce?{}:{initial:'hidden',whileInView:'shown',viewport:{once:true,amount,margin:'0px 0px -6% 0px'},variants:{hidden:{},shown:{transition:{staggerChildren:gap,delayChildren:delay}}}};
  return <Element {...play} {...props}>{children}</Element>;
}
export function Item({as='div',variant='rise',children,...props}){
  const Element=motion[as];
  return <Element variants={revealVariants[variant]} {...props}>{children}</Element>;
}
export function Entrance({as='div',delay=0,children,...props}){
  const reduce=useReducedMotion();const Element=motion[as];
  return <Element initial={reduce?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:reduce?0:.45,delay:reduce?0:delay,ease:motionEase}} {...props}>{children}</Element>;
}
