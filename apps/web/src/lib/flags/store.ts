/**
 * Svelte store for app feature flags
 * 
 * Provides reactive access to feature flags throughout the app
 */

import { writable, derived, type Readable } from 'svelte/store';
import type { AppFlags, ForceMode } from './flags.js';

/**
 * Main flags store - initialized in +layout.ts
 */
export const appFlags = writable<AppFlags>({
  hud: false,
  devMenu: false,
  logConsole: false,
  useLegacyBgSim: false,
  forceMode: 'auto',
});

/**
 * Derived stores for individual flags
 * These provide convenient access to specific flags
 */
export const hudEnabled: Readable<boolean> = derived(
  appFlags,
  ($flags) => $flags.hud
);

export const devMenuEnabled: Readable<boolean> = derived(
  appFlags,
  ($flags) => $flags.devMenu
);

export const logConsoleEnabled: Readable<boolean> = derived(
  appFlags,
  ($flags) => $flags.logConsole
);

export const legacyBgSimEnabled: Readable<boolean> = derived(
  appFlags,
  ($flags) => $flags.useLegacyBgSim
);

export const forceMode: Readable<ForceMode> = derived(
  appFlags,
  ($flags) => $flags.forceMode
);

/**
 * Utility function to check if a specific flag is enabled
 */
export function isFlagEnabled(flag: keyof AppFlags): Readable<boolean> {
  return derived(appFlags, ($flags) => Boolean($flags[flag]));
}

/**
 * Utility function to get current flag values (for non-reactive access)
 */
export function getCurrentFlags(): AppFlags {
  let current: AppFlags;
  appFlags.subscribe((flags) => {
    current = flags;
  })();
  return current!;
}



