// Builds the animated SVGs used by the profile README. Run: node .github/assets/build.mjs
// Every SVG adapts to light and dark mode on its own (prefers-color-scheme), and uses system fonts only,
// because GitHub shows README images as <img>, which cannot load web fonts.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const SANS = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`;

// GitHub's own Primer colours, light first, then dark.
const style = (extra = '') => `<style>
  .sans{font-family:${SANS}} .mono{font-family:${MONO}}
  .card{fill:#ffffff;stroke:#d0d7de} .inner{fill:#f6f8fa;stroke:#d0d7de} .bar{fill:#f6f8fa}
  .fg{fill:#1f2328} .muted{fill:#59636e} .faint{fill:#818b98} .line{stroke:#d0d7de}
  .blue{fill:#0969da} .purple{fill:#8250df} .green{fill:#1a7f37} .orange{fill:#bc4c00} .pink{fill:#bf3989}
  .s-blue{stroke:#0969da} .s-purple{stroke:#8250df} .s-green{stroke:#1a7f37} .s-muted{stroke:#d0d7de}
  .glow-blue{fill:#54aeff} .glow-purple{fill:#c297ff} .glow-green{fill:#4ac26b}
  .pill{fill:#dafbe1;stroke:#4ac26b} .bubble-in{fill:#ffffff;stroke:#d0d7de} .bubble-out{fill:#1a7f37}
  .on-accent{fill:#ffffff} .grid{stroke:#d0d7de}
  @media (prefers-color-scheme: dark){
    .card{fill:#0d1117;stroke:#30363d} .inner{fill:#161b22;stroke:#30363d} .bar{fill:#161b22}
    .fg{fill:#e6edf3} .muted{fill:#9198a1} .faint{fill:#6e7681} .line{stroke:#30363d}
    .blue{fill:#4493f8} .purple{fill:#ab7df8} .green{fill:#3fb950} .orange{fill:#f0883e} .pink{fill:#db61a2}
    .s-blue{stroke:#4493f8} .s-purple{stroke:#ab7df8} .s-green{stroke:#3fb950} .s-muted{stroke:#30363d}
    .glow-blue{fill:#1f6feb} .glow-purple{fill:#8957e5} .glow-green{fill:#238636}
    .pill{fill:#0f2a1a;stroke:#238636} .bubble-in{fill:#21262d;stroke:#30363d} .bubble-out{fill:#238636}
    .grid{stroke:#21262d}
  }
  ${extra}
</style>`;
const svg = (w, h, title, body, extra) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${style(extra)}${body}</svg>\n`;
const write = (name, content) => { fs.writeFileSync(path.join(out, name), content); console.log('wrote', name); };
// Fade and rise in once, after `begin` seconds.
const enter = (begin, dy = 10) => `<animate attributeName="opacity" from="0" to="1" begin="${begin}s" dur=".6s" fill="freeze"/><animateTransform attributeName="transform" type="translate" from="0 ${dy}" to="0 0" begin="${begin}s" dur=".6s" fill="freeze" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1"/>`;

// ---------- Header ----------
{
  const taglines = ['building production CRMs and fintech platforms', 'integrating WhatsApp Cloud API & MetaTrader 5', 'money and messages that stay correct under load'];
  const cycle = 12, slot = cycle / taglines.length;
  const tags = taglines.map((t, i) => `<text x="72" y="262" class="mono blue" font-size="21" opacity="0"><tspan class="faint">&gt; </tspan>${esc(t)}<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.04;.3;.33;1" dur="${cycle}s" begin="${1 + i * slot}s" repeatCount="indefinite"/></text>`).join('');
  const ring = (r, dur, reverse, nodes) => `<g><circle cx="1000" cy="172" r="${r}" fill="none" class="s-muted" stroke-width="1.5" stroke-dasharray="4 7"/>${nodes.map(([a, c, size]) => { const x = 1000 + r * Math.cos(a * Math.PI / 180), y = 172 + r * Math.sin(a * Math.PI / 180); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size}" fill="${c}"/>`; }).join('')}<animateTransform attributeName="transform" type="rotate" from="${reverse ? 360 : 0} 1000 172" to="${reverse ? 0 : 360} 1000 172" dur="${dur}s" repeatCount="indefinite"/></g>`;
  write('header.svg', svg(1200, 340, 'Arjun Sathia — Full-Stack Developer, CRM and fintech systems', `
  <defs>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="55"/></filter>
    <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" class="grid" stroke-width="1"/></pattern>
    <linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
    <mask id="gridMask"><rect width="1200" height="340" fill="url(#fade)"/></mask>
    <clipPath id="cardClip"><rect x="1" y="1" width="1198" height="338" rx="24"/></clipPath>
  </defs>
  <rect x="1" y="1" width="1198" height="338" rx="24" class="card" stroke-width="1.5"/>
  <g clip-path="url(#cardClip)">
    <rect width="1200" height="340" fill="url(#grid)" mask="url(#gridMask)" opacity=".7"/>
    <g filter="url(#blur)" opacity=".55">
      <circle r="120" class="glow-blue" cx="960" cy="90"><animate attributeName="cx" values="960;1040;960" dur="14s" repeatCount="indefinite"/><animate attributeName="cy" values="90;150;90" dur="11s" repeatCount="indefinite"/></circle>
      <circle r="110" class="glow-purple" cx="1060" cy="280"><animate attributeName="cx" values="1060;960;1060" dur="16s" repeatCount="indefinite"/></circle>
      <circle r="90" class="glow-green" cx="760" cy="300"><animate attributeName="cy" values="300;250;300" dur="12s" repeatCount="indefinite"/></circle>
    </g>
  </g>
  <g opacity="0">${enter(0)}
    <rect x="72" y="44" width="176" height="34" rx="17" class="pill" stroke-width="1"/>
    <circle cx="94" cy="61" r="5" class="green"><animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;.45;1" dur="2s" repeatCount="indefinite"/></circle>
    <text x="108" y="66" class="sans green" font-size="15" font-weight="600">Open to work</text>
  </g>
  <g opacity="0">${enter(.15, 14)}<text x="70" y="160" class="sans fg" font-size="78" font-weight="700" letter-spacing="-2">Arjun Sathia</text></g>
  <g opacity="0">${enter(.3)}<text x="72" y="206" class="sans muted" font-size="26">Full-Stack Developer <tspan class="faint">·</tspan> CRM &amp; Fintech Systems</text></g>
  ${tags}
  <g opacity="0">${enter(.5)}<text x="72" y="306" class="mono faint" font-size="17">Kozhikode, India  ·  React · Next.js · Node.js · PostgreSQL · MongoDB</text></g>
  <g opacity="0">${enter(.4, 0)}
    ${ring(132, 40, true, [[20, '#f0883e', 6], [110, '#3fb950', 7], [200, '#db61a2', 5], [290, '#4493f8', 6]])}
    ${ring(88, 24, false, [[0, '#61dafb', 8], [120, '#ab7df8', 7], [240, '#47a248', 8]])}
    <circle cx="1000" cy="172" r="46" class="inner" stroke-width="1.5"/>
    <text x="1000" y="181" text-anchor="middle" class="mono blue" font-size="26" font-weight="700">&lt;/&gt;</text>
  </g>`));
}

// ---------- Section titles: typed in, with a blinking cursor and a rule that draws across ----------
const sections = [['about', '01', 'about_me', 'who I am'], ['highlights', '02', 'highlights', 'numbers that matter'], ['stack', '03', 'tech_stack', 'tools I ship with'], ['work', '04', 'featured_work', 'things I have built'], ['experience', '05', 'experience', 'where I have worked'], ['activity', '06', 'github_activity', 'live from GitHub']];
for (const [file, num, name, note] of sections) {
  const label = `> ${name}`, cw = 18, x0 = 46, w = label.length * cw;
  const steps = Array.from({length: label.length + 1}, (_, i) => i * cw).join(';');
  write(`title-${file}.svg`, svg(900, 72, `${name.replace('_', ' ')} — ${note}`, `
  <defs><clipPath id="type"><rect x="${x0}" y="0" width="0" height="60"><animate attributeName="width" values="${steps}" dur="${(label.length * 0.07).toFixed(2)}s" begin=".2s" fill="freeze" calcMode="discrete"/></rect></clipPath>
  <linearGradient id="rule" x1="0" x2="1"><stop offset="0" stop-color="#4493f8"/><stop offset=".5" stop-color="#ab7df8" stop-opacity=".7"/><stop offset="1" stop-color="#ab7df8" stop-opacity="0"/></linearGradient></defs>
  <text x="0" y="40" class="mono faint" font-size="15">${num}</text>
  <text x="${x0}" y="42" class="mono blue" font-size="30" font-weight="700" textLength="${w}" lengthAdjust="spacingAndGlyphs" clip-path="url(#type)">${esc(label)}</text>
  <rect x="${x0 + w + 6}" y="17" width="13" height="30" class="blue" opacity="0"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1s" begin=".2s" repeatCount="indefinite"/></rect>
  <text x="900" y="40" text-anchor="end" class="mono faint" font-size="15" opacity="0">// ${esc(note)}<animate attributeName="opacity" from="0" to="1" begin="${(0.3 + label.length * 0.07).toFixed(2)}s" dur=".5s" fill="freeze"/></text>
  <rect x="0" y="64" height="2" width="0" rx="1" fill="url(#rule)"><animate attributeName="width" from="0" to="900" begin=".2s" dur="1.2s" fill="freeze" calcMode="spline" keySplines=".2 .8 .2 1" keyTimes="0;1"/></rect>`));
}

// ---------- About: a terminal that types its answers ----------
{
  const rows = [
    ['cmd', 'whoami'], ['out', [['fg', 'Arjun Sathia'], ['muted', ' · Full-Stack Developer @ '], ['blue', 'Wisbato'], ['muted', ', Kozhikode']]],
    ['cmd', 'cat building.txt'], ['out', [['muted', 'WhatsApp CRM for '], ['fg', '3 client companies'], ['muted', ' · '], ['purple', 'HighCRM'], ['muted', ' on MetaTrader 5']]],
    ['cmd', 'cat focus.txt'], ['out', [['muted', 'transactions, idempotent jobs & rate limits — '], ['fg', 'money and messages stay correct']]],
    ['cmd', 'npm test'], ['out', [['green', '✓ 300+ automated tests passing'], ['muted', ' across my main projects']]],
    ['cmd', 'cat path.txt'], ['out', [['muted', 'B.Com graduate → full-stack engineer · '], ['fg', 'Luminar Technolab'], ['muted', ' · '], ['fg', 'IBM Full Stack']]],
    ['cmd', 'status --availability'], ['out', [['green', '● open'], ['muted', ' to full-time roles & freelance projects']]],
  ];
  const top = 92, step = 31, H = top + rows.length * step + 44;
  const body = rows.map(([kind, content], i) => {
    const y = top + i * step, begin = (0.4 + i * 0.32).toFixed(2);
    const line = kind === 'cmd'
      ? `<text x="34" y="${y}" class="mono" font-size="17"><tspan class="green" font-weight="700">➜ </tspan><tspan class="blue">~ </tspan><tspan class="fg">${esc(content)}</tspan></text>`
      : `<text x="58" y="${y}" class="mono" font-size="17">${content.map(([c, t]) => `<tspan class="${c}">${esc(t)}</tspan>`).join('')}</text>`;
    return `<g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="${begin}s" dur=".25s" fill="freeze"/>${line}</g>`;
  }).join('');
  const lastY = top + rows.length * step, lastBegin = (0.4 + rows.length * 0.32).toFixed(2);
  write('about-terminal.svg', svg(1000, H, 'About Arjun: Full-Stack Developer at Wisbato, building a WhatsApp CRM for 3 client companies and HighCRM on MetaTrader 5; focused on transactions, idempotent jobs and rate limits; 300+ automated tests; B.Com graduate turned engineer; open to full-time and freelance work.', `
  <rect x="1" y="1" width="998" height="${H - 2}" rx="16" class="card" stroke-width="1.5"/>
  <path d="M1 17a16 16 0 0 1 16-16h966a16 16 0 0 1 16 16v29H1Z" class="bar"/>
  <line x1="1" y1="46" x2="999" y2="46" class="line" stroke-width="1"/>
  <circle cx="26" cy="24" r="7" fill="#ff5f57"/><circle cx="48" cy="24" r="7" fill="#febc2e"/><circle cx="70" cy="24" r="7" fill="#28c840"/>
  <text x="500" y="29" text-anchor="middle" class="mono faint" font-size="14">arjun@wisbato: ~</text>
  ${body}
  <g opacity="0"><animate attributeName="opacity" from="0" to="1" begin="${lastBegin}s" dur=".25s" fill="freeze"/>
    <text x="34" y="${lastY}" class="mono" font-size="17"><tspan class="green" font-weight="700">➜ </tspan><tspan class="blue">~ </tspan></text>
    <rect x="80" y="${lastY - 15}" width="10" height="19" class="fg"><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1s" repeatCount="indefinite"/></rect>
  </g>`));
}

// ---------- Highlights: five stat cards that rise in one after another ----------
{
  const stats = [['300+', 'automated tests', 'across main projects', 'blue'], ['3', 'client companies', 'on the WhatsApp CRM', 'green'], ['~37 KB', 'planner payload', 'down from ~320 KB', 'purple'], ['12 × 7', 'permission matrix', 'modules × actions', 'orange'], ['60+', 'SQL migrations', 'RLS, RPCs, guards', 'pink']];
  const w = 184, gap = 20;
  write('highlights.svg', svg(1000, 160, 'Highlights: 300+ automated tests; 3 client companies; planner payload cut from about 320 KB to about 37 KB; 12 by 7 permission matrix; 60+ SQL migrations.', stats.map(([n, a, b, c], i) => {
    const x = i * (w + gap);
    return `<g opacity="0">${enter(0.15 + i * 0.12, 16)}
    <rect x="${x + 1}" y="1" width="${w - 2}" height="156" rx="14" class="card" stroke-width="1.5"/>
    <rect x="${x + 20}" y="1" width="0" height="3" rx="1.5" class="${c}"><animate attributeName="width" from="0" to="44" begin="${(0.5 + i * 0.12).toFixed(2)}s" dur=".6s" fill="freeze"/></rect>
    <text x="${x + 20}" y="72" class="sans ${c}" font-size="38" font-weight="700" letter-spacing="-1">${esc(n)}</text>
    <text x="${x + 20}" y="106" class="sans fg" font-size="15" font-weight="600">${esc(a)}</text>
    <text x="${x + 20}" y="130" class="sans muted" font-size="13">${esc(b)}</text></g>`;
  }).join('')));
}

// ---------- Project banners, each with its own small live animation ----------
const banner = (file, {tag, name, subtitle, stack, color, glow, art, title}) => write(file, svg(1000, 230, title, `
  <defs><filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="50"/></filter><clipPath id="clip"><rect x="1" y="1" width="998" height="228" rx="18"/></clipPath></defs>
  <rect x="1" y="1" width="998" height="228" rx="18" class="card" stroke-width="1.5"/>
  <g clip-path="url(#clip)"><circle cx="820" cy="40" r="140" class="${glow}" opacity=".35" filter="url(#blur)"><animate attributeName="cx" values="820;900;820" dur="12s" repeatCount="indefinite"/></circle></g>
  <g opacity="0">${enter(0)}
    <circle cx="44" cy="54" r="5" class="${color}"/>
    <text x="58" y="59" class="mono muted" font-size="14" letter-spacing="1">${esc(tag)}</text>
    <text x="38" y="124" class="sans fg" font-size="54" font-weight="700" letter-spacing="-1.5">${esc(name)}</text>
    <text x="40" y="160" class="sans muted" font-size="20">${esc(subtitle)}</text>
    <text x="40" y="198" class="mono ${color}" font-size="14">${esc(stack)}</text>
  </g>
  <g opacity="0">${enter(.25, 0)}<rect x="640" y="30" width="330" height="170" rx="14" class="inner" stroke-width="1.5"/>${art}</g>`));

{ // NexChain: a price line that draws itself on a loop
  const pts = [[0, .35], [.07, .42], [.14, .38], [.21, .5], [.28, .46], [.35, .58], [.42, .54], [.5, .63], [.57, .57], [.64, .7], [.71, .66], [.78, .76], [.85, .72], [.92, .84], [1, .8]].map(([a, b]) => [664 + a * 282, 182 - b * 112]);
  const d = 'M' + pts.map(p => p.map(n => n.toFixed(1)).join(' ')).join(' L');
  const end = pts[pts.length - 1];
  banner('project-nexchain.svg', {tag: 'PERSONAL PROJECT · LIVE DEMO', name: 'NexChain', subtitle: 'Crypto paper-trading platform on live Binance prices', stack: 'React 19 · Express 5 · MongoDB · WebSockets', color: 'blue', glow: 'glow-blue', title: 'NexChain — crypto paper-trading platform', art: `
    <text x="660" y="60" class="mono fg" font-size="14" font-weight="700">BTC/USDT</text>
    <text x="950" y="60" text-anchor="end" class="mono green" font-size="14" font-weight="700">+2.4%</text>
    <path d="${d} L946 186 L664 186 Z" class="blue" opacity=".1"/>
    <path d="${d}" fill="none" class="s-blue" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="460" stroke-dashoffset="460"><animate attributeName="stroke-dashoffset" values="460;0;0" keyTimes="0;.55;1" dur="5s" repeatCount="indefinite"/></path>
    <circle cx="${end[0].toFixed(1)}" cy="${end[1].toFixed(1)}" r="5" class="blue"><animate attributeName="r" values="4;8;4" dur="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.5;.55;1" dur="5s" repeatCount="indefinite"/></circle>`});
}
{ // HighCRM: deposit bars that keep moving, and a live MT5 status
  const base = 184, bars = [[.45, .6, .5], [.62, .48, .66], [.52, .7, .58], [.75, .6, .8], [.66, .82, .7], [.88, .72, .92], [.8, .9, .85]];
  const art = bars.map((v, i) => { const x = 664 + i * 42, hs = v.map(n => (n * 100).toFixed(0)); const vals = [...hs, hs[0]]; return `<rect x="${x}" width="26" rx="5" class="${i === bars.length - 1 ? 'purple' : 'purple'}" opacity="${(0.45 + i * 0.08).toFixed(2)}" y="${base - hs[0]}" height="${hs[0]}"><animate attributeName="height" values="${vals.join(';')}" dur="6s" repeatCount="indefinite" calcMode="spline" keySplines="${Array(3).fill('.4 0 .2 1').join(';')}" keyTimes="0;.33;.66;1"/><animate attributeName="y" values="${vals.map(h => base - h).join(';')}" dur="6s" repeatCount="indefinite" calcMode="spline" keySplines="${Array(3).fill('.4 0 .2 1').join(';')}" keyTimes="0;.33;.66;1"/></rect>`; }).join('');
  banner('project-highcrm.svg', {tag: 'CLIENT PROJECT · WISBATO · IN PRODUCTION', name: 'HighCRM', subtitle: 'Forex brokerage CRM & client portal on MetaTrader 5', stack: 'React 19 · Node.js · PostgreSQL · Socket.IO', color: 'purple', glow: 'glow-purple', title: 'HighCRM — forex brokerage CRM and client portal', art: `
    <text x="660" y="60" class="mono fg" font-size="14" font-weight="700">Deposits</text>
    <circle cx="884" cy="55" r="4" class="green"><animate attributeName="opacity" values="1;.3;1" dur="1.6s" repeatCount="indefinite"/></circle>
    <text x="950" y="60" text-anchor="end" class="mono green" font-size="13" font-weight="700">MT5 LIVE</text>
    ${art}`});
}
{ // WhatsApp CRM: a class reminder, an attendance code and the reply, on a loop
  const bubble = (i, x, y, w, text, out) => { const a = 0.08 + i * 0.16; return `<g opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${a.toFixed(2)};${(a + .05).toFixed(2)};.9;1" dur="7s" repeatCount="indefinite"/><rect x="${x}" y="${y}" width="${w}" height="32" rx="12" class="${out ? 'bubble-out' : 'bubble-in'}" stroke-width="1"/><text x="${x + 14}" y="${y + 21}" class="sans ${out ? 'on-accent' : 'fg'}" font-size="14"${out ? ' font-weight="600"' : ''}>${esc(text)}</text></g>`; };
  banner('project-whatsapp-crm.svg', {tag: 'CLIENT PROJECT · WISBATO · 3 COMPANIES', name: 'WhatsApp CRM', subtitle: 'Business messaging & class automation platform', stack: 'Next.js 16 · TypeScript · Supabase · WhatsApp Cloud API', color: 'green', glow: 'glow-green', title: 'WhatsApp CRM — business messaging and class automation', art: `
    ${bubble(0, 660, 46, 200, 'Class starts at 7:00 PM', false)}
    ${bubble(1, 838, 92, 112, 'NOTES 47', true)}
    ${bubble(2, 660, 138, 250, 'Marked present ✓ Notes sent', false)}`});
}

// ---------- Footer: soft waves and a sign-off ----------
{
  const wave = (y, amp, cls, op, dur) => { const a = `M0 ${y} C 200 ${y - amp} 400 ${y + amp} 600 ${y} S 1000 ${y - amp} 1200 ${y} V 200 H 0 Z`, b = `M0 ${y} C 200 ${y + amp} 400 ${y - amp} 600 ${y} S 1000 ${y + amp} 1200 ${y} V 200 H 0 Z`; return `<path d="${a}" class="${cls}" opacity="${op}"><animate attributeName="d" values="${a};${b};${a}" dur="${dur}s" repeatCount="indefinite"/></path>`; };
  write('footer.svg', svg(1200, 200, 'Thanks for visiting', `
  ${wave(130, 22, 'glow-purple', .18, 9)}${wave(145, 18, 'glow-blue', .25, 7)}${wave(162, 14, 'blue', .35, 11)}
  <text x="600" y="58" text-anchor="middle" class="sans fg" font-size="24" font-weight="600">Thanks for stopping by.</text>
  <text x="600" y="88" text-anchor="middle" class="mono muted" font-size="15">Let's build something reliable together.</text>`));
}
