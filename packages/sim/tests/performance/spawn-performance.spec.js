/**
 * @file Performance tests for spawn system
 * @description P1-E2-S1: Performance validation for enemy spawning system
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SpawnManager, SimpleRngImpl } from '../../src/enemies/spawn-manager.js';
import { PoolManager, DEFAULT_POOL_MANAGER_CONFIG } from '../../src/enemies/pool-manager.js';
describe('Spawn System Performance', () => {
    let spawnManager;
    let poolManager;
    beforeEach(() => {
        poolManager = new PoolManager(DEFAULT_POOL_MANAGER_CONFIG);
        spawnManager = new SpawnManager(poolManager, new SimpleRngImpl());
    });
    describe('Spawn Performance', () => {
        it('should spawn 100 enemies within performance budget', () => {
            const startTime = performance.now();
            const playerPosition = { x: 500, y: 500 };
            const currentWard = 1;
            const currentLand = 1;
            // Spawn 100 enemies
            for (let i = 0; i < 100; i++) {
                const enemy = spawnManager.forceSpawn(playerPosition, currentWard, currentLand);
                expect(enemy).toBeDefined();
            }
            const endTime = performance.now();
            const duration = endTime - startTime;
            // Performance target: < 10ms for 100 spawns (0.1ms per spawn)
            expect(duration).toBeLessThan(10);
            console.log(`Performance: ${duration.toFixed(2)}ms for 100 spawns (${(duration / 100).toFixed(3)}ms per spawn)`);
        });
        it('should handle high-frequency updates efficiently', () => {
            const startTime = performance.now();
            const playerPosition = { x: 500, y: 500 };
            const currentWard = 1;
            const currentLand = 1;
            // Simulate 1000 game loop iterations (16.67ms each at 60fps)
            for (let i = 0; i < 1000; i++) {
                const currentTime = i * 16.67; // 60fps
                spawnManager.update(currentTime, i * 10, playerPosition, currentWard, currentLand, 16.67); // Distance increases
            }
            const endTime = performance.now();
            const duration = endTime - startTime;
            // Performance target: < 50ms for 1000 updates (0.05ms per update)
            expect(duration).toBeLessThan(50);
            console.log(`Performance: ${duration.toFixed(2)}ms for 1000 updates (${(duration / 1000).toFixed(3)}ms per update)`);
        });
        it('should maintain performance with large enemy counts', () => {
            const startTime = performance.now();
            const playerPosition = { x: 500, y: 500 };
            const currentWard = 1;
            const currentLand = 1;
            // Spawn up to pool capacity
            const poolStats = poolManager.getStats();
            const maxEnemies = poolStats.totalSize;
            for (let i = 0; i < maxEnemies; i++) {
                const enemy = spawnManager.forceSpawn(playerPosition, currentWard, currentLand);
                expect(enemy).toBeDefined();
            }
            const endTime = performance.now();
            const duration = endTime - startTime;
            // Performance target: < 100ms for max capacity spawns
            expect(duration).toBeLessThan(100);
            console.log(`Performance: ${duration.toFixed(2)}ms for ${maxEnemies} spawns (${(duration / maxEnemies).toFixed(3)}ms per spawn)`);
        });
        it('should efficiently destroy large numbers of enemies', () => {
            const playerPosition = { x: 500, y: 500 };
            const currentWard = 1;
            const currentLand = 1;
            // Fill the pool
            const poolStats = poolManager.getStats();
            const maxEnemies = poolStats.totalSize;
            for (let i = 0; i < maxEnemies; i++) {
                spawnManager.forceSpawn(playerPosition, currentWard, currentLand);
            }
            // Measure destruction performance
            const startTime = performance.now();
            spawnManager.destroyAllEnemies();
            const endTime = performance.now();
            const duration = endTime - startTime;
            // Performance target: < 20ms for destroying all enemies
            expect(duration).toBeLessThan(20);
            console.log(`Performance: ${duration.toFixed(2)}ms for destroying ${maxEnemies} enemies`);
            // Verify all enemies are destroyed
            const finalStats = spawnManager.getStats();
            expect(finalStats.despawnedEnemies).toBeGreaterThan(0);
        });
    });
    describe('Memory Efficiency', () => {
        it('should not leak memory during repeated spawn/destroy cycles', () => {
            const playerPosition = { x: 500, y: 500 };
            const currentWard = 1;
            const currentLand = 1;
            // Perform multiple spawn/destroy cycles
            for (let cycle = 0; cycle < 10; cycle++) {
                // Spawn enemies
                for (let i = 0; i < 50; i++) {
                    spawnManager.forceSpawn(playerPosition, currentWard, currentLand);
                }
                // Destroy all enemies
                spawnManager.destroyAllEnemies();
                // Verify pool is reset correctly
                const poolStats = poolManager.getStats();
                expect(poolStats.activeCount).toBe(0);
                expect(poolStats.availableCount).toBe(poolStats.totalSize);
            }
            // Final verification that system is still functional
            const finalEnemy = spawnManager.forceSpawn(playerPosition, currentWard, currentLand);
            expect(finalEnemy).toBeDefined();
        });
    });
});
