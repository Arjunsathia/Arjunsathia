import {useEffect, useRef, useState} from 'react';
import {useReducedMotion} from 'motion/react';

// Shared modal behavior: open on mount, lock page scroll, contain focus, and close on Escape or backdrop click.
export function useModalDialog(onClose) {
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
