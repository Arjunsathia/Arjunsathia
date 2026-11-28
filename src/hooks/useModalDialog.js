import {useEffect, useRef, useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {POPUP_CLOSED_EVENT} from '../lib/popup-pause.js';

// How long a popup takes to leave (its closing animation in main.css, "Popup scenes").
const CLOSE_MS = 420;

// The page behind an open popup moves with it (main.css, "Popup scenes"): "reveal" sinks the page back while the popup
// rises in; "blow" grows the popup from the centre as the backdrop darkens; "tilt" springs it up. Larger screens use
// reveal; on phones each popup picks (useModalDialog's `phoneLook`).
// <html data-modal-look> and data-modal-scene="in|out" drive it, and #root's transform-origin keeps the zoom centred on
// what is on screen. Popups can open over another one (the screenshot viewer over a project), so the page moves only
// for the first.
let openPopups = 0;
const sceneOpen = phoneLook => {
  if (openPopups++ > 0) return;
  const root = document.documentElement;
  // Set on #root itself: a variable on <html> would be inherited by every element and restyle the whole page.
  const page = document.getElementById('root');
  if (page) page.style.transformOrigin = `50% ${Math.round(window.scrollY + window.innerHeight / 2)}px`;
  root.dataset.modalLook = window.matchMedia('(max-width: 700px)').matches ? phoneLook : 'reveal';
  root.dataset.modalScene = 'in';
};
const sceneClosing = () => { if (openPopups === 1) document.documentElement.dataset.modalScene = 'out'; };
const sceneDone = () => {
  openPopups = Math.max(0, openPopups - 1);
  if (openPopups) return;
  const root = document.documentElement;
  delete root.dataset.modalScene;
  delete root.dataset.modalLook;
  document.getElementById('root')?.style.removeProperty('transform-origin');
  // The live canvases paused while the popup was open (lib/popup-pause.js) start drawing again.
  window.dispatchEvent(new Event(POPUP_CLOSED_EVENT));
};

// Shared modal behavior: open on mount, lock page scroll, contain focus, and close on Escape or backdrop click.
// `phoneLook`: how this popup opens on phones: 'blow' (default), 'reveal' or 'tilt' (the page stays put).
export function useModalDialog(onClose, {phoneLook = 'blow'} = {}) {
  const ref=useRef(null),timer=useRef(null),shown=useRef(false);
  const [closing,setClosing]=useState(false);
  const reduce=useReducedMotion();
  useEffect(()=>{
    // The page is locked on <html>, not <body>: <body> stays free to clip the zoomed page on phones (main.css,
    // Popup scenes) without becoming a scroll box of its own, which would unstick the sticky header.
    const html=document.documentElement,previous=html.style.overflow;
    const dialog=ref.current;
    if(!dialog.open)dialog.showModal();
    html.style.overflow='hidden';
    // Opening a popup is heavy for one frame (the browser restyles the page behind it). The popup stays invisible
    // through that frame and the animations start on the next clean one, so they run smoothly from their first frame
    // instead of jumping ahead.
    let frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{shown.current=true;sceneOpen(phoneLook);dialog.dataset.shown='';});});
    return()=>{html.style.overflow=previous;clearTimeout(timer.current);cancelAnimationFrame(frame);if(shown.current)sceneDone();};
  },[]);
  // Close the native dialog first: it fires the close event (and onClose) only once the page is no longer inert, so focus can return to the trigger.
  const close=()=>{if(closing)return;setClosing(true);if(shown.current)sceneClosing();timer.current=setTimeout(()=>ref.current?.open?ref.current.close():onClose(),reduce||!shown.current?0:CLOSE_MS);};
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
  return {ref,closing,close,reduce,dialogProps:{ref,'data-lenis-prevent':true,onClose,onCancel:event=>{event.preventDefault();close();},onKeyDown,onClick}};
}
