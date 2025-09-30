/**
 * Tests for the Arcana drop system
 *
 * This module contains comprehensive tests for the Arcana drop system,
 * including drop calculations, scaling, balance management, and
 * integration scenarios.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createArcanaDropManager,
  createDefaultArcanaDropManager,
  type ArcanaDropManager,
} from '../../packages/sim/src/economy/arcana-drop-manager.js';
import {
  createArcanaScaling,
  calculateArcanaDrop,
  getDistanceScalingFactor,
  getWardScalingFactor,
  getTotalScalingFactor,
} from '../../packages/sim/src/economy/arcana-scaling.js';
import type {
  ArcanaDropConfig,
  EnemyType,
  BossType,
} from '../../packages/sim/src/economy/types.js';

describe('Arcana Drop System', () => {
  let dropManager: ArcanaDropManager;
  let config: ArcanaDropConfig;

  beforeEach(() => {
    config = {
      baseDropAmount: 10,
      distanceScalingFactor: 1.05,
      wardScalingFactor: 1.15,
      bossRewardMultiplier: 5.0,
      eliteMultiplier: 2.0,
      miniBossMultiplier: 3.0,
    };
    dropManager = createArcanaDropManager(config);
  });

  describe('Arcana Drop Manager', () => {
    it('should initialize with zero balance', () => {
      expect(dropManager.getCurrentBalance()).toBe(0);
      expect(dropManager.balance.totalEarned).toBe(0);
      expect(dropManager.balance.totalSpent).toBe(0);
      expect(dropManager.balance.drops).toHaveLength(0);
    });

    it('should drop Arcana correctly', () => {
      const source = { type: 'enemy_kill' as const, enemyId: 'test-enemy' };
      dropManager.dropArcana(50, source);

      expect(dropManager.getCurrentBalance()).toBe(50);
      expect(dropManager.balance.totalEarned).toBe(50);
      expect(dropManager.balance.drops).toHaveLength(1);
      expect(dropManager.balance.drops[0].amount).toBe(50);
      expect(dropManager.balance.drops[0].source).toEqual(source);
    });

    it('should calculate drop amounts correctly', () => {
      const basicDrop = dropManager.calculateDropAmount('basic', 0, 0);
      const eliteDrop = dropManager.calculateDropAmount('elite', 0, 0);
      const bossDrop = dropManager.calculateDropAmount('boss', 0, 0);

      expect(basicDrop).toBe(10); // base amount
      expect(eliteDrop).toBe(50); // 25 * 2.0 multiplier
      expect(bossDrop).toBe(500); // 100 * 5.0 multiplier
    });

    it('should handle distance scaling', () => {
      const distance0 = dropManager.calculateDropAmount('basic', 0, 0);
      const distance10 = dropManager.calculateDropAmount('basic', 10, 0);
      const distance20 = dropManager.calculateDropAmount('basic', 20, 0);

      expect(distance10).toBeGreaterThan(distance0);
      expect(distance20).toBeGreaterThan(distance10);
    });

    it('should handle ward scaling', () => {
      const ward0 = dropManager.calculateDropAmount('basic', 0, 0);
      const ward1 = dropManager.calculateDropAmount('basic', 0, 1);
      const ward2 = dropManager.calculateDropAmount('basic', 0, 2);

      expect(ward1).toBeGreaterThan(ward0);
      expect(ward2).toBeGreaterThan(ward1);
    });

    it('should handle combined distance and ward scaling', () => {
      const baseDrop = dropManager.calculateDropAmount('basic', 0, 0);
      const scaledDrop = dropManager.calculateDropAmount('basic', 10, 2);

      expect(scaledDrop).toBeGreaterThan(baseDrop);
    });

    it('should spend Arcana correctly', () => {
      dropManager.dropArcana(100, { type: 'enemy_kill' });

      const success = dropManager.spendArcana(30, 'test purchase');
      expect(success).toBe(true);
      expect(dropManager.getCurrentBalance()).toBe(70);
      expect(dropManager.balance.totalSpent).toBe(30);

      const failure = dropManager.spendArcana(100, 'too much');
      expect(failure).toBe(false);
      expect(dropManager.getCurrentBalance()).toBe(70);
    });

    it('should reset for new journey', () => {
      dropManager.dropArcana(100, { type: 'enemy_kill' });
      dropManager.spendArcana(50, 'test');

      dropManager.resetForNewJourney();

      expect(dropManager.getCurrentBalance()).toBe(0);
      expect(dropManager.balance.totalEarned).toBe(0);
      expect(dropManager.balance.totalSpent).toBe(0);
      expect(dropManager.balance.drops).toHaveLength(0);
    });

    it('should track drop history', () => {
      dropManager.dropArcana(50, { type: 'enemy_kill', enemyId: 'enemy1' });
      dropManager.dropArcana(75, { type: 'boss_reward', bossId: 'boss1' });

      const history = dropManager.getDropHistory();
      expect(history).toHaveLength(2);
      expect(history[0].amount).toBe(50);
      expect(history[1].amount).toBe(75);
    });

    it('should get journey statistics', () => {
      dropManager.dropArcana(100, { type: 'enemy_kill' });
      dropManager.spendArcana(30, 'test');

      const stats = dropManager.getJourneyStats();
      expect(stats.totalEarned).toBe(100);
      expect(stats.totalSpent).toBe(30);
      expect(stats.netGain).toBe(70);
      expect(stats.dropCount).toBe(1);
      expect(stats.journeyDuration).toBeGreaterThan(0);
    });

    it('should filter drops by source type', () => {
      dropManager.dropArcana(50, { type: 'enemy_kill', enemyId: 'enemy1' });
      dropManager.dropArcana(75, { type: 'boss_reward', bossId: 'boss1' });
      dropManager.dropArcana(25, { type: 'enemy_kill', enemyId: 'enemy2' });

      const enemyKills = dropManager.getDropsBySource('enemy_kill');
      const bossRewards = dropManager.getDropsBySource('boss_reward');

      expect(enemyKills).toHaveLength(2);
      expect(bossRewards).toHaveLength(1);
    });

    it('should calculate total drops by source type', () => {
      dropManager.dropArcana(50, { type: 'enemy_kill' });
      dropManager.dropArcana(75, { type: 'boss_reward' });
      dropManager.dropArcana(25, { type: 'enemy_kill' });

      const enemyKillTotal = dropManager.getTotalDropsBySource('enemy_kill');
      const bossRewardTotal = dropManager.getTotalDropsBySource('boss_reward');

      expect(enemyKillTotal).toBe(75);
      expect(bossRewardTotal).toBe(75);
    });
  });

  describe('Arcana Scaling System', () => {
    it('should calculate distance scaling factor', () => {
      const factor0 = getDistanceScalingFactor(0, config);
      const factor10 = getDistanceScalingFactor(10, config);
      const factor20 = getDistanceScalingFactor(20, config);

      expect(factor0).toBe(1.0);
      expect(factor10).toBeGreaterThan(factor0);
      expect(factor20).toBeGreaterThan(factor10);
    });

    it('should calculate ward scaling factor', () => {
      const factor0 = getWardScalingFactor(0, config);
      const factor1 = getWardScalingFactor(1, config);
      const factor2 = getWardScalingFactor(2, config);

      expect(factor0).toBe(1.0);
      expect(factor1).toBeGreaterThan(factor0);
      expect(factor2).toBeGreaterThan(factor1);
    });

    it('should calculate total scaling factor', () => {
      const totalFactor = getTotalScalingFactor(10, 2, config);
      const distanceFactor = getDistanceScalingFactor(10, config);
      const wardFactor = getWardScalingFactor(2, config);

      expect(totalFactor).toBe(distanceFactor * wardFactor);
    });

    it('should calculate drop amounts for different enemy types', () => {
      const basicResult = calculateArcanaDrop('basic', 0, 0, config);
      const eliteResult = calculateArcanaDrop('elite', 0, 0, config);
      const bossResult = calculateArcanaDrop('boss', 0, 0, config);

      expect(basicResult.baseAmount).toBe(10);
      expect(eliteResult.baseAmount).toBe(50); // 25 * 2.0
      expect(bossResult.baseAmount).toBe(500); // 100 * 5.0
    });

    it('should apply scaling correctly', () => {
      const result = calculateArcanaDrop('basic', 10, 2, config);

      expect(result.distanceFactor).toBeGreaterThan(1.0);
      expect(result.wardFactor).toBeGreaterThan(1.0);
      expect(result.totalFactor).toBe(result.distanceFactor * result.wardFactor);
      expect(result.finalAmount).toBe(Math.floor(result.baseAmount * result.totalFactor));
    });
  });

  describe('Performance Tests', () => {
    it('should handle many drops efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        dropManager.dropArcana(10, { type: 'enemy_kill', enemyId: `enemy-${i}` });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
      expect(dropManager.getCurrentBalance()).toBe(10000);
    });

    it('should handle scaling calculations efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        dropManager.calculateDropAmount('basic', i % 100, Math.floor(i / 100));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amounts gracefully', () => {
      dropManager.dropArcana(0, { type: 'enemy_kill' });
      expect(dropManager.getCurrentBalance()).toBe(0);
      expect(dropManager.balance.drops).toHaveLength(0);
    });

    it('should handle negative amounts gracefully', () => {
      dropManager.dropArcana(-10, { type: 'enemy_kill' });
      expect(dropManager.getCurrentBalance()).toBe(0);
      expect(dropManager.balance.drops).toHaveLength(0);
    });

    it('should handle spending more than available', () => {
      dropManager.dropArcana(50, { type: 'enemy_kill' });
      const success = dropManager.spendArcana(100, 'too much');

      expect(success).toBe(false);
      expect(dropManager.getCurrentBalance()).toBe(50);
    });

    it('should handle spending zero amount', () => {
      dropManager.dropArcana(50, { type: 'enemy_kill' });
      const success = dropManager.spendArcana(0, 'zero');

      expect(success).toBe(false);
      expect(dropManager.getCurrentBalance()).toBe(50);
    });
  });
});
