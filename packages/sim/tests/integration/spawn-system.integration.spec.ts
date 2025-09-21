/**
 * @file Integration tests for complete spawn system
 * @description P1-E2-S1: Integration tests for spawn manager with pool and config
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SpawnManager, SimpleRngImpl } from '../../src/enemies/spawn-manager.js';
import { PoolManager, DEFAULT_POOL_MANAGER_CONFIG } from '../../src/enemies/pool-manager.js';
import { createSpawnConfig, calculateSpawnRate } from '../../src/enemies/spawn-config.js';
import type { Vector2, WardId, LandId, SpawnStats, PoolStats } from '../../src/enemies/types.js';

describe('Spawn System Integration', () => {
  let spawnManager: SpawnManager;
  let poolManager: PoolManager;

  beforeEach(() => {
    poolManager = new PoolManager(DEFAULT_POOL_MANAGER_CONFIG);
    spawnManager = new SpawnManager(poolManager, new SimpleRngImpl());
  });

  describe('Complete Spawn Flow', () => {
    it('should integrate spawn manager with pool manager and spawn config', () => {
      const playerPosition: Vector2 = { x: 500, y: 500 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const distance = 1000;
      const deltaTime = 1000; // 1 second

      // Initial state
      const initialPoolStats = poolManager.getStats();
      const initialSpawnStats = spawnManager.getStats();

      expect(initialPoolStats.activeCount).toBe(0);
      expect(initialSpawnStats.spawnedEnemies).toBe(0);

      // Update spawn manager
      spawnManager.update(1000, distance, playerPosition, currentWard, currentLand, deltaTime);

      // Verify integration worked
      const finalPoolStats = poolManager.getStats();
      const finalSpawnStats = spawnManager.getStats();

      expect(finalSpawnStats.spawnAttempts).toBeGreaterThan(0);
      expect(finalSpawnStats.currentSpawnRate).toBeGreaterThan(0);
      expect(finalPoolStats.activeCount).toBeGreaterThan(0);
      expect(finalSpawnStats.spawnedEnemies).toBe(finalPoolStats.activeCount);
    });

    it('should handle distance-based spawn rate scaling', () => {
      const playerPosition: Vector2 = { x: 500, y: 500 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 1000;

      // Test at different distances
      const distances = [0, 100, 500, 1000, 5000];
      const spawnRates: number[] = [];

      for (const distance of distances) {
        spawnManager.update(1000, distance, playerPosition, currentWard, currentLand, deltaTime);
        const stats = spawnManager.getStats();
        spawnRates.push(stats.currentSpawnRate);
      }

      // Spawn rate should generally increase with distance
      for (let i = 1; i < spawnRates.length; i++) {
        expect(spawnRates[i]).toBeGreaterThanOrEqual(spawnRates[i - 1]);
      }
    });

    it('should maintain pool utilization efficiency', () => {
      const playerPosition: Vector2 = { x: 500, y: 500 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 1000;

      // Simulate extended gameplay
      for (let i = 0; i < 10; i++) {
        spawnManager.update(i * 1000, i * 100, playerPosition, currentWard, currentLand, deltaTime);
      }

      const poolStats = poolManager.getStats();
      const spawnStats = spawnManager.getStats();

      // Pool should be utilized but not overwhelmed
      expect(poolStats.utilizationRate).toBeGreaterThan(0);
      expect(poolStats.utilizationRate).toBeLessThanOrEqual(1.0);

      // Should have spawned enemies
      expect(spawnStats.spawnedEnemies).toBeGreaterThan(0);
      expect(spawnStats.spawnedEnemies).toBe(poolStats.activeCount);
    });

    it('should handle enemy lifecycle correctly', () => {
      const playerPosition: Vector2 = { x: 500, y: 500 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 1000;

      // Spawn some enemies
      spawnManager.update(1000, 1000, playerPosition, currentWard, currentLand, deltaTime);

      const poolStatsAfterSpawn = poolManager.getStats();
      const spawnStatsAfterSpawn = spawnManager.getStats();

      expect(poolStatsAfterSpawn.activeCount).toBeGreaterThan(0);
      expect(spawnStatsAfterSpawn.spawnedEnemies).toBe(poolStatsAfterSpawn.activeCount);

      // Destroy some enemies
      const activeEnemies = poolManager.getActiveEnemies();
      const enemiesToDestroy = activeEnemies.slice(0, Math.floor(activeEnemies.length / 2));

      for (const enemy of enemiesToDestroy) {
        poolManager.destroyEnemy(enemy);
      }

      const poolStatsAfterDestroy = poolManager.getStats();
      const spawnStatsAfterDestroy = spawnManager.getStats();

      expect(poolStatsAfterDestroy.activeCount).toBeLessThan(poolStatsAfterSpawn.activeCount);
      expect(spawnStatsAfterDestroy.despawnedEnemies).toBeGreaterThan(0);
    });
  });

  describe('Configuration Integration', () => {
    it('should use spawn configuration for enemy properties', () => {
      const playerPosition: Vector2 = { x: 500, y: 500 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 1000;

      spawnManager.update(1000, 1000, playerPosition, currentWard, currentLand, deltaTime);

      const activeEnemies = poolManager.getActiveEnemies();
      expect(activeEnemies.length).toBeGreaterThan(0);

      // Verify enemies have proper configuration
      for (const enemy of activeEnemies) {
        expect(enemy.family).toBeGreaterThan(0);
        expect(enemy.hp).toBeGreaterThan(0);
        expect(enemy.maxHp).toBeGreaterThan(0);
        expect(enemy.spd).toBeGreaterThan(0);
        expect(enemy.contactDmg).toBeGreaterThan(0);
        expect(enemy.wardId).toBe(currentWard);
        expect(enemy.landId).toBe(currentLand);
      }
    });

    it('should respect ward-specific spawn configurations', () => {
      const playerPosition: Vector2 = { x: 500, y: 500 };
      const ward1: WardId = 1;
      const ward2: WardId = 2;
      const currentLand: LandId = 1;
      const deltaTime = 1000;

      // Spawn in ward 1
      spawnManager.update(1000, 1000, playerPosition, ward1, currentLand, deltaTime);
      const ward1Enemies = poolManager.getActiveEnemies();

      // Clear and spawn in ward 2
      spawnManager.destroyAllEnemies();
      spawnManager.update(2000, 1000, playerPosition, ward2, currentLand, deltaTime);
      const ward2Enemies = poolManager.getActiveEnemies();

      // Both wards should spawn enemies (if configured)
      expect(ward1Enemies.length).toBeGreaterThan(0);
      expect(ward2Enemies.length).toBeGreaterThan(0);

      // All enemies should have correct ward ID
      for (const enemy of ward1Enemies) {
        expect(enemy.wardId).toBe(ward1);
      }
      for (const enemy of ward2Enemies) {
        expect(enemy.wardId).toBe(ward2);
      }
    });
  });

  describe('Performance Integration', () => {
    it('should maintain performance with high spawn rates', () => {
      const playerPosition: Vector2 = { x: 500, y: 500 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 1000;

      const startTime = performance.now();

      // Simulate high-distance gameplay (high spawn rate)
      for (let i = 0; i < 5; i++) {
        spawnManager.update(i * 1000, 10000, playerPosition, currentWard, currentLand, deltaTime);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly
      expect(duration).toBeLessThan(500); // Less than 500ms

      const poolStats = poolManager.getStats();
      const spawnStats = spawnManager.getStats();

      expect(spawnStats.spawnedEnemies).toBeGreaterThan(0);
      expect(poolStats.activeCount).toBe(spawnStats.spawnedEnemies);
    });

    it('should handle pool expansion efficiently', () => {
      const playerPosition: Vector2 = { x: 500, y: 500 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 1000;

      // Force spawn many enemies to trigger pool expansion
      for (let i = 0; i < 20; i++) {
        spawnManager.forceSpawn({ x: 100 + i * 10, y: 100 + i * 10 }, currentWard, currentLand);
      }

      const poolStats = poolManager.getStats();
      const spawnStats = spawnManager.getStats();

      expect(spawnStats.spawnedEnemies).toBe(20);
      expect(poolStats.activeCount).toBe(20);
      expect(poolStats.totalSize).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Statistics Integration', () => {
    it('should maintain consistent statistics across components', () => {
      const playerPosition: Vector2 = { x: 500, y: 500 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 1000;

      // Generate activity
      spawnManager.update(1000, 1000, playerPosition, currentWard, currentLand, deltaTime);
      spawnManager.forceSpawn({ x: 600, y: 600 }, currentWard, currentLand);

      const poolStats = poolManager.getStats();
      const spawnStats = spawnManager.getStats();

      // Statistics should be consistent
      expect(spawnStats.spawnedEnemies).toBe(poolStats.activeCount);
      expect(poolStats.activeCount).toBeGreaterThan(0);
      expect(spawnStats.spawnAttempts).toBeGreaterThanOrEqual(spawnStats.spawnedEnemies);
    });

    it('should track despawned enemies correctly', () => {
      // Spawn some enemies
      spawnManager.forceSpawn({ x: 100, y: 100 }, 1, 1);
      spawnManager.forceSpawn({ x: 200, y: 200 }, 1, 1);

      const initialStats = spawnManager.getStats();
      expect(initialStats.spawnedEnemies).toBe(2);

      // Destroy one enemy
      const activeEnemies = poolManager.getActiveEnemies();
      poolManager.destroyEnemy(activeEnemies[0]);

      // Update spawn manager to refresh stats
      spawnManager.update(1000, 1000, { x: 500, y: 500 }, 1, 1, 1000);

      const finalStats = spawnManager.getStats();
      expect(finalStats.despawnedEnemies).toBe(1);
      expect(finalStats.spawnedEnemies).toBe(2); // Should not change
    });
  });

  describe('Edge Case Integration', () => {
    it('should handle rapid spawn/destroy cycles', () => {
      const playerPosition: Vector2 = { x: 500, y: 500 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 100;

      // Rapid cycles
      for (let i = 0; i < 10; i++) {
        spawnManager.update(i * 100, 1000, playerPosition, currentWard, currentLand, deltaTime);

        if (i % 2 === 0) {
          spawnManager.destroyAllEnemies();
        }
      }

      const poolStats = poolManager.getStats();
      const spawnStats = spawnManager.getStats();

      // System should remain stable
      expect(poolStats.activeCount).toBeGreaterThanOrEqual(0);
      expect(spawnStats.spawnedEnemies).toBeGreaterThanOrEqual(0);
      expect(spawnStats.despawnedEnemies).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero spawn rate gracefully', () => {
      const playerPosition: Vector2 = { x: 500, y: 500 };
      const currentWard: WardId = 1;
      const currentLand: LandId = 1;
      const deltaTime = 1000;

      // Test at very low distance (should have low spawn rate)
      spawnManager.update(1000, 0, playerPosition, currentWard, currentLand, deltaTime);

      const stats = spawnManager.getStats();
      expect(stats.currentSpawnRate).toBeGreaterThan(0); // Should still have some rate
      expect(stats.spawnAttempts).toBeGreaterThanOrEqual(0);
    });
  });
});
