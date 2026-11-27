// The hero lanyard's artwork: the card's front is the portrait alone (no text), cropped to the card's exact
// proportions so it fills edge to edge with the figure centred; the back carries the "about" details (the lime title
// panel and three lines); the strap is printed in the site's own type and colours. Each is returned as an image URL
// for the Lanyard. Drawn once per theme, after the fonts have loaded (so the canvas uses Anton and Manrope).

// The card is 1.78 x 2.4 (see CARD_SIZES in Lanyard.jsx); the face images match that shape, so nothing is squashed.
const FACE = { width: 1068, height: 1440 };
// The card has a punched slot for the strap clip, centred near the top: keep the back's content below this band.
const SLOT_BAND = 150;

const THEMES = {
  light: {
    paper: '#fffdf8',
    ink: '#13170d',
    muted: '#626155',
    line: '#13170d26',
    panel: ['#e5ee83', '#d4e62d', '#ecd953'],
    strap: '#d4e62d',
    strapInk: '#13170d',
  },
  dark: {
    paper: '#171b14',
    ink: '#f2f4ea',
    muted: '#a4ab97',
    line: '#ffffff26',
    panel: ['#b7ec78', '#9fe05a', '#7fc63f'],
    strap: '#9fe05a',
    strapInk: '#0b1006',
  },
};

const fontsReady = () =>
  Promise.all(
    ['400 120px Anton', '700 40px Manrope', '600 40px Manrope', '400 40px Manrope'].map(font =>
      document.fonts?.load(font).catch(() => null)
    )
  );

const loadImage = src =>
  new Promise(resolve => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

const canvasOf = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return [canvas, canvas.getContext('2d')];
};

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

// Draws the image to cover the area, zoomed in by `zoom`, with its focus point (0..1) in the middle of the area.
const cover = (ctx, image, x, y, w, h, focusX = 0.5, focusY = 0.5, zoom = 1) => {
  const scale = Math.max(w / image.width, h / image.height) * zoom;
  const sw = w / scale;
  const sh = h / scale;
  const sx = Math.min(image.width - sw, Math.max(0, image.width * focusX - sw / 2));
  const sy = Math.min(image.height - sh, Math.max(0, image.height * focusY - sh / 2));
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
};

const spark = (ctx, cx, cy, r, color, width) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(angle) * r, cy - Math.sin(angle) * r);
    ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.stroke();
  }
  ctx.restore();
};

const drawPhoto = image => {
  const [canvas, ctx] = canvasOf(FACE.width, FACE.height);
  ctx.fillStyle = '#c8a37d';
  ctx.fillRect(0, 0, FACE.width, FACE.height);
  // Zoomed in, centred on the figure: from the hair down to the arms resting on the chair (x 0.49, y 0.475 of the photo).
  if (image) cover(ctx, image, 0, 0, FACE.width, FACE.height, 0.494, 0.475, 1.25);
  return canvas.toDataURL('image/jpeg', 0.92);
};

const drawBack = (about, c) => {
  const [canvas, ctx] = canvasOf(FACE.width, FACE.height);
  ctx.fillStyle = c.paper;
  ctx.fillRect(0, 0, FACE.width, FACE.height);
  // The lime panel with the title (below the strap slot).
  const panel = { x: 48, y: SLOT_BAND, w: FACE.width - 96, h: 760 };
  const fill = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.w, panel.y + panel.h);
  fill.addColorStop(0, c.panel[0]);
  fill.addColorStop(0.52, c.panel[1]);
  fill.addColorStop(1, c.panel[2]);
  roundRect(ctx, panel.x, panel.y, panel.w, panel.h, 36);
  ctx.fillStyle = fill;
  ctx.fill();
  spark(ctx, panel.x + panel.w - 92, panel.y + 92, 42, '#13170d', 10);
  ctx.fillStyle = '#13170d';
  ctx.textBaseline = 'alphabetic';
  // The title lines, as large as they fit across the panel.
  const lines = about.role.map(line => line.toUpperCase());
  let titleSize = 132;
  ctx.font = `400 ${titleSize}px Anton, Impact, sans-serif`;
  while (titleSize > 80 && Math.max(...lines.map(line => ctx.measureText(line).width)) > panel.w - 128) {
    titleSize -= 2;
    ctx.font = `400 ${titleSize}px Anton, Impact, sans-serif`;
  }
  lines.forEach((line, i) => ctx.fillText(line, panel.x + 64, panel.y + 400 + i * titleSize * 0.95));
  ctx.font = '600 40px Manrope, Arial, sans-serif';
  ctx.fillStyle = '#13170dc2';
  ctx.fillText(about.lede, panel.x + 64, panel.y + panel.h - 64);
  // The three lines: number, what, and a small label at the end.
  const top = panel.y + panel.h + 40;
  const row = (FACE.height - top - 60) / about.details.length;
  about.details.forEach(([label, value], i) => {
    const y = top + row * i;
    if (i > 0) {
      ctx.fillStyle = c.line;
      ctx.fillRect(112, y, FACE.width - 224, 3);
    }
    const mid = y + row / 2;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = c.muted;
    ctx.font = '700 26px ui-monospace, Consolas, monospace';
    ctx.fillText(`0${i + 1}`, 112, mid);
    // The small label sits at the end; the line itself shrinks to fit the space left for it.
    ctx.font = '400 26px Manrope, Arial, sans-serif';
    const labelWidth = ctx.measureText(label).width;
    const room = FACE.width - 112 - labelWidth - 28 - 176;
    let size = 38;
    ctx.font = `700 ${size}px Manrope, Arial, sans-serif`;
    while (size > 22 && ctx.measureText(value).width > room) {
      size -= 1;
      ctx.font = `700 ${size}px Manrope, Arial, sans-serif`;
    }
    ctx.fillStyle = c.ink;
    ctx.fillText(value, 176, mid);
    ctx.fillStyle = c.muted;
    ctx.font = '400 26px Manrope, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(label, FACE.width - 112, mid);
    ctx.textAlign = 'left';
  });
  return canvas.toDataURL('image/png');
};

const drawStrap = c => {
  const [canvas, ctx] = canvasOf(1800, 200);
  ctx.fillStyle = c.strap;
  ctx.fillRect(0, 0, 1800, 200);
  // Stitching along both edges.
  ctx.fillStyle = `${c.strapInk}40`;
  for (let x = 0; x < 1800; x += 28) {
    ctx.fillRect(x, 16, 16, 4);
    ctx.fillRect(x, 180, 16, 4);
  }
  ctx.fillStyle = c.strapInk;
  ctx.font = '400 96px Anton, Impact, sans-serif';
  ctx.textBaseline = 'middle';
  const words = ['ARJUN SATHIA', 'FULL STACK DEVELOPER'];
  let x = 40;
  words.forEach(word => {
    ctx.fillText(word, x, 106);
    x += ctx.measureText(word).width + 48;
    spark(ctx, x + 30, 100, 30, c.strapInk, 7);
    x += 108;
  });
  return canvas.toDataURL('image/png');
};

const cache = new Map();

export function heroCardArt(theme, portrait, about) {
  if (!cache.has(theme)) {
    const colours = THEMES[theme] ?? THEMES.light;
    cache.set(
      theme,
      Promise.all([fontsReady(), loadImage(portrait)]).then(([, image]) => ({
        front: drawPhoto(image),
        back: drawBack(about, colours),
        strap: drawStrap(colours),
      }))
    );
  }
  return cache.get(theme);
}
