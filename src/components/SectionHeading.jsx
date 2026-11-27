import React from 'react';
import {Sequence, Item} from '../lib/motion.jsx';
import SplitText from './SplitText.jsx';

// The section title: its letters rise in one by one (SplitText) while the highlighted word wipes in behind them.
export function SectionHeading({ number, id, title, note }) {
  return <Sequence className="section-heading" gap={.1}><Item as="span" variant="fade" className="eyebrow">({number})</Item><SplitText as="h2" id={id} startDelay={.1}>{title}</SplitText>{note && <Item as="span" variant="fade" className="heading-note">// {note}</Item>}</Sequence>;
}
