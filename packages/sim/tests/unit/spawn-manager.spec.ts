/**
 * @file Unit tests for spawn manager
 * @description P1-E2-S1: Unit tests for spawn manager integration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SpawnManager,
  SimpleRngImpl,
  type SimpleRng,
  DEFAULT_SPAWN_MANAGER_CONFIG,
} from '../../src/enemies/spawn-manager.js';
import { PoolManager, DEFAULT_POOL_MANAGER_CONFIG } from '../../src/enemies/pool-manager.js';
import type { Vector2, WardId, LandId, Family } from '../../src/enemies/types.js';

/**
 * Mock RNG for deterministic testing
 */
class MockRng implements SimpleRng {
  private values: number[] = [];
  private index = 0;

  constructor(values: number[] = []) {
    this.values = values;
  }

  randomFloat(min?: number, max?: number): number {
    const value = this.values[this.index % this.values.length];
    this.index++;

    if (min !== undefined && max !== undefined) {
      return min + value * (max - min);
    }
    return value;
  }

  randomInt(min: number, max: number): number {
    return Math.floor(this.randomFloat(min, max + 1));
  }

  reset(): void {
    this.index = 0;
  }
}

describe('Spawn Manager', () => {
  let poolManager: PoolManager;
  let mockRng: MockRng;
  let spawnManager: SpawnManager;

  beforeEach(() => {
    poolManager = new PoolManager(DEFAULT_POOL_MANAGER_CONFIG);
    mockRng = new MockRng([0.5, 0.3, 0.7, 0.1, 0.9]); // Deterministic values
    spawnManager = new SpawnManager(poolManager, mockRng);
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const manager = new SpawnManager(poolManager);

      expect(manager.getStats()).toEqual({
        spawnAttempts: 0,
        spawnedEnemies: 0,
        despawnedEnemies: 0,
        currentSpawnRate: 0,
      });
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        ...DEFAULT_SPAWN_MANAGER_CONFIG,
        maxSpawnAttempts: 5,
        enableDebugLogging: true,
      };

      const manager = new SpawnManager(poolManager, mockRng, customConfig);
      expect(manager.getPoolManager()).toBe(poolManager);
    });

    it('should initialize with custom RNG', () => {
      const customRng = new MockRng([0.1, 0.2, 0.3]);
      const manager = new SpawnManager(poolManager, customRng);

      expect(manager).toBeDefined();
    });
  });

  describe('Spawn Rate Calculation', () => {
    it('should calculate spawn rate based on distance', () => {
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      // Test at distance 0 (base rate)
      spawnManager.update(1000, 0, playerPosition, currentWard, currentLand, deltaTime);
      const statsAt0 = spawnManager.getStats();
      expect(statsAt0.currentSpawnRate).toBeGreaterThan(0);

      // Test at higher distance (should have higher rate)
      spawnManager.update(2000, 1000, playerPosition, currentWard, currentLand, deltaTime);
      const statsAt1000 = spawnManager.getStats();
      expect(statsAt1000.currentSpawnRate).toBeGreaterThan(statsAt0.currentSpawnRate);
    });

    it('should handle negative distance', () => {
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      spawnManager.update(1000, -100, playerPosition, currentWard, currentLand, deltaTime);
      const stats = spawnManager.getStats();
      expect(stats.currentSpawnRate).toBeGreaterThan(0);
    });
  });

  describe('Enemy Spawning', () => {
    it('should spawn enemies based on spawn rate', () => {
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      const initialStats = spawnManager.getStats();

      spawnManager.update(1000, 500, playerPosition, currentWard, currentLand, deltaTime);

      const finalStats = spawnManager.getStats();
      expect(finalStats.spawnAttempts).toBeGreaterThan(initialStats.spawnAttempts);
      expect(finalStats.spawnedEnemies).toBeGreaterThan(initialStats.spawnedEnemies);
    });

    it('should not spawn when pool is full', () => {
      // Fill up the pool
      const poolManager = spawnManager.getPoolManager();
      const poolStats = poolManager.getStats();

      // Spawn until pool is nearly full
      while (poolManager.canSpawn()) {
        poolManager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
      }

      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      const initialStats = spawnManager.getStats();

      spawnManager.update(1000, 500, playerPosition, currentWard, currentLand, deltaTime);

      const finalStats = spawnManager.getStats();
      expect(finalStats.spawnAttempts).toBeGreaterThan(initialStats.spawnAttempts);
      expect(finalStats.spawnedEnemies).toBe(initialStats.spawnedEnemies); // No new spawns
    });

    it('should spawn enemies at appropriate distances from player', () => {
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      spawnManager.update(1000, 500, playerPosition, currentWard, currentLand, deltaTime);

      const activeEnemies = poolManager.getActiveEnemies();
      expect(activeEnemies.length).toBeGreaterThan(0);

      for (const enemy of activeEnemies) {
        const distance = Math.sqrt(
          Math.pow(enemy.position.x - playerPosition.x, 2) +
            Math.pow(enemy.position.y - playerPosition.y, 2),
        );
        expect(distance).toBeGreaterThan(800); // Should spawn off-screen
      }
    });

    it('should apply enemy configuration correctly', () => {
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      spawnManager.update(1000, 500, playerPosition, currentWard, currentLand, deltaTime);

      const activeEnemies = poolManager.getActiveEnemies();
      expect(activeEnemies.length).toBeGreaterThan(0);

      for (const enemy of activeEnemies) {
        expect(enemy.hp).toBeGreaterThan(0);
        expect(enemy.maxHp).toBeGreaterThan(0);
        expect(enemy.spd).toBeGreaterThan(0);
        expect(enemy.contactDmg).toBeGreaterThan(0);
        expect(enemy.hp).toBe(enemy.maxHp); // Should start at full health
      }
    });
  });

  describe('Force Spawn', () => {
    it('should force spawn enemy at specific position', () => {
      const position: Vector2 = { x: 200, y: 300 };
      const wardId: WardId = 1;
      const landId: LandId = 1;

      const enemy = spawnManager.forceSpawn(position, wardId, landId);

      expect(enemy).not.toBeNull();
      expect(enemy!.position.x).toBe(position.x);
      expect(enemy!.position.y).toBe(position.y);
      expect(enemy!.wardId).toBe(wardId);
      expect(enemy!.landId).toBe(landId);
    });

    it('should force spawn enemy with specific family', () => {
      const position: Vector2 = { x: 200, y: 300 };
      const wardId: WardId = 1;
      const landId: LandId = 1;
      const family: Family = 2; // Ranged

      const enemy = spawnManager.forceSpawn(position, wardId, landId, family);

      expect(enemy).not.toBeNull();
      expect(enemy!.family).toBe(family);
    });

    it('should return null when pool is full', () => {
      // Fill up the pool
      const poolManager = spawnManager.getPoolManager();
      while (poolManager.canSpawn()) {
        poolManager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
      }

      const position: Vector2 = { x: 200, y: 300 };
      const wardId: WardId = 1;
      const landId: LandId = 1;

      const enemy = spawnManager.forceSpawn(position, wardId, landId);
      expect(enemy).toBeNull();
    });
  });

  describe('Statistics', () => {
    it('should track spawn attempts and successes', () => {
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      const initialStats = spawnManager.getStats();

      spawnManager.update(1000, 500, playerPosition, currentWard, currentLand, deltaTime);

      const finalStats = spawnManager.getStats();
      expect(finalStats.spawnAttempts).toBeGreaterThan(initialStats.spawnAttempts);
      expect(finalStats.spawnedEnemies).toBeGreaterThan(initialStats.spawnedEnemies);
      expect(finalStats.spawnAttempts).toBeGreaterThanOrEqual(finalStats.spawnedEnemies);
    });

    it('should track despawned enemies', () => {
      // Spawn some enemies first
      spawnManager.forceSpawn({ x: 100, y: 100 }, 1, 1);
      spawnManager.forceSpawn({ x: 200, y: 200 }, 1, 1);

      const initialStats = spawnManager.getStats();
      expect(initialStats.spawnedEnemies).toBe(2);

      // Destroy all enemies
      spawnManager.destroyAllEnemies();

      const finalStats = spawnManager.getStats();
      expect(finalStats.despawnedEnemies).toBe(2);
    });

    it('should update current spawn rate', () => {
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      spawnManager.update(1000, 1000, playerPosition, currentWard, currentLand, deltaTime);

      const stats = spawnManager.getStats();
      expect(stats.currentSpawnRate).toBeGreaterThan(0);
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig = {
        ...DEFAULT_SPAWN_MANAGER_CONFIG,
        maxSpawnAttempts: 5,
        enableDebugLogging: true,
      };

      spawnManager.updateConfig(newConfig);

      // Configuration is private, but we can test behavior
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      spawnManager.update(1000, 500, playerPosition, currentWard, currentLand, deltaTime);

      const stats = spawnManager.getStats();
      expect(stats.spawnAttempts).toBeLessThanOrEqual(5); // Should respect max attempts
    });
  });

  describe('Reset Functionality', () => {
    it('should reset spawn manager state', () => {
      // Generate some activity
      spawnManager.forceSpawn({ x: 100, y: 100 }, 1, 1);

      const statsBeforeReset = spawnManager.getStats();
      expect(statsBeforeReset.spawnedEnemies).toBeGreaterThan(0);

      spawnManager.reset();

      const statsAfterReset = spawnManager.getStats();
      expect(statsAfterReset.spawnAttempts).toBe(0);
      expect(statsAfterReset.spawnedEnemies).toBe(0);
      expect(statsAfterReset.despawnedEnemies).toBe(0);
      expect(statsAfterReset.currentSpawnRate).toBe(0);
    });

    it('should destroy all enemies', () => {
      // Spawn some enemies
      spawnManager.forceSpawn({ x: 100, y: 100 }, 1, 1);
      spawnManager.forceSpawn({ x: 200, y: 200 }, 1, 1);

      const poolManager = spawnManager.getPoolManager();
      expect(poolManager.getActiveEnemies().length).toBe(2);

      spawnManager.destroyAllEnemies();

      expect(poolManager.getActiveEnemies().length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero delta time', () => {
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 0;

      const initialStats = spawnManager.getStats();

      spawnManager.update(1000, 500, playerPosition, currentWard, currentLand, deltaTime);

      const finalStats = spawnManager.getStats();
      expect(finalStats.spawnAttempts).toBe(initialStats.spawnAttempts);
    });

    it('should handle very large delta time', () => {
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 10000; // 10 seconds

      spawnManager.update(1000, 500, playerPosition, currentWard, currentLand, deltaTime);

      const stats = spawnManager.getStats();
      expect(stats.spawnAttempts).toBeGreaterThan(0);
    });

    it('should handle invalid ward ID', () => {
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const invalidWard: WardId = 999;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      const initialStats = spawnManager.getStats();

      spawnManager.update(1000, 500, playerPosition, invalidWard, currentLand, deltaTime);

      const finalStats = spawnManager.getStats();
      expect(finalStats.spawnAttempts).toBeGreaterThan(initialStats.spawnAttempts);
      expect(finalStats.spawnedEnemies).toBe(initialStats.spawnedEnemies); // Should not spawn
    });
  });

  describe('Performance', () => {
    it('should handle high spawn rates efficiently', () => {
      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      const startTime = performance.now();

      // Simulate high distance (high spawn rate)
      spawnManager.update(1000, 10000, playerPosition, currentWard, currentLand, deltaTime);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly (less than 100ms for this operation)
      expect(duration).toBeLessThan(100);
    });

    it('should respect max spawn attempts limit', () => {
      const customConfig = {
        ...DEFAULT_SPAWN_MANAGER_CONFIG,
        maxSpawnAttempts: 3,
      };

      const manager = new SpawnManager(poolManager, mockRng, customConfig);

      const playerPosition: Vector2 = { x: 100, y: 100 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 2000; // 2 seconds to ensure spawn

      manager.update(1000, 10000, playerPosition, currentWard, currentLand, deltaTime);

      const stats = manager.getStats();
      expect(stats.spawnAttempts).toBeLessThanOrEqual(3);
    });
  });
});
