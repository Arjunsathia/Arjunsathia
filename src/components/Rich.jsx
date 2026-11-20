import React from 'react';
import {splitBold} from '../lib/rich-text.js';

// Renders content text, showing **marked** key phrases in bold.
export const Rich = ({text}) => splitBold(text).map((part, i) => part.bold ? <strong key={i}>{part.text}</strong> : <React.Fragment key={i}>{part.text}</React.Fragment>);
