/**
 * Performance Tests for Enhanced AI System
 * Tests performance with 200+ enemies as required by P1-E2-S2
 */

import { describe, it, expect } from 'vitest';
import { EnhancedAIManager } from '../../../dist/enemies/ai/enhanced-ai-manager.js';
import type { SpawnedEnemy, Vector2 } from '../../../dist/enemies/types.js';
import type { AIBehaviorConfig } from '../../../dist/enemies/ai/state-machine.js';

describe('Enhanced AI Performance', () => {
  const createMockEnemy = (id: number): SpawnedEnemy =>
    ({
      id: `enemy-${id}`,
      type: 'mantair-corsair',
      position: { x: Math.random() * 1000, y: Math.random() * 1000 },
      velocity: { x: 0, y: 0 },
      spawnTime: Date.now(),
      spawnDistance: 200,
      wardId: 'test-ward',
      landId: 'test-land',
      isActive: true,
      poolIndex: id,
      state: 'approach' as any,
      // Add required properties
      hp: 10,
      spd: 50,
      atk: 5,
      def: 2,
    }) as SpawnedEnemy;

  const createMockConfig = (): AIBehaviorConfig => ({
    speedMultiplier: 1.0,
    attackRange: 300,
    attackDamage: 5,
    attackCooldown: 2000,
    stopDistance: 50,
    updateFrequency: 10,
  });

  describe('Large Scale Performance', () => {
    it('should handle 200+ enemies efficiently', () => {
      const aiManager = new EnhancedAIManager();
      const enemyCount = 250; // Test with 250 enemies

      // Create targets
      const targets: Vector2[] = [
        { x: 500, y: 500 },
        { x: 300, y: 300 },
        { x: 700, y: 700 },
      ];
      aiManager.setTargets(targets);

      const startTime = performance.now();

      // Add 250 enemies
      for (let i = 0; i < enemyCount; i++) {
        const enemy = createMockEnemy(i);
        const config = createMockConfig();
        aiManager.addEnemy(enemy, config);
      }

      const addTime = performance.now();
      console.log(`Added ${enemyCount} enemies in ${(addTime - startTime).toFixed(2)}ms`);

      // Update AI system 100 times (simulating 100 frames)
      const updateStartTime = performance.now();
      for (let frame = 0; frame < 100; frame++) {
        aiManager.update();
      }
      const updateEndTime = performance.now();
      const updateDuration = updateEndTime - updateStartTime;

      console.log(`Updated ${enemyCount} enemies for 100 frames in ${updateDuration.toFixed(2)}ms`);
      console.log(`Average time per frame: ${(updateDuration / 100).toFixed(2)}ms`);
      console.log(
        `Average time per enemy per frame: ${(updateDuration / 100 / enemyCount).toFixed(4)}ms`,
      );

      // Performance assertions
      expect(updateDuration).toBeLessThan(1000); // Should complete in under 1 second
      expect(updateDuration / 100).toBeLessThan(16.67); // Should be under 16.67ms per frame (60 FPS)
      expect(aiManager.getAIStates().size).toBe(enemyCount);

      // Cleanup
      aiManager.destroy();
    });

    it('should maintain performance with mixed enemy types', () => {
      const aiManager = new EnhancedAIManager();
      const enemyCount = 200;

      const targets: Vector2[] = [{ x: 500, y: 500 }];
      aiManager.setTargets(targets);

      const startTime = performance.now();

      // Add mixed enemy types
      for (let i = 0; i < enemyCount; i++) {
        const enemy = createMockEnemy(i);
        const config: AIBehaviorConfig = {
          speedMultiplier: i % 2 === 0 ? 1.0 : 1.5, // Alternate between types
          attackRange: i % 2 === 0 ? 300 : 200,
          attackDamage: i % 2 === 0 ? 5 : 2,
          attackCooldown: i % 2 === 0 ? 2000 : 1500,
          stopDistance: 50,
          updateFrequency: 10,
        };
        aiManager.addEnemy(enemy, config);
      }

      // Update many times
      for (let frame = 0; frame < 50; frame++) {
        aiManager.update();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Mixed enemy types (${enemyCount} enemies, 50 frames): ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(500); // Should complete quickly
      expect(aiManager.getAIStates().size).toBe(enemyCount);

      aiManager.destroy();
    });

    it('should handle dynamic enemy addition/removal efficiently', () => {
      const aiManager = new EnhancedAIManager();
      const targets: Vector2[] = [{ x: 500, y: 500 }];
      aiManager.setTargets(targets);

      const startTime = performance.now();

      // Add enemies in batches
      for (let batch = 0; batch < 10; batch++) {
        // Add 20 enemies
        for (let i = 0; i < 20; i++) {
          const enemy = createMockEnemy(batch * 20 + i);
          const config = createMockConfig();
          aiManager.addEnemy(enemy, config);
        }

        // Update a few times
        for (let frame = 0; frame < 5; frame++) {
          aiManager.update();
        }

        // Remove some enemies (every other batch)
        if (batch % 2 === 1) {
          for (let i = 0; i < 10; i++) {
            aiManager.removeEnemy(batch * 20 + i);
          }
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`Dynamic enemy management (10 batches): ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(1000);
      expect(aiManager.getAIStates().size).toBeGreaterThan(0);

      aiManager.destroy();
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with many enemies', () => {
      const aiManager = new EnhancedAIManager();
      const targets: Vector2[] = [{ x: 500, y: 500 }];
      aiManager.setTargets(targets);

      // Add and remove enemies multiple times
      for (let cycle = 0; cycle < 5; cycle++) {
        // Add 100 enemies
        for (let i = 0; i < 100; i++) {
          const enemy = createMockEnemy(cycle * 100 + i);
          const config = createMockConfig();
          aiManager.addEnemy(enemy, config);
        }

        // Update many times
        for (let frame = 0; frame < 20; frame++) {
          aiManager.update();
        }

        // Remove all enemies
        for (let i = 0; i < 100; i++) {
          aiManager.removeEnemy(cycle * 100 + i);
        }
      }

      // Should have no enemies left
      expect(aiManager.getAIStates().size).toBe(0);

      aiManager.destroy();
    });
  });

  describe('Target Management Performance', () => {
    it('should efficiently find closest targets for many enemies', () => {
      const aiManager = new EnhancedAIManager();
      const enemyCount = 200;

      // Create many targets
      const targets: Vector2[] = [];
      for (let i = 0; i < 20; i++) {
        targets.push({
          x: Math.random() * 1000,
          y: Math.random() * 1000,
        });
      }
      aiManager.setTargets(targets);

      // Add many enemies
      for (let i = 0; i < enemyCount; i++) {
        const enemy = createMockEnemy(i);
        const config = createMockConfig();
        aiManager.addEnemy(enemy, config);
      }

      const startTime = performance.now();

      // Update many times to test target finding performance
      for (let frame = 0; frame < 100; frame++) {
        aiManager.update();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(
        `Target finding (${enemyCount} enemies, 20 targets, 100 frames): ${duration.toFixed(2)}ms`,
      );
      expect(duration).toBeLessThan(1000);

      aiManager.destroy();
    });
  });
});
