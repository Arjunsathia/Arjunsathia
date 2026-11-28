// The site's theme: 'light' or 'dark'. The small script in index.html applies it before the first paint.
// The site opens in light mode, whatever the device setting. A visitor's own choice is saved and wins.

export const THEME_KEY = 'theme';
const BAR_COLOR = {light: '#f6f0e8', dark: '#0a0c09'};

const isTheme = value => value === 'light' || value === 'dark';
export const resolveTheme = saved => isTheme(saved) ? saved : 'light';

export const readSaved = storage => {
  try { return storage.getItem(THEME_KEY); } catch { return null; }
};
export const writeSaved = (storage, theme) => {
  try { storage.setItem(THEME_KEY, theme); return true; } catch { return false; }
};

export function createThemeStore({root, storage, addStorageListener = () => {}, barColor = () => {}}) {
  const listeners = new Set();
  let theme = resolveTheme(readSaved(storage));
  const apply = next => {
    const changed = next !== theme;
    theme = next;
    root.dataset.theme = next;
    barColor(BAR_COLOR[next]);
    if (changed) listeners.forEach(listener => listener());
  };
  apply(theme);
  addStorageListener(event => { if (event.key === THEME_KEY) apply(resolveTheme(event.newValue)); });
  return {
    get: () => theme,
    set: next => { writeSaved(storage, next); apply(next); },
    toggle() { this.set(theme === 'dark' ? 'light' : 'dark'); },
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
  };
}

let store;
const browserStore = () => store ??= createThemeStore({
  root: document.documentElement,
  storage: window.localStorage,
  addStorageListener: listener => window.addEventListener('storage', listener),
  barColor: color => document.querySelector('meta[name=theme-color]')?.setAttribute('content', color),
});

export const getTheme = () => browserStore().get();
export const subscribeTheme = listener => browserStore().subscribe(listener);

// Changes the theme. With an origin point, the new theme spreads from there in a circle (where the browser can do that).
export function switchTheme(origin) {
  const themeStore = browserStore();
  const noAnimation = !origin || !document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (noAnimation) { themeStore.toggle(); return; }
  const root = document.documentElement;
  const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
  root.classList.add('theme-switching');
  const transition = document.startViewTransition(() => themeStore.toggle());
  transition.ready.then(() => root.animate(
    {clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`]},
    {duration: 600, easing: 'cubic-bezier(.22,.8,.3,1)', pseudoElement: '::view-transition-new(root)'},
  )).catch(() => {});
  transition.finished.finally(() => root.classList.remove('theme-switching'));
}
