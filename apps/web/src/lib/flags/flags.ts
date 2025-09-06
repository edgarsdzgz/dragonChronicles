/**
 * Typed feature flags interface for Draconia Chronicles
 *
 * Flags control app behavior and can be set via:
 * - Environment variables (build-time)
 * - Query string parameters (runtime)
 * - Default values (fallback)
 */

export type ForceMode = 'fg' | 'bg' | 'auto';

export interface AppFlags {
  /** Show development HUD overlay */
  hud: boolean;

  /** Show developer navigation menu */
  devMenu: boolean;

  /** Enable console logging sink (dev override) */
  logConsole: boolean;

  /** Use legacy in-page background simulation (dev fallback) */
  useLegacyBgSim: boolean;

  /** Force simulation mode: fg=foreground, bg=background, auto=visibility-driven */
  forceMode: ForceMode;
}

export interface FlagSources {
  env: Partial<AppFlags>;
  query: Partial<AppFlags>;
  defaults: AppFlags;
}

/**
 * Default flag values
 */
export const DEFAULT_FLAGS: AppFlags = {
  hud: false,
  devMenu: false,
  logConsole: false,
  useLegacyBgSim: false,
  forceMode: 'auto',
};

/**
 * Environment-based flag overrides
 * These are set at build time and cannot be changed at runtime
 */
export function getEnvFlags(): Partial<AppFlags> {
  const flags: Partial<AppFlags> = {};

  // Only allow dev flags in development mode
  if (import.meta.env.DEV) {
    if (import.meta.env.VITE_HUD_ENABLED === 'true') {
      flags.hud = true;
    }
    if (import.meta.env.VITE_DEV_MENU_ENABLED === 'true') {
      flags.devMenu = true;
    }
    if (import.meta.env.VITE_LOG_CONSOLE === 'true') {
      flags.logConsole = true;
    }
    if (import.meta.env.VITE_LEGACY_BG_SIM === 'true') {
      flags.useLegacyBgSim = true;
    }
    if (import.meta.env.VITE_FORCE_MODE) {
      const mode = import.meta.env.VITE_FORCE_MODE as ForceMode;
      if (['fg', 'bg', 'auto'].includes(mode)) {
        flags.forceMode = mode;
      }
    }
  }

  return flags;
}

/**
 * Query string flag parsing
 * These can be changed at runtime via URL parameters
 */
export function getQueryFlags(url: URL): Partial<AppFlags> {
  const flags: Partial<AppFlags> = {};

  // Only allow query flags in development mode
  if (import.meta.env.DEV) {
    if (url.searchParams.get('hud') === '1') {
      flags.hud = true;
    }
    if (url.searchParams.get('dev') === '1') {
      flags.devMenu = true;
    }
    if (url.searchParams.get('logConsole') === '1') {
      flags.logConsole = true;
    }
    if (url.searchParams.get('legacyBg') === '1') {
      flags.useLegacyBgSim = true;
    }
    const mode = url.searchParams.get('mode');
    if (mode && ['fg', 'bg', 'auto'].includes(mode)) {
      flags.forceMode = mode as ForceMode;
    }
  }

  return flags;
}

/**
 * Merge flag sources with precedence: query > env > defaults
 */
export function mergeFlags(sources: FlagSources): AppFlags {
  return {
    ...sources.defaults,
    ...sources.env,
    ...sources.query,
  };
}

/**
 * Create complete flag configuration from URL
 */
export function createFlags(url: URL): AppFlags {
  const sources: FlagSources = {
    env: getEnvFlags(),
    query: getQueryFlags(url),
    defaults: DEFAULT_FLAGS,
  };

  return mergeFlags(sources);
}
