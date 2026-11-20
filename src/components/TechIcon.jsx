import React from 'react';
import {techIcons, techColors} from '../content/site.js';

// A technology's icon (brand logos from simple-icons, a few drawn by hand), or nothing if it has none.
export const TechIcon = ({tag}) => techIcons[tag] ? <svg className="tech-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={techIcons[tag]} fill="currentColor"/></svg> : null;

// The pill's style: its brand colour, which the stylesheet uses for the icon, border and soft background.
export const techStyle = tag => techColors[tag] ? {'--tech': techColors[tag]} : undefined;
