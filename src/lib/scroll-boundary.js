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

// Touch equivalent: browsers keep a swipe "latched" to the inner list, so a swipe (or fling) that reaches
// the list's edge stops dead there, and iOS only bounces a list that is already at its edge instead of
// scrolling the page. So the page is driven directly: once the edge is reached mid-swipe the rest of the
// movement scrolls the page, and a swipe that starts at the edge and moves outward cancels the bounce and
// scrolls the page from the first movement. Either way the page then glides on with decaying momentum.
export function createTouchHandoff(panel,page=window,frame=callback=>requestAnimationFrame(callback),now=()=>performance.now()){
  const atEnd=direction=>{
    const max=Math.max(0,panel.scrollHeight-panel.clientHeight);
    return direction>0?panel.scrollTop>=max-1:panel.scrollTop<=1;
  };
  let touching=false,lastY=0,lastT=0,velocity=0,handing=0,manual=false,startedAtEnd={1:false,'-1':false};
  let glide=null,lastTop=panel.scrollTop,lastScrollT=0,scrollVelocity=0;
  const stopGlide=()=>{glide=null;};
  const startGlide=initial=>{
    let v=initial,t=now();
    const token={};glide=token;
    const step=()=>{
      if(glide!==token)return;
      const current=now(),dt=Math.min(32,current-t||16);t=current;
      page.scrollBy({top:v*dt,behavior:'instant'});
      v*=Math.pow(.95,dt/16);
      if(Math.abs(v)>.02)frame(step);else glide=null;
    };
    frame(step);
  };
  return {
    start(y){
      stopGlide();touching=true;lastY=y;lastT=now();velocity=0;handing=0;manual=false;
      startedAtEnd={1:atEnd(1),'-1':atEnd(-1)};
    },
    // `event` is the touchmove event; while it is still cancelable the browser has not started scrolling.
    move(y,event){
      const t=now(),dy=lastY-y,dt=Math.max(1,t-lastT);
      lastY=y;lastT=t;
      if(!dy)return;
      const direction=Math.sign(dy);
      if(handing&&direction!==handing){handing=0;manual=false;}
      if(!handing&&atEnd(direction)){
        if(!startedAtEnd[direction])handing=direction;
        // Started at the edge, moving outward: take over before the list can bounce.
        else if(event?.cancelable){handing=direction;manual=true;}
        // Otherwise the browser is already scrolling the page itself; stay out of the way.
      }
      if(!handing)return;
      if(manual&&event?.cancelable)event.preventDefault();
      page.scrollBy({top:dy,behavior:'instant'});
      velocity=.8*(dy/dt)+.2*velocity;
    },
    end(){
      touching=false;
      if(handing&&Math.abs(velocity)>.05)startGlide(velocity);
      handing=0;manual=false;
    },
    // A fling that coasts the list into its edge after the finger lifts carries its speed into the page.
    scrolled(){
      const t=now(),top=panel.scrollTop,dt=Math.max(1,t-lastScrollT);
      if(dt<100)scrollVelocity=.7*((top-lastTop)/dt)+.3*scrollVelocity;else scrollVelocity=0;
      lastTop=top;lastScrollT=t;
      if(!touching&&!glide&&Math.abs(scrollVelocity)>.3&&atEnd(Math.sign(scrollVelocity))){startGlide(scrollVelocity*.8);scrollVelocity=0;}
    },
    cancel:stopGlide,
  };
}
