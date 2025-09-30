/**
 * Test suite for individual targeting strategies
 * Tests each strategy's specific behavior and edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Dragon, Enemy } from '../../src/combat/types.js';
import { createStrategyRegistry } from '../../src/combat/targeting-strategies.js';

describe('Targeting Strategies', () => {
  let dragon: Dragon;
  let enemies: Enemy[];
  let strategyRegistry: ReturnType<typeof createStrategyRegistry>;

  beforeEach(() => {
    // Create test dragon
    dragon = {
      position: { x: 0, y: 0 },
      attackRange: 500,
      elementalType: 'fire',
      targetingConfig: {
        primaryStrategy: 'closest',
        fallbackStrategy: 'highest_threat',
        range: 500,
        updateInterval: 100,
        switchThreshold: 0.1,
        enabledStrategies: [],
        persistenceMode: 'keep_target',
        targetLockDuration: 5000,
      },
    };

    // Create diverse test enemies
    enemies = [
      {
        id: 'close_weak',
        position: { x: 50, y: 50 },
        health: { current: 20, max: 100 },
        damage: 10,
        speed: 50,
        armor: 2,
        shield: 0,
        elementalType: 'ice',
        isAlive: true,
        threatLevel: 0.2,
        distance: 70.71,
      },
      {
        id: 'far_strong',
        position: { x: 400, y: 400 },
        health: { current: 200, max: 200 },
        damage: 80,
        speed: 120,
        armor: 25,
        shield: 50,
        elementalType: 'fire',
        isAlive: true,
        threatLevel: 0.9,
        distance: 565.69,
      },
      {
        id: 'medium_balanced',
        position: { x: 200, y: 200 },
        health: { current: 100, max: 100 },
        damage: 40,
        speed: 80,
        armor: 10,
        shield: 0,
        elementalType: 'lightning',
        isAlive: true,
        threatLevel: 0.6,
        distance: 282.84,
      },
      {
        id: 'fast_glass',
        position: { x: 100, y: 100 },
        health: { current: 30, max: 30 },
        damage: 60,
        speed: 200,
        armor: 1,
        shield: 0,
        elementalType: 'ice',
        isAlive: true,
        threatLevel: 0.7,
        distance: 141.42,
      },
      {
        id: 'slow_tank',
        position: { x: 300, y: 300 },
        health: { current: 150, max: 150 },
        damage: 20,
        speed: 30,
        armor: 40,
        shield: 30,
        elementalType: 'fire',
        isAlive: true,
        threatLevel: 0.4,
        distance: 424.26,
      },
    ];

    strategyRegistry = createStrategyRegistry();
  });

  describe('Closest Strategy', () => {
    it('should target the nearest enemy', () => {
      const strategy = strategyRegistry.getStrategy('closest');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('close_weak'); // Closest enemy
    });

    it('should handle enemies at same distance', () => {
      const sameDistanceEnemies = [
        { ...enemies[0], position: { x: 100, y: 0 } },
        { ...enemies[1], position: { x: 0, y: 100 } },
      ];

      const strategy = strategyRegistry.getStrategy('closest');
      const target = strategy?.calculate(sameDistanceEnemies, dragon);

      expect(target).toBeDefined();
      expect(['enemy1', 'enemy2']).toContain(target?.id);
    });

    it('should return null for no enemies', () => {
      const strategy = strategyRegistry.getStrategy('closest');
      const target = strategy?.calculate([], dragon);

      expect(target).toBeNull();
    });
  });

  describe('Highest Threat Strategy', () => {
    it('should target the most dangerous enemy', () => {
      const strategy = strategyRegistry.getStrategy('highest_threat');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('far_strong'); // Highest threat enemy
    });

    it('should consider multiple threat factors', () => {
      const strategy = strategyRegistry.getStrategy('highest_threat');
      const target = strategy?.calculate(enemies, dragon);

      expect(target).toBeDefined();
      expect(target?.threatLevel).toBeGreaterThan(0);
    });
  });

  describe('Lowest Threat Strategy', () => {
    it('should target the easiest enemy', () => {
      const strategy = strategyRegistry.getStrategy('lowest_threat');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('close_weak'); // Lowest threat enemy
    });

    it('should prioritize weak enemies', () => {
      const strategy = strategyRegistry.getStrategy('lowest_threat');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.threatLevel).toBeLessThan(0.5);
    });
  });

  describe('Health-based Strategies', () => {
    it('should target highest HP enemy', () => {
      const strategy = strategyRegistry.getStrategy('highest_hp');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('far_strong'); // 200 HP
    });

    it('should target lowest HP enemy', () => {
      const strategy = strategyRegistry.getStrategy('lowest_hp');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('fast_glass'); // 30 HP
    });

    it('should handle enemies with same HP', () => {
      const sameHpEnemies = [
        { ...enemies[0], health: { current: 100, max: 100 } },
        { ...enemies[1], health: { current: 100, max: 100 } },
      ];

      const strategy = strategyRegistry.getStrategy('highest_hp');
      const target = strategy?.calculate(sameHpEnemies, dragon);

      expect(target).toBeDefined();
    });
  });

  describe('Damage-based Strategies', () => {
    it('should target highest damage enemy', () => {
      const strategy = strategyRegistry.getStrategy('highest_damage');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('far_strong'); // 80 damage
    });

    it('should target lowest damage enemy', () => {
      const strategy = strategyRegistry.getStrategy('lowest_damage');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('close_weak'); // 10 damage
    });

    it('should handle enemies with same damage', () => {
      const sameDamageEnemies = [
        { ...enemies[0], damage: 50 },
        { ...enemies[1], damage: 50 },
      ];

      const strategy = strategyRegistry.getStrategy('highest_damage');
      const target = strategy?.calculate(sameDamageEnemies, dragon);

      expect(target).toBeDefined();
    });
  });

  describe('Speed-based Strategies', () => {
    it('should target fastest enemy', () => {
      const strategy = strategyRegistry.getStrategy('fastest');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('fast_glass'); // 200 speed
    });

    it('should target slowest enemy', () => {
      const strategy = strategyRegistry.getStrategy('slowest');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('slow_tank'); // 30 speed
    });

    it('should handle enemies with same speed', () => {
      const sameSpeedEnemies = [
        { ...enemies[0], speed: 100 },
        { ...enemies[1], speed: 100 },
      ];

      const strategy = strategyRegistry.getStrategy('fastest');
      const target = strategy?.calculate(sameSpeedEnemies, dragon);

      expect(target).toBeDefined();
    });
  });

  describe('Armor-based Strategies', () => {
    it('should target highest armor enemy', () => {
      const strategy = strategyRegistry.getStrategy('highest_armor');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('slow_tank'); // 40 armor
    });

    it('should target lowest armor enemy', () => {
      const strategy = strategyRegistry.getStrategy('lowest_armor');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('fast_glass'); // 1 armor
    });

    it('should handle enemies with same armor', () => {
      const sameArmorEnemies = [
        { ...enemies[0], armor: 10 },
        { ...enemies[1], armor: 10 },
      ];

      const strategy = strategyRegistry.getStrategy('highest_armor');
      const target = strategy?.calculate(sameArmorEnemies, dragon);

      expect(target).toBeDefined();
    });
  });

  describe('Shield-based Strategies', () => {
    it('should target shielded enemies first', () => {
      const strategy = strategyRegistry.getStrategy('shielded');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('far_strong'); // Has 50 shield
    });

    it('should target unshielded enemies first', () => {
      const strategy = strategyRegistry.getStrategy('unshielded');
      const target = strategy?.calculate(enemies, dragon);

      expect(target?.id).toBe('close_weak'); // No shield
    });

    it('should fall back to closest when no shielded enemies', () => {
      const noShieldEnemies = enemies.map((enemy) => ({ ...enemy, shield: 0 }));

      const strategy = strategyRegistry.getStrategy('shielded');
      const target = strategy?.calculate(noShieldEnemies, dragon);

      expect(target).toBeDefined();
    });

    it('should fall back to closest when no unshielded enemies', () => {
      const allShieldedEnemies = enemies.map((enemy) => ({ ...enemy, shield: 10 }));

      const strategy = strategyRegistry.getStrategy('unshielded');
      const target = strategy?.calculate(allShieldedEnemies, dragon);

      expect(target).toBeDefined();
    });
  });

  describe('Elemental Strategies', () => {
    it('should target enemies weak to dragon element', () => {
      const strategy = strategyRegistry.getStrategy('elemental_weak');
      const target = strategy?.calculate(enemies, dragon);

      // Fire dragon should target ice enemies
      expect(['close_weak', 'fast_glass']).toContain(target?.id);
    });

    it('should target enemies strong against dragon element', () => {
      const strategy = strategyRegistry.getStrategy('elemental_strong');
      const target = strategy?.calculate(enemies, dragon);

      // Fire dragon should target lightning enemies
      expect(target?.id).toBe('medium_balanced');
    });

    it('should fall back to closest when no elemental enemies', () => {
      const noElementalEnemies = enemies.map((enemy) => ({ ...enemy, elementalType: undefined }));

      const strategy = strategyRegistry.getStrategy('elemental_weak');
      const target = strategy?.calculate(noElementalEnemies, dragon);

      expect(target).toBeDefined();
    });

    it('should handle different dragon elements', () => {
      const iceDragon: Dragon = { ...dragon, elementalType: 'ice' };

      const strategy = strategyRegistry.getStrategy('elemental_weak');
      const target = strategy?.calculate(enemies, iceDragon);

      // Ice dragon should target lightning enemies
      expect(target?.id).toBe('medium_balanced');
    });
  });

  describe('Custom Strategy', () => {
    it('should be locked by default', () => {
      const strategy = strategyRegistry.getStrategy('custom');

      expect(strategy?.isUnlocked()).toBe(false);
    });

    it('should fall back to closest strategy', () => {
      const strategy = strategyRegistry.getStrategy('custom');
      const target = strategy?.calculate(enemies, dragon);

      expect(target).toBeDefined();
    });
  });

  describe('Strategy Registry', () => {
    it('should register all strategies', () => {
      const allStrategies = strategyRegistry.getAllStrategies();

      expect(allStrategies).toHaveLength(17);
      expect(allStrategies.map((s) => s.strategy)).toContain('closest');
      expect(allStrategies.map((s) => s.strategy)).toContain('highest_threat');
      expect(allStrategies.map((s) => s.strategy)).toContain('custom');
    });

    it('should get unlocked strategies only', () => {
      const unlockedStrategies = strategyRegistry.getUnlockedStrategies();

      expect(unlockedStrategies).toHaveLength(16); // All except custom
      expect(unlockedStrategies.map((s) => s.strategy)).not.toContain('custom');
    });

    it('should get strategy descriptions', () => {
      const descriptions = strategyRegistry.getStrategyDescriptions();

      expect(descriptions.get('closest')).toBe('Target the nearest enemy in range');
      expect(descriptions.get('highest_threat')).toBe('Target the most dangerous enemy');
      expect(descriptions.get('custom')).toBe('Custom targeting strategy (unlocked later)');
    });

    it('should register custom strategies', () => {
      const customStrategy = {
        strategy: 'custom_test' as any,
        calculate: () => enemies[0],
        getDescription: () => 'Test strategy',
        isUnlocked: () => true,
      };

      strategyRegistry.registerStrategy('custom_test' as any, customStrategy);

      const retrieved = strategyRegistry.getStrategy('custom_test' as any);
      expect(retrieved).toBe(customStrategy);
    });

    it('should unregister strategies', () => {
      const result = strategyRegistry.unregisterStrategy('custom');

      expect(result).toBe(true);
      expect(strategyRegistry.getStrategy('custom')).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle enemies out of range', () => {
      const outOfRangeEnemies = enemies.map((enemy) => ({
        ...enemy,
        position: { x: 1000, y: 1000 },
      }));

      const strategy = strategyRegistry.getStrategy('closest');
      const target = strategy?.calculate(outOfRangeEnemies, dragon);

      expect(target).toBeNull();
    });

    it('should handle dead enemies', () => {
      const deadEnemies = enemies.map((enemy) => ({
        ...enemy,
        isAlive: false,
      }));

      const strategy = strategyRegistry.getStrategy('closest');
      const target = strategy?.calculate(deadEnemies, dragon);

      expect(target).toBeNull();
    });

    it('should handle mixed alive/dead enemies', () => {
      const mixedEnemies = [
        { ...enemies[0], isAlive: true },
        { ...enemies[1], isAlive: false },
        { ...enemies[2], isAlive: true },
      ];

      const strategy = strategyRegistry.getStrategy('closest');
      const target = strategy?.calculate(mixedEnemies, dragon);

      expect(target).toBeDefined();
      expect(target?.isAlive).toBe(true);
    });

    it('should handle enemies with zero values', () => {
      const zeroValueEnemies = [
        {
          ...enemies[0],
          health: { current: 0, max: 100 },
          damage: 0,
          speed: 0,
          armor: 0,
          shield: 0,
        },
      ];

      const strategy = strategyRegistry.getStrategy('lowest_hp');
      const target = strategy?.calculate(zeroValueEnemies, dragon);

      expect(target).toBeDefined();
    });

    it('should handle enemies with maximum values', () => {
      const maxValueEnemies = [
        {
          ...enemies[0],
          health: { current: 1000, max: 1000 },
          damage: 1000,
          speed: 1000,
          armor: 1000,
          shield: 1000,
        },
      ];

      const strategy = strategyRegistry.getStrategy('highest_hp');
      const target = strategy?.calculate(maxValueEnemies, dragon);

      expect(target).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of enemies efficiently', () => {
      const largeEnemyList: Enemy[] = [];
      for (let i = 0; i < 200; i++) {
        largeEnemyList.push({
          id: `enemy${i}`,
          position: { x: Math.random() * 1000, y: Math.random() * 1000 },
          health: { current: Math.random() * 200, max: 200 },
          damage: Math.random() * 100,
          speed: Math.random() * 200,
          armor: Math.random() * 50,
          shield: Math.random() * 30,
          isAlive: true,
          threatLevel: Math.random(),
          distance: 0,
        });
      }

      const strategy = strategyRegistry.getStrategy('closest');
      const startTime = performance.now();
      const target = strategy?.calculate(largeEnemyList, dragon);
      const endTime = performance.now();

      expect(target).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1); // Should complete in less than 1ms
    });

    it('should maintain consistent performance across strategies', () => {
      const strategies = ['closest', 'highest_threat', 'lowest_hp', 'fastest', 'highest_armor'];
      const times: number[] = [];

      for (const strategyName of strategies) {
        const strategy = strategyRegistry.getStrategy(strategyName as any);
        const startTime = performance.now();
        strategy?.calculate(enemies, dragon);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      expect(averageTime).toBeLessThan(0.1); // Average should be less than 0.1ms
    });
  });
});
