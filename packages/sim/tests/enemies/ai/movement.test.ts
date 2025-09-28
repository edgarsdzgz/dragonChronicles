/**
 * @file Tests for movement system
 * @description P1-E2-S2: Unit tests for enemy movement system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnemyMovement } from '../../../dist/enemies/ai/movement.js';
import type { SpawnedEnemy, Vector2 } from '../../../dist/enemies/types.js';

describe('EnemyMovement', () => {
  let enemy: SpawnedEnemy;
  let target: Vector2;
  let movement: EnemyMovement;

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
    movement = new EnemyMovement(enemy, target);
  });

  describe('Initialization', () => {
    it('should initialize with zero velocity', () => {
      const velocity = movement.getVelocity();
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });

    it('should set initial target', () => {
      const movementState = movement.getMovementState();
      expect(movementState.target).toEqual(target);
    });
  });

  describe('Movement Updates', () => {
    it('should move toward target', () => {
      const initialX = enemy.position.x;
      const initialY = enemy.position.y;

      movement.update(100, target);

      // Should have moved toward target
      expect(enemy.position.x).toBeGreaterThan(initialX);
      expect(enemy.position.y).toBeGreaterThan(initialY);
    });

    it('should stop when very close to target', () => {
      // Move enemy very close to target
      enemy.position.x = 99;
      enemy.position.y = 99;

      const initialX = enemy.position.x;
      const initialY = enemy.position.y;

      movement.update(100, target);

      // Should not have moved
      expect(enemy.position.x).toBe(initialX);
      expect(enemy.position.y).toBe(initialY);
    });

    it('should update target position', () => {
      const newTarget = { x: 200, y: 200 };
      movement.setTarget(newTarget);

      const movementState = movement.getMovementState();
      expect(movementState.target).toEqual(newTarget);
    });
  });

  describe('Collision Avoidance', () => {
    it('should avoid obstacles', () => {
      const obstacles: Vector2[] = [
        { x: 50, y: 50 },
        { x: 60, y: 60 },
      ];

      // Move enemy toward obstacles
      enemy.position.x = 40;
      enemy.position.y = 40;

      movement.update(100, target, obstacles);

      // Should have some avoidance behavior
      const velocity = movement.getVelocity();
      expect(velocity.x).not.toBe(0);
      expect(velocity.y).not.toBe(0);
    });
  });

  describe('Speed Control', () => {
    it('should respect speed multiplier', () => {
      movement.setSpeedMultiplier(0.5);

      const initialVelocity = movement.getVelocity();
      movement.update(100, target);
      const newVelocity = movement.getVelocity();

      // Should have reduced speed
      expect(Math.abs(newVelocity.x)).toBeLessThan(Math.abs(initialVelocity.x) * 2);
    });
  });

  describe('Movement State', () => {
    it('should track movement state', () => {
      movement.update(100, target);

      const movementState = movement.getMovementState();
      expect(movementState.velocity).toBeDefined();
      expect(movementState.target).toBeDefined();
      expect(movementState.config).toBeDefined();
    });

    it('should detect if moving', () => {
      // Initially not moving
      expect(movement.isMoving()).toBe(false);

      // After update, should be moving
      movement.update(100, target);
      expect(movement.isMoving()).toBe(true);
    });
  });
});
