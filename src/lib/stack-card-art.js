// Cards for the "What I work with" gallery: one per tool, drawn in the site's own type and colours. Each has the
// tool's logo large on a panel tinted with its brand colour, its group ("01 — FRONTEND") and its name. Returned as
// image URLs for CircularGallery, drawn once per theme after the fonts have loaded.

const CARD = { width: 624, height: 800 };

const THEMES = {
  light: { paper: '#fffdf8', ink: '#13170d', muted: '#626155', line: '#13170d1f', accent: '#d4e62d', mark: '#707e25' },
  dark: { paper: '#171b14', ink: '#f2f4ea', muted: '#a4ab97', line: '#ffffff1f', accent: '#9fe05a', mark: '#9fe05a' },
};

// A "check" stands in for a practice without a logo (CI/CD).
const CHECK = { path: 'M5 12l4 4L19 6', stroke: true };

const luminance = hex => {
  const value = parseInt(hex.replace('#', ''), 16);
  const channel = shift => {
    const c = ((value >> shift) & 255) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0);
};

// The logo colour: the brand's own, except near-black logos in dark mode (and near-white in light) use the ink.
const brandFor = (hex, c, dark) => {
  if (!hex) return c.ink;
  const colour = `#${hex}`;
  const l = luminance(colour);
  if (dark && l < 0.06) return c.ink;
  if (!dark && l > 0.85) return c.ink;
  return colour;
};

const fontsReady = () =>
  Promise.all(['400 90px Anton', '700 22px Manrope'].map(font => document.fonts?.load(font).catch(() => null)));

const drawCard = ({ name, icon, group, groupIndex, toolIndex, toolCount }, c, dark) => {
  const canvas = document.createElement('canvas');
  canvas.width = CARD.width;
  canvas.height = CARD.height;
  const ctx = canvas.getContext('2d');
  const brand = brandFor(icon?.hex, c, dark);
  ctx.fillStyle = c.paper;
  ctx.fillRect(0, 0, CARD.width, CARD.height);

  // The tinted panel with a fine dot grid.
  const panel = { x: 24, y: 24, w: CARD.width - 48, h: 560 };
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(panel.x, panel.y, panel.w, panel.h, 30);
  ctx.clip();
  ctx.fillStyle = brand;
  ctx.globalAlpha = dark ? 0.16 : 0.13;
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  ctx.globalAlpha = 1;
  ctx.fillStyle = c.line;
  for (let y = panel.y + 22; y < panel.y + panel.h; y += 26) {
    for (let x = panel.x + 22; x < panel.x + panel.w; x += 26) ctx.fillRect(x, y, 3, 3);
  }
  // A soft glow behind the logo.
  const glow = ctx.createRadialGradient(312, 330, 0, 312, 330, 260);
  glow.addColorStop(0, dark ? '#ffffff14' : '#ffffffb0');
  glow.addColorStop(1, '#ffffff00');
  ctx.fillStyle = glow;
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  ctx.restore();
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(panel.x + 1, panel.y + 1, panel.w - 2, panel.h - 2, 29);
  ctx.stroke();

  // Group tag, top left of the panel.
  ctx.font = '700 22px ui-monospace, Consolas, monospace';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = c.ink;
  const number = `0${groupIndex + 1}`;
  ctx.fillText(number, 60, 78);
  const numberWidth = ctx.measureText(number).width;
  ctx.fillRect(60 + numberWidth + 14, 77, 36, 2);
  ctx.fillStyle = c.muted;
  ctx.fillText(group.toUpperCase(), 60 + numberWidth + 64, 78);

  // The logo.
  const size = 230;
  ctx.save();
  ctx.translate(312 - size / 2, 330 - size / 2);
  ctx.scale(size / 24, size / 24);
  const path = new Path2D(icon?.path ?? CHECK.path);
  if (!icon?.path || icon === CHECK) {
    ctx.strokeStyle = brand;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(path);
  } else {
    ctx.fillStyle = brand;
    ctx.fill(path);
  }
  ctx.restore();

  // Name (as large as fits), then the tool's place in its group.
  let nameSize = 96;
  ctx.font = `400 ${nameSize}px Anton, Impact, sans-serif`;
  while (nameSize > 48 && ctx.measureText(name.toUpperCase()).width > CARD.width - 96) {
    nameSize -= 2;
    ctx.font = `400 ${nameSize}px Anton, Impact, sans-serif`;
  }
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = c.ink;
  ctx.fillText(name.toUpperCase(), 46, 702);
  ctx.fillStyle = c.accent;
  ctx.beginPath();
  ctx.arc(54, 748, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '700 20px ui-monospace, Consolas, monospace';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = c.muted;
  ctx.fillText(`TOOL 0${toolIndex + 1} / 0${toolCount}`, 74, 749);
  // Encoded off the main thread (toBlob), so drawing the 22 cards doesn't stall scrolling.
  return new Promise(resolve => canvas.toBlob(blob => resolve(blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/jpeg', 0.9)), 'image/jpeg', 0.9));
};

const cache = new Map();

// Waits for a quiet moment and reports how long it lasts, so the cards are drawn a few at a time between frames
// (as many as fit) instead of all at once mid-scroll, or one per idle moment (which made the gallery slow to appear).
const idle = () => new Promise(resolve => (window.requestIdleCallback
  ? window.requestIdleCallback(deadline => resolve(deadline), { timeout: 120 })
  : setTimeout(() => resolve({ timeRemaining: () => 8 }), 0)));

// `groups`: the site's stackGroups ({name, description, tools: [[name, icon]]}); `notes`: a short line per tool, shown
// when its card is opened (falling back to the group's description). Returns gallery items.
export function stackCardArt(theme, groups, extras = {}, notes = {}) {
  if (!cache.has(theme)) {
    const colours = THEMES[theme] ?? THEMES.light;
    const dark = theme === 'dark';
    cache.set(
      theme,
      fontsReady().then(async () => {
        const items = [];
        let quiet = await idle();
        for (const [groupIndex, group] of groups.entries()) {
          const tools = [...group.tools, ...(extras[groupIndex] ?? [])];
          for (const [toolIndex, [name, icon]] of tools.entries()) {
            if (quiet.timeRemaining() < 6) quiet = await idle();
            items.push({
              image: drawCard(
                { name, icon: icon === 'check' || !icon ? CHECK : icon, group: group.name, groupIndex, toolIndex, toolCount: tools.length },
                colours,
                dark
              ),
              text: name,
              description: notes[name] ?? `${group.name}: ${group.description}`,
            });
          }
        }
        // The JPEG encodes run in parallel in the background; wait for them all.
        return Promise.all(items.map(async item => ({ ...item, image: await item.image })));
      })
    );
  }
  return cache.get(theme);
}
