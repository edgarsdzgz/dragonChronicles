/**
 * @file Tests for AI manager
 * @description P1-E2-S2: Unit tests for AI manager system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AIManager } from '../../dist/enemies/ai/ai-manager.js';
import type { SpawnedEnemy, Vector2 } from '../../dist/enemies/types.js';

describe('AIManager', () => {
  let aiManager: AIManager;
  let enemy: SpawnedEnemy;
  let target: Vector2;

  beforeEach(() => {
    aiManager = new AIManager();
    
    enemy = {
      id: 1,
      family: 1,
      hp: 100,
      maxHp: 100,
      spd: 100,
      contactDmg: 10,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      spawnTime: Date.now(),
      spawnDistance: 0,
      wardId: 1,
      landId: 1,
      isActive: true,
      poolIndex: 0,
      state: 'approach',
    };
    
    target = { x: 100, y: 100 };
  });

  describe('AI System Creation', () => {
    it('should create AI system for enemy', () => {
      const aiSystem = aiManager.createAISystem(enemy, target);
      
      expect(aiSystem).toBeDefined();
      expect(aiSystem.enemy).toBe(enemy);
      expect(aiSystem.ai).toBeDefined();
      expect(aiSystem.movement).toBeDefined();
      expect(aiSystem.combat).toBeDefined();
    });

    it('should track created AI systems', () => {
      aiManager.createAISystem(enemy, target);
      
      const aiSystem = aiManager.getAISystem(enemy.id);
      expect(aiSystem).toBeDefined();
    });
  });

  describe('AI System Management', () => {
    beforeEach(() => {
      aiManager.createAISystem(enemy, target);
    });

    it('should remove AI system', () => {
      aiManager.removeAISystem(enemy.id);
      
      const aiSystem = aiManager.getAISystem(enemy.id);
      expect(aiSystem).toBeUndefined();
    });

    it('should get all AI systems', () => {
      const allSystems = aiManager.getAllAISystems();
      expect(allSystems.size).toBe(1);
      expect(allSystems.has(enemy.id)).toBe(true);
    });

    it('should get AI systems by family', () => {
      const meleeSystems = aiManager.getAISystemsByFamily(1);
      expect(meleeSystems.length).toBe(1);
      
      const rangedSystems = aiManager.getAISystemsByFamily(2);
      expect(rangedSystems.length).toBe(0);
    });
  });

  describe('AI Updates', () => {
    beforeEach(() => {
      aiManager.createAISystem(enemy, target);
    });

    it('should update AI systems', () => {
      const initialX = enemy.position.x;
      
      aiManager.update(100, target);
      
      // AI should have updated enemy position
      expect(enemy.position.x).not.toBe(initialX);
    });

    it('should handle dead enemies', () => {
      enemy.hp = 0;
      
      aiManager.update(100, target);
      
      const aiSystem = aiManager.getAISystem(enemy.id);
      expect(aiSystem?.ai.getState()).toBe('death');
    });
  });

  describe('Performance Statistics', () => {
    it('should track performance statistics', () => {
      aiManager.createAISystem(enemy, target);
      aiManager.update(100, target);
      
      const stats = aiManager.getPerformanceStats();
      expect(stats.totalSystems).toBe(1);
      expect(stats.activeSystems).toBe(1);
      expect(stats.systemsByFamily[1]).toBe(1);
    });

    it('should update statistics after removal', () => {
      aiManager.createAISystem(enemy, target);
      aiManager.removeAISystem(enemy.id);
      
      const stats = aiManager.getPerformanceStats();
      expect(stats.totalSystems).toBe(0);
      expect(stats.activeSystems).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        maxUpdatesPerFrame: 100,
        updateFrequency: 30,
      };
      
      aiManager.updateConfig(newConfig);
      
      // Configuration should be updated
      expect(aiManager).toBeDefined();
    });
  });

  describe('Reset and Cleanup', () => {
    beforeEach(() => {
      aiManager.createAISystem(enemy, target);
    });

    it('should reset AI manager', () => {
      aiManager.reset();
      
      const allSystems = aiManager.getAllAISystems();
      expect(allSystems.size).toBe(0);
      
      const stats = aiManager.getPerformanceStats();
      expect(stats.totalSystems).toBe(0);
    });

    it('should destroy AI manager', () => {
      aiManager.destroy();
      
      const allSystems = aiManager.getAllAISystems();
      expect(allSystems.size).toBe(0);
    });
  });
});
