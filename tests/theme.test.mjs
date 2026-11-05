import test from 'node:test';
import assert from 'node:assert/strict';
import {createThemeStore, resolveTheme, readSaved, writeSaved, THEME_KEY} from '../src/lib/theme.js';

const memoryStorage = (initial = {}) => { const data = {...initial}; return {data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }}; };
const blockedStorage = {getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }};
const fakeMedia = matches => { const media = {matches, handlers: [], addEventListener: (_, fn) => media.handlers.push(fn), emit(value) { media.matches = value; media.handlers.forEach(fn => fn({matches: value})); }}; return media; };
const store = (saved, deviceDark = false, extra = {}) => {
  const root = {dataset: {}}, storage = memoryStorage(saved ? {[THEME_KEY]: saved} : {}), media = fakeMedia(deviceDark);
  return {root, storage, media, themes: createThemeStore({root, storage, media, ...extra})};
};

test('a saved choice wins over the device setting', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});
test('with no choice, or a corrupted one, the device setting decides', () => {
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme(null, false), 'light');
  assert.equal(resolveTheme('purple', true), 'dark');
});
test('a first visit follows the device and applies it to the page', () => {
  const {root, themes} = store(null, true);
  assert.equal(themes.get(), 'dark');
  assert.equal(root.dataset.theme, 'dark');
});
test('switching saves the choice and notifies listeners', () => {
  const {root, storage, themes} = store('light');
  let calls = 0;
  themes.subscribe(() => calls++);
  themes.toggle();
  assert.equal(root.dataset.theme, 'dark');
  assert.equal(storage.data[THEME_KEY], 'dark');
  assert.equal(calls, 1);
});
test('the site follows live device changes until the visitor chooses', () => {
  const {media, themes} = store(null, false);
  media.emit(true);
  assert.equal(themes.get(), 'dark');
  themes.set('light');
  media.emit(true);
  assert.equal(themes.get(), 'light');
});
test('a change in another tab is picked up', () => {
  let tabListener;
  const {themes} = store('light', false, {addStorageListener: fn => { tabListener = fn; }});
  tabListener({key: THEME_KEY, newValue: 'dark'});
  assert.equal(themes.get(), 'dark');
  tabListener({key: 'other', newValue: 'light'});
  assert.equal(themes.get(), 'dark');
});
test('the site still works when storage is blocked', () => {
  assert.equal(readSaved(blockedStorage), null);
  assert.equal(writeSaved(blockedStorage, 'dark'), false);
  const root = {dataset: {}}, themes = createThemeStore({root, storage: blockedStorage, media: fakeMedia(false)});
  themes.toggle();
  assert.equal(themes.get(), 'dark');
  assert.equal(root.dataset.theme, 'dark');
});
