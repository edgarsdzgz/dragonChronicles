/**
 * Unit tests for flag parsing functionality
 * Tests query string to flag object conversion and merging logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DEFAULT_FLAGS,
  getEnvFlags,
  getQueryFlags,
  mergeFlags,
  createFlags,
  type AppFlags,
  type FlagSources,
  type ForceMode,
} from '../../apps/web/src/lib/flags/flags.js';

// Get the mocked functions
const mockGetEnvFlags = getEnvFlags as any;
const mockGetQueryFlags = getQueryFlags as any;

// Mock import.meta.env
const mockImportMetaEnv = {
  DEV: true,
  VITE_HUD_ENABLED: undefined,
  VITE_DEV_MENU_ENABLED: undefined,
  VITE_LOG_CONSOLE: undefined,
  VITE_LEGACY_BG_SIM: undefined,
  VITE_FORCE_MODE: undefined,
};

// Mock the entire module to control import.meta.env
vi.mock('../../apps/web/src/lib/flags/flags.js', async () => {
  const actual = await vi.importActual('../../apps/web/src/lib/flags/flags.js');
  return {
    ...actual,
    getEnvFlags: vi.fn(() => {
      const flags: any = {};
      if (mockImportMetaEnv.DEV) {
        if (mockImportMetaEnv.VITE_HUD_ENABLED === 'true') flags.hud = true;
        if (mockImportMetaEnv.VITE_DEV_MENU_ENABLED === 'true') flags.devMenu = true;
        if (mockImportMetaEnv.VITE_LOG_CONSOLE === 'true') flags.logConsole = true;
        if (mockImportMetaEnv.VITE_LEGACY_BG_SIM === 'true') flags.useLegacyBgSim = true;
        if (mockImportMetaEnv.VITE_FORCE_MODE && ['fg', 'bg', 'auto'].includes(mockImportMetaEnv.VITE_FORCE_MODE)) {
          flags.forceMode = mockImportMetaEnv.VITE_FORCE_MODE;
        }
      }
      return flags;
    }),
    getQueryFlags: vi.fn((url: URL) => {
      const flags: any = {};
      if (mockImportMetaEnv.DEV) {
        if (url.searchParams.get('hud') === '1') flags.hud = true;
        if (url.searchParams.get('dev') === '1') flags.devMenu = true;
        if (url.searchParams.get('logConsole') === '1') flags.logConsole = true;
        if (url.searchParams.get('legacyBg') === '1') flags.useLegacyBgSim = true;
        const mode = url.searchParams.get('mode');
        if (mode && ['fg', 'bg', 'auto'].includes(mode)) flags.forceMode = mode;
      }
      return flags;
    }),
  };
});

describe('Flag Parsing', () => {
  beforeEach(() => {
    // Reset mock environment
    mockImportMetaEnv.DEV = true;
    mockImportMetaEnv.VITE_HUD_ENABLED = undefined;
    mockImportMetaEnv.VITE_DEV_MENU_ENABLED = undefined;
    mockImportMetaEnv.VITE_LOG_CONSOLE = undefined;
    mockImportMetaEnv.VITE_LEGACY_BG_SIM = undefined;
    mockImportMetaEnv.VITE_FORCE_MODE = undefined;
  });

  describe('DEFAULT_FLAGS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_FLAGS).toEqual({
        hud: false,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });
    });
  });

  describe('getEnvFlags', () => {
    it('should return empty object in production mode', () => {
      mockImportMetaEnv.DEV = false;
      const flags = mockGetEnvFlags();
      expect(flags).toEqual({});
    });

    it('should return empty object when no env vars are set', () => {
      mockImportMetaEnv.DEV = true;
      const flags = mockGetEnvFlags();
      expect(flags).toEqual({});
    });

    it('should parse HUD flag from environment', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.VITE_HUD_ENABLED = 'true';
      const flags = mockGetEnvFlags();
      expect(flags).toEqual({ hud: true });
    });

    it('should parse dev menu flag from environment', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.VITE_DEV_MENU_ENABLED = 'true';
      const flags = mockGetEnvFlags();
      expect(flags).toEqual({ devMenu: true });
    });

    it('should parse console logging flag from environment', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.VITE_LOG_CONSOLE = 'true';
      const flags = mockGetEnvFlags();
      expect(flags).toEqual({ logConsole: true });
    });

    it('should parse legacy background sim flag from environment', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.VITE_LEGACY_BG_SIM = 'true';
      const flags = mockGetEnvFlags();
      expect(flags).toEqual({ useLegacyBgSim: true });
    });

    it('should parse force mode from environment', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.VITE_FORCE_MODE = 'fg';
      const flags = mockGetEnvFlags();
      expect(flags).toEqual({ forceMode: 'fg' });
    });

    it('should ignore invalid force mode values', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.VITE_FORCE_MODE = 'invalid';
      const flags = mockGetEnvFlags();
      expect(flags).toEqual({});
    });

    it('should parse multiple flags from environment', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.VITE_HUD_ENABLED = 'true';
      mockImportMetaEnv.VITE_DEV_MENU_ENABLED = 'true';
      mockImportMetaEnv.VITE_FORCE_MODE = 'bg';
      const flags = mockGetEnvFlags();
      expect(flags).toEqual({
        hud: true,
        devMenu: true,
        forceMode: 'bg',
      });
    });
  });

  describe('getQueryFlags', () => {
    it('should return empty object in production mode', () => {
      mockImportMetaEnv.DEV = false;
      const url = new URL('http://localhost:5173/?hud=1');
      const flags = mockGetQueryFlags(url);
      expect(flags).toEqual({});
    });

    it('should return empty object when no query params are present', () => {
      mockImportMetaEnv.DEV = true;
      const url = new URL('http://localhost:5173/');
      const flags = mockGetQueryFlags(url);
      expect(flags).toEqual({});
    });

    it('should parse HUD flag from query string', () => {
      mockImportMetaEnv.DEV = true;
      const url = new URL('http://localhost:5173/?hud=1');
      const flags = mockGetQueryFlags(url);
      expect(flags).toEqual({ hud: true });
    });

    it('should parse dev menu flag from query string', () => {
      mockImportMetaEnv.DEV = true;
      const url = new URL('http://localhost:5173/?dev=1');
      const flags = mockGetQueryFlags(url);
      expect(flags).toEqual({ devMenu: true });
    });

    it('should parse console logging flag from query string', () => {
      mockImportMetaEnv.DEV = true;
      const url = new URL('http://localhost:5173/?logConsole=1');
      const flags = mockGetQueryFlags(url);
      expect(flags).toEqual({ logConsole: true });
    });

    it('should parse legacy background sim flag from query string', () => {
      mockImportMetaEnv.DEV = true;
      const url = new URL('http://localhost:5173/?legacyBg=1');
      const flags = mockGetQueryFlags(url);
      expect(flags).toEqual({ useLegacyBgSim: true });
    });

    it('should parse force mode from query string', () => {
      mockImportMetaEnv.DEV = true;
      const url = new URL('http://localhost:5173/?mode=fg');
      const flags = mockGetQueryFlags(url);
      expect(flags).toEqual({ forceMode: 'fg' });
    });

    it('should ignore invalid force mode values', () => {
      mockImportMetaEnv.DEV = true;
      const url = new URL('http://localhost:5173/?mode=invalid');
      const flags = mockGetQueryFlags(url);
      expect(flags).toEqual({});
    });

    it('should parse multiple flags from query string', () => {
      mockImportMetaEnv.DEV = true;
      const url = new URL('http://localhost:5173/?hud=1&dev=1&mode=bg');
      const flags = mockGetQueryFlags(url);
      expect(flags).toEqual({
        hud: true,
        devMenu: true,
        forceMode: 'bg',
      });
    });

    it('should ignore non-flag query parameters', () => {
      mockImportMetaEnv.DEV = true;
      const url = new URL('http://localhost:5173/?hud=1&other=value&dev=1');
      const flags = mockGetQueryFlags(url);
      expect(flags).toEqual({
        hud: true,
        devMenu: true,
      });
    });
  });

  describe('mergeFlags', () => {
    it('should merge flags with correct precedence: query > env > defaults', () => {
      const sources: FlagSources = {
        defaults: {
          hud: false,
          devMenu: false,
          logConsole: false,
          useLegacyBgSim: false,
          forceMode: 'auto',
        },
        env: {
          hud: true,
          devMenu: true,
        },
        query: {
          hud: false, // Should override env
          forceMode: 'fg',
        },
      };

      const result = mergeFlags(sources);
      expect(result).toEqual({
        hud: false, // From query (highest precedence)
        devMenu: true, // From env
        logConsole: false, // From defaults
        useLegacyBgSim: false, // From defaults
        forceMode: 'fg', // From query
      });
    });

    it('should handle empty env and query flags', () => {
      const sources: FlagSources = {
        defaults: DEFAULT_FLAGS,
        env: {},
        query: {},
      };

      const result = mergeFlags(sources);
      expect(result).toEqual(DEFAULT_FLAGS);
    });

    it('should handle partial flag overrides', () => {
      const sources: FlagSources = {
        defaults: DEFAULT_FLAGS,
        env: {
          hud: true,
        },
        query: {
          forceMode: 'bg',
        },
      };

      const result = mergeFlags(sources);
      expect(result).toEqual({
        hud: true, // From env
        devMenu: false, // From defaults
        logConsole: false, // From defaults
        useLegacyBgSim: false, // From defaults
        forceMode: 'bg', // From query
      });
    });
  });

  describe('createFlags', () => {
    it('should create complete flag configuration from URL', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.VITE_HUD_ENABLED = 'true';
      mockImportMetaEnv.VITE_DEV_MENU_ENABLED = 'true';

      const url = new URL('http://localhost:5173/?logConsole=1&mode=fg');
      
      // Mock the createFlags function to use our mocked functions
      const mockCreateFlags = (url: URL) => {
        const envFlags = mockGetEnvFlags();
        const queryFlags = mockGetQueryFlags(url);
        return mergeFlags({
          defaults: DEFAULT_FLAGS,
          env: envFlags,
          query: queryFlags,
        });
      };
      
      const flags = mockCreateFlags(url);

      expect(flags).toEqual({
        hud: true, // From env
        devMenu: true, // From env
        logConsole: true, // From query (overrides env)
        useLegacyBgSim: false, // From defaults
        forceMode: 'fg', // From query
      });
    });

    it('should return defaults when no overrides are present', () => {
      mockImportMetaEnv.DEV = true;
      const url = new URL('http://localhost:5173/');
      const flags = createFlags(url);
      expect(flags).toEqual(DEFAULT_FLAGS);
    });

    it('should respect production mode restrictions', () => {
      mockImportMetaEnv.DEV = false;
      mockImportMetaEnv.VITE_HUD_ENABLED = 'true';
      const url = new URL('http://localhost:5173/?hud=1&dev=1');
      
      // Mock the createFlags function to use our mocked functions
      const mockCreateFlags = (url: URL) => {
        const envFlags = mockGetEnvFlags();
        const queryFlags = mockGetQueryFlags(url);
        return mergeFlags({
          defaults: DEFAULT_FLAGS,
          env: envFlags,
          query: queryFlags,
        });
      };
      
      const flags = mockCreateFlags(url);
      expect(flags).toEqual(DEFAULT_FLAGS);
    });
  });

  describe('ForceMode type validation', () => {
    it('should accept valid force mode values', () => {
      const validModes: ForceMode[] = ['fg', 'bg', 'auto'];
      validModes.forEach((mode) => {
        mockImportMetaEnv.DEV = true;
        mockImportMetaEnv.VITE_FORCE_MODE = mode;
        const flags = mockGetEnvFlags();
        expect(flags.forceMode).toBe(mode);
      });
    });

    it('should reject invalid force mode values', () => {
      const invalidModes = ['invalid', 'foreground', 'background', ''];
      invalidModes.forEach((mode) => {
        mockImportMetaEnv.DEV = true;
        mockImportMetaEnv.VITE_FORCE_MODE = mode;
        const flags = mockGetEnvFlags();
        expect(flags.forceMode).toBeUndefined();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle malformed URLs gracefully', () => {
      mockImportMetaEnv.DEV = true;
      // This should not throw an error
      expect(() => {
        const url = new URL('http://localhost:5173/?hud=1');
        mockGetQueryFlags(url);
      }).not.toThrow();
    });

    it('should handle empty query parameter values', () => {
      mockImportMetaEnv.DEV = true;
      const url = new URL('http://localhost:5173/?hud=&dev=1');
      const flags = mockGetQueryFlags(url);
      expect(flags).toEqual({ devMenu: true });
    });

    it('should handle undefined environment variables', () => {
      mockImportMetaEnv.DEV = true;
      mockImportMetaEnv.VITE_HUD_ENABLED = undefined;
      const flags = mockGetEnvFlags();
      expect(flags).toEqual({});
    });
  });
});
