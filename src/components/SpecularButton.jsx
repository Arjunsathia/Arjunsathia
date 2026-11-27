import React, { useEffect, useRef } from 'react';

import './SpecularButton.css';

// A thin streak of light that runs around a button's edge and turns towards the pointer as it comes near.
// Adapted from React Bits' SpecularButton (JS + CSS).
//
// <SpecularLight/> adds the light to any existing button or link: put it inside the element. It takes the
// element's corner radius, and its colours from the CSS variables --spec-line (the streak) and --spec-base
// (the faint hairline), so each button style (and its hover) can set its own. Props override them.
// A WebGL canvas only exists while the button is on screen, so a page with many buttons never runs into the
// browser's limit on WebGL contexts. On screens up to `hideBelow` px wide (700, phones) there is no light at all.
//
// <SpecularButton> is the original stand-alone glass button, built on the same light.

const PAD = 24;
const TAU = Math.PI * 2;

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uRadius;
uniform float uPx;
uniform float uSpot;
uniform vec2 uEntry;
uniform vec4 uLineColor;
uniform vec4 uBaseColor;
uniform float uIntensity;
uniform vec2 uWindow;
uniform float uThickness;
uniform float uGlow;
out vec4 outColor;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float loopPosition(vec2 p, vec2 b, float r) {
  vec2 inner = b - r;
  float arc = 1.5707963 * r;
  float quarter = inner.x + inner.y + arc;
  vec2 a = abs(p);
  vec2 q = a - inner;
  float s = q.x > 0.0 && q.y > 0.0
    ? inner.y + atan(q.y, q.x) * r
    : (q.x > q.y ? min(a.y, inner.y) : inner.y + arc + inner.x - min(a.x, inner.x));
  if (p.x < 0.0) s = p.y >= 0.0 ? 2.0 * quarter - s : 2.0 * quarter + s;
  else if (p.y < 0.0) s = 4.0 * quarter - s;
  return s / max(4.0 * quarter, 0.0001);
}

float lobe(float position, float center) {
  float gap = abs(fract(position - center + 0.5) - 0.5);
  return 1.0 - smoothstep(uWindow.x, uWindow.x + uWindow.y, gap);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = roundedBox(p, uHalf, uRadius);
  float position = loopPosition(p, uHalf, uRadius);
  float key = lobe(position, uSpot);
  float back = lobe(position, uSpot + 0.5);
  float streak = key + back * 0.45;
  float width = max(uThickness * uPx * mix(1.0, max(key, back), 0.6), 0.35);
  float band = smoothstep(-width - 0.6, -width + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float hair = smoothstep(-uPx - 0.6, -uPx + 0.6, d) * (1.0 - smoothstep(-0.6, 0.6, d));
  float inside = 1.0 - smoothstep(-0.6, 0.6, d);
  vec2 pool = (p - uEntry) / (uHalf.y * vec2(1.6, 1.1));
  float glow = streak * 0.2 * exp(-abs(d + width * 0.5) / (5.0 * uPx)) + inside * 0.08 * exp(-dot(pool, pool));
  float light = clamp((band * streak + glow * uGlow) * uIntensity, 0.0, 1.0) * uLineColor.a;
  vec4 base = vec4(uBaseColor.rgb, 1.0) * uBaseColor.a * hair * 0.6;
  outColor = vec4(uLineColor.rgb, 1.0) * light + base * (1.0 - light);
}`;

const UNIFORMS = [
  'uCenter',
  'uHalf',
  'uRadius',
  'uPx',
  'uSpot',
  'uEntry',
  'uLineColor',
  'uBaseColor',
  'uIntensity',
  'uWindow',
  'uThickness',
  'uGlow'
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const wrap = value => value - Math.floor(value);

const loopPosition = (x, y, halfX, halfY, r) => {
  const innerX = halfX - r;
  const innerY = halfY - r;
  const arc = (Math.PI / 2) * r;
  const quarter = innerX + innerY + arc;
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  const qx = ax - innerX;
  const qy = ay - innerY;
  let s;
  if (qx > 0 && qy > 0) s = innerY + Math.atan2(qy, qx) * r;
  else if (qx > qy) s = Math.min(ay, innerY);
  else s = innerY + arc + innerX - Math.min(ax, innerX);
  if (x < 0) s = y >= 0 ? 2 * quarter - s : 2 * quarter + s;
  else if (y < 0) s = 4 * quarter - s;
  return wrap(s / Math.max(4 * quarter, 0.0001));
};

const rimPoint = (position, halfX, halfY, r) => {
  const innerX = halfX - r;
  const innerY = halfY - r;
  const arc = (Math.PI / 2) * r;
  const quarter = innerX + innerY + arc;
  let s = wrap(position) * 4 * quarter;
  let signX = 1;
  let signY = 1;
  if (s > 3 * quarter) {
    s = 4 * quarter - s;
    signY = -1;
  } else if (s > 2 * quarter) {
    s -= 2 * quarter;
    signX = -1;
    signY = -1;
  } else if (s > quarter) {
    s = 2 * quarter - s;
    signX = -1;
  }
  let x = innerX - (s - innerY - arc);
  let y = halfY;
  if (s <= innerY) {
    x = halfX;
    y = s;
  } else if (s <= innerY + arc) {
    const angle = (s - innerY) / Math.max(r, 0.0001);
    x = innerX + Math.cos(angle) * r;
    y = innerY + Math.sin(angle) * r;
  }
  return [x * signX, y * signY];
};

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const link = gl => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
};

// Reads any CSS colour (including var() results and rgb with alpha) as [r, g, b, a] from 0 to 1.
const probe = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d', { willReadFrequently: true }) : null;
const colorCache = new Map();
const toRgba = value => {
  const text = String(value || '').trim();
  if (!text || text === 'transparent') return [0, 0, 0, 0];
  if (colorCache.has(text)) return colorCache.get(text);
  let rgba = [1, 1, 1, 1];
  if (probe) {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = '#000000';
    probe.fillStyle = text;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
    rgba = a ? [r / a, g / a, b / a, a / 255] : [0, 0, 0, 0];
  }
  colorCache.set(text, rgba);
  return rgba;
};

// The colour an element is filled with: its background colour, else the first colour of its background
// gradient, else (for see-through elements) whatever is behind it.
const surface = (element, computed = getComputedStyle(element)) => {
  for (let node = element, style = computed, depth = 0; node && depth < 8; depth++) {
    const fill = toRgba(style.backgroundColor);
    if (fill[3] > 0.5) return fill;
    const stop = /rgba?\([^)]*\)|#[0-9a-f]{3,8}\b/i.exec(style.backgroundImage || '');
    if (stop) {
      const first = toRgba(stop[0]);
      if (first[3] > 0.5) return first;
    }
    node = node.parentElement;
    if (node) style = getComputedStyle(node);
  }
  return toRgba(getComputedStyle(document.body).backgroundColor);
};

// Every light shares one pointer listener.
const pointer = { x: 0, y: 0, known: false };
const listeners = new Set();
let listening = false;
const notify = () => listeners.forEach(wake => wake());
const onPointerMove = event => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.known = true;
  notify();
};
const onPointerEnd = event => {
  if (event.pointerType === 'mouse') return;
  pointer.known = false;
  notify();
};
const onPointerLeave = () => {
  pointer.known = false;
  notify();
};
const listen = wake => {
  listeners.add(wake);
  if (!listening) {
    listening = true;
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerEnd, { passive: true });
    window.addEventListener('pointercancel', onPointerEnd, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
  }
  return () => {
    listeners.delete(wake);
    if (listening && !listeners.size) {
      listening = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    }
  };
};

export function SpecularLight({
  radius,
  lineColor,
  baseColor,
  intensity = 1,
  idleIntensity = 0.35,
  shineSize = 10,
  shineFade = 34,
  thickness = 1.2,
  glow = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  hideBelow = 700
}) {
  const layerRef = useRef(null);
  const wakeRef = useRef(null);
  const settings = {
    hideBelow,
    radius,
    lineColor,
    baseColor,
    intensity: Math.max(0, intensity),
    idleIntensity: clamp(idleIntensity, 0, 1),
    shineSize: Math.max(0, shineSize),
    shineFade: Math.max(0, shineFade),
    thickness: Math.max(0, thickness),
    glow: Math.max(0, glow),
    speed,
    followMouse,
    proximity: Math.max(1, proximity),
    autoAnimate,
    disabled
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const layer = layerRef.current;
    const host = layer?.parentElement;
    if (!layer || !host) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const view = { width: 1, height: 1, ratio: 1, radius: 0 };
    const state = { spot: 0, level: 0, press: 0, ready: false };
    let gpu = null;
    let raf = 0;
    let last = 0;
    let visible = false;
    let follow = 0;
    // Making a WebGL context can take a few hundred milliseconds, so it waits until the button has been on screen a
    // moment and the browser is idle: it never freezes a scroll or an opening dialog.
    let warm = false;
    let warming = 0;
    const warmUp = () => {
      if (warm || warming) return;
      warming = window.setTimeout(() => {
        const go = () => {
          warming = 0;
          warm = true;
          wake();
        };
        if (window.requestIdleCallback) warming = window.requestIdleCallback(go, { timeout: 1500 });
        else go();
      }, 700);
    };

    // The canvas and its WebGL context are made when the button comes on screen and thrown away when it leaves.
    const open = () => {
      if (gpu) return gpu;
      const canvas = document.createElement('canvas');
      canvas.className = 'specular-light__canvas';
      const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
      const program = gl && link(gl);
      if (!gl || !program) return null;
      const uniforms = {};
      for (const name of UNIFORMS) uniforms[name] = gl.getUniformLocation(program, name);
      const buffer = gl.createBuffer();
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        close();
      });
      layer.appendChild(canvas);
      gpu = { canvas, gl, program, uniforms, buffer, vao };
      size();
      return gpu;
    };

    const close = () => {
      if (!gpu) return;
      const { canvas, gl, program, buffer, vao } = gpu;
      gpu = null;
      if (!gl.isContextLost()) {
        gl.deleteBuffer(buffer);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(program);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
      canvas.remove();
    };

    const size = () => {
      view.width = Math.max(1, host.offsetWidth);
      view.height = Math.max(1, host.offsetHeight);
      view.ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (!gpu) return;
      const width = Math.max(1, Math.round((view.width + PAD * 2) * view.ratio));
      const height = Math.max(1, Math.round((view.height + PAD * 2) * view.ratio));
      if (gpu.canvas.width !== width) gpu.canvas.width = width;
      if (gpu.canvas.height !== height) gpu.canvas.height = height;
    };

    const look = s => {
      const computed = getComputedStyle(host);
      const corner = s.radius ?? parseFloat(computed.borderTopLeftRadius);
      view.radius = Math.min(Math.max(0, corner || 0), view.width / 2, view.height / 2);
      const explicit = computed.getPropertyValue('--spec-line').trim();
      return {
        line: s.lineColor ? toRgba(s.lineColor) : explicit ? toRgba(explicit) : autoLine(computed),
        base: toRgba(s.baseColor ?? (computed.getPropertyValue('--spec-base').trim() || 'transparent'))
      };
    };

    // No colour given: the streak contrasts with whatever the button is filled with right now (hover included).
    // Light fills get --spec-ink (dark ink), dark fills get --spec-glow (the theme's accent).
    const autoLine = computed => {
      const fill = surface(host, computed);
      const light = 0.2126 * fill[0] + 0.7152 * fill[1] + 0.0722 * fill[2] > 0.5;
      const pick = light ? computed.getPropertyValue('--spec-ink') : computed.getPropertyValue('--spec-glow') || computed.getPropertyValue('--accent');
      return toRgba(pick.trim() || (light ? '#13170d' : '#ffffff'));
    };

    const restSpot = () => {
      const r = view.radius;
      const inset = r * (1 - Math.SQRT1_2);
      return loopPosition(inset - view.width / 2, view.height / 2 - inset, view.width / 2, view.height / 2, r);
    };

    const aim = s => {
      if (!s.followMouse || s.disabled || !pointer.known) return null;
      const rect = host.getBoundingClientRect();
      const scale = rect.width / view.width || 1;
      const halfX = view.width / 2;
      const halfY = view.height / 2;
      const x = (pointer.x - rect.left - rect.width / 2) / scale;
      const y = (rect.top + rect.height / 2 - pointer.y) / scale;
      const distance = Math.hypot(Math.max(Math.abs(x) - halfX, 0), Math.max(Math.abs(y) - halfY, 0));
      const t = clamp(1 - distance / s.proximity, 0, 1);
      const near = t * t * (3 - 2 * t);
      const nearest = loopPosition(x, y, halfX, halfY, view.radius);
      if (distance > 0) return { spot: nearest, near };
      const depth = clamp(Math.min(halfX - Math.abs(x), halfY - Math.abs(y)) / (halfY * 0.8), 0, 1);
      const sway = restSpot() - (x / halfX) * 0.06 - (y / halfY) * 0.02;
      const offset = sway - nearest - Math.round(sway - nearest);
      return { spot: wrap(nearest + offset * depth * depth * (3 - 2 * depth)), near };
    };

    const draw = (s, colors) => {
      if (!gpu) return;
      const { canvas, gl, program, uniforms, vao } = gpu;
      const { width, height } = view;
      const scaleX = canvas.width / (width + PAD * 2);
      const scaleY = canvas.height / (height + PAD * 2);
      const r = view.radius;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(uniforms.uCenter, (PAD + width / 2) * scaleX, (PAD + height / 2) * scaleY);
      gl.uniform2f(uniforms.uHalf, (width / 2) * scaleX, (height / 2) * scaleY);
      gl.uniform1f(uniforms.uRadius, r * scaleX);
      gl.uniform1f(uniforms.uPx, view.ratio);
      const [rimX, rimY] = rimPoint(state.spot, width / 2, height / 2, r);
      const pull = 1 - Math.min(0.35 * (height / 2), Math.hypot(rimX, rimY)) / Math.max(Math.hypot(rimX, rimY), 0.0001);
      gl.uniform1f(uniforms.uSpot, state.spot);
      gl.uniform2f(uniforms.uEntry, rimX * pull * scaleX, rimY * pull * scaleY);
      gl.uniform4fv(uniforms.uLineColor, colors.line);
      gl.uniform4fv(uniforms.uBaseColor, colors.base);
      gl.uniform1f(uniforms.uIntensity, s.intensity * (state.level + state.press * 0.8));
      gl.uniform2f(uniforms.uWindow, s.shineSize / 360 + state.press * 0.06, s.shineFade / 360 + 0.0001);
      gl.uniform1f(uniforms.uThickness, s.thickness);
      gl.uniform1f(uniforms.uGlow, s.glow);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindVertexArray(null);
    };

    const frame = now => {
      raf = 0;
      if (!visible) return;
      if (!gpu && !warm) {
        warmUp();
        return;
      }
      if (!open()) return;
      const s = settingsRef.current;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const colors = look(s);
      const target = aim(s);
      const spinning = s.autoAnimate && !reduce;
      const steering = !!target && target.near > 0;
      if (!state.ready) {
        state.spot = restSpot();
        state.level = s.autoAnimate ? 1 : s.idleIntensity;
        state.ready = true;
      }
      let diff = 0;
      if (spinning && !steering) state.spot = wrap(state.spot + (s.speed / TAU) * dt);
      else {
        diff = (steering ? target.spot : restSpot()) - state.spot;
        diff -= Math.round(diff);
        state.spot = wrap(state.spot + diff * (1 - Math.exp(-dt * 8)));
      }
      const level = s.autoAnimate ? 1 : s.idleIntensity + (1 - s.idleIntensity) * (target ? target.near : 0);
      state.level += (level - state.level) * (1 - Math.exp(-dt * 7));
      state.press *= Math.exp(-dt * 5);
      draw(s, colors);
      const settling = Math.abs(diff) > 0.0002 || Math.abs(level - state.level) > 0.001 || state.press > 0.002 || now < follow;
      if (settling || (spinning && !steering)) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };

    const onPress = () => {
      if (!settingsRef.current.disabled) state.press = 1;
      wake();
    };
    // Hover and focus can change the button's colours, so the light is redrawn with them.
    const onChange = () => {
      follow = performance.now() + 450;
      wake();
    };

    const resizeObserver = new ResizeObserver(() => {
      size();
      wake();
    });
    resizeObserver.observe(host);
    // The light runs only while the button is on screen, and never on phone-sized screens (`hideBelow`), where the
    // buttons stay exactly as they were.
    const small = window.matchMedia(`(max-width: ${settingsRef.current.hideBelow}px)`);
    let onScreen = false;
    // Throwing a WebGL context away can stall the page for a moment, so a button that scrolls off screen keeps its
    // context until the scrolling has stopped and the browser is idle; if it comes back on screen first, it keeps it.
    let releasing = 0;
    const cancelRelease = () => { window.clearTimeout(releasing); window.cancelIdleCallback?.(releasing); releasing = 0; };
    const releaseLater = () => {
      cancelRelease();
      releasing = window.setTimeout(function wait() {
        if (document.documentElement.classList.contains('is-scrolling')) { releasing = window.setTimeout(wait, 600); return; }
        const go = () => { releasing = 0; if (!visible) close(); };
        if (window.requestIdleCallback) releasing = window.requestIdleCallback(go, { timeout: 3000 });
        else go();
      }, 1200);
    };
    const refresh = () => {
      visible = onScreen && !small.matches;
      if (visible) {
        cancelRelease();
        last = 0;
        wake();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
        if (small.matches) close();
        else releaseLater();
      }
    };
    const intersection = new IntersectionObserver(
      entries => {
        onScreen = entries.some(entry => entry.isIntersecting);
        refresh();
      },
      { rootMargin: '80px' }
    );
    intersection.observe(host);
    small.addEventListener('change', refresh);
    const unlisten = listen(wake);
    host.addEventListener('pointerdown', onPress);
    host.addEventListener('pointerenter', onChange);
    host.addEventListener('pointerleave', onChange);
    host.addEventListener('focus', onChange);
    host.addEventListener('blur', onChange);
    wakeRef.current = wake;

    return () => {
      cancelAnimationFrame(raf);
      cancelRelease();
      window.clearTimeout(warming);
      window.cancelIdleCallback?.(warming);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      small.removeEventListener('change', refresh);
      unlisten();
      host.removeEventListener('pointerdown', onPress);
      host.removeEventListener('pointerenter', onChange);
      host.removeEventListener('pointerleave', onChange);
      host.removeEventListener('focus', onChange);
      host.removeEventListener('blur', onChange);
      close();
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

  return <span ref={layerRef} className="specular-light" aria-hidden="true" />;
}

const SpecularButton = ({
  children = 'Get Started',
  size = 'lg',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0.04,
  blur = 0,
  textColor = '#f5f5f5',
  lineColor = '#ffffff',
  baseColor = '#525252',
  intensity = 1,
  idleIntensity = 0.35,
  shineSize = 10,
  shineFade = 34,
  thickness = 1.2,
  glow = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  style,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`specular-button specular-button--${size}${className ? ` ${className}` : ''}`}
    style={{
      '--sb-radius': `${radius}px`,
      '--sb-tint': tint,
      '--sb-tint-opacity': tintOpacity,
      '--sb-blur': `${blur}px`,
      '--sb-text-color': textColor,
      ...style
    }}
    {...rest}
  >
    <SpecularLight
      radius={radius}
      lineColor={lineColor}
      baseColor={baseColor}
      intensity={intensity}
      idleIntensity={idleIntensity}
      shineSize={shineSize}
      shineFade={shineFade}
      thickness={thickness}
      glow={glow}
      speed={speed}
      followMouse={followMouse}
      proximity={proximity}
      autoAnimate={autoAnimate}
      disabled={disabled}
    />
    <span className="specular-button__label">{children}</span>
  </button>
);

export default SpecularButton;
