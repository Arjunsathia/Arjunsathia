import React from 'react';
import {Rich} from './Rich.jsx';

// Headline numbers as a 2 × 2 grid of tiles (a big figure and a short line under it), with a note saying where the
// numbers come from. Used in the project popup's overview and in the Experience popup. Styles: "Project results" in
// main.css.
export function ResultTiles({results, note, label = 'Key results'}) {
  return <section className="project-results" aria-label={label}>
    <ul>{results.map(item => <li key={item.value}><strong>{item.value}</strong><span><Rich text={item.label}/></span></li>)}</ul>
    {note && <p>{note}</p>}
  </section>;
}
