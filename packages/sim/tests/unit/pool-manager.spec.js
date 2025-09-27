/**
 * @file Unit tests for PoolManager class
 * @description P1-E2-S1: Unit tests for high-level pool management
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PoolManager, DEFAULT_POOL_MANAGER_CONFIG, } from '../../src/enemies/pool-manager.js';
describe('PoolManager', () => {
    let manager;
    let config;
    beforeEach(() => {
        config = { ...DEFAULT_POOL_MANAGER_CONFIG };
        manager = new PoolManager(config);
    });
    afterEach(() => {
        manager.destroy();
    });
    describe('Initialization', () => {
        it('should initialize with default configuration', () => {
            const defaultManager = new PoolManager();
            const stats = defaultManager.getStats();
            expect(stats.totalSize).toBe(DEFAULT_POOL_MANAGER_CONFIG.initialSize);
            expect(stats.activeCount).toBe(0);
            expect(stats.totalSpawned).toBe(0);
            expect(stats.totalDestroyed).toBe(0);
            defaultManager.destroy();
        });
        it('should initialize with custom configuration', () => {
            const customConfig = {
                initialSize: 10,
                maxSize: 50,
                growthFactor: 2.0,
                maxGrowthSize: 20,
                maxActiveEnemies: 25,
                cleanupInterval: 10000,
                enableAutoCleanup: false,
            };
            const customManager = new PoolManager(customConfig);
            const stats = customManager.getStats();
            expect(stats.totalSize).toBe(10);
            expect(stats.activeCount).toBe(0);
            customManager.destroy();
        });
    });
    describe('Enemy Spawning', () => {
        it('should spawn enemy successfully', () => {
            const family = 1;
            const position = { x: 100, y: 200 };
            const wardId = 1;
            const landId = 1;
            const spawnDistance = 50;
            const enemy = manager.spawnEnemy(family, position, wardId, landId, spawnDistance);
            expect(enemy).not.toBeNull();
            expect(enemy?.family).toBe(family);
            expect(enemy?.position).toEqual(position);
            expect(enemy?.wardId).toBe(wardId);
            expect(enemy?.landId).toBe(landId);
            expect(enemy?.spawnDistance).toBe(spawnDistance);
        });
        it('should respect maximum active enemy limit', () => {
            // Spawn enemies up to the limit
            const enemies = [];
            for (let i = 0; i < config.maxActiveEnemies; i++) {
                enemies.push(manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0));
            }
            // Next spawn should fail
            const enemy = manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            expect(enemy).toBeNull();
        });
        it('should track spawn statistics', () => {
            const initialStats = manager.getStats();
            manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            manager.spawnEnemy(2, { x: 0, y: 0 }, 1, 1, 0);
            const newStats = manager.getStats();
            expect(newStats.totalSpawned).toBe(initialStats.totalSpawned + 2);
        });
        it('should check if can spawn more enemies', () => {
            expect(manager.canSpawn()).toBe(true);
            // Fill up the pool
            for (let i = 0; i < config.maxActiveEnemies; i++) {
                manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            }
            expect(manager.canSpawn()).toBe(false);
        });
        it('should calculate available spawn slots', () => {
            expect(manager.getAvailableSpawnSlots()).toBe(config.maxActiveEnemies);
            manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            manager.spawnEnemy(2, { x: 0, y: 0 }, 1, 1, 0);
            expect(manager.getAvailableSpawnSlots()).toBe(config.maxActiveEnemies - 2);
        });
    });
    describe('Enemy Destruction', () => {
        it('should destroy enemy and return to pool', () => {
            const enemy = manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            const initialStats = manager.getStats();
            manager.destroyEnemy(enemy);
            const newStats = manager.getStats();
            expect(newStats.activeCount).toBe(initialStats.activeCount - 1);
            expect(newStats.totalDestroyed).toBe(initialStats.totalDestroyed + 1);
        });
        it('should destroy enemies by family', () => {
            // Spawn mixed enemies
            manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            manager.spawnEnemy(2, { x: 0, y: 0 }, 1, 1, 0);
            const destroyed = manager.destroyEnemiesByFamily(1);
            expect(destroyed).toBe(2);
            const activeEnemies = manager.getActiveEnemies();
            expect(activeEnemies).toHaveLength(1);
            expect(activeEnemies[0]?.family).toBe(2);
        });
        it('should destroy enemies in radius', () => {
            const center = { x: 100, y: 100 };
            const radius = 50;
            // Spawn enemies at different distances
            manager.spawnEnemy(1, { x: 120, y: 120 }, 1, 1, 0); // Inside radius
            manager.spawnEnemy(1, { x: 200, y: 200 }, 1, 1, 0); // Outside radius
            manager.spawnEnemy(2, { x: 110, y: 110 }, 1, 1, 0); // Inside radius
            const destroyed = manager.destroyEnemiesInRadius(center, radius);
            expect(destroyed).toBe(2);
            const activeEnemies = manager.getActiveEnemies();
            expect(activeEnemies).toHaveLength(1);
            expect(activeEnemies[0]?.position).toEqual({ x: 200, y: 200 });
        });
    });
    describe('Enemy Queries', () => {
        beforeEach(() => {
            // Spawn some test enemies
            manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            manager.spawnEnemy(1, { x: 10, y: 10 }, 1, 1, 0);
            manager.spawnEnemy(2, { x: 20, y: 20 }, 1, 1, 0);
        });
        it('should get all active enemies', () => {
            const activeEnemies = manager.getActiveEnemies();
            expect(activeEnemies).toHaveLength(3);
        });
        it('should get active enemies by family', () => {
            const meleeEnemies = manager.getActiveEnemiesByFamily(1);
            const rangedEnemies = manager.getActiveEnemiesByFamily(2);
            expect(meleeEnemies).toHaveLength(2);
            expect(rangedEnemies).toHaveLength(1);
            expect(meleeEnemies.every((enemy) => enemy.family === 1)).toBe(true);
            expect(rangedEnemies.every((enemy) => enemy.family === 2)).toBe(true);
        });
        it('should get enemies in radius', () => {
            const center = { x: 5, y: 5 };
            const radius = 15;
            const enemiesInRadius = manager.getEnemiesInRadius(center, radius);
            expect(enemiesInRadius).toHaveLength(2);
            // Check that all returned enemies are within radius
            enemiesInRadius.forEach((enemy) => {
                const distance = Math.sqrt(Math.pow(enemy.position.x - center.x, 2) + Math.pow(enemy.position.y - center.y, 2));
                expect(distance).toBeLessThanOrEqual(radius);
            });
        });
    });
    describe('Statistics', () => {
        it('should provide comprehensive statistics', () => {
            // Spawn some enemies
            manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            manager.spawnEnemy(2, { x: 0, y: 0 }, 1, 1, 0);
            const stats = manager.getStats();
            expect(stats.totalSpawned).toBe(3);
            expect(stats.totalDestroyed).toBe(0);
            expect(stats.activeCount).toBe(3);
            expect(stats.activeEnemiesByFamily[1]).toBe(2);
            expect(stats.activeEnemiesByFamily[2]).toBe(1);
        });
        it('should track spawn and destroy counts correctly', () => {
            const enemy1 = manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            const _enemy2 = manager.spawnEnemy(2, { x: 0, y: 0 }, 1, 1, 0);
            manager.destroyEnemy(enemy1);
            const stats = manager.getStats();
            expect(stats.totalSpawned).toBe(2);
            expect(stats.totalDestroyed).toBe(1);
            expect(stats.activeCount).toBe(1);
        });
    });
    describe('Configuration Management', () => {
        it('should update configuration', () => {
            const newConfig = { maxActiveEnemies: 100 };
            manager.updateConfig(newConfig);
            // Should be able to spawn more enemies
            expect(manager.getAvailableSpawnSlots()).toBe(100);
        });
        it('should handle auto-cleanup configuration changes', () => {
            // Disable auto-cleanup
            manager.updateConfig({ enableAutoCleanup: false });
            // Enable auto-cleanup
            manager.updateConfig({ enableAutoCleanup: true });
            // Should not throw errors
            expect(true).toBe(true);
        });
    });
    describe('Reset and Cleanup', () => {
        it('should reset manager state', () => {
            // Spawn some enemies
            manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            manager.spawnEnemy(2, { x: 0, y: 0 }, 1, 1, 0);
            manager.reset();
            const stats = manager.getStats();
            expect(stats.activeCount).toBe(0);
            expect(stats.totalSpawned).toBe(0);
            expect(stats.totalDestroyed).toBe(0);
        });
        it('should destroy manager and cleanup resources', () => {
            manager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            manager.destroy();
            // Should not throw errors when accessing destroyed manager
            expect(() => manager.getStats()).not.toThrow();
        });
    });
    describe('Performance Tests', () => {
        it('should handle rapid spawning efficiently', () => {
            const start = performance.now();
            // Spawn many enemies rapidly
            for (let i = 0; i < 100; i++) {
                manager.spawnEnemy(1, { x: i, y: i }, 1, 1, 0);
            }
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(100); // Should complete in less than 100ms
        });
        it('should handle rapid destruction efficiently', () => {
            // Spawn enemies first
            const enemies = [];
            for (let i = 0; i < 50; i++) {
                enemies.push(manager.spawnEnemy(1, { x: i, y: i }, 1, 1, 0));
            }
            const start = performance.now();
            // Destroy all enemies rapidly
            for (const enemy of enemies) {
                manager.destroyEnemy(enemy);
            }
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(50); // Should complete in less than 50ms
        });
    });
    describe('Edge Cases', () => {
        it('should handle zero max active enemies', () => {
            const zeroConfig = {
                ...config,
                maxActiveEnemies: 0,
            };
            const zeroManager = new PoolManager(zeroConfig);
            expect(zeroManager.canSpawn()).toBe(false);
            expect(zeroManager.getAvailableSpawnSlots()).toBe(0);
            const enemy = zeroManager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            expect(enemy).toBeNull();
            zeroManager.destroy();
        });
        it('should handle destruction of non-existent enemy', () => {
            const fakeEnemy = {
                id: 999,
                family: 1,
                hp: 0,
                maxHp: 0,
                spd: 0,
                contactDmg: 0,
                position: { x: 0, y: 0 },
                velocity: { x: 0, y: 0 },
                spawnTime: 0,
                spawnDistance: 0,
                wardId: 0,
                landId: 0,
                isActive: false,
                poolIndex: 0,
                state: 'approach',
            };
            // Should not throw error
            expect(() => manager.destroyEnemy(fakeEnemy)).not.toThrow();
        });
    });
});
