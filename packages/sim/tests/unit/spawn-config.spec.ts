/**
 * @file Unit tests for spawn configuration system
 * @description P1-E2-S1: Unit tests for spawn rate calculations and ward configurations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_SPAWN_CONFIG,
  createWardConfigs,
  calculateSpawnRate,
  getEnemyConfig,
  selectEnemyFamily,
  createSpawnConfig,
  validateSpawnConfig,
  type SpawnConfig,
} from '../../src/enemies/spawn-config.js';
import type { Family, LandId, WardId } from '../../src/enemies/types.js';

describe('Spawn Configuration', () => {
  describe('Default Configuration', () => {
    it('should have valid default spawn configuration', () => {
      expect(DEFAULT_SPAWN_CONFIG.baseRate).toBeGreaterThan(0);
      expect(DEFAULT_SPAWN_CONFIG.distanceMultiplier).toBeGreaterThan(1);
      expect(DEFAULT_SPAWN_CONFIG.maxSpawnRate).toBeGreaterThan(DEFAULT_SPAWN_CONFIG.baseRate);
      expect(DEFAULT_SPAWN_CONFIG.distanceThresholds).toHaveLength(6);
    });

    it('should have distance thresholds in ascending order', () => {
      const thresholds = DEFAULT_SPAWN_CONFIG.distanceThresholds;
      for (let i = 1; i < thresholds.length; i++) {
        expect(thresholds[i]!.distance).toBeGreaterThan(thresholds[i - 1]!.distance);
      }
    });
  });

  describe('Ward Configuration Creation', () => {
    it('should create ward configurations', () => {
      const wardConfigs = createWardConfigs();

      expect(wardConfigs.size).toBeGreaterThan(0);

      for (const [wardId, config] of wardConfigs) {
        expect(config.wardId).toBe(wardId);
        expect(config.landId).toBeGreaterThan(0);
        expect(config.spawnRateMultiplier).toBeGreaterThan(0);
        expect(config.availableEnemyTypes.length).toBeGreaterThan(0);
        expect(config.enemyConfigs.size).toBeGreaterThan(0);
      }
    });

    it('should include both melee and ranged enemy types', () => {
      const wardConfigs = createWardConfigs();

      for (const [, config] of wardConfigs) {
        expect(config.availableEnemyTypes).toContain(1); // Melee
        expect(config.availableEnemyTypes).toContain(2); // Ranged
      }
    });

    it('should have valid enemy configurations', () => {
      const wardConfigs = createWardConfigs();

      for (const [, config] of wardConfigs) {
        for (const family of config.availableEnemyTypes) {
          const enemyConfig = config.enemyConfigs.get(family);
          expect(enemyConfig).toBeDefined();
          expect(enemyConfig!.family).toBe(family);
          expect(enemyConfig!.baseHp).toBeGreaterThan(0);
          expect(enemyConfig!.baseSpeed).toBeGreaterThan(0);
          expect(enemyConfig!.baseContactDmg).toBeGreaterThan(0);
          expect(enemyConfig!.spawnWeight).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Spawn Rate Calculation', () => {
    it('should calculate base spawn rate at distance 0', () => {
      const rate = calculateSpawnRate(DEFAULT_SPAWN_CONFIG, 0);
      expect(rate).toBe(DEFAULT_SPAWN_CONFIG.baseRate);
    });

    it('should increase spawn rate with distance', () => {
      const rate0 = calculateSpawnRate(DEFAULT_SPAWN_CONFIG, 0);
      const rate100 = calculateSpawnRate(DEFAULT_SPAWN_CONFIG, 100);
      const rate500 = calculateSpawnRate(DEFAULT_SPAWN_CONFIG, 500);

      expect(rate100).toBeGreaterThan(rate0);
      expect(rate500).toBeGreaterThan(rate100);
    });

    it('should apply distance threshold multipliers', () => {
      const rate100 = calculateSpawnRate(DEFAULT_SPAWN_CONFIG, 100);
      const expectedRate = DEFAULT_SPAWN_CONFIG.baseRate * 1.2; // First threshold multiplier

      expect(rate100).toBeCloseTo(expectedRate, 1);
    });

    it('should apply exponential growth factor beyond highest threshold', () => {
      // Test exponential growth beyond the highest threshold (5000)
      const rate5000 = calculateSpawnRate(DEFAULT_SPAWN_CONFIG, 5000);
      const rate5100 = calculateSpawnRate(DEFAULT_SPAWN_CONFIG, 5100);

      // Should have exponential growth beyond highest threshold
      expect(rate5100).toBeCloseTo(rate5000 * 1.1, 2); // Growth factor applied
    });

    it('should cap at maximum spawn rate', () => {
      const rate = calculateSpawnRate(DEFAULT_SPAWN_CONFIG, 10000);
      expect(rate).toBeLessThanOrEqual(DEFAULT_SPAWN_CONFIG.maxSpawnRate);
    });

    it('should handle negative distance', () => {
      const rate = calculateSpawnRate(DEFAULT_SPAWN_CONFIG, -100);
      expect(rate).toBe(DEFAULT_SPAWN_CONFIG.baseRate);
    });
  });

  describe('Enemy Configuration Retrieval', () => {
    let config: SpawnConfig;

    beforeEach(() => {
      config = createSpawnConfig();
    });

    it('should get enemy configuration for valid ward and family', () => {
      const enemyConfig = getEnemyConfig(config, 1 as WardId, 1 as Family);

      expect(enemyConfig).toBeDefined();
      expect(enemyConfig!.family).toBe(1);
    });

    it('should return undefined for invalid ward', () => {
      const enemyConfig = getEnemyConfig(config, 999 as WardId, 1 as Family);
      expect(enemyConfig).toBeUndefined();
    });

    it('should return undefined for invalid family', () => {
      const enemyConfig = getEnemyConfig(config, 1 as WardId, 999 as Family);
      expect(enemyConfig).toBeUndefined();
    });
  });

  describe('Enemy Family Selection', () => {
    let config: SpawnConfig;

    beforeEach(() => {
      config = createSpawnConfig();
    });

    it('should select enemy family based on weights', () => {
      const selections = new Map<Family, number>();
      const iterations = 1000;

      // Run selection many times to test probability distribution
      for (let i = 0; i < iterations; i++) {
        const randomValue = Math.random();
        const family = selectEnemyFamily(config, 1 as WardId, randomValue);

        if (family) {
          selections.set(family, (selections.get(family) || 0) + 1);
        }
      }

      // Should have selected both families
      expect(selections.has(1)).toBe(true); // Melee
      expect(selections.has(2)).toBe(true); // Ranged

      // Melee should be more common (higher weight)
      const meleeCount = selections.get(1) || 0;
      const rangedCount = selections.get(2) || 0;
      expect(meleeCount).toBeGreaterThan(rangedCount);
    });

    it('should return undefined for invalid ward', () => {
      const family = selectEnemyFamily(config, 999 as WardId, 0.5);
      expect(family).toBeUndefined();
    });

    it('should handle edge case random values', () => {
      const family0 = selectEnemyFamily(config, 1 as WardId, 0);
      const family1 = selectEnemyFamily(config, 1 as WardId, 1);

      expect(family0).toBeDefined();
      expect(family1).toBeDefined();
    });
  });

  describe('Spawn Configuration Creation', () => {
    it('should create complete spawn configuration', () => {
      const config = createSpawnConfig();

      expect(config.baseRate).toBe(DEFAULT_SPAWN_CONFIG.baseRate);
      expect(config.distanceMultiplier).toBe(DEFAULT_SPAWN_CONFIG.distanceMultiplier);
      expect(config.maxSpawnRate).toBe(DEFAULT_SPAWN_CONFIG.maxSpawnRate);
      expect(config.distanceThresholds).toEqual(DEFAULT_SPAWN_CONFIG.distanceThresholds);
      expect(config.wardConfigs.size).toBeGreaterThan(0);
    });

    it('should have populated ward configurations', () => {
      const config = createSpawnConfig();

      for (const [wardId, wardConfig] of config.wardConfigs) {
        expect(wardConfig.wardId).toBe(wardId);
        expect(wardConfig.availableEnemyTypes.length).toBeGreaterThan(0);
        expect(wardConfig.enemyConfigs.size).toBeGreaterThan(0);
      }
    });
  });

  describe('Configuration Validation', () => {
    it('should validate correct configuration', () => {
      const config = createSpawnConfig();
      const errors = validateSpawnConfig(config);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid base rate', () => {
      const config = createSpawnConfig();
      config.baseRate = 0;

      const errors = validateSpawnConfig(config);
      expect(errors).toContain('Base spawn rate must be positive');
    });

    it('should detect invalid maximum spawn rate', () => {
      const config = createSpawnConfig();
      config.maxSpawnRate = config.baseRate;

      const errors = validateSpawnConfig(config);
      expect(errors).toContain('Maximum spawn rate must be greater than base rate');
    });

    it('should detect invalid distance multiplier', () => {
      const config = createSpawnConfig();
      config.distanceMultiplier = 1.0;

      const errors = validateSpawnConfig(config);
      expect(errors).toContain('Distance multiplier must be greater than 1.0');
    });

    it('should detect missing ward configurations', () => {
      const config = createSpawnConfig();
      config.wardConfigs.clear();

      const errors = validateSpawnConfig(config);
      expect(errors).toContain('At least one ward configuration is required');
    });

    it('should detect unsorted distance thresholds', () => {
      const config = createSpawnConfig();
      config.distanceThresholds = [
        { distance: 100, spawnRateMultiplier: 1.2 },
        { distance: 50, spawnRateMultiplier: 1.1 }, // Out of order
        { distance: 200, spawnRateMultiplier: 1.3 },
      ];

      const errors = validateSpawnConfig(config);
      expect(errors).toContain('Distance thresholds must be in ascending order');
    });

    it('should detect ward with no enemy types', () => {
      const config = createSpawnConfig();
      const wardConfig = config.wardConfigs.get(1 as WardId);
      if (wardConfig) {
        wardConfig.availableEnemyTypes = [];
      }

      const errors = validateSpawnConfig(config);
      expect(errors.some((error) => error.includes('must have at least one enemy type'))).toBe(
        true,
      );
    });

    it('should detect ward with invalid spawn rate multiplier', () => {
      const config = createSpawnConfig();
      const wardConfig = config.wardConfigs.get(1 as WardId);
      if (wardConfig) {
        wardConfig.spawnRateMultiplier = 0;
      }

      const errors = validateSpawnConfig(config);
      expect(errors.some((error) => error.includes('spawn rate multiplier must be positive'))).toBe(
        true,
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty distance thresholds', () => {
      const config = createSpawnConfig();
      config.distanceThresholds = [];

      const rate = calculateSpawnRate(config, 100);
      expect(rate).toBeGreaterThan(0);
    });

    it('should handle single distance threshold', () => {
      const config = createSpawnConfig();
      config.distanceThresholds = [{ distance: 0, spawnRateMultiplier: 1.0 }];

      const rate = calculateSpawnRate(config, 100);
      expect(rate).toBeGreaterThan(0);
    });

    it('should handle very large distances', () => {
      const config = createSpawnConfig();
      const rate = calculateSpawnRate(config, 1000000);

      expect(rate).toBeLessThanOrEqual(config.maxSpawnRate);
      expect(rate).toBeGreaterThan(0);
    });
  });
});
