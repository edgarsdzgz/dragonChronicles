/**
 * Enhanced AI Manager Tests
 * Tests the integration of proven AI logic with our simulation package
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnhancedAIManager } from '../../../dist/enemies/ai/enhanced-ai-manager.js';
import type { SpawnedEnemy, Vector2 } from '../../../dist/enemies/types.js';
import type { AIBehaviorConfig } from '../../../dist/enemies/ai/state-machine.js';

describe('Enhanced AI Manager', () => {
  let aiManager: EnhancedAIManager;
  let mockEnemy: SpawnedEnemy;
  let mockConfig: AIBehaviorConfig;

  beforeEach(() => {
    aiManager = new EnhancedAIManager();
    
    mockEnemy = {
      id: 'test-enemy-1',
      type: 'mantair-corsair',
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      spawnTime: Date.now(),
      spawnDistance: 200,
      wardId: 'test-ward',
      landId: 'test-land',
      isActive: true,
      poolIndex: 1,
      state: 'approach' as any,
      // Add required properties
      hp: 10,
      spd: 50,
      atk: 5,
      def: 2,
    } as SpawnedEnemy;

    mockConfig = {
      approachSpeed: 1.0,
      attackRange: 300,
      attackCooldown: 2000,
      health: 10,
    };
  });

  describe('Enemy Management', () => {
    it('should add enemy to AI management', () => {
      aiManager.addEnemy(mockEnemy, mockConfig);
      
      const aiState = aiManager.getAIState(1);
      expect(aiState).toBeDefined();
      expect(aiState?.enemy).toBe(mockEnemy);
      expect(aiState?.isMoving).toBe(true);
      expect(aiState?.health).toBe(10);
    });

    it('should remove enemy from AI management', () => {
      aiManager.addEnemy(mockEnemy, mockConfig);
      expect(aiManager.getAIState(1)).toBeDefined();
      
      aiManager.removeEnemy(1);
      expect(aiManager.getAIState(1)).toBeUndefined();
    });

    it('should handle multiple enemies', () => {
      const enemy2 = { ...mockEnemy, poolIndex: 2 };
      
      aiManager.addEnemy(mockEnemy, mockConfig);
      aiManager.addEnemy(enemy2, mockConfig);
      
      expect(aiManager.getAIStates().size).toBe(2);
    });
  });

  describe('Target Management', () => {
    it('should set targets for AI to pursue', () => {
      const targets: Vector2[] = [
        { x: 200, y: 200 },
        { x: 300, y: 300 }
      ];
      
      aiManager.setTargets(targets);
      aiManager.addEnemy(mockEnemy, mockConfig);
      
      // Update AI to process targets
      aiManager.update();
      
      const aiState = aiManager.getAIState(1);
      expect(aiState?.target).toBeDefined();
    });

    it('should find closest target', () => {
      const targets: Vector2[] = [
        { x: 150, y: 150 }, // Closer
        { x: 500, y: 500 }  // Farther
      ];
      
      aiManager.setTargets(targets);
      aiManager.addEnemy(mockEnemy, mockConfig);
      aiManager.update();
      
      const aiState = aiManager.getAIState(1);
      expect(aiState?.target.x).toBe(150);
      expect(aiState?.target.y).toBe(150);
    });
  });

  describe('AI Behavior', () => {
    it('should move enemy toward target when far away', () => {
      const targets: Vector2[] = [{ x: 500, y: 500 }];
      aiManager.setTargets(targets);
      aiManager.addEnemy(mockEnemy, mockConfig);
      
      const initialX = mockEnemy.position.x;
      const initialY = mockEnemy.position.y;
      
      // Update multiple times to see movement
      for (let i = 0; i < 10; i++) {
        aiManager.update();
      }
      
      // Enemy should have moved toward target
      expect(mockEnemy.position.x).not.toBe(initialX);
      expect(mockEnemy.position.y).not.toBe(initialY);
    });

    it('should stop moving when in attack range', () => {
      const targets: Vector2[] = [{ x: 120, y: 120 }]; // Close to enemy
      aiManager.setTargets(targets);
      aiManager.addEnemy(mockEnemy, mockConfig);
      
      // Update to process the close target
      aiManager.update();
      
      const aiState = aiManager.getAIState(1);
      expect(aiState?.isMoving).toBe(false);
    });

    it('should resume moving if target moves away', () => {
      const targets: Vector2[] = [{ x: 120, y: 120 }]; // Close initially
      aiManager.setTargets(targets);
      aiManager.addEnemy(mockEnemy, mockConfig);
      
      // Update to get in range
      aiManager.update();
      let aiState = aiManager.getAIState(1);
      expect(aiState?.isMoving).toBe(false);
      
      // Move target far away
      aiManager.setTargets([{ x: 500, y: 500 }]);
      aiManager.update();
      
      aiState = aiManager.getAIState(1);
      expect(aiState?.isMoving).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle many enemies efficiently', () => {
      const startTime = performance.now();
      
      // Add many enemies
      for (let i = 0; i < 100; i++) {
        const enemy = { ...mockEnemy, poolIndex: i };
        aiManager.addEnemy(enemy, mockConfig);
      }
      
      const targets: Vector2[] = [{ x: 200, y: 200 }];
      aiManager.setTargets(targets);
      
      // Update many times
      for (let i = 0; i < 100; i++) {
        aiManager.update();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
      expect(aiManager.getAIStates().size).toBe(100);
    });
  });

  describe('Cleanup', () => {
    it('should destroy all AI instances', () => {
      aiManager.addEnemy(mockEnemy, mockConfig);
      expect(aiManager.getAIStates().size).toBe(1);
      
      aiManager.destroy();
      expect(aiManager.getAIStates().size).toBe(0);
    });
  });
});
