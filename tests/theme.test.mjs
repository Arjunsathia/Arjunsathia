import test from 'node:test';
import assert from 'node:assert/strict';
import {createThemeStore, resolveTheme, readSaved, writeSaved, THEME_KEY} from '../src/lib/theme.js';

const memoryStorage = (initial = {}) => { const data = {...initial}; return {data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }}; };
const blockedStorage = {getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }};
const store = (saved, extra = {}) => {
  const root = {dataset: {}}, storage = memoryStorage(saved ? {[THEME_KEY]: saved} : {});
  return {root, storage, themes: createThemeStore({root, storage, ...extra})};
};

test('a saved choice is kept', () => {
  assert.equal(resolveTheme('light'), 'light');
  assert.equal(resolveTheme('dark'), 'dark');
});
test('with no choice, or a corrupted one, the site is light', () => {
  assert.equal(resolveTheme(null), 'light');
  assert.equal(resolveTheme('purple'), 'light');
});
test('a first visit opens in light mode and applies it to the page', () => {
  const {root, themes} = store(null);
  assert.equal(themes.get(), 'light');
  assert.equal(root.dataset.theme, 'light');
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
test('a change in another tab is picked up', () => {
  let tabListener;
  const {themes} = store('light', {addStorageListener: fn => { tabListener = fn; }});
  tabListener({key: THEME_KEY, newValue: 'dark'});
  assert.equal(themes.get(), 'dark');
  tabListener({key: 'other', newValue: 'light'});
  assert.equal(themes.get(), 'dark');
});
test('the site still works when storage is blocked', () => {
  assert.equal(readSaved(blockedStorage), null);
  assert.equal(writeSaved(blockedStorage, 'dark'), false);
  const root = {dataset: {}}, themes = createThemeStore({root, storage: blockedStorage});
  themes.toggle();
  assert.equal(themes.get(), 'dark');
  assert.equal(root.dataset.theme, 'dark');
});
