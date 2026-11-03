import {useEffect} from 'react';

// A minimal pointer overlay: a dot that gains a ring over interactive elements.
// Native cursors remain for touch, text entry, keyboard use, and forced-colors mode.
export function PremiumCursor() {
  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine) and (forced-colors: none)');
    const cursor = document.createElement('div');
    if (!('showPopover' in cursor)) return;
    cursor.className = 'premium-cursor';
    cursor.setAttribute('popover', 'manual');
    cursor.setAttribute('aria-hidden', 'true');
    document.body.append(cursor);
    let visible = false;
    let lastTarget = null;
    let topDialog = null;
    let x = 0, y = 0, frame = 0, refreshFrame = 0, settleTimer = 0;

    const hide = () => {
      visible = false;
      document.documentElement.classList.remove('premium-cursor-enabled');
      if (cursor.matches(':popover-open')) cursor.hidePopover();
    };
    const inspectTarget = target => {
      cursor.dataset.interactive = Boolean(target.closest('a[href],button:not(:disabled),[role="tab"],[role="button"]'));
      let dark = false;
      for (let element = target; element; element = element.parentElement) {
        const values = getComputedStyle(element).backgroundColor.match(/[\d.]+/g)?.map(Number);
        if (values?.length >= 3 && (values.length === 3 || values[3] > .6)) {
          dark = (values[0] * .2126 + values[1] * .7152 + values[2] * .0722) < 110;
          break;
        }
      }
      cursor.dataset.dark = dark;
    };
    // Hover and press styles fade the background in; read it again once they have settled.
    const settle = () => { clearTimeout(settleTimer); settleTimer = setTimeout(() => { if (lastTarget?.isConnected) inspectTarget(lastTarget); }, 220); };
    const render = () => {
      frame = 0;
      cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
    };
    const move = event => {
      if (!media.matches || event.pointerType !== 'mouse' || !(event.target instanceof Element)) { hide(); return; }
      const target = event.target;
      if (target.closest('input,textarea,select,[contenteditable="true"],iframe')) { hide(); return; }
      x = event.clientX; y = event.clientY;
      if (target !== lastTarget) { inspectTarget(target); lastTarget = target; settle(); }
      if (!visible || !cursor.matches(':popover-open')) {
        // Place the cursor before showing it so it never flashes at the corner.
        render();
        cursor.showPopover();
        visible = true;
        document.documentElement.classList.add('premium-cursor-enabled');
      } else if (!frame) frame = requestAnimationFrame(render);
    };
    // Content can move under a still pointer (scrolling, dialogs opening); re-read what is under it.
    const refresh = () => {
      refreshFrame = 0;
      if (!visible) return;
      const target = document.elementFromPoint(x, y);
      if (!target || target === lastTarget) return;
      if (target.closest('input,textarea,select,[contenteditable="true"],iframe')) { hide(); return; }
      inspectTarget(target); lastTarget = target; settle();
    };
    const scheduleRefresh = () => { if (!refreshFrame) refreshFrame = requestAnimationFrame(refresh); };
    const leave = event => { if (!event.relatedTarget) hide(); };
    const down = () => { cursor.dataset.pressed = 'true'; settle(); };
    const up = () => { cursor.dataset.pressed = 'false'; settle(); };
    const key = event => { if (event.key === 'Tab') hide(); };
    const visibility = () => { if (document.hidden) hide(); };
    // Re-promote the noninteractive overlay when a dialog enters the top layer.
    const observer = new MutationObserver(() => {
      const dialogs = document.querySelectorAll('dialog[open]');
      const next = dialogs[dialogs.length - 1] ?? null;
      if (next !== topDialog) {
        topDialog = next;
        lastTarget = null;
        if (visible) { if (cursor.matches(':popover-open')) cursor.hidePopover(); cursor.showPopover(); }
        scheduleRefresh();
      }
    });
    observer.observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['open']});
    document.addEventListener('pointermove', move, {passive:true});
    document.addEventListener('pointerout', leave, {passive:true});
    document.addEventListener('pointerdown', down, {passive:true});
    document.addEventListener('pointerup', up, {passive:true});
    document.addEventListener('scroll', scheduleRefresh, {passive:true, capture:true});
    document.addEventListener('keydown', key);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', hide);
    media.addEventListener('change', hide);
    return () => {
      hide();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(refreshFrame);
      clearTimeout(settleTimer);
      observer.disconnect();
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', leave);
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('scroll', scheduleRefresh, {capture:true});
      document.removeEventListener('keydown', key);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', hide);
      media.removeEventListener('change', hide);
      cursor.remove();
    };
  }, []);
  return null;
}
