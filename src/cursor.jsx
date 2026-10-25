import {useEffect} from 'react';

// A cosmetic pointer overlay. Native cursors remain available for touch and text entry.
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
    const move = event => {
      if (!media.matches || event.pointerType !== 'mouse' || !(event.target instanceof Element)) { hide(); return; }
      const target = event.target;
      if (target.closest('input,textarea,select,[contenteditable="true"],iframe')) { hide(); return; }
      if (target !== lastTarget) { inspectTarget(target); lastTarget = target; }
      cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      if (!visible || !cursor.matches(':popover-open')) {
        cursor.showPopover();
        visible = true;
        document.documentElement.classList.add('premium-cursor-enabled');
      }
    };
    const leave = event => { if (!event.relatedTarget) hide(); };
    const down = () => { cursor.dataset.pressed = 'true'; };
    const up = () => { cursor.dataset.pressed = 'false'; };
    const key = event => { if (event.key === 'Tab' || event.key === 'Escape') hide(); };
    const visibility = () => { if (document.hidden) hide(); };
    // Re-promote the noninteractive overlay when a dialog enters the top layer.
    const observer = new MutationObserver(() => {
      const dialogs = document.querySelectorAll('dialog[open]');
      const next = dialogs[dialogs.length - 1] ?? null;
      if (next !== topDialog) {
        topDialog = next;
        lastTarget = null;
        if (visible) { if (cursor.matches(':popover-open')) cursor.hidePopover(); cursor.showPopover(); }
      }
    });
    observer.observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['open']});
    document.addEventListener('pointermove', move, {passive:true});
    document.addEventListener('pointerout', leave, {passive:true});
    document.addEventListener('pointerdown', down, {passive:true});
    document.addEventListener('pointerup', up, {passive:true});
    document.addEventListener('keydown', key);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('blur', hide);
    media.addEventListener('change', hide);
    return () => {
      hide();
      observer.disconnect();
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', leave);
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('keydown', key);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('blur', hide);
      media.removeEventListener('change', hide);
      cursor.remove();
    };
  }, []);
  return null;
}
