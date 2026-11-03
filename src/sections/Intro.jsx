import React from 'react';
import {Reveal} from '../lib/motion.jsx';
import {Asterisk} from '../components/icons.jsx';

export function Intro() {
  return <section className="intro-section" aria-labelledby="intro-title"><div className="section-wrap"><p className="eyebrow">ONE DEVELOPER. THE WHOLE PICTURE.</p><h2 id="intro-title"><Reveal as="span" className="manifesto-line" distance={24} delay={0*.08} style={{'--line-index':0}}>I BUILD <mark className="front-mark">FRONT.</mark></Reveal><Reveal as="span" className="manifesto-line" distance={24} delay={1*.08} style={{'--line-index':1}}>I CONNECT <mark className="back-mark">BACK.</mark></Reveal><Reveal as="span" className="manifesto-line" distance={24} delay={2*.08} style={{'--line-index':2}}>I TEST <mark className="test-mark">EVERYTHING.</mark></Reveal></h2><div className="intro-bottom"><p>Good software should feel simple. I work across interfaces, APIs, and databases to make that happen.</p><Asterisk className="code-flower"/></div></div></section>;
}
