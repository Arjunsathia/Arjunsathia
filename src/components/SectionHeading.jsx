import React from 'react';
import {Sequence, Item} from '../lib/motion.jsx';

export function SectionHeading({ number, id, title, note }) {
  return <Sequence className="section-heading" gap={.1}><Item as="span" variant="fade" className="eyebrow">({number})</Item><Item as="h2" variant="line" id={id}>{title}</Item>{note && <Item as="span" variant="fade" className="heading-note">// {note}</Item>}</Sequence>;
}
