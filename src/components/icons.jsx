import React from 'react';

// Icons are drawn as SVG: the ↗ and ✳ characters have emoji versions that phones would otherwise substitute.
const arrowRotation = {'→':0,'↘':45,'↓':90,'←':180,'↑':-90,'↗':-45};
export const Arrow = ({ direction = '↗', className, ...props }) => <span aria-hidden="true" className={['glyph',className].filter(Boolean).join(' ')} {...props}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{transform:`rotate(${arrowRotation[direction]??0}deg)`}}><path d="M4 12h16M13 5l7 7-7 7" /></svg></span>;
export const Asterisk = ({ className, ...props }) => <span aria-hidden="true" className={['glyph',className].filter(Boolean).join(' ')} {...props}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3 5.3 18.7" /></svg></span>;
export function ServiceDoodle({type='arrow',className=''}) {
  return <svg className={`service-doodle ${className}`} viewBox={type==='burst'?'0 0 80 60':'0 0 100 65'} fill="none" aria-hidden="true">{type==='burst'?<path d="M15 42 6 20M37 30 39 5M57 36 73 17"/>:<path d="M8 8C-3 40 37 60 81 26M62 25 84 23 81 45"/>}</svg>;
}
