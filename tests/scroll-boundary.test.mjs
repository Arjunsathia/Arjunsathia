import test from 'node:test';
import assert from 'node:assert/strict';
import {handoffAtScrollBoundary, createTouchHandoff} from '../src/lib/scroll-boundary.js';

function fixture(top,delta,overrides={}){
  const pageMoves=[],listMoves=[];
  const panel={scrollTop:top,scrollHeight:1500,clientHeight:500,scrollTo(options){this.scrollTop=options.top;listMoves.push(options.top);}};
  const event={defaultPrevented:false,cancelable:true,ctrlKey:false,shiftKey:false,deltaX:0,deltaY:delta,deltaMode:0,preventDefault(){this.defaultPrevented=true;},...overrides};
  const page={scrollBy(options){pageMoves.push(options.top);}};
  return {panel,event,page,pageMoves,listMoves,run(){return handoffAtScrollBoundary(event,panel,page);}};
}

test('ordinary list scrolling remains native',()=>{
  const f=fixture(400,120);assert.equal(f.run(),false);assert.equal(f.event.defaultPrevented,false);assert.deepEqual(f.pageMoves,[]);assert.deepEqual(f.listMoves,[]);
});
test('continued downward movement leaves a completed list',()=>{
  const f=fixture(1000,120);assert.equal(f.run(),true);assert.equal(f.event.defaultPrevented,true);assert.deepEqual(f.pageMoves,[120]);assert.equal(f.panel.scrollTop,1000);
});
test('continued upward movement leaves the first item',()=>{
  const f=fixture(0,-90);f.run();assert.deepEqual(f.pageMoves,[-90]);assert.equal(f.panel.scrollTop,0);
});
test('only excess movement is passed on when crossing an edge',()=>{
  const down=fixture(960,120);down.run();assert.deepEqual(down.pageMoves,[80]);assert.equal(down.panel.scrollTop,1000);
  const up=fixture(30,-100);up.run();assert.deepEqual(up.pageMoves,[-70]);assert.equal(up.panel.scrollTop,0);
});
test('fractional leftover space cannot trap wheel movement',()=>{
  const f=fixture(999.6,24);f.run();assert.deepEqual(f.pageMoves,[24]);assert.equal(f.panel.scrollTop,1000);
});
test('reversing direction at the bottom scrolls the list normally',()=>{
  const f=fixture(1000,-50);assert.equal(f.run(),false);assert.deepEqual(f.pageMoves,[]);
});
test('line and page wheel units are normalized',()=>{
  const line=fixture(1000,3,{deltaMode:1});line.run();assert.deepEqual(line.pageMoves,[48]);
  const page=fixture(1000,1,{deltaMode:2});page.run();assert.deepEqual(page.pageMoves,[500]);
});
test('zoom, horizontal gestures, and noncancelable or handled events remain native',()=>{
  for(const overrides of [{ctrlKey:true},{shiftKey:true},{deltaX:150},{cancelable:false},{defaultPrevented:true},{deltaY:0}]){
    const f=fixture(1000,100,overrides);assert.equal(f.run(),false);assert.deepEqual(f.pageMoves,[]);
  }
});
test('overscroll bounce positions clamp safely',()=>{
  const f=fixture(-4,-20);f.run();assert.equal(f.panel.scrollTop,0);assert.deepEqual(f.pageMoves,[-20]);
});

// Touch hand-off: a fake clock and frame queue make momentum deterministic.
function touchFixture(top){
  const pageMoves=[],frames=[];let clock=0;
  const panel={scrollTop:top,scrollHeight:1500,clientHeight:500};
  const page={scrollBy(options){pageMoves.push(options.top);}};
  const handoff=createTouchHandoff(panel,page,callback=>frames.push(callback),()=>clock);
  return {panel,pageMoves,handoff,tick(ms=16){clock+=ms;},flushFrames(limit=500){let n=0;while(frames.length&&n++<limit){clock+=16;frames.shift()();}return n;}};
}
test('touch: swiping inside the list leaves the page alone',()=>{
  const f=touchFixture(400);f.handoff.start(600);f.tick();f.handoff.move(560);f.tick();f.handoff.move(520);f.handoff.end();
  assert.deepEqual(f.pageMoves,[]);
});
test('touch: once the list reaches its end mid-swipe, the rest of the swipe scrolls the page',()=>{
  const f=touchFixture(980);f.handoff.start(600);
  f.panel.scrollTop=1000;f.tick();f.handoff.move(570);f.tick();f.handoff.move(540);
  assert.deepEqual(f.pageMoves,[30,30]);
});
test('touch: the page keeps gliding after release, slowing to a stop',()=>{
  const f=touchFixture(980);f.handoff.start(600);f.panel.scrollTop=1000;
  for(let y=570;y>=450;y-=30){f.tick();f.handoff.move(y);}
  const during=f.pageMoves.length;f.handoff.end();f.flushFrames();
  const glide=f.pageMoves.slice(during);
  assert.ok(glide.length>5,'momentum continues for several frames');
  assert.ok(glide.every(v=>v>0),'momentum keeps the swipe direction');
  assert.ok(glide.at(-1)<glide[0],'momentum decays');
});
test('touch: a swipe that starts at the end is left to the browser (no double scroll)',()=>{
  const f=touchFixture(1000);f.handoff.start(600);f.tick();f.handoff.move(560);f.handoff.end();
  assert.deepEqual(f.pageMoves,[]);
});
test('touch: reversing direction hands control back to the list',()=>{
  const f=touchFixture(980);f.handoff.start(600);f.panel.scrollTop=1000;f.tick();f.handoff.move(570);
  f.tick();f.handoff.move(620);
  assert.deepEqual(f.pageMoves,[30]);
});
test('touch: the same applies at the top of the list',()=>{
  const f=touchFixture(20);f.handoff.start(300);f.panel.scrollTop=0;f.tick();f.handoff.move(340);
  assert.deepEqual(f.pageMoves,[-40]);
});
test('touch: a fling that coasts into the end carries its speed into the page',()=>{
  const f=touchFixture(900);f.handoff.start(600);f.tick();f.handoff.move(500);f.handoff.end();
  for(const top of [940,980,1000]){f.tick(16);f.panel.scrollTop=top;f.handoff.scrolled();}
  f.flushFrames();
  assert.ok(f.pageMoves.length>0&&f.pageMoves[0]>0,'page continues downward after the list stops');
});
test('touch: a new touch stops any glide immediately',()=>{
  const f=touchFixture(980);f.handoff.start(600);f.panel.scrollTop=1000;f.tick();f.handoff.move(560);f.tick();f.handoff.move(520);f.handoff.end();
  const before=f.pageMoves.length;f.handoff.start(500);f.flushFrames();
  assert.equal(f.pageMoves.length,before);
});
const touchEvent=()=>({cancelable:true,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;}});
test('touch: at the end, an outward swipe cancels the list bounce and scrolls the page (iOS)',()=>{
  const f=touchFixture(1000);f.handoff.start(600);
  const first=touchEvent();f.tick();f.handoff.move(570,first);
  const second=touchEvent();f.tick();f.handoff.move(540,second);
  assert.equal(first.defaultPrevented,true);assert.equal(second.defaultPrevented,true);
  assert.deepEqual(f.pageMoves,[30,30]);
});
test('touch: at the end, swiping back into the list still scrolls the list',()=>{
  const f=touchFixture(1000);f.handoff.start(500);
  const event=touchEvent();f.tick();f.handoff.move(540,event);
  assert.equal(event.defaultPrevented,false);assert.deepEqual(f.pageMoves,[]);
});
