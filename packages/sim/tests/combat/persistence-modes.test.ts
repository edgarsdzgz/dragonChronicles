/**
 * Test suite for target persistence modes
 * Tests each persistence mode's specific behavior and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Enemy, TargetingState, TargetingConfig } from '../../src/combat/types.js';
import { createPersistenceModeRegistry } from '../../src/combat/persistence-modes.js';

describe('Persistence Modes', () => {
  let enemies: Enemy[];
  let state: TargetingState;
  let config: TargetingConfig;
  let persistenceRegistry: ReturnType<typeof createPersistenceModeRegistry>;

  beforeEach(() => {
    // Create test enemies
    enemies = [
      {
        id: 'enemy1',
        position: { x: 100, y: 100 },
        health: { current: 100, max: 100 },
        damage: 50,
        speed: 100,
        armor: 10,
        shield: 0,
        elementalType: 'ice',
        isAlive: true,
        threatLevel: 0.8,
        distance: 141.42,
      },
      {
        id: 'enemy2',
        position: { x: 200, y: 200 },
        health: { current: 80, max: 100 },
        damage: 30,
        speed: 80,
        armor: 5,
        shield: 20,
        elementalType: 'fire',
        isAlive: true,
        threatLevel: 0.6,
        distance: 282.84,
      },
      {
        id: 'enemy3',
        position: { x: 300, y: 300 },
        health: { current: 50, max: 100 },
        damage: 70,
        speed: 120,
        armor: 15,
        shield: 0,
        elementalType: 'lightning',
        isAlive: true,
        threatLevel: 0.9,
        distance: 424.26,
      },
    ];

    // Create test state
    state = {
      currentTarget: enemies[0],
      lastTarget: null,
      targetHistory: [],
      lastUpdateTime: Date.now(),
      strategy: 'closest',
      isTargetLocked: false,
      targetLockStartTime: Date.now(),
      targetSwitchCount: 0,
      lastStrategyChange: Date.now(),
    };

    // Create test config
    config = {
      primaryStrategy: 'closest',
      fallbackStrategy: 'highest_threat',
      range: 500,
      updateInterval: 100,
      switchThreshold: 0.1,
      enabledStrategies: [],
      persistenceMode: 'keep_target',
      targetLockDuration: 5000,
    };

    persistenceRegistry = createPersistenceModeRegistry();
  });

  describe('Keep Target Mode', () => {
    it('should not switch when target is locked', () => {
      const mode = persistenceRegistry.getMode('keep_target');
      state.isTargetLocked = true;

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], enemies[1], state, config);

      expect(shouldSwitch).toBe(false);
    });

    it('should switch when no current target', () => {
      const mode = persistenceRegistry.getMode('keep_target');
      state.currentTarget = null;

      const shouldSwitch = mode?.shouldSwitchTarget(null, enemies[0], state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should switch when current target dies', () => {
      const mode = persistenceRegistry.getMode('keep_target');
      const deadEnemy = { ...enemies[0], isAlive: false };

      const shouldSwitch = mode?.shouldSwitchTarget(deadEnemy, enemies[1], state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should not switch when current target is valid', () => {
      const mode = persistenceRegistry.getMode('keep_target');

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], enemies[1], state, config);

      expect(shouldSwitch).toBe(false);
    });

    it('should have correct description', () => {
      const mode = persistenceRegistry.getMode('keep_target');

      expect(mode?.getDescription()).toBe('Keep current target until it dies or goes out of range');
    });
  });

  describe('Switch Freely Mode', () => {
    it('should not switch when target is locked', () => {
      const mode = persistenceRegistry.getMode('switch_freely');
      state.isTargetLocked = true;

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], enemies[1], state, config);

      expect(shouldSwitch).toBe(false);
    });

    it('should switch when no current target', () => {
      const mode = persistenceRegistry.getMode('switch_freely');
      state.currentTarget = null;

      const shouldSwitch = mode?.shouldSwitchTarget(null, enemies[0], state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should switch when current target dies', () => {
      const mode = persistenceRegistry.getMode('switch_freely');
      const deadEnemy = { ...enemies[0], isAlive: false };

      const shouldSwitch = mode?.shouldSwitchTarget(deadEnemy, enemies[1], state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should switch when new target is significantly better', () => {
      const mode = persistenceRegistry.getMode('switch_freely');
      const betterEnemy = { ...enemies[1], threatLevel: 0.9 };

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], betterEnemy, state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should not switch when new target is not significantly better', () => {
      const mode = persistenceRegistry.getMode('switch_freely');
      const similarEnemy = { ...enemies[1], threatLevel: 0.81 }; // Small difference

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], similarEnemy, state, config);

      expect(shouldSwitch).toBe(false);
    });

    it('should have correct description', () => {
      const mode = persistenceRegistry.getMode('switch_freely');

      expect(mode?.getDescription()).toBe(
        'Switch targets when significantly better options are available',
      );
    });
  });

  describe('Switch Aggressive Mode', () => {
    it('should not switch when target is locked', () => {
      const mode = persistenceRegistry.getMode('switch_aggressive');
      state.isTargetLocked = true;

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], enemies[1], state, config);

      expect(shouldSwitch).toBe(false);
    });

    it('should switch when no current target', () => {
      const mode = persistenceRegistry.getMode('switch_aggressive');
      state.currentTarget = null;

      const shouldSwitch = mode?.shouldSwitchTarget(null, enemies[0], state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should switch when current target dies', () => {
      const mode = persistenceRegistry.getMode('switch_aggressive');
      const deadEnemy = { ...enemies[0], isAlive: false };

      const shouldSwitch = mode?.shouldSwitchTarget(deadEnemy, enemies[1], state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should switch when new target is better', () => {
      const mode = persistenceRegistry.getMode('switch_aggressive');
      const betterEnemy = { ...enemies[1], threatLevel: 0.85 };

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], betterEnemy, state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should not switch when new target is worse', () => {
      const mode = persistenceRegistry.getMode('switch_aggressive');
      const worseEnemy = { ...enemies[1], threatLevel: 0.7 };

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], worseEnemy, state, config);

      expect(shouldSwitch).toBe(false);
    });

    it('should have correct description', () => {
      const mode = persistenceRegistry.getMode('switch_aggressive');

      expect(mode?.getDescription()).toBe('Always target the best available enemy');
    });
  });

  describe('Manual Only Mode', () => {
    it('should not switch when target is locked', () => {
      const mode = persistenceRegistry.getMode('manual_only');
      state.isTargetLocked = true;

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], enemies[1], state, config);

      expect(shouldSwitch).toBe(false);
    });

    it('should switch when no current target', () => {
      const mode = persistenceRegistry.getMode('manual_only');
      state.currentTarget = null;

      const shouldSwitch = mode?.shouldSwitchTarget(null, enemies[0], state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should switch when current target dies', () => {
      const mode = persistenceRegistry.getMode('manual_only');
      const deadEnemy = { ...enemies[0], isAlive: false };

      const shouldSwitch = mode?.shouldSwitchTarget(deadEnemy, enemies[1], state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should switch when strategy was recently changed', () => {
      const mode = persistenceRegistry.getMode('manual_only');
      state.lastStrategyChange = Date.now() - 500; // 500ms ago

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], enemies[1], state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should not switch when strategy was changed long ago', () => {
      const mode = persistenceRegistry.getMode('manual_only');
      state.lastStrategyChange = Date.now() - 2000; // 2 seconds ago

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], enemies[1], state, config);

      expect(shouldSwitch).toBe(false);
    });

    it('should have correct description', () => {
      const mode = persistenceRegistry.getMode('manual_only');

      expect(mode?.getDescription()).toBe('Only switch targets when you manually change strategy');
    });
  });

  describe('Persistence Mode Registry', () => {
    it('should register all default modes', () => {
      const allModes = persistenceRegistry.getAllModes();

      expect(allModes).toHaveLength(4);
      expect(allModes.map((m) => m.mode)).toContain('keep_target');
      expect(allModes.map((m) => m.mode)).toContain('switch_freely');
      expect(allModes.map((m) => m.mode)).toContain('switch_aggressive');
      expect(allModes.map((m) => m.mode)).toContain('manual_only');
    });

    it('should get unlocked modes only', () => {
      const unlockedModes = persistenceRegistry.getUnlockedModes();

      expect(unlockedModes).toHaveLength(4); // All modes are unlocked by default
      expect(unlockedModes.map((m) => m.mode)).toContain('keep_target');
      expect(unlockedModes.map((m) => m.mode)).toContain('switch_freely');
      expect(unlockedModes.map((m) => m.mode)).toContain('switch_aggressive');
      expect(unlockedModes.map((m) => m.mode)).toContain('manual_only');
    });

    it('should get mode descriptions', () => {
      const descriptions = persistenceRegistry.getModeDescriptions();

      expect(descriptions.get('keep_target')).toBe(
        'Keep current target until it dies or goes out of range',
      );
      expect(descriptions.get('switch_freely')).toBe(
        'Switch targets when significantly better options are available',
      );
      expect(descriptions.get('switch_aggressive')).toBe('Always target the best available enemy');
      expect(descriptions.get('manual_only')).toBe(
        'Only switch targets when you manually change strategy',
      );
    });

    it('should register custom modes', () => {
      const customMode = {
        mode: 'custom_test' as any,
        shouldSwitchTarget: () => true,
        getDescription: () => 'Test mode',
        isUnlocked: () => true,
      };

      persistenceRegistry.registerMode('custom_test' as any, customMode);

      const retrieved = persistenceRegistry.getMode('custom_test' as any);
      expect(retrieved).toBe(customMode);
    });

    it('should unregister modes', () => {
      const result = persistenceRegistry.unregisterMode('manual_only');

      expect(result).toBe(true);
      expect(persistenceRegistry.getMode('manual_only')).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null current target', () => {
      const mode = persistenceRegistry.getMode('keep_target');
      state.currentTarget = null;

      const shouldSwitch = mode?.shouldSwitchTarget(null, enemies[0], state, config);

      expect(shouldSwitch).toBe(true);
    });

    it('should handle null new target', () => {
      const mode = persistenceRegistry.getMode('keep_target');

      const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], null, state, config);

      expect(shouldSwitch).toBe(false);
    });

    it('should handle both targets null', () => {
      const mode = persistenceRegistry.getMode('keep_target');
      state.currentTarget = null;

      const shouldSwitch = mode?.shouldSwitchTarget(null, null, state, config);

      expect(shouldSwitch).toBe(false);
    });

    it('should handle locked target in all modes', () => {
      const modes = ['keep_target', 'switch_freely', 'switch_aggressive', 'manual_only'];
      state.isTargetLocked = true;

      for (const modeName of modes) {
        const mode = persistenceRegistry.getMode(modeName as any);
        const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], enemies[1], state, config);

        expect(shouldSwitch).toBe(false);
      }
    });

    it('should handle dead current target in all modes', () => {
      const modes = ['keep_target', 'switch_freely', 'switch_aggressive', 'manual_only'];
      const deadEnemy = { ...enemies[0], isAlive: false };

      for (const modeName of modes) {
        const mode = persistenceRegistry.getMode(modeName as any);
        const shouldSwitch = mode?.shouldSwitchTarget(deadEnemy, enemies[1], state, config);

        expect(shouldSwitch).toBe(true);
      }
    });

    it('should handle zero switch threshold', () => {
      const mode = persistenceRegistry.getMode('switch_freely');
      const zeroThresholdConfig = { ...config, switchThreshold: 0 };

      const shouldSwitch = mode?.shouldSwitchTarget(
        enemies[0],
        enemies[1],
        state,
        zeroThresholdConfig,
      );

      expect(shouldSwitch).toBe(true);
    });

    it('should handle high switch threshold', () => {
      const mode = persistenceRegistry.getMode('switch_freely');
      const highThresholdConfig = { ...config, switchThreshold: 1.0 };

      const shouldSwitch = mode?.shouldSwitchTarget(
        enemies[0],
        enemies[1],
        state,
        highThresholdConfig,
      );

      expect(shouldSwitch).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should handle frequent mode checks efficiently', () => {
      const mode = persistenceRegistry.getMode('keep_target');
      const times: number[] = [];

      for (let i = 0; i < 1000; i++) {
        const startTime = performance.now();
        mode?.shouldSwitchTarget(enemies[0], enemies[1], state, config);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      expect(averageTime).toBeLessThan(0.01); // Should be very fast
    });

    it('should maintain consistent performance across modes', () => {
      const modes = ['keep_target', 'switch_freely', 'switch_aggressive', 'manual_only'];
      const times: number[] = [];

      for (const modeName of modes) {
        const mode = persistenceRegistry.getMode(modeName as any);
        const startTime = performance.now();
        mode?.shouldSwitchTarget(enemies[0], enemies[1], state, config);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      expect(averageTime).toBeLessThan(0.01);
    });
  });

  describe('Integration', () => {
    it('should work with different targeting strategies', () => {
      const strategies = ['closest', 'highest_threat', 'lowest_hp', 'fastest'];

      for (const strategy of strategies) {
        state.strategy = strategy as any;
        state.lastStrategyChange = Date.now();

        const mode = persistenceRegistry.getMode('manual_only');
        const shouldSwitch = mode?.shouldSwitchTarget(enemies[0], enemies[1], state, config);

        expect(shouldSwitch).toBe(true);
      }
    });

    it('should work with different enemy types', () => {
      const mantairEnemy: Enemy = {
        id: 'mantair1',
        position: { x: 150, y: 150 },
        health: { current: 120, max: 120 },
        damage: 40,
        speed: 90,
        armor: 8,
        shield: 0,
        elementalType: 'fire',
        isAlive: true,
        threatLevel: 0.7,
        distance: 212.13,
      };

      const swarmEnemy: Enemy = {
        id: 'swarm1',
        position: { x: 80, y: 80 },
        health: { current: 30, max: 30 },
        damage: 20,
        speed: 150,
        armor: 2,
        shield: 0,
        elementalType: 'ice',
        isAlive: true,
        threatLevel: 0.4,
        distance: 113.14,
      };

      const mode = persistenceRegistry.getMode('switch_freely');
      const shouldSwitch = mode?.shouldSwitchTarget(mantairEnemy, swarmEnemy, state, config);

      expect(typeof shouldSwitch).toBe('boolean');
    });
  });
});
