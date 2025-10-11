/**
 * Balance Testing Framework Tests
 *
 * Tests for the balance testing framework including scenario execution,
 * metrics collection, and balance analysis.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createBalanceTestingFramework,
  type BalanceTestingFramework,
  type EconomicScenario,
} from '../../packages/sim/src/economy/balance-testing.js';
import { createEconomicMetricsCollector } from '../../packages/sim/src/economy/economic-metrics.js';
import { createScenarioRunner } from '../../packages/sim/src/economy/scenario-runner.js';
import { createBalanceAnalyzer } from '../../packages/sim/src/economy/balance-analyzer.js';
import { DefaultArcanaDropManager } from '../../packages/sim/src/economy/arcana-drop-manager.js';
import { DefaultSoulPowerDropManager } from '../../packages/sim/src/economy/soul-power-drop-manager.js';
import { DefaultEnchantManager } from '../../packages/sim/src/economy/enchant-manager.js';
import type {
  ArcanaDropConfig,
  SoulPowerDropConfig,
  EnchantConfig,
} from '../../packages/sim/src/economy/types.js';

describe('Balance Testing Framework', () => {
  let framework: BalanceTestingFramework;
  let arcanaManager: DefaultArcanaDropManager;
  let soulPowerManager: DefaultSoulPowerDropManager;
  let enchantManager: DefaultEnchantManager;
  let metricsCollector: ReturnType<typeof createEconomicMetricsCollector>;

  beforeEach(() => {
    framework = createBalanceTestingFramework();
    metricsCollector = createEconomicMetricsCollector();

    // Create mock configurations
    const arcanaConfig: ArcanaDropConfig = {
      baseDropAmount: 10,
      distanceScalingFactor: 1.5,
      wardScalingFactor: 1.2,
      bossRewardMultiplier: 2.0,
      eliteMultiplier: 1.5,
      miniBossMultiplier: 1.8,
    };

    const soulPowerConfig: SoulPowerDropConfig = {
      baseDropChance: 0.05,
      baseDropPercentage: 0.02,
      minDropAmount: 1,
      maxDropAmount: 10,
      distanceScalingFactor: 1.2,
      wardScalingFactor: 1.1,
      bossChanceMultiplier: 3.0,
      bossAmountMultiplier: 2.0,
      eliteChanceMultiplier: 2.0,
      eliteAmountMultiplier: 1.5,
      miniBossChanceMultiplier: 2.5,
      miniBossAmountMultiplier: 1.8,
    };

    const enchantConfig: EnchantConfig = {
      baseCosts: {
        firepower: 100,
        scales: 100,
      },
      growthRate: 1.12,
      baseCap: 10,
      soulForgingMultiplier: 60,
      temporarySoulForgingCost: 15,
      permanentSoulForgingCost: 1000,
    };

    arcanaManager = new DefaultArcanaDropManager(arcanaConfig);
    soulPowerManager = new DefaultSoulPowerDropManager(soulPowerConfig);
    enchantManager = new DefaultEnchantManager(enchantConfig);
  });

  describe('Scenario Management', () => {
    it('should create default scenarios', () => {
      const scenarios = framework.getScenarios();
      expect(scenarios).toHaveLength(4);

      const scenarioIds = scenarios.map((s) => s.id);
      expect(scenarioIds).toContain('standard_progression');
      expect(scenarioIds).toContain('fast_progression');
      expect(scenarioIds).toContain('slow_progression');
      expect(scenarioIds).toContain('stress_test');
    });

    it('should add custom scenarios', () => {
      const customScenario: EconomicScenario = {
        id: 'custom_test',
        name: 'Custom Test',
        description: 'A custom test scenario',
        duration: 60000, // 1 minute
        config: {
          enemySpawnRate: 1,
          bossFrequency: 0.5,
          distanceProgression: 0.5,
          wardProgression: 0.05,
          playerBehavior: 'optimal',
          spendingPattern: 'balanced',
        },
      };

      framework.addScenario(customScenario);
      const scenarios = framework.getScenarios();
      expect(scenarios).toHaveLength(5);
      expect(framework.getScenario('custom_test')).toEqual(customScenario);
    });

    it('should get specific scenario by ID', () => {
      const scenario = framework.getScenario('standard_progression');
      expect(scenario).toBeDefined();
      expect(scenario?.id).toBe('standard_progression');
      expect(scenario?.name).toBe('Standard Progression');
    });

    it('should return undefined for non-existent scenario', () => {
      const scenario = framework.getScenario('non_existent');
      expect(scenario).toBeUndefined();
    });
  });

  describe('Test Execution', () => {
    it('should execute a test successfully', async () => {
      const results = await framework.runTest(
        'standard_progression',
        arcanaManager,
        soulPowerManager,
        enchantManager,
        true, // Enable test mode with time acceleration
      );

      expect(results).toBeDefined();
      expect(results.scenario.id).toBe('standard_progression');
      expect(results.duration).toBeGreaterThan(0);
      expect(results.metrics).toBeDefined();
      expect(results.analysis).toBeDefined();
      expect(results.performance).toBeDefined();
    });

    it('should throw error for non-existent scenario', async () => {
      await expect(
        framework.runTest('non_existent', arcanaManager, soulPowerManager, enchantManager),
      ).rejects.toThrow('Scenario non_existent not found');
    });

    it('should prevent concurrent test execution', async () => {
      // Start first test
      const firstTest = framework.runTest(
        'standard_progression',
        arcanaManager,
        soulPowerManager,
        enchantManager,
        true, // Enable test mode
      );

      // Try to start second test immediately
      await expect(
        framework.runTest('fast_progression', arcanaManager, soulPowerManager, enchantManager),
      ).rejects.toThrow('A test is already running');

      // Wait for first test to complete
      await firstTest;
    });

    it('should track test results', async () => {
      expect(framework.getResults()).toHaveLength(0);

      await framework.runTest(
        'standard_progression',
        arcanaManager,
        soulPowerManager,
        enchantManager,
        true, // Enable test mode
      );

      const results = framework.getResults();
      expect(results).toHaveLength(1);
      expect(framework.getLatestResult()).toBeDefined();
    });

    it('should clear test results', async () => {
      await framework.runTest(
        'standard_progression',
        arcanaManager,
        soulPowerManager,
        enchantManager,
        true, // Enable test mode
      );

      expect(framework.getResults()).toHaveLength(1);
      framework.clearResults();
      expect(framework.getResults()).toHaveLength(0);
    });
  });

  describe('Balance Analysis', () => {
    it('should analyze balance correctly', async () => {
      const results = await framework.runTest(
        'standard_progression',
        arcanaManager,
        soulPowerManager,
        enchantManager,
        true, // Enable test mode
      );

      expect(results.analysis).toBeDefined();
      expect(results.analysis.meetsTarget).toBeDefined();
      expect(results.analysis.actualReturnsPerHour).toBeGreaterThan(0);
      expect(results.analysis.balanceScore).toBeGreaterThanOrEqual(0);
      expect(results.analysis.balanceScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(results.analysis.issues)).toBe(true);
      expect(Array.isArray(results.analysis.recommendations)).toBe(true);
    });

    it('should provide progression curve analysis', async () => {
      const results = await framework.runTest(
        'standard_progression',
        arcanaManager,
        soulPowerManager,
        enchantManager,
        true, // Enable test mode
      );

      expect(results.analysis.progressionCurve).toBeDefined();
      expect(typeof results.analysis.progressionCurve.isSmooth).toBe('boolean');
      expect(typeof results.analysis.progressionCurve.isBalanced).toBe('boolean');
      expect(results.analysis.progressionCurve.consistency).toBeGreaterThanOrEqual(0);
      expect(results.analysis.progressionCurve.consistency).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance Metrics', () => {
    it('should collect performance metrics', async () => {
      const results = await framework.runTest(
        'standard_progression',
        arcanaManager,
        soulPowerManager,
        enchantManager,
        true, // Enable test mode
      );

      expect(results.performance).toBeDefined();
      expect(results.performance.executionTime).toBeGreaterThan(0);
      expect(results.performance.averageFrameTime).toBeGreaterThan(0);
      expect(results.performance.peakFrameTime).toBeGreaterThan(0);
      expect(results.performance.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(results.performance.cpuUsage).toBeGreaterThanOrEqual(0);
      expect(results.performance.operationsPerSecond).toBeGreaterThan(0);
    });
  });

  describe('Economic Metrics', () => {
    it('should collect economic metrics', async () => {
      const results = await framework.runTest(
        'standard_progression',
        arcanaManager,
        soulPowerManager,
        enchantManager,
        true, // Enable test mode
      );

      const metrics = results.metrics;
      expect(metrics.arcana).toBeDefined();
      expect(metrics.soulPower).toBeDefined();
      expect(metrics.enchants).toBeDefined();
      expect(metrics.soulForging).toBeDefined();

      // Check Arcana metrics
      expect(metrics.arcana.totalEarned).toBeGreaterThanOrEqual(0);
      expect(metrics.arcana.totalSpent).toBeGreaterThanOrEqual(0);
      expect(metrics.arcana.averagePerHour).toBeGreaterThanOrEqual(0);
      expect(metrics.arcana.peakBalance).toBeGreaterThanOrEqual(0);
      expect(metrics.arcana.dropCount).toBeGreaterThanOrEqual(0);
      expect(metrics.arcana.averageDropAmount).toBeGreaterThanOrEqual(0);

      // Check Soul Power metrics
      expect(metrics.soulPower.totalEarned).toBeGreaterThanOrEqual(0);
      expect(metrics.soulPower.totalSpent).toBeGreaterThanOrEqual(0);
      expect(metrics.soulPower.averagePerHour).toBeGreaterThanOrEqual(0);
      expect(metrics.soulPower.peakBalance).toBeGreaterThanOrEqual(0);
      expect(metrics.soulPower.dropCount).toBeGreaterThanOrEqual(0);
      expect(metrics.soulPower.averageDropAmount).toBeGreaterThanOrEqual(0);

      // Check Enchant metrics
      expect(metrics.enchants.totalPurchases).toBeGreaterThanOrEqual(0);
      expect(metrics.enchants.averageLevel).toBeGreaterThanOrEqual(0);
      expect(metrics.enchants.peakLevels.firepower).toBeGreaterThanOrEqual(0);
      expect(metrics.enchants.peakLevels.scales).toBeGreaterThanOrEqual(0);
      expect(metrics.enchants.totalCosts).toBeGreaterThanOrEqual(0);

      // Check Soul Forging metrics
      expect(metrics.soulForging.totalPurchases).toBeGreaterThanOrEqual(0);
      expect(metrics.soulForging.averageLevel).toBeGreaterThanOrEqual(0);
      expect(metrics.soulForging.peakLevels.temporary).toBeGreaterThanOrEqual(0);
      expect(metrics.soulForging.peakLevels.permanent).toBeGreaterThanOrEqual(0);
      expect(metrics.soulForging.totalCosts).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Scenario Variations', () => {
    it('should handle different progression scenarios', async () => {
      const scenarios = ['standard_progression', 'fast_progression', 'slow_progression'];

      for (const scenarioId of scenarios) {
        const results = await framework.runTest(
          scenarioId,
          arcanaManager,
          soulPowerManager,
          enchantManager,
          true, // Enable test mode
        );

        expect(results.scenario.id).toBe(scenarioId);
        expect(results.metrics).toBeDefined();
        expect(results.analysis).toBeDefined();
      }
    });

    it('should handle stress test scenario', async () => {
      const results = await framework.runTest(
        'stress_test',
        arcanaManager,
        soulPowerManager,
        enchantManager,
        true, // Enable test mode
      );

      expect(results.scenario.id).toBe('stress_test');
      expect(results.metrics.arcana.dropCount).toBeGreaterThan(0);
      expect(results.performance.executionTime).toBeLessThan(300000); // 5 minutes max
    });
  });
});
