// Preserve native list scrolling, but release wheel momentum to the page at an edge.
export function handoffAtScrollBoundary(event,panel,page=window){
  if(event.defaultPrevented||!event.cancelable||event.ctrlKey||event.shiftKey||!event.deltaY||Math.abs(event.deltaX)>Math.abs(event.deltaY))return false;
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?panel.clientHeight:1);
  const max=Math.max(0,panel.scrollHeight-panel.clientHeight);
  const position=Math.max(0,Math.min(max,panel.scrollTop));
  const available=delta>0?max-position:position;
  // A fractional pixel of scroll space must not keep the gesture trapped.
  const remaining=available<=1?0:available;
  if(Math.abs(delta)<=remaining)return false;
  event.preventDefault();
  panel.scrollTo({top:delta>0?max:0,behavior:'instant'});
  page.scrollBy({top:Math.sign(delta)*(Math.abs(delta)-remaining),behavior:'instant'});
  return true;
}
