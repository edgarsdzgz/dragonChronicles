/**
 * @file Integration tests for enemy system components
 * @description P1-E2-S1: Integration tests for enemy spawning, pooling, and configuration
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PoolManager } from '../../src/enemies/pool-manager.js';
import { EnemyPool } from '../../src/enemies/enemy-pool.js';
import { createSpawnConfig, calculateSpawnRate, selectEnemyFamily, getEnemyConfig, } from '../../src/enemies/spawn-config.js';
describe('Enemy System Integration', () => {
    let poolManager;
    let enemyPool;
    beforeEach(() => {
        poolManager = new PoolManager();
        enemyPool = new EnemyPool();
    });
    afterEach(() => {
        poolManager.destroy();
    });
    describe('Pool Manager and Enemy Pool Integration', () => {
        it('should spawn and manage enemies through pool manager', () => {
            const family = 1;
            const position = { x: 100, y: 200 };
            const wardId = 1;
            const landId = 1;
            const spawnDistance = 50;
            // Spawn enemy through pool manager
            const enemy = poolManager.spawnEnemy(family, position, wardId, landId, spawnDistance);
            expect(enemy).not.toBeNull();
            expect(enemy?.family).toBe(family);
            expect(enemy?.position).toEqual(position);
            // Verify enemy is tracked in pool manager
            const activeEnemies = poolManager.getActiveEnemies();
            expect(activeEnemies).toContain(enemy);
            // Destroy enemy through pool manager
            poolManager.destroyEnemy(enemy);
            // Verify enemy is removed
            const updatedActiveEnemies = poolManager.getActiveEnemies();
            expect(updatedActiveEnemies).not.toContain(enemy);
        });
        it('should handle multiple enemy families through integration', () => {
            // Spawn mixed enemy types
            const meleeEnemy = poolManager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            const rangedEnemy = poolManager.spawnEnemy(2, { x: 10, y: 10 }, 1, 1, 0);
            expect(meleeEnemy?.family).toBe(1);
            expect(rangedEnemy?.family).toBe(2);
            // Test family-based queries
            const meleeEnemies = poolManager.getActiveEnemiesByFamily(1);
            const rangedEnemies = poolManager.getActiveEnemiesByFamily(2);
            expect(meleeEnemies).toHaveLength(1);
            expect(rangedEnemies).toHaveLength(1);
            expect(meleeEnemies[0]).toBe(meleeEnemy);
            expect(rangedEnemies[0]).toBe(rangedEnemy);
        });
        it('should handle spatial queries through integration', () => {
            const center = { x: 50, y: 50 };
            const radius = 30;
            // Spawn enemies at different distances
            const closeEnemy = poolManager.spawnEnemy(1, { x: 60, y: 60 }, 1, 1, 0);
            const farEnemy = poolManager.spawnEnemy(1, { x: 100, y: 100 }, 1, 1, 0);
            // Test radius-based queries
            const enemiesInRadius = poolManager.getEnemiesInRadius(center, radius);
            expect(enemiesInRadius).toHaveLength(1);
            expect(enemiesInRadius[0]).toBe(closeEnemy);
            // Test radius-based destruction
            const destroyed = poolManager.destroyEnemiesInRadius(center, radius);
            expect(destroyed).toBe(1);
            const remainingEnemies = poolManager.getActiveEnemies();
            expect(remainingEnemies).toHaveLength(1);
            expect(remainingEnemies[0]).toBe(farEnemy);
        });
    });
    describe('Spawn Configuration and Pool Integration', () => {
        it('should integrate spawn configuration with pool management', () => {
            const spawnConfig = createSpawnConfig();
            const wardId = 1;
            const landId = 1;
            // Test spawn rate calculation
            const spawnRate = calculateSpawnRate(spawnConfig, 100);
            expect(spawnRate).toBeGreaterThan(0);
            // Test enemy family selection
            const selectedFamily = selectEnemyFamily(spawnConfig, wardId, 0.5);
            expect(selectedFamily).toBeDefined();
            expect([1, 2]).toContain(selectedFamily);
            // Test enemy configuration retrieval
            const enemyConfig = getEnemyConfig(spawnConfig, wardId, selectedFamily);
            expect(enemyConfig).toBeDefined();
            expect(enemyConfig.family).toBe(selectedFamily);
            // Spawn enemy using configuration data
            const enemy = poolManager.spawnEnemy(selectedFamily, { x: 0, y: 0 }, wardId, landId, 100);
            expect(enemy).not.toBeNull();
            expect(enemy?.family).toBe(selectedFamily);
        });
        it('should handle ward-specific enemy spawning', () => {
            const spawnConfig = createSpawnConfig();
            const wardId = 1;
            const landId = 1;
            // Spawn enemies using configuration
            const enemies = [];
            for (let i = 0; i < 10; i++) {
                const family = selectEnemyFamily(spawnConfig, wardId, Math.random());
                if (family) {
                    const enemy = poolManager.spawnEnemy(family, { x: i * 10, y: i * 10 }, wardId, landId, 0);
                    enemies.push(enemy);
                }
            }
            expect(enemies.length).toBeGreaterThan(0);
            // Verify all spawned enemies have valid configurations
            for (const enemy of enemies) {
                if (enemy) {
                    const config = getEnemyConfig(spawnConfig, wardId, enemy.family);
                    expect(config).toBeDefined();
                    expect(config.family).toBe(enemy.family);
                }
            }
        });
    });
    describe('Performance Integration Tests', () => {
        it('should handle high-volume enemy spawning efficiently', () => {
            const spawnConfig = createSpawnConfig();
            const wardId = 1;
            const landId = 1;
            const maxEnemies = 100;
            const start = performance.now();
            // Spawn many enemies rapidly
            for (let i = 0; i < maxEnemies; i++) {
                const family = selectEnemyFamily(spawnConfig, wardId, Math.random());
                if (family) {
                    const spawnRate = calculateSpawnRate(spawnConfig, i * 10);
                    const enemy = poolManager.spawnEnemy(family, { x: i, y: i }, wardId, landId, i * 10);
                    expect(enemy).not.toBeNull();
                }
            }
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(200); // Should complete in less than 200ms
            // Verify all enemies are active
            const stats = poolManager.getStats();
            expect(stats.activeCount).toBe(maxEnemies);
        });
        it('should handle rapid spawn and destroy cycles', () => {
            const spawnConfig = createSpawnConfig();
            const wardId = 1;
            const landId = 1;
            const cycles = 50;
            const start = performance.now();
            for (let cycle = 0; cycle < cycles; cycle++) {
                // Spawn enemies
                const enemies = [];
                for (let i = 0; i < 10; i++) {
                    const family = selectEnemyFamily(spawnConfig, wardId, Math.random());
                    if (family) {
                        const enemy = poolManager.spawnEnemy(family, { x: i, y: i }, wardId, landId, 0);
                        enemies.push(enemy);
                    }
                }
                // Destroy all enemies
                for (const enemy of enemies) {
                    if (enemy) {
                        poolManager.destroyEnemy(enemy);
                    }
                }
            }
            const duration = performance.now() - start;
            expect(duration).toBeLessThan(500); // Should complete in less than 500ms
            // Verify no enemies remain
            const stats = poolManager.getStats();
            expect(stats.activeCount).toBe(0);
        });
    });
    describe('Error Handling Integration', () => {
        it('should handle invalid configuration gracefully', () => {
            // Test with invalid ward ID
            const spawnConfig = createSpawnConfig();
            const invalidWardId = 999;
            const family = selectEnemyFamily(spawnConfig, invalidWardId, 0.5);
            expect(family).toBeUndefined();
            const enemyConfig = getEnemyConfig(spawnConfig, invalidWardId, 1);
            expect(enemyConfig).toBeUndefined();
        });
        it('should handle pool exhaustion gracefully', () => {
            // Fill up the pool manager
            const maxEnemies = poolManager.getAvailableSpawnSlots();
            for (let i = 0; i < maxEnemies; i++) {
                poolManager.spawnEnemy(1, { x: i, y: i }, 1, 1, 0);
            }
            // Next spawn should fail
            const enemy = poolManager.spawnEnemy(1, { x: 0, y: 0 }, 1, 1, 0);
            expect(enemy).toBeNull();
            // Verify pool manager knows it's full
            expect(poolManager.canSpawn()).toBe(false);
        });
        it('should maintain consistency during concurrent operations', () => {
            const spawnConfig = createSpawnConfig();
            const wardId = 1;
            const landId = 1;
            // Simulate concurrent spawn and destroy operations
            const operations = [];
            // Spawn operations
            for (let i = 0; i < 20; i++) {
                operations.push(() => {
                    const family = selectEnemyFamily(spawnConfig, wardId, Math.random());
                    if (family) {
                        return poolManager.spawnEnemy(family, { x: i, y: i }, wardId, landId, 0);
                    }
                    return null;
                });
            }
            // Execute spawn operations
            const enemies = operations.map((op) => op());
            // Verify all spawns succeeded
            const validEnemies = enemies.filter((enemy) => enemy !== null);
            expect(validEnemies.length).toBeGreaterThan(0);
            // Destroy all enemies
            for (const enemy of validEnemies) {
                poolManager.destroyEnemy(enemy);
            }
            // Verify consistency
            const stats = poolManager.getStats();
            expect(stats.activeCount).toBe(0);
            expect(stats.totalSpawned).toBe(validEnemies.length);
            expect(stats.totalDestroyed).toBe(validEnemies.length);
        });
    });
    describe('Statistics Integration', () => {
        it('should provide accurate statistics across all components', () => {
            const spawnConfig = createSpawnConfig();
            const wardId = 1;
            const landId = 1;
            // Spawn some enemies
            const enemies = [];
            for (let i = 0; i < 5; i++) {
                const family = selectEnemyFamily(spawnConfig, wardId, Math.random());
                if (family) {
                    const enemy = poolManager.spawnEnemy(family, { x: i, y: i }, wardId, landId, 0);
                    enemies.push(enemy);
                }
            }
            // Get comprehensive statistics
            const stats = poolManager.getStats();
            // Verify pool statistics
            expect(stats.activeCount).toBe(enemies.filter((e) => e !== null).length);
            expect(stats.totalSpawned).toBe(enemies.filter((e) => e !== null).length);
            expect(stats.totalDestroyed).toBe(0);
            expect(stats.utilizationRate).toBeGreaterThan(0);
            // Verify family breakdown
            const meleeCount = stats.activeEnemiesByFamily[1] || 0;
            const rangedCount = stats.activeEnemiesByFamily[2] || 0;
            expect(meleeCount + rangedCount).toBe(stats.activeCount);
            // Destroy some enemies
            poolManager.destroyEnemy(enemies[0]);
            poolManager.destroyEnemy(enemies[1]);
            // Verify updated statistics
            const updatedStats = poolManager.getStats();
            expect(updatedStats.activeCount).toBe(stats.activeCount - 2);
            expect(updatedStats.totalDestroyed).toBe(2);
        });
    });
});
