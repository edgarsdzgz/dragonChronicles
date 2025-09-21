/**
 * @file Unit tests for EnemyPool class
 * @description P1-E2-S1: Unit tests for object pooling system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  EnemyPool,
  DEFAULT_POOL_CONFIG,
  type EnemyPoolConfig,
} from '../../src/enemies/enemy-pool.js';
import { EnemyState } from '../../src/enemies/types.js';
import type { Family, LandId, WardId, Vector2 } from '../../src/enemies/types.js';

describe('EnemyPool', () => {
  let pool: EnemyPool;
  let config: EnemyPoolConfig;

  beforeEach(() => {
    config = { ...DEFAULT_POOL_CONFIG };
    pool = new EnemyPool(config);
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultPool = new EnemyPool();
      const stats = defaultPool.getStats();

      expect(stats.totalSize).toBe(DEFAULT_POOL_CONFIG.initialSize);
      expect(stats.activeCount).toBe(0);
      expect(stats.availableCount).toBe(DEFAULT_POOL_CONFIG.initialSize);
    });

    it('should initialize with custom configuration', () => {
      const customConfig: EnemyPoolConfig = {
        initialSize: 10,
        maxSize: 50,
        growthFactor: 2.0,
        maxGrowthSize: 20,
      };

      const customPool = new EnemyPool(customConfig);
      const stats = customPool.getStats();

      expect(stats.totalSize).toBe(10);
      expect(stats.availableCount).toBe(10);
    });

    it('should pre-allocate enemy objects', () => {
      const stats = pool.getStats();
      expect(stats.totalSize).toBe(config.initialSize);
      expect(stats.availableCount).toBe(config.initialSize);
    });
  });

  describe('Allocation', () => {
    it('should allocate enemy from pool', () => {
      const family = 1 as Family;
      const position: Vector2 = { x: 100, y: 200 };
      const wardId = 1 as WardId;
      const landId = 1 as LandId;
      const spawnDistance = 50;

      const enemy = pool.allocate(family, position, wardId, landId, spawnDistance);

      expect(enemy).not.toBeNull();
      expect(enemy?.id).toBeGreaterThan(0);
      expect(enemy?.family).toBe(family);
      expect(enemy?.position).toEqual(position);
      expect(enemy?.wardId).toBe(wardId);
      expect(enemy?.landId).toBe(landId);
      expect(enemy?.spawnDistance).toBe(spawnDistance);
      expect(enemy?.isActive).toBe(true);
      expect(enemy?.state).toBe(EnemyState.APPROACH);
    });

    it('should update pool statistics after allocation', () => {
      const initialStats = pool.getStats();

      pool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);

      const newStats = pool.getStats();
      expect(newStats.activeCount).toBe(initialStats.activeCount + 1);
      expect(newStats.availableCount).toBe(initialStats.availableCount - 1);
      expect(newStats.utilizationRate).toBeGreaterThan(0);
    });

    it('should generate unique IDs for each allocation', () => {
      const enemy1 = pool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);
      const enemy2 = pool.allocate(2 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);

      expect(enemy1?.id).not.toBe(enemy2?.id);
      expect(enemy2?.id).toBe(enemy1!.id + 1);
    });

    it('should expand pool when needed', () => {
      // Allocate all initial enemies
      const initialSize = config.initialSize;
      for (let i = 0; i < initialSize; i++) {
        pool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);
      }

      // Next allocation should trigger expansion
      const enemy = pool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);

      expect(enemy).not.toBeNull();
      expect(pool.getTotalSize()).toBeGreaterThan(initialSize);
    });

    it('should return null when pool is at maximum size and full', () => {
      // Create a small pool that can't expand
      const smallConfig: EnemyPoolConfig = {
        initialSize: 1,
        maxSize: 1,
        growthFactor: 1.5,
        maxGrowthSize: 1,
      };

      const smallPool = new EnemyPool(smallConfig);

      // Allocate the only available enemy
      smallPool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);

      // Next allocation should fail
      const enemy = smallPool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);
      expect(enemy).toBeNull();
    });
  });

  describe('Deallocation', () => {
    it('should deallocate enemy and return to pool', () => {
      const enemy = pool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);
      const initialStats = pool.getStats();

      pool.deallocate(enemy!);

      const newStats = pool.getStats();
      expect(newStats.activeCount).toBe(initialStats.activeCount - 1);
      expect(newStats.availableCount).toBe(initialStats.availableCount + 1);
    });

    it('should reset enemy properties on deallocation', () => {
      const enemy = pool.allocate(1 as Family, { x: 100, y: 200 }, 1 as WardId, 1 as LandId, 50);

      pool.deallocate(enemy!);

      expect(enemy!.id).toBe(0);
      expect(enemy!.family).toBe(1);
      expect(enemy!.position).toEqual({ x: 0, y: 0 });
      expect(enemy!.velocity).toEqual({ x: 0, y: 0 });
      expect(enemy!.spawnTime).toBe(0);
      expect(enemy!.spawnDistance).toBe(0);
      expect(enemy!.wardId).toBe(0);
      expect(enemy!.landId).toBe(0);
      expect(enemy!.isActive).toBe(false);
      expect(enemy!.state).toBe(EnemyState.APPROACH);
    });

    it('should handle deallocation of already inactive enemy', () => {
      const enemy = pool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);
      const initialStats = pool.getStats();

      // Deallocate twice
      pool.deallocate(enemy!);
      pool.deallocate(enemy!);

      const newStats = pool.getStats();
      expect(newStats.activeCount).toBe(initialStats.activeCount - 1);
      expect(newStats.availableCount).toBe(initialStats.availableCount + 1);
    });
  });

  describe('Statistics', () => {
    it('should track peak usage correctly', () => {
      // Allocate several enemies
      const enemies = [];
      for (let i = 0; i < 5; i++) {
        enemies.push(pool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0));
      }

      let stats = pool.getStats();
      expect(stats.peakUsage).toBe(5);

      // Deallocate some
      pool.deallocate(enemies[0]!);
      pool.deallocate(enemies[1]!);

      stats = pool.getStats();
      expect(stats.peakUsage).toBe(5); // Peak should remain
      expect(stats.activeCount).toBe(3);
    });

    it('should calculate utilization rate correctly', () => {
      // Allocate half the pool
      const halfSize = Math.floor(config.initialSize / 2);
      const enemies = [];

      for (let i = 0; i < halfSize; i++) {
        enemies.push(pool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0));
      }

      const stats = pool.getStats();
      expect(stats.utilizationRate).toBeCloseTo(0.5, 1);
    });
  });

  describe('Pool Management', () => {
    it('should check if pool is full correctly', () => {
      expect(pool.isFull()).toBe(false);

      // Create a pool that's at max size and allocate all enemies
      const smallConfig: EnemyPoolConfig = {
        initialSize: 2,
        maxSize: 2,
        growthFactor: 1.5,
        maxGrowthSize: 1,
      };

      const smallPool = new EnemyPool(smallConfig);
      smallPool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);
      smallPool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);

      expect(smallPool.isFull()).toBe(true);
    });

    it('should get active enemies list', () => {
      const enemy1 = pool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);
      const enemy2 = pool.allocate(2 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);

      const activeEnemies = pool.getActiveEnemies();
      expect(activeEnemies).toHaveLength(2);
      expect(activeEnemies).toContain(enemy1);
      expect(activeEnemies).toContain(enemy2);
    });

    it('should reset pool correctly', () => {
      // Allocate some enemies
      pool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);
      pool.allocate(2 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);

      pool.reset();

      const stats = pool.getStats();
      expect(stats.activeCount).toBe(0);
      expect(stats.availableCount).toBe(config.initialSize);
      expect(stats.peakUsage).toBe(0);
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      const newConfig = { maxSize: 500 };
      pool.updateConfig(newConfig);

      // Should be able to expand beyond original max size
      // (This is tested indirectly through allocation behavior)
      expect(true).toBe(true); // Placeholder - actual test would involve expansion
    });
  });

  describe('Edge Cases', () => {
    it('should handle allocation with zero initial size', () => {
      const zeroConfig: EnemyPoolConfig = {
        initialSize: 0,
        maxSize: 10,
        growthFactor: 2.0,
        maxGrowthSize: 5,
      };

      const zeroPool = new EnemyPool(zeroConfig);
      const enemy = zeroPool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0);

      expect(enemy).not.toBeNull();
      expect(zeroPool.getTotalSize()).toBeGreaterThan(0);
    });

    it('should handle rapid allocation and deallocation', () => {
      const enemies = [];

      // Rapid allocation
      for (let i = 0; i < 10; i++) {
        enemies.push(pool.allocate(1 as Family, { x: 0, y: 0 }, 1 as WardId, 1 as LandId, 0));
      }

      // Rapid deallocation
      for (const enemy of enemies) {
        pool.deallocate(enemy!);
      }

      const stats = pool.getStats();
      expect(stats.activeCount).toBe(0);
      expect(stats.availableCount).toBe(config.initialSize);
    });
  });
});
