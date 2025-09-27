/**
 * @file Tests for combat system
 * @description P1-E2-S2: Unit tests for enemy combat system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnemyCombat } from '../../../dist/enemies/ai/combat.js';
import type { SpawnedEnemy, Vector2 } from '../../../dist/enemies/types.js';

describe('EnemyCombat', () => {
  let enemy: SpawnedEnemy;
  let target: Vector2;
  let combat: EnemyCombat;

  beforeEach(() => {
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
    combat = new EnemyCombat(enemy, target);
  });

  describe('Initialization', () => {
    it('should initialize with attack ready', () => {
      expect(combat.isAttackReady()).toBe(true);
    });

    it('should not be attacking initially', () => {
      expect(combat.isAttacking()).toBe(false);
    });

    it('should have zero cooldown initially', () => {
      expect(combat.getCooldownRemaining()).toBe(0);
    });
  });

  describe('Range Detection', () => {
    it('should detect target in range', () => {
      // Move enemy to attack range
      enemy.position.x = 50;
      enemy.position.y = 50;
      
      expect(combat.isTargetInRange()).toBe(true);
    });

    it('should detect target out of range', () => {
      // Move enemy far from target
      enemy.position.x = 200;
      enemy.position.y = 200;
      
      expect(combat.isTargetInRange()).toBe(false);
    });
  });

  describe('Attack System', () => {
    it('should attempt attack when in range', () => {
      // Move enemy to attack range
      enemy.position.x = 50;
      enemy.position.y = 50;
      
      const attackResult = combat.attemptAttack();
      
      expect(attackResult).toBeDefined();
      expect(attackResult?.success).toBe(true);
      expect(attackResult?.damage).toBeGreaterThan(0);
    });

    it('should not attack when out of range', () => {
      // Move enemy out of range
      enemy.position.x = 200;
      enemy.position.y = 200;
      
      const attackResult = combat.attemptAttack();
      
      expect(attackResult).toBeNull();
    });

    it('should not attack when on cooldown', () => {
      // Move enemy to range and attack
      enemy.position.x = 50;
      enemy.position.y = 50;
      combat.attemptAttack();
      
      // Try to attack again immediately
      const attackResult = combat.attemptAttack();
      
      expect(attackResult).toBeNull();
    });

    it('should track attack history', () => {
      // Move enemy to range and attack
      enemy.position.x = 50;
      enemy.position.y = 50;
      combat.attemptAttack();
      
      const history = combat.getAttackHistory();
      expect(history.length).toBe(1);
      expect(history[0].success).toBe(true);
    });
  });

  describe('Combat Updates', () => {
    it('should update cooldown over time', () => {
      // Attack to start cooldown
      enemy.position.x = 50;
      enemy.position.y = 50;
      combat.attemptAttack();
      
      const initialCooldown = combat.getCooldownRemaining();
      expect(initialCooldown).toBeGreaterThan(0);
      
      // Update with time
      combat.update(1000, target);
      
      const newCooldown = combat.getCooldownRemaining();
      expect(newCooldown).toBeLessThan(initialCooldown);
    });

    it('should complete attack after duration', () => {
      // Move enemy to range and attack
      enemy.position.x = 50;
      enemy.position.y = 50;
      const attackResult = combat.attemptAttack();
      
      expect(attackResult).toBeDefined();
      expect(combat.isAttacking()).toBe(true);
      
      // Update with attack duration
      const combatState = combat.getCombatState();
      combat.update(combatState.config.attackDuration, target);
      
      expect(combat.isAttacking()).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should update attack range', () => {
      combat.setAttackRange(200);
      
      // Move enemy to new range
      enemy.position.x = 150;
      enemy.position.y = 150;
      
      expect(combat.isTargetInRange()).toBe(true);
    });

    it('should update attack damage', () => {
      combat.setAttackDamage(50);
      
      // Move enemy to range and attack
      enemy.position.x = 50;
      enemy.position.y = 50;
      const attackResult = combat.attemptAttack();
      
      expect(attackResult?.damage).toBeGreaterThanOrEqual(50);
    });

    it('should update attack cooldown', () => {
      combat.setAttackCooldown(500);
      
      // Move enemy to range and attack
      enemy.position.x = 50;
      enemy.position.y = 50;
      combat.attemptAttack();
      
      const cooldown = combat.getCooldownRemaining();
      expect(cooldown).toBeLessThanOrEqual(500);
    });
  });

  describe('Target Updates', () => {
    it('should update target position', () => {
      const newTarget = { x: 200, y: 200 };
      combat.setTarget(newTarget);
      
      const combatState = combat.getCombatState();
      expect(combatState.target).toEqual(newTarget);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset combat state', () => {
      // Attack to change state
      enemy.position.x = 50;
      enemy.position.y = 50;
      combat.attemptAttack();
      
      // Reset
      combat.reset();
      
      expect(combat.isAttackReady()).toBe(true);
      expect(combat.isAttacking()).toBe(false);
      expect(combat.getCooldownRemaining()).toBe(0);
    });
  });
});
