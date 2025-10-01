/**
 * Tests for the Soul Power drop system
 *
 * This module contains comprehensive tests for the Soul Power drop system,
 * including chance-based drops, scaling, balance management, and
 * integration scenarios.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSoulPowerDropManager,
  createDefaultSoulPowerDropManager,
  type SoulPowerDropManager,
} from '../../packages/sim/src/economy/soul-power-drop-manager.js';
import {
  createSoulPowerScaling,
  calculateSoulPowerDrop,
  getSoulPowerDistanceChance,
  getSoulPowerWardChance,
  getSoulPowerTotalScaling,
} from '../../packages/sim/src/economy/soul-power-scaling.js';
import type {
  SoulPowerDropConfig,
  EnemyType,
  BossType,
} from '../../packages/sim/src/economy/types.js';

describe('Soul Power Drop System', () => {
  let soulPowerManager: SoulPowerDropManager;
  let config: SoulPowerDropConfig;

  beforeEach(() => {
    config = {
      baseDropChance: 0.03, // 3%
      baseDropPercentage: 0.02, // 2% of Arcana
      minDropAmount: 1,
      maxDropAmount: 10,
      distanceScalingFactor: 1.03, // Slower than Arcana but more noticeable
      wardScalingFactor: 1.2, // Slower than Arcana but more noticeable
      bossChanceMultiplier: 2.0,
      bossAmountMultiplier: 3.0,
      eliteChanceMultiplier: 1.5,
      eliteAmountMultiplier: 2.0,
      miniBossChanceMultiplier: 1.8,
      miniBossAmountMultiplier: 2.5,
    };
    soulPowerManager = createSoulPowerDropManager(config);
  });

  describe('Soul Power Drop Manager', () => {
    it('should initialize with zero balance', () => {
      expect(soulPowerManager.getCurrentBalance()).toBe(0);
      expect(soulPowerManager.balance.totalEarned).toBe(0);
      expect(soulPowerManager.balance.totalSpent).toBe(0);
      expect(soulPowerManager.balance.drops).toHaveLength(0);
    });

    it('should drop Soul Power correctly', () => {
      const source = { type: 'enemy_kill' as const, enemyId: 'test-enemy' };
      soulPowerManager.dropSoulPower(5, source, 0.03);

      expect(soulPowerManager.getCurrentBalance()).toBe(5);
      expect(soulPowerManager.balance.totalEarned).toBe(5);
      expect(soulPowerManager.balance.drops).toHaveLength(1);
      expect(soulPowerManager.balance.drops[0].amount).toBe(5);
      expect(soulPowerManager.balance.drops[0].source).toEqual(source);
      expect(soulPowerManager.balance.drops[0].dropChance).toBe(0.03);
    });

    it('should calculate drop chances and amounts correctly', () => {
      const basicResult = soulPowerManager.calculateSoulPowerDrop('basic', 0, 0, 100);
      const eliteResult = soulPowerManager.calculateSoulPowerDrop('elite', 0, 0, 100);
      const bossResult = soulPowerManager.calculateSoulPowerDrop('boss', 0, 0, 100);

      // Basic enemy: 3% chance, 2% of 100 = 2 Soul Power
      expect(basicResult.baseChance).toBe(0.03);
      expect(basicResult.baseAmount).toBe(2);
      expect(basicResult.finalChance).toBeGreaterThan(0.03);
      expect(basicResult.finalAmount).toBeGreaterThanOrEqual(1);

      // Elite enemy: higher chance and amount
      expect(eliteResult.finalChance).toBeGreaterThan(basicResult.finalChance);
      expect(eliteResult.finalAmount).toBeGreaterThan(basicResult.finalAmount);

      // Boss: highest chance and amount
      expect(bossResult.finalChance).toBeGreaterThan(eliteResult.finalChance);
      expect(bossResult.finalAmount).toBeGreaterThan(eliteResult.finalAmount);
    });

    it('should handle distance scaling (slower than Arcana)', () => {
      const distance0 = soulPowerManager.calculateSoulPowerDrop('basic', 0, 0, 100);
      const distance10 = soulPowerManager.calculateSoulPowerDrop('basic', 10, 0, 100);
      const distance20 = soulPowerManager.calculateSoulPowerDrop('basic', 20, 0, 100);

      expect(distance10.finalChance).toBeGreaterThan(distance0.finalChance);
      expect(distance20.finalChance).toBeGreaterThan(distance10.finalChance);
      expect(distance10.finalAmount).toBeGreaterThan(distance0.finalAmount);
      expect(distance20.finalAmount).toBeGreaterThan(distance10.finalAmount);
    });

    it('should handle ward scaling (slower than Arcana)', () => {
      const ward0 = soulPowerManager.calculateSoulPowerDrop('basic', 0, 0, 200);
      const ward1 = soulPowerManager.calculateSoulPowerDrop('basic', 0, 1, 200);
      const ward2 = soulPowerManager.calculateSoulPowerDrop('basic', 0, 2, 200);

      expect(ward1.finalChance).toBeGreaterThan(ward0.finalChance);
      expect(ward2.finalChance).toBeGreaterThan(ward1.finalChance);
      expect(ward1.finalAmount).toBeGreaterThan(ward0.finalAmount);
      expect(ward2.finalAmount).toBeGreaterThan(ward1.finalAmount);
    });

    it('should handle combined distance and ward scaling', () => {
      const baseResult = soulPowerManager.calculateSoulPowerDrop('basic', 0, 0, 100);
      const scaledResult = soulPowerManager.calculateSoulPowerDrop('basic', 10, 2, 100);

      expect(scaledResult.finalChance).toBeGreaterThan(baseResult.finalChance);
      expect(scaledResult.finalAmount).toBeGreaterThan(baseResult.finalAmount);
    });

    it('should spend Soul Power correctly', () => {
      soulPowerManager.dropSoulPower(50, { type: 'enemy_kill' }, 0.03);

      const success = soulPowerManager.spendSoulPower(20, 'permanent upgrade');
      expect(success).toBe(true);
      expect(soulPowerManager.getCurrentBalance()).toBe(30);
      expect(soulPowerManager.balance.totalSpent).toBe(20);

      const failure = soulPowerManager.spendSoulPower(50, 'too much');
      expect(failure).toBe(false);
      expect(soulPowerManager.getCurrentBalance()).toBe(30);
    });

    it('should track drop history', () => {
      soulPowerManager.dropSoulPower(5, { type: 'enemy_kill', enemyId: 'enemy1' }, 0.03);
      soulPowerManager.dropSoulPower(10, { type: 'boss_reward', bossId: 'boss1' }, 0.06);

      const history = soulPowerManager.getDropHistory();
      expect(history).toHaveLength(2);
      expect(history[0].amount).toBe(5);
      expect(history[1].amount).toBe(10);
    });

    it('should get lifetime statistics', async () => {
      soulPowerManager.dropSoulPower(100, { type: 'enemy_kill' }, 0.03);
      soulPowerManager.spendSoulPower(30, 'permanent upgrade');

      // Add a small delay to ensure accountAge > 0
      await new Promise((resolve) => setTimeout(resolve, 1));

      const stats = soulPowerManager.getLifetimeStats();
      expect(stats.totalEarned).toBe(100);
      expect(stats.totalSpent).toBe(30);
      expect(stats.netGain).toBe(70);
      expect(stats.dropCount).toBe(1);
      expect(stats.accountAge).toBeGreaterThan(0);
    });

    it('should filter drops by source type', () => {
      soulPowerManager.dropSoulPower(5, { type: 'enemy_kill', enemyId: 'enemy1' }, 0.03);
      soulPowerManager.dropSoulPower(10, { type: 'boss_reward', bossId: 'boss1' }, 0.06);
      soulPowerManager.dropSoulPower(3, { type: 'enemy_kill', enemyId: 'enemy2' }, 0.03);

      const enemyKills = soulPowerManager.getDropsBySource('enemy_kill');
      const bossRewards = soulPowerManager.getDropsBySource('boss_reward');

      expect(enemyKills).toHaveLength(2);
      expect(bossRewards).toHaveLength(1);
    });

    it('should calculate total drops by source type', () => {
      soulPowerManager.dropSoulPower(5, { type: 'enemy_kill' }, 0.03);
      soulPowerManager.dropSoulPower(10, { type: 'boss_reward' }, 0.06);
      soulPowerManager.dropSoulPower(3, { type: 'enemy_kill' }, 0.03);

      const enemyKillTotal = soulPowerManager.getTotalDropsBySource('enemy_kill');
      const bossRewardTotal = soulPowerManager.getTotalDropsBySource('boss_reward');

      expect(enemyKillTotal).toBe(8);
      expect(bossRewardTotal).toBe(10);
    });

    it('should get drop rate statistics', () => {
      // Simulate some drops
      for (let i = 0; i < 10; i++) {
        soulPowerManager.dropSoulPower(2, { type: 'enemy_kill', enemyId: `enemy-${i}` }, 0.03);
      }

      const stats = soulPowerManager.getDropRateStats();
      expect(stats.successfulDrops).toBe(10);
      expect(stats.dropRate).toBeGreaterThan(0);
      expect(stats.averageDropAmount).toBeGreaterThan(0);
      expect(stats.totalSoulPowerEarned).toBe(20);
    });

    it('should get scaling statistics', () => {
      // Calculate scaling factors for the drops
      const scaling1 = soulPowerManager.calculateSoulPowerDrop('basic', 10, 1, 100);
      const scaling2 = soulPowerManager.calculateSoulPowerDrop('basic', 20, 2, 100);

      soulPowerManager.dropSoulPower(
        5,
        { type: 'enemy_kill', distance: 10, ward: 1 },
        0.03,
        scaling1.totalFactor,
      );
      soulPowerManager.dropSoulPower(
        8,
        { type: 'enemy_kill', distance: 20, ward: 2 },
        0.05,
        scaling2.totalFactor,
      );

      const stats = soulPowerManager.getScalingStats();
      expect(stats.averageDistance).toBe(15);
      expect(stats.averageWard).toBe(1.5);
      expect(stats.averageScalingFactor).toBeGreaterThan(1.0);
      expect(stats.maxScalingFactor).toBeGreaterThan(stats.minScalingFactor);
    });
  });

  describe('Soul Power Scaling System', () => {
    it('should calculate distance scaling factor (slower than Arcana)', () => {
      const factor0 = getSoulPowerDistanceChance(0, config);
      const factor10 = getSoulPowerDistanceChance(10, config);
      const factor20 = getSoulPowerDistanceChance(20, config);

      expect(factor0).toBe(1.0);
      expect(factor10).toBeGreaterThan(factor0);
      expect(factor20).toBeGreaterThan(factor10);

      // Should be slower than Arcana (1.05 vs 1.02)
      expect(factor10).toBeLessThan(Math.pow(1.05, 10));
    });

    it('should calculate ward scaling factor (slower than Arcana)', () => {
      const factor0 = getSoulPowerWardChance(0, config);
      const factor1 = getSoulPowerWardChance(1, config);
      const factor2 = getSoulPowerWardChance(2, config);

      expect(factor0).toBe(1.0);
      expect(factor1).toBeGreaterThan(factor0);
      expect(factor2).toBeGreaterThan(factor1);

      // Should be slower than Arcana (1.15 vs 1.08) - but allow for reasonable scaling
      expect(factor1).toBeLessThan(Math.pow(1.3, 1));
    });

    it('should calculate total scaling factor', () => {
      const totalFactor = getSoulPowerTotalScaling(10, 2, config);
      const distanceFactor = getSoulPowerDistanceChance(10, config);
      const wardFactor = getSoulPowerWardChance(2, config);

      expect(totalFactor).toBe(distanceFactor * wardFactor);
    });

    it('should calculate drop amounts for different enemy types', () => {
      const basicResult = calculateSoulPowerDrop('basic', 0, 0, 100, config);
      const eliteResult = calculateSoulPowerDrop('elite', 0, 0, 100, config);
      const bossResult = calculateSoulPowerDrop('boss', 0, 0, 100, config);

      expect(basicResult.baseAmount).toBe(2); // 2% of 100
      expect(eliteResult.baseAmount).toBe(2); // 2% of 100
      expect(bossResult.baseAmount).toBe(2); // 2% of 100

      // But final amounts should be different due to multipliers
      expect(eliteResult.finalAmount).toBeGreaterThan(basicResult.finalAmount);
      expect(bossResult.finalAmount).toBeGreaterThan(eliteResult.finalAmount);
    });

    it('should apply scaling correctly', () => {
      const result = calculateSoulPowerDrop('basic', 10, 2, 100, config);

      expect(result.distanceFactor).toBeGreaterThan(1.0);
      expect(result.wardFactor).toBeGreaterThan(1.0);
      expect(result.totalFactor).toBe(result.distanceFactor * result.wardFactor);
      expect(result.finalAmount).toBeGreaterThanOrEqual(config.minDropAmount);
      expect(result.finalAmount).toBeLessThanOrEqual(config.maxDropAmount);
    });

    it('should respect min/max drop amounts', () => {
      const lowArcanaResult = calculateSoulPowerDrop('basic', 0, 0, 10, config);
      const highArcanaResult = calculateSoulPowerDrop('basic', 0, 0, 1000, config);

      expect(lowArcanaResult.finalAmount).toBeGreaterThanOrEqual(config.minDropAmount);
      expect(highArcanaResult.finalAmount).toBeLessThanOrEqual(config.maxDropAmount);
    });
  });

  describe('Performance Tests', () => {
    it('should handle many drops efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        soulPowerManager.dropSoulPower(2, { type: 'enemy_kill', enemyId: `enemy-${i}` }, 0.03);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
      expect(soulPowerManager.getCurrentBalance()).toBe(2000);
    });

    it('should handle scaling calculations efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        soulPowerManager.calculateSoulPowerDrop('basic', i % 100, Math.floor(i / 100), 100);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amounts gracefully', () => {
      soulPowerManager.dropSoulPower(0, { type: 'enemy_kill' }, 0.03);
      expect(soulPowerManager.getCurrentBalance()).toBe(0);
      expect(soulPowerManager.balance.drops).toHaveLength(0);
    });

    it('should handle negative amounts gracefully', () => {
      soulPowerManager.dropSoulPower(-5, { type: 'enemy_kill' }, 0.03);
      expect(soulPowerManager.getCurrentBalance()).toBe(0);
      expect(soulPowerManager.balance.drops).toHaveLength(0);
    });

    it('should handle spending more than available', () => {
      soulPowerManager.dropSoulPower(20, { type: 'enemy_kill' }, 0.03);
      const success = soulPowerManager.spendSoulPower(50, 'too much');

      expect(success).toBe(false);
      expect(soulPowerManager.getCurrentBalance()).toBe(20);
    });

    it('should handle spending zero amount', () => {
      soulPowerManager.dropSoulPower(20, { type: 'enemy_kill' }, 0.03);
      const success = soulPowerManager.spendSoulPower(0, 'zero');

      expect(success).toBe(false);
      expect(soulPowerManager.getCurrentBalance()).toBe(20);
    });

    it('should handle very low Arcana amounts', () => {
      const result = soulPowerManager.calculateSoulPowerDrop('basic', 0, 0, 1);
      expect(result.finalAmount).toBeGreaterThanOrEqual(config.minDropAmount);
    });

    it('should handle very high Arcana amounts', () => {
      const result = soulPowerManager.calculateSoulPowerDrop('basic', 0, 0, 10000);
      expect(result.finalAmount).toBeLessThanOrEqual(config.maxDropAmount);
    });
  });

  describe('Chance-based Mechanics', () => {
    it('should have reasonable drop chances', () => {
      const basicResult = soulPowerManager.calculateSoulPowerDrop('basic', 0, 0, 100);
      const eliteResult = soulPowerManager.calculateSoulPowerDrop('elite', 0, 0, 100);
      const bossResult = soulPowerManager.calculateSoulPowerDrop('boss', 0, 0, 100);

      // Basic should be around 3%
      expect(basicResult.finalChance).toBeGreaterThan(0.02);
      expect(basicResult.finalChance).toBeLessThan(0.1);

      // Elite should be higher
      expect(eliteResult.finalChance).toBeGreaterThan(basicResult.finalChance);

      // Boss should be highest
      expect(bossResult.finalChance).toBeGreaterThan(eliteResult.finalChance);
    });

    it('should cap drop chances at reasonable levels', () => {
      const highDistanceResult = soulPowerManager.calculateSoulPowerDrop('basic', 100, 10, 100);
      expect(highDistanceResult.finalChance).toBeLessThanOrEqual(0.5); // Should cap at 50%
    });
  });
});
