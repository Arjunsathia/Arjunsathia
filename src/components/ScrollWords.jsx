import React from 'react';

// A sentence that reads itself in as it scrolls up the screen: each word brightens from faint to full in turn,
// following the scroll (forwards and back). Pure CSS (a scroll-driven animation on the paragraph's own view timeline,
// main.css "Scroll-linked words"), so nothing runs per frame in JavaScript. Browsers without scroll-driven
// animations, and reduced motion, show the sentence at full strength. The words are ordinary text, so screen
// readers, search and copy-paste see the sentence unchanged.
export default function ScrollWords({as: Element = 'p', text, className, ...props}) {
  const words = text.split(' ');
  return <Element className={['scroll-words', className].filter(Boolean).join(' ')} {...props}>
    {words.map((word, i) => <React.Fragment key={i}>{i > 0 && ' '}<span className="scroll-word" style={{'--word-start': `${(i / words.length) * 100}%`, '--word-end': `${((i + 1) / words.length) * 100}%`}}>{word}</span></React.Fragment>)}
  </Element>;
}
