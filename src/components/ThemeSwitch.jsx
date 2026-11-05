import React, {useSyncExternalStore} from 'react';
import {getTheme, subscribeTheme} from '../lib/theme.js';

export const useTheme = () => useSyncExternalStore(subscribeTheme, getTheme);

export const SunIcon = props => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" {...props}><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>;
export const MoonIcon = props => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z"/></svg>;

// The tag's accessible twin. The tag itself is decorative for assistive technology, because it sits inside the page's main heading.
// Activating this plays a short pull on the tag (see DogTag), and focusing it draws the focus ring on the tag.
export const TAG_PULL_EVENT = 'tag:pull';
export function TagSwitch() {
  const dark = useTheme() === 'dark';
  return <>
    <button type="button" className="hero-tag-switch" role="switch" aria-checked={dark} aria-label="Dark mode" onClick={() => window.dispatchEvent(new Event(TAG_PULL_EVENT))}/>
    <span className="visually-hidden" role="status">{dark ? 'Dark mode on' : 'Light mode on'}</span>
  </>;
}
