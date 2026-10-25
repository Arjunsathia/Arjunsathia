import test from 'node:test';
import assert from 'node:assert/strict';
import {handoffAtScrollBoundary} from '../src/scroll-boundary.js';

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
