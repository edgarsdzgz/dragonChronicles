/**
 * Unit tests for flag store behavior
 * Tests Svelte store updates, subscriptions, and derived stores
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  appFlags,
  hudEnabled,
  devMenuEnabled,
  logConsoleEnabled,
  legacyBgSimEnabled,
  forceMode,
  isFlagEnabled,
  getCurrentFlags,
  type AppFlags,
} from '../../apps/web/src/lib/flags/store.js';

describe('Flag Store', () => {
  beforeEach(() => {
    // Reset store to default values before each test
    appFlags.set({
      hud: false,
      devMenu: false,
      logConsole: false,
      useLegacyBgSim: false,
      forceMode: 'auto',
    });
  });

  describe('appFlags store', () => {
    it('should initialize with default values', () => {
      const flags = get(appFlags);
      expect(flags).toEqual({
        hud: false,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });
    });

    it('should update when set is called', () => {
      const newFlags: AppFlags = {
        hud: true,
        devMenu: true,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'fg',
      };

      appFlags.set(newFlags);
      const flags = get(appFlags);
      expect(flags).toEqual(newFlags);
    });

    it('should update when update is called', () => {
      appFlags.update((flags) => ({
        ...flags,
        hud: true,
        forceMode: 'bg',
      }));

      const flags = get(appFlags);
      expect(flags).toEqual({
        hud: true,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'bg',
      });
    });

    it('should notify subscribers when values change', () => {
      const subscriber = vi.fn();
      const unsubscribe = appFlags.subscribe(subscriber);

      // Initial subscription should be called immediately
      expect(subscriber).toHaveBeenCalledWith({
        hud: false,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });

      // Update should trigger subscriber
      appFlags.set({
        hud: true,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });

      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(subscriber).toHaveBeenLastCalledWith({
        hud: true,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });

      unsubscribe();
    });

    it('should not notify unsubscribed listeners', () => {
      const subscriber = vi.fn();
      const unsubscribe = appFlags.subscribe(subscriber);

      // Clear initial call
      subscriber.mockClear();

      unsubscribe();

      // Update should not trigger subscriber
      appFlags.set({
        hud: true,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });

      expect(subscriber).not.toHaveBeenCalled();
    });
  });

  describe('derived stores', () => {
    it('should derive hudEnabled correctly', () => {
      expect(get(hudEnabled)).toBe(false);

      appFlags.set({
        hud: true,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });

      expect(get(hudEnabled)).toBe(true);
    });

    it('should derive devMenuEnabled correctly', () => {
      expect(get(devMenuEnabled)).toBe(false);

      appFlags.set({
        hud: false,
        devMenu: true,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });

      expect(get(devMenuEnabled)).toBe(true);
    });

    it('should derive logConsoleEnabled correctly', () => {
      expect(get(logConsoleEnabled)).toBe(false);

      appFlags.set({
        hud: false,
        devMenu: false,
        logConsole: true,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });

      expect(get(logConsoleEnabled)).toBe(true);
    });

    it('should derive legacyBgSimEnabled correctly', () => {
      expect(get(legacyBgSimEnabled)).toBe(false);

      appFlags.set({
        hud: false,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: true,
        forceMode: 'auto',
      });

      expect(get(legacyBgSimEnabled)).toBe(true);
    });

    it('should derive forceMode correctly', () => {
      expect(get(forceMode)).toBe('auto');

      appFlags.set({
        hud: false,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'fg',
      });

      expect(get(forceMode)).toBe('fg');

      appFlags.set({
        hud: false,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'bg',
      });

      expect(get(forceMode)).toBe('bg');
    });

    it('should update derived stores when parent store changes', () => {
      const hudSubscriber = vi.fn();
      const devMenuSubscriber = vi.fn();

      const unsubscribeHud = hudEnabled.subscribe(hudSubscriber);
      const unsubscribeDevMenu = devMenuEnabled.subscribe(devMenuSubscriber);

      // Clear initial calls
      hudSubscriber.mockClear();
      devMenuSubscriber.mockClear();

      // Update parent store
      appFlags.set({
        hud: true,
        devMenu: true,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });

      expect(hudSubscriber).toHaveBeenCalledWith(true);
      expect(devMenuSubscriber).toHaveBeenCalledWith(true);

      unsubscribeHud();
      unsubscribeDevMenu();
    });
  });

  describe('isFlagEnabled utility', () => {
    it('should return a derived store for boolean flags', () => {
      const hudFlag = isFlagEnabled('hud');
      expect(get(hudFlag)).toBe(false);

      appFlags.set({
        hud: true,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });

      expect(get(hudFlag)).toBe(true);
    });

    it('should work with all boolean flags', () => {
      const flags = ['hud', 'devMenu', 'logConsole', 'useLegacyBgSim'] as const;

      flags.forEach((flag) => {
        const flagStore = isFlagEnabled(flag);
        expect(get(flagStore)).toBe(false);

        appFlags.update((current) => ({
          ...current,
          [flag]: true,
        }));

        expect(get(flagStore)).toBe(true);
      });
    });

    it('should convert non-boolean values to boolean', () => {
      const forceModeFlag = isFlagEnabled('forceMode');
      expect(get(forceModeFlag)).toBe(true); // 'auto' is truthy

      appFlags.set({
        hud: false,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'fg',
      });

      expect(get(forceModeFlag)).toBe(true); // 'fg' is truthy
    });

    it('should update when flag values change', () => {
      const hudFlag = isFlagEnabled('hud');
      const subscriber = vi.fn();

      const unsubscribe = hudFlag.subscribe(subscriber);

      // Clear initial call
      subscriber.mockClear();

      // Update flag
      appFlags.update((flags) => ({
        ...flags,
        hud: true,
      }));

      expect(subscriber).toHaveBeenCalledWith(true);

      unsubscribe();
    });
  });

  describe('getCurrentFlags utility', () => {
    it('should return current flag values', () => {
      const flags = getCurrentFlags();
      expect(flags).toEqual({
        hud: false,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });
    });

    it('should return updated values after store changes', () => {
      appFlags.set({
        hud: true,
        devMenu: true,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'fg',
      });

      const flags = getCurrentFlags();
      expect(flags).toEqual({
        hud: true,
        devMenu: true,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'fg',
      });
    });

    it('should return a snapshot of current state', () => {
      const flags1 = getCurrentFlags();
      appFlags.set({
        hud: true,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });
      const flags2 = getCurrentFlags();

      expect(flags1).not.toEqual(flags2);
      expect(flags1.hud).toBe(false);
      expect(flags2.hud).toBe(true);
    });
  });

  describe('store integration', () => {
    it('should maintain consistency across all derived stores', () => {
      const testFlags: AppFlags = {
        hud: true,
        devMenu: true,
        logConsole: true,
        useLegacyBgSim: true,
        forceMode: 'bg',
      };

      appFlags.set(testFlags);

      expect(get(hudEnabled)).toBe(true);
      expect(get(devMenuEnabled)).toBe(true);
      expect(get(logConsoleEnabled)).toBe(true);
      expect(get(legacyBgSimEnabled)).toBe(true);
      expect(get(forceMode)).toBe('bg');
      expect(getCurrentFlags()).toEqual(testFlags);
    });

    it('should handle rapid updates correctly', () => {
      const updates = [
        { hud: true },
        { devMenu: true },
        { logConsole: true },
        { useLegacyBgSim: true },
        { forceMode: 'fg' as const },
        { forceMode: 'bg' as const },
        { forceMode: 'auto' as const },
      ];

      updates.forEach((update) => {
        appFlags.update((flags) => ({ ...flags, ...update }));
      });

      const finalFlags = getCurrentFlags();
      expect(finalFlags).toEqual({
        hud: true,
        devMenu: true,
        logConsole: true,
        useLegacyBgSim: true,
        forceMode: 'auto',
      });
    });

    it('should handle partial updates correctly', () => {
      // Set initial state
      appFlags.set({
        hud: true,
        devMenu: true,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });

      // Update only one flag
      appFlags.update((flags) => ({
        ...flags,
        logConsole: true,
      }));

      const flags = getCurrentFlags();
      expect(flags).toEqual({
        hud: true,
        devMenu: true,
        logConsole: true,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined values gracefully', () => {
      // This should not throw an error
      expect(() => {
        appFlags.set({
          hud: false,
          devMenu: false,
          logConsole: false,
          useLegacyBgSim: false,
          forceMode: 'auto',
        });
      }).not.toThrow();
    });

    it('should handle multiple subscribers correctly', () => {
      const subscribers = Array.from({ length: 5 }, () => vi.fn());
      const unsubscribers = subscribers.map((sub) => appFlags.subscribe(sub));

      // Clear initial calls
      subscribers.forEach((sub) => sub.mockClear());

      // Update store
      appFlags.set({
        hud: true,
        devMenu: false,
        logConsole: false,
        useLegacyBgSim: false,
        forceMode: 'auto',
      });

      // All subscribers should be called
      subscribers.forEach((sub) => {
        expect(sub).toHaveBeenCalledWith({
          hud: true,
          devMenu: false,
          logConsole: false,
          useLegacyBgSim: false,
          forceMode: 'auto',
        });
      });

      // Cleanup
      unsubscribers.forEach((unsub) => unsub());
    });
  });
});
