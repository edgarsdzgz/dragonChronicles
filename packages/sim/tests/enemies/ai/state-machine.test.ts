/**
 * @file Tests for AI state machine
 * @description P1-E2-S2: Unit tests for enemy AI state machine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnemyAI } from '../../../dist/enemies/ai/state-machine.js';
import type { SpawnedEnemy, Vector2 } from '../../../dist/enemies/types.js';

describe('EnemyAI', () => {
  let enemy: SpawnedEnemy;
  let target: Vector2;
  let ai: EnemyAI;

  beforeEach(() => {
    enemy = {
      id: 1,
      family: 1, // Melee
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
    ai = new EnemyAI(enemy, target);
  });

  describe('Initialization', () => {
    it('should initialize with approach state', () => {
      expect(ai.getState()).toBe('approach');
    });

    it('should set target position', () => {
      const stateData = ai.getStateData();
      expect(stateData.target).toEqual(target);
    });

    it('should have correct family configuration for melee', () => {
      const stateData = ai.getStateData();
      expect(stateData.config.attackRange).toBe(50);
      expect(stateData.config.attackDamage).toBe(25);
    });
  });

  describe('State Transitions', () => {
    it('should transition from approach to stop when in range', () => {
      // Move enemy close to target (within attack range of 50)
      enemy.position.x = 80;
      enemy.position.y = 80;
      
      ai.update(100, target);
      
      expect(ai.getState()).toBe('stop');
    });

    it('should transition from stop to attack when in range and ready', () => {
      // Move enemy to attack range (within 50 units)
      enemy.position.x = 80;
      enemy.position.y = 80;
      
      // First update to get to stop state
      ai.update(100, target);
      expect(ai.getState()).toBe('stop');
      
      // Second update to transition to attack
      ai.update(100, target);
      expect(ai.getState()).toBe('attack');
    });

    it('should transition back to approach when target moves away', () => {
      // Start in stop state (within range)
      enemy.position.x = 80;
      enemy.position.y = 80;
      ai.update(100, target);
      expect(ai.getState()).toBe('stop');
      
      // Move target far away
      const farTarget = { x: 200, y: 200 };
      ai.update(100, farTarget);
      
      expect(ai.getState()).toBe('approach');
    });
  });

  describe('Movement Behavior', () => {
    it('should move toward target in approach state', () => {
      const initialX = enemy.position.x;
      const initialY = enemy.position.y;
      
      ai.update(100, target);
      
      // Should have moved toward target
      expect(enemy.position.x).toBeGreaterThan(initialX);
      expect(enemy.position.y).toBeGreaterThan(initialY);
    });

    it('should stop moving in stop state', () => {
      // Move to stop state (within attack range)
      enemy.position.x = 80;
      enemy.position.y = 80;
      ai.update(100, target);
      
      // Should be in stop state
      expect(ai.getState()).toBe('stop');
      
      const stopX = enemy.position.x;
      const stopY = enemy.position.y;
      
      // Update again
      ai.update(100, target);
      
      // Should not have moved
      expect(enemy.position.x).toBe(stopX);
      expect(enemy.position.y).toBe(stopY);
    });
  });

  describe('Target Updates', () => {
    it('should update target position', () => {
      const newTarget = { x: 200, y: 200 };
      ai.setTarget(newTarget);
      
      const stateData = ai.getStateData();
      expect(stateData.target).toEqual(newTarget);
    });
  });

  describe('Death State', () => {
    it('should transition to death state when die() is called', () => {
      ai.die();
      expect(ai.getState()).toBe('death');
    });
  });

  describe('Family Configurations', () => {
    it('should have different configurations for different families', () => {
      // Test melee family
      const meleeEnemy: SpawnedEnemy = { ...enemy, family: 1 };
      const meleeAI = new EnemyAI(meleeEnemy, target);
      const meleeConfig = meleeAI.getStateData().config;
      
      // Test ranged family
      const rangedEnemy: SpawnedEnemy = { ...enemy, family: 2 };
      const rangedAI = new EnemyAI(rangedEnemy, target);
      const rangedConfig = rangedAI.getStateData().config;
      
      // Ranged should have longer attack range
      expect(rangedConfig.attackRange).toBeGreaterThan(meleeConfig.attackRange);
      
      // Ranged should have faster attack cooldown
      expect(rangedConfig.attackCooldown).toBeLessThan(meleeConfig.attackCooldown);
    });
  });
});
