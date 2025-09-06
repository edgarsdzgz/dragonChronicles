/**
 * Query string utilities for feature flags
 * 
 * Provides helper functions for working with flag-related query parameters
 */

import type { AppFlags, ForceMode } from './flags.js';

/**
 * Build a query string with flag parameters
 */
export function buildFlagQuery(flags: Partial<AppFlags>): string {
  const params = new URLSearchParams();
  
  // Only add flags that are enabled (true) to keep URLs clean
  if (flags.hud) params.set('hud', '1');
  if (flags.devMenu) params.set('dev', '1');
  if (flags.logConsole) params.set('logConsole', '1');
  if (flags.useLegacyBgSim) params.set('legacyBg', '1');
  if (flags.forceMode && flags.forceMode !== 'auto') {
    params.set('mode', flags.forceMode);
  }
  
  return params.toString();
}

/**
 * Create a URL with flag parameters
 */
export function createFlagUrl(baseUrl: string, flags: Partial<AppFlags>): string {
  const query = buildFlagQuery(flags);
  return query ? `${baseUrl}?${query}` : baseUrl;
}

/**
 * Parse force mode from string
 */
export function parseForceMode(value: string | null): ForceMode | null {
  if (!value) return null;
  if (['fg', 'bg', 'auto'].includes(value)) {
    return value as ForceMode;
  }
  return null;
}

/**
 * Get flag display name for UI
 */
export function getFlagDisplayName(flag: keyof AppFlags): string {
  const names: Record<keyof AppFlags, string> = {
    hud: 'HUD',
    devMenu: 'Dev Menu',
    logConsole: 'Console Logging',
    useLegacyBgSim: 'Legacy Background Sim',
    forceMode: 'Force Mode',
  };
  return names[flag];
}

/**
 * Get flag description for UI
 */
export function getFlagDescription(flag: keyof AppFlags): string {
  const descriptions: Record<keyof AppFlags, string> = {
    hud: 'Show development HUD overlay',
    devMenu: 'Show developer navigation menu',
    logConsole: 'Enable console logging sink',
    useLegacyBgSim: 'Use legacy in-page background simulation',
    forceMode: 'Force simulation mode (fg/bg/auto)',
  };
  return descriptions[flag];
}

/**
 * Check if flag is a development-only flag
 */
export function isDevOnlyFlag(flag: keyof AppFlags): boolean {
  const devFlags: (keyof AppFlags)[] = [
    'hud',
    'devMenu', 
    'logConsole',
    'useLegacyBgSim',
    'forceMode',
  ];
  return devFlags.includes(flag);
}



