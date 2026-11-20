// Builds the animated SVGs used by the profile README. Run: node .github/assets/build.mjs
// Every SVG adapts to light and dark mode by itself (prefers-color-scheme) and uses system fonts only,
// because GitHub shows README images as <img>, which cannot load web fonts.
// All canvases are 800 wide with text no smaller than 22px, so they stay readable when a phone
// shrinks them to ~350px.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const SANS = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`;

// GitHub's Primer colours: light first, dark in the media query.
const style = `<style>
  .sans{font-family:${SANS}} .mono{font-family:${MONO}}
  .card{fill:#ffffff;stroke:#d0d7de} .inner{fill:#f6f8fa;stroke:#d0d7de}
  .fg{fill:#1f2328} .muted{fill:#59636e} .faint{fill:#818b98}
  .blue{fill:#0969da} .purple{fill:#8250df} .green{fill:#1a7f37}
  .s-blue{stroke:#0969da} .s-muted{stroke:#d0d7de} .dot{fill:#d0d7de}
  .glow-blue{fill:#54aeff} .glow-purple{fill:#c297ff} .glow-green{fill:#4ac26b}
  .pill{fill:#dafbe1;stroke:#4ac26b} .bubble-in{fill:#ffffff;stroke:#d0d7de} .bubble-out{fill:#1a7f37} .on-accent{fill:#ffffff}
  .stop-a{stop-color:#0969da} .stop-b{stop-color:#8250df}
  @media (prefers-color-scheme: dark){
    .card{fill:#0d1117;stroke:#30363d} .inner{fill:#161b22;stroke:#30363d}
    .fg{fill:#e6edf3} .muted{fill:#9198a1} .faint{fill:#6e7681}
    .blue{fill:#4493f8} .purple{fill:#ab7df8} .green{fill:#3fb950}
    .s-blue{stroke:#4493f8} .s-muted{stroke:#30363d} .dot{fill:#30363d}
    .glow-blue{fill:#1f6feb} .glow-purple{fill:#8957e5} .glow-green{fill:#238636}
    .pill{fill:#0f2a1a;stroke:#238636} .bubble-in{fill:#21262d;stroke:#30363d} .bubble-out{fill:#238636}
    .stop-a{stop-color:#4493f8} .stop-b{stop-color:#ab7df8}
  }
</style>`;
const svg = (w, h, title, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${style}${body}</svg>\n`;
const write = (name, content) => { fs.writeFileSync(path.join(out, name), content); console.log('wrote', name); };
const ease = 'calcMode="spline" keySplines=".16 1 .3 1" keyTimes="0;1"';
// Fade in while rising (or sliding, with dx) into place, once.
const enter = (begin, dy = 14, dx = 0, dur = .8) => `<animate attributeName="opacity" from="0" to="1" begin="${begin}s" dur="${dur}s" fill="freeze"/><animateTransform attributeName="transform" type="translate" from="${dx} ${dy}" to="0 0" begin="${begin}s" dur="${dur}s" fill="freeze" ${ease}/>`;

// ---------- Header: centred, so it reads well at any width ----------
{
  const W = 800, H = 400, cx = W / 2;
  const lines = ['CRM & fintech platforms', 'WhatsApp Cloud API · MetaTrader 5', 'React · Next.js · Node.js · PostgreSQL'];
  const cycle = 9, slot = cycle / lines.length;
  const rotating = lines.map((t, i) => `<g opacity="0"><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.06;.28;.33;1" dur="${cycle}s" begin="${1.4 + i * slot}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 10;0 0;0 0;0 -10;0 -10" keyTimes="0;.06;.28;.33;1" dur="${cycle}s" begin="${1.4 + i * slot}s" repeatCount="indefinite"/><text x="${cx}" y="292" text-anchor="middle" class="mono blue" font-size="24">${esc(t)}</text></g>`).join('');
  write('header.svg', svg(W, H, 'Arjun Sathia — Full-Stack Developer at Wisbato, building CRM and fintech platforms', `
  <defs>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
    <filter id="focus" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="10"><animate attributeName="stdDeviation" from="10" to="0" begin=".2s" dur="1s" fill="freeze" ${ease}/></feGaussianBlur></filter>
    <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" class="dot"/></pattern>
    <radialGradient id="vignette" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <mask id="dotMask"><rect width="${W}" height="${H}" fill="url(#vignette)"/></mask>
    <clipPath id="clip"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28"/></clipPath>
    <linearGradient id="shine" gradientUnits="userSpaceOnUse" x1="-300" y1="0" x2="0" y2="0">
      <stop offset="0" class="stop-a" stop-opacity="0"/><stop offset=".5" class="stop-b" stop-opacity=".9"/><stop offset="1" class="stop-a" stop-opacity="0"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="1400 0" begin="1.4s" dur="4.5s" repeatCount="indefinite"/>
    </linearGradient>
  </defs>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="28" class="card" stroke-width="1.5"/>
  <g clip-path="url(#clip)">
    <rect width="${W}" height="${H}" fill="url(#dots)" mask="url(#dotMask)"/>
    <g filter="url(#soft)" opacity=".5">
      <circle r="130" cx="140" cy="60" class="glow-blue"><animate attributeName="cx" values="140;260;140" dur="16s" repeatCount="indefinite"/></circle>
      <circle r="120" cx="680" cy="340" class="glow-purple"><animate attributeName="cx" values="680;560;680" dur="18s" repeatCount="indefinite"/></circle>
      <circle r="80" cx="700" cy="40" class="glow-green" opacity=".7"><animate attributeName="cy" values="40;90;40" dur="13s" repeatCount="indefinite"/></circle>
    </g>
  </g>
  <g opacity="0">${enter(0, 10)}
    <rect x="${cx - 105}" y="48" width="210" height="44" rx="22" class="pill" stroke-width="1.2"/>
    <circle cx="${cx - 76}" cy="70" r="6" class="green"><animate attributeName="r" values="6;9;6" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;.4;1" dur="2.2s" repeatCount="indefinite"/></circle>
    <text x="${cx + 12}" y="78" text-anchor="middle" class="sans green" font-size="22" font-weight="600">Open to work</text>
  </g>
  <g opacity="0" filter="url(#focus)">${enter(.2, 18)}
    <text x="${cx}" y="188" text-anchor="middle" class="sans fg" font-size="88" font-weight="800" letter-spacing="-2.5">Arjun Sathia</text>
    <text x="${cx}" y="188" text-anchor="middle" class="sans" font-size="88" font-weight="800" letter-spacing="-2.5" fill="url(#shine)">Arjun Sathia</text>
  </g>
  <g opacity="0">${enter(.7, 12)}<text x="${cx}" y="240" text-anchor="middle" class="sans muted" font-size="32" font-weight="500">Full-Stack Developer</text></g>
  ${rotating}
  <g opacity="0">${enter(1.1, 8)}<text x="${cx}" y="352" text-anchor="middle" class="sans faint" font-size="22">Wisbato  ·  Kozhikode, India</text></g>`));
}

// ---------- Section headers: number tile, title sliding in, a rule with a travelling light ----------
const sections = [['about', '01', 'About', 'who I am'], ['stack', '02', 'Tech stack', 'tools I ship with'], ['work', '03', 'Featured work', "things I've built"], ['experience', '04', 'Experience', "where I've worked"], ['activity', '05', 'GitHub activity', 'live from GitHub']];
for (const [file, num, title, note] of sections) {
  write(`title-${file}.svg`, svg(800, 100, `${title} — ${note}`, `
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="stop-a"/><stop offset="1" class="stop-b"/></linearGradient>
    <linearGradient id="rule" x1="0" x2="1"><stop offset="0" class="stop-a"/><stop offset=".6" class="stop-b" stop-opacity=".5"/><stop offset="1" class="stop-b" stop-opacity="0"/></linearGradient>
    <linearGradient id="spark" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>
  <g opacity="0">${enter(0, 0, 0, .6)}
    <rect x="2" y="14" width="64" height="64" rx="18" fill="url(#tile)"/>
    <text x="34" y="56" text-anchor="middle" class="sans on-accent" font-size="26" font-weight="700">${num}</text>
  </g>
  <g opacity="0">${enter(.15, 0, -24)}<text x="88" y="62" class="sans fg" font-size="42" font-weight="700" letter-spacing="-1">${esc(title)}</text></g>
  <g opacity="0">${enter(.45, 0, 16)}<text x="798" y="58" text-anchor="end" class="mono faint" font-size="22">${esc(note)}</text></g>
  <rect x="0" y="94" height="3" width="0" rx="1.5" fill="url(#rule)"><animate attributeName="width" from="0" to="800" begin=".2s" dur="1.4s" fill="freeze" ${ease}/></rect>
  <rect x="-140" y="94" width="140" height="3" fill="url(#spark)" opacity=".7"><animate attributeName="x" values="-140;800;800" keyTimes="0;.45;1" dur="5s" begin="1.6s" repeatCount="indefinite"/></rect>`));
}

// ---------- Project banners: key facts on the left, a small live animation on the right ----------
const banner = (file, {tag, name, subtitle, fact, color, glow, art, title}) => write(file, svg(800, 280, title, `
  <defs><filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="50"/></filter><clipPath id="clip"><rect x="1" y="1" width="798" height="278" rx="24"/></clipPath></defs>
  <rect x="1" y="1" width="798" height="278" rx="24" class="card" stroke-width="1.5"/>
  <g clip-path="url(#clip)"><circle cx="680" cy="60" r="150" class="${glow}" opacity=".35" filter="url(#soft)"><animate attributeName="cx" values="680;740;680" dur="12s" repeatCount="indefinite"/></circle></g>
  <g opacity="0">${enter(0, 0, -16)}
    <circle cx="46" cy="58" r="7" class="${color}"/>
    <text x="64" y="66" class="mono muted" font-size="22">${esc(tag)}</text>
    <text x="38" y="140" class="sans fg" font-size="60" font-weight="800" letter-spacing="-1.8">${esc(name)}</text>
    <text x="40" y="186" class="sans muted" font-size="26">${esc(subtitle)}</text>
    <text x="40" y="234" class="sans ${color}" font-size="24" font-weight="600">${esc(fact)}</text>
  </g>
  <g opacity="0">${enter(.3, 0, 16)}<rect x="520" y="36" width="250" height="208" rx="18" class="inner" stroke-width="1.5"/>${art}</g>`));

{ // WhatsApp CRM: reminder, attendance code and reply, on a loop
  const bubble = (i, x, y, w, text, out) => { const a = 0.08 + i * 0.16; return `<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${a.toFixed(2)};${(a + .05).toFixed(2)};.9;1" dur="7s" repeatCount="indefinite"/><rect x="${x}" y="${y}" width="${w}" height="44" rx="16" class="${out ? 'bubble-out' : 'bubble-in'}" stroke-width="1.2"/><text x="${x + 16}" y="${y + 29}" class="sans ${out ? 'on-accent' : 'fg'}" font-size="20"${out ? ' font-weight="700"' : ''}>${esc(text)}</text></g>`; };
  banner('project-whatsapp-crm.svg', {tag: 'CLIENT · WISBATO', name: 'WhatsApp CRM', subtitle: 'Messaging & class automation', fact: 'Used by 3 client companies', color: 'green', glow: 'glow-green', title: 'WhatsApp CRM — messaging and class automation, used by 3 client companies', art: `
    ${bubble(0, 536, 58, 196, 'Class at 7:00 PM', false)}
    ${bubble(1, 616, 118, 138, 'NOTES 47', true)}
    ${bubble(2, 536, 178, 218, 'Present ✓ notes sent', false)}`});
}
{ // HighCRM: deposit bars that keep moving, and a live MT5 status
  const base = 226, bars = [[.45, .6, .5], [.62, .48, .66], [.52, .7, .58], [.75, .6, .8], [.66, .82, .7], [.88, .72, .92]];
  const spline = Array(3).fill('.4 0 .2 1').join(';');
  const art = bars.map((v, i) => { const x = 542 + i * 37, hs = v.map(n => Math.round(n * 120)); const vals = [...hs, hs[0]]; return `<rect x="${x}" width="26" rx="6" class="purple" opacity="${(0.45 + i * 0.1).toFixed(2)}" y="${base - hs[0]}" height="${hs[0]}"><animate attributeName="height" values="${vals.join(';')}" dur="6s" repeatCount="indefinite" calcMode="spline" keySplines="${spline}" keyTimes="0;.33;.66;1"/><animate attributeName="y" values="${vals.map(h => base - h).join(';')}" dur="6s" repeatCount="indefinite" calcMode="spline" keySplines="${spline}" keyTimes="0;.33;.66;1"/></rect>`; }).join('');
  banner('project-highcrm.svg', {tag: 'CLIENT · IN PRODUCTION', name: 'HighCRM', subtitle: 'Forex brokerage CRM & portal', fact: 'MetaTrader 5 · KYC · funding', color: 'purple', glow: 'glow-purple', title: 'HighCRM — forex brokerage CRM and client portal on MetaTrader 5', art: `
    <circle cx="546" cy="72" r="6" class="green"><animate attributeName="opacity" values="1;.3;1" dur="1.6s" repeatCount="indefinite"/></circle>
    <text x="560" y="79" class="mono green" font-size="20" font-weight="700">MT5 LIVE</text>
    ${art}`});
}
{ // NexChain: a price line that draws itself on a loop
  const pts = [[0, .3], [.08, .4], [.16, .34], [.25, .5], [.33, .45], [.42, .6], [.5, .54], [.58, .66], [.67, .6], [.75, .74], [.83, .68], [.92, .84], [1, .8]].map(([a, b]) => [542 + a * 206, 226 - b * 120]);
  const d = 'M' + pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join(' L'), end = pts[pts.length - 1];
  banner('project-nexchain.svg', {tag: 'PERSONAL · LIVE DEMO', name: 'NexChain', subtitle: 'Crypto paper-trading platform', fact: 'Live Binance prices · $10k balance', color: 'blue', glow: 'glow-blue', title: 'NexChain — crypto paper-trading platform on live Binance prices', art: `
    <text x="540" y="79" class="mono fg" font-size="20" font-weight="700">BTC</text>
    <text x="752" y="79" text-anchor="end" class="mono green" font-size="20" font-weight="700">+2.4%</text>
    <path d="${d} L748 228 L542 228 Z" class="blue" opacity=".1"/>
    <path d="${d}" fill="none" class="s-blue" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="420" stroke-dashoffset="420"><animate attributeName="stroke-dashoffset" values="420;0;0" keyTimes="0;.55;1" dur="5s" repeatCount="indefinite"/></path>
    <circle cx="${end[0].toFixed(1)}" cy="${end[1].toFixed(1)}" r="6" class="blue"><animate attributeName="r" values="5;10;5" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.5;.55;1" dur="5s" repeatCount="indefinite"/></circle>`});
}

// ---------- Footer: soft waves and a sign-off ----------
{
  const wave = (y, amp, cls, op, dur) => { const a = `M0 ${y} C 130 ${y - amp} 270 ${y + amp} 400 ${y} S 670 ${y - amp} 800 ${y} V 220 H 0 Z`, b = `M0 ${y} C 130 ${y + amp} 270 ${y - amp} 400 ${y} S 670 ${y + amp} 800 ${y} V 220 H 0 Z`; return `<path d="${a}" class="${cls}" opacity="${op}"><animate attributeName="d" values="${a};${b};${a}" dur="${dur}s" repeatCount="indefinite"/></path>`; };
  write('footer.svg', svg(800, 220, "Thanks for stopping by. Let's build something reliable together.", `
  ${wave(150, 20, 'glow-purple', .2, 9)}${wave(166, 16, 'glow-blue', .28, 7)}${wave(184, 12, 'blue', .38, 11)}
  <g opacity="0">${enter(.1)}<text x="400" y="62" text-anchor="middle" class="sans fg" font-size="34" font-weight="700" letter-spacing="-.5">Thanks for stopping by.</text></g>
  <g opacity="0">${enter(.35)}<text x="400" y="104" text-anchor="middle" class="mono muted" font-size="22">Let's build something reliable together.</text></g>`));
}
