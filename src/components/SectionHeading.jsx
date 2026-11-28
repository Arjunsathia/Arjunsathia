import React from 'react';
import {Sequence, Item} from '../lib/motion.jsx';
import SplitText from './SplitText.jsx';
import DecryptText from './DecryptText.jsx';

// The section title: its letters rise in one by one (SplitText) while the highlighted word wipes in behind them.
// The note beside it decodes from scrambled code glyphs as it fades in (DecryptText).
export function SectionHeading({ number, id, title, note }) {
  return <Sequence className="section-heading" gap={.1}><Item as="span" variant="fade" className="eyebrow">({number})</Item><SplitText as="h2" id={id} startDelay={.1}>{title}</SplitText>{note && <Item as="span" variant="fade" className="heading-note"><DecryptText text={`// ${note}`} delay={250}/></Item>}</Sequence>;
}
