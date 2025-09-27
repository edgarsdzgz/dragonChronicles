/**
 * Enhanced AI Integration Tests
 * Tests the integration layer between enhanced AI and existing spawn system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEnhancedAIIntegration,
  addEnemyToEnhancedAI,
  removeEnemyFromEnhancedAI,
  setAITargets,
  updateEnhancedAI,
  startEnhancedAI,
  stopEnhancedAI,
  getAIStatistics,
  getEnemyAIState,
  destroyEnhancedAI,
} from '../../../dist/enemies/ai/enhanced-integration.js';
import type { SpawnedEnemy } from '../../../dist/enemies/types.js';

describe('Enhanced AI Integration', () => {
  let integration: ReturnType<typeof createEnhancedAIIntegration>;
  let mockEnemy: SpawnedEnemy;

  beforeEach(() => {
    integration = createEnhancedAIIntegration();
    
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
  });

  describe('Integration Creation', () => {
    it('should create enhanced AI integration', () => {
      expect(integration.aiManager).toBeDefined();
      expect(integration.isActive).toBe(false);
      expect(integration.targets).toEqual([]);
    });
  });

  describe('Enemy Management', () => {
    it('should add enemy to enhanced AI system', () => {
      addEnemyToEnhancedAI(integration, mockEnemy, 'mantair-corsair');
      
      const aiState = getEnemyAIState(integration, 1);
      expect(aiState).toBeDefined();
      expect(aiState?.enemy).toBe(mockEnemy);
    });

    it('should add swarm enemy with different config', () => {
      const swarmEnemy = { ...mockEnemy, type: 'swarm' };
      addEnemyToEnhancedAI(integration, swarmEnemy, 'swarm');
      
      const aiState = getEnemyAIState(integration, 1);
      expect(aiState).toBeDefined();
    });

    it('should remove enemy from enhanced AI system', () => {
      addEnemyToEnhancedAI(integration, mockEnemy, 'mantair-corsair');
      expect(getEnemyAIState(integration, 1)).toBeDefined();
      
      removeEnemyFromEnhancedAI(integration, 1);
      expect(getEnemyAIState(integration, 1)).toBeUndefined();
    });
  });

  describe('Target Management', () => {
    it('should set targets for AI system', () => {
      const targets = [
        { x: 200, y: 200 },
        { x: 300, y: 300 }
      ];
      
      setAITargets(integration, targets);
      expect(integration.targets).toEqual(targets);
    });

    it('should update AI manager with targets', () => {
      const targets = [{ x: 200, y: 200 }];
      setAITargets(integration, targets);
      
      addEnemyToEnhancedAI(integration, mockEnemy, 'mantair-corsair');
      updateEnhancedAI(integration);
      
      const aiState = getEnemyAIState(integration, 1);
      expect(aiState?.target).toBeDefined();
    });
  });

  describe('AI System Control', () => {
    it('should start enhanced AI system', () => {
      expect(integration.isActive).toBe(false);
      startEnhancedAI(integration);
      expect(integration.isActive).toBe(true);
    });

    it('should stop enhanced AI system', () => {
      startEnhancedAI(integration);
      expect(integration.isActive).toBe(true);
      
      stopEnhancedAI(integration);
      expect(integration.isActive).toBe(false);
    });

    it('should only update when active', () => {
      addEnemyToEnhancedAI(integration, mockEnemy, 'mantair-corsair');
      setAITargets(integration, [{ x: 200, y: 200 }]);
      
      // Update when inactive - should not process
      updateEnhancedAI(integration);
      let aiState = getEnemyAIState(integration, 1);
      expect(aiState?.target.x).toBe(0);
      expect(aiState?.target.y).toBe(0);
      
      // Start and update - should process
      startEnhancedAI(integration);
      updateEnhancedAI(integration);
      aiState = getEnemyAIState(integration, 1);
      expect(aiState?.target.x).toBe(200);
      expect(aiState?.target.y).toBe(200);
    });
  });

  describe('Statistics and Debugging', () => {
    it('should provide AI statistics', () => {
      const stats = getAIStatistics(integration);
      expect(stats.activeEnemies).toBe(0);
      expect(stats.targets).toBe(0);
      expect(stats.isActive).toBe(false);
    });

    it('should update statistics with enemies and targets', () => {
      addEnemyToEnhancedAI(integration, mockEnemy, 'mantair-corsair');
      setAITargets(integration, [{ x: 200, y: 200 }]);
      startEnhancedAI(integration);
      
      const stats = getAIStatistics(integration);
      expect(stats.activeEnemies).toBe(1);
      expect(stats.targets).toBe(1);
      expect(stats.isActive).toBe(true);
    });

    it('should get enemy AI state', () => {
      addEnemyToEnhancedAI(integration, mockEnemy, 'mantair-corsair');
      
      const aiState = getEnemyAIState(integration, 1);
      expect(aiState).toBeDefined();
      expect(aiState?.enemy).toBe(mockEnemy);
    });
  });

  describe('Cleanup', () => {
    it('should destroy enhanced AI integration', () => {
      addEnemyToEnhancedAI(integration, mockEnemy, 'mantair-corsair');
      setAITargets(integration, [{ x: 200, y: 200 }]);
      startEnhancedAI(integration);
      
      expect(integration.isActive).toBe(true);
      expect(integration.targets.length).toBe(1);
      
      destroyEnhancedAI(integration);
      expect(integration.isActive).toBe(false);
      expect(integration.targets).toEqual([]);
    });
  });

  describe('Performance', () => {
    it('should handle multiple enemies efficiently', () => {
      const startTime = performance.now();
      
      // Add many enemies
      for (let i = 0; i < 50; i++) {
        const enemy = { ...mockEnemy, poolIndex: i };
        addEnemyToEnhancedAI(integration, enemy, 'mantair-corsair');
      }
      
      setAITargets(integration, [{ x: 200, y: 200 }]);
      startEnhancedAI(integration);
      
      // Update many times
      for (let i = 0; i < 100; i++) {
        updateEnhancedAI(integration);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time
      expect(duration).toBeLessThan(1000);
      
      const stats = getAIStatistics(integration);
      expect(stats.activeEnemies).toBe(50);
    });
  });
});
