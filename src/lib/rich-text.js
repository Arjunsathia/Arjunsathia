// Lightweight emphasis for content strings: wrap a key phrase in **double asterisks** to show it in bold.
// The popups render it with <Rich>; anywhere that shows the same text plainly uses plainText().

const BOLD = /\*\*(.+?)\*\*/g;

// Splits text into parts, each { text, bold }. Empty parts are dropped.
export function splitBold(text) {
  const parts = [];
  let last = 0;
  for (const match of String(text).matchAll(BOLD)) {
    if (match.index > last) parts.push({text: text.slice(last, match.index), bold: false});
    parts.push({text: match[1], bold: true});
    last = match.index + match[0].length;
  }
  if (last < String(text).length) parts.push({text: String(text).slice(last), bold: false});
  return parts;
}

// The same text without the markers.
export const plainText = text => String(text).replace(BOLD, '$1');
