/**
 * Scenario Runner Tests
 *
 * Tests for the scenario runner including execution control, timing,
 * and simulation coordination.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createScenarioRunner,
  type ScenarioRunner,
  type ScenarioExecutionOptions,
} from '../../packages/sim/src/economy/scenario-runner.js';
import { createEconomicMetricsCollector } from '../../packages/sim/src/economy/economic-metrics.js';
import { DefaultArcanaDropManager } from '../../packages/sim/src/economy/arcana-drop-manager.js';
import { DefaultSoulPowerDropManager } from '../../packages/sim/src/economy/soul-power-drop-manager.js';
import { DefaultEnchantManager } from '../../packages/sim/src/economy/enchant-manager.js';
import type {
  ArcanaDropConfig,
  SoulPowerDropConfig,
  EnchantConfig,
} from '../../packages/sim/src/economy/types.js';
import type { EconomicScenario } from '../../packages/sim/src/economy/balance-testing.js';

describe('Scenario Runner', () => {
  let runner: ScenarioRunner;
  let arcanaManager: DefaultArcanaDropManager;
  let soulPowerManager: DefaultSoulPowerDropManager;
  let enchantManager: DefaultEnchantManager;
  let metricsCollector: ReturnType<typeof createEconomicMetricsCollector>;

  const testScenario: EconomicScenario = {
    id: 'test_scenario',
    name: 'Test Scenario',
    description: 'A test scenario for unit testing',
    duration: 1000, // 1 second for fast testing
    config: {
      enemySpawnRate: 1,
      bossFrequency: 0.1,
      distanceProgression: 0.5,
      wardProgression: 0.05,
      playerBehavior: 'optimal',
      spendingPattern: 'balanced',
    },
  };

  beforeEach(() => {
    runner = createScenarioRunner({
      targetFrameRate: 60,
      enablePerformanceMonitoring: true,
      enableMetricsCollection: true,
      simulationSpeed: 1.0,
      maxExecutionTime: 5000, // 5 seconds
      pauseOnError: false,
      testMode: true, // Enable test mode for fast execution
    });

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

  describe('Initialization', () => {
    it('should create runner with default options', () => {
      const defaultRunner = createScenarioRunner();
      expect(defaultRunner.isRunning).toBe(false);
      expect(defaultRunner.progress).toBe(0);
    });

    it('should create runner with custom options', () => {
      const customOptions: ScenarioExecutionOptions = {
        targetFrameRate: 30,
        enablePerformanceMonitoring: false,
        enableMetricsCollection: false,
        simulationSpeed: 2.0,
        maxExecutionTime: 10000,
        pauseOnError: true,
      };

      const customRunner = createScenarioRunner(customOptions);
      expect(customRunner.isRunning).toBe(false);
      expect(customRunner.progress).toBe(0);
    });
  });

  describe('Execution Control', () => {
    it('should execute scenario successfully', async () => {
      const result = await runner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.frameCount).toBeGreaterThan(0);
      expect(result.averageFrameRate).toBeGreaterThan(0);
      expect(result.performance).toBeDefined();
      expect(result.statistics).toBeDefined();
    });

    it('should track execution state during run', async () => {
      const executionPromise = runner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      // Check state during execution
      expect(runner.isRunning).toBe(true);
      expect(runner.progress).toBeGreaterThan(0);

      const result = await executionPromise;
      expect(result.success).toBe(true);
      expect(runner.isRunning).toBe(false);
    });

    it('should stop execution when requested', async () => {
      const longScenario: EconomicScenario = {
        ...testScenario,
        duration: 10000, // 10 seconds
      };

      const executionPromise = runner.execute(
        longScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      // Stop execution after a short delay
      setTimeout(() => {
        runner.stop();
      }, 100);

      const result = await executionPromise;
      expect(result.success).toBe(true); // Should complete successfully even when stopped
      expect(runner.isRunning).toBe(false);
    });

    it('should handle timeout', async () => {
      const timeoutRunner = createScenarioRunner({
        targetFrameRate: 60,
        enablePerformanceMonitoring: true,
        enableMetricsCollection: true,
        simulationSpeed: 1.0,
        maxExecutionTime: 100, // Very short timeout
        pauseOnError: false,
      });

      const longScenario: EconomicScenario = {
        ...testScenario,
        duration: 10000, // 10 seconds
      };

      const result = await timeoutRunner.execute(
        longScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('Performance Monitoring', () => {
    it('should collect performance metrics', async () => {
      const result = await runner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      expect(result.performance).toBeDefined();
      expect(result.performance.averageFrameTime).toBeGreaterThan(0);
      expect(result.performance.peakFrameTime).toBeGreaterThan(0);
      expect(result.performance.frameTimeHistory).toBeDefined();
      expect(result.performance.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    it('should track frame timing', async () => {
      const result = await runner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      expect(result.frameCount).toBeGreaterThan(0);
      expect(result.averageFrameRate).toBeGreaterThan(0);
      expect(result.averageFrameRate).toBeLessThanOrEqual(runner.getState().targetFrameRate);
    });

    it('should handle performance monitoring when disabled', async () => {
      const noPerformanceRunner = createScenarioRunner({
        targetFrameRate: 60,
        enablePerformanceMonitoring: false,
        enableMetricsCollection: false,
        simulationSpeed: 1.0,
        maxExecutionTime: 5000,
        pauseOnError: false,
      });

      const result = await noPerformanceRunner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
      );

      expect(result.success).toBe(true);
      expect(result.performance).toBeDefined();
    });
  });

  describe('Event Statistics', () => {
    it('should track economic events', async () => {
      const result = await runner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalEvents).toBeGreaterThan(0);
      expect(result.statistics.averageEventsPerFrame).toBeGreaterThan(0);
      expect(result.statistics.peakEventsPerFrame).toBeGreaterThanOrEqual(0);
    });

    it('should track events per frame', async () => {
      const result = await runner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      expect(result.frameCount).toBeGreaterThan(0);
      expect(result.statistics.averageEventsPerFrame).toBe(
        result.statistics.totalEvents / result.frameCount,
      );
    });
  });

  describe('State Management', () => {
    it('should provide execution state', () => {
      const state = runner.getState();

      expect(state.isRunning).toBe(false);
      expect(state.currentTime).toBe(0);
      expect(state.startTime).toBe(0);
      expect(state.endTime).toBe(0);
      expect(state.frameNumber).toBe(0);
      expect(state.targetFrameRate).toBe(60);
      expect(state.actualFrameRate).toBe(0);
      expect(state.performance).toBeDefined();
    });

    it('should update state during execution', async () => {
      const executionPromise = runner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      // Wait a bit for execution to start
      await new Promise((resolve) => setTimeout(resolve, 50));

      const state = runner.getState();
      expect(state.isRunning).toBe(true);
      expect(state.currentTime).toBeGreaterThan(0);
      expect(state.frameNumber).toBeGreaterThan(0);

      await executionPromise;
    });

    it('should track progress correctly', async () => {
      const executionPromise = runner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      // Wait for execution to start
      await new Promise((resolve) => setTimeout(resolve, 50));

      const progress = runner.progress;
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(1);

      await executionPromise;
      expect(runner.progress).toBe(1);
    });
  });

  describe('Simulation Speed', () => {
    it('should respect simulation speed multiplier', async () => {
      const fastRunner = createScenarioRunner({
        targetFrameRate: 60,
        enablePerformanceMonitoring: true,
        enableMetricsCollection: true,
        simulationSpeed: 2.0, // 2x speed
        maxExecutionTime: 5000,
        pauseOnError: false,
      });

      const startTime = Date.now();
      const result = await fastRunner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );
      const endTime = Date.now();

      expect(result.success).toBe(true);
      // Execution should be faster due to speed multiplier
      expect(endTime - startTime).toBeLessThan(testScenario.duration);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully when pauseOnError is false', async () => {
      const errorRunner = createScenarioRunner({
        targetFrameRate: 60,
        enablePerformanceMonitoring: true,
        enableMetricsCollection: true,
        simulationSpeed: 1.0,
        maxExecutionTime: 5000,
        pauseOnError: false,
      });

      // Mock a method to throw an error
      const originalDropArcana = arcanaManager.dropArcana;
      arcanaManager.dropArcana = vi.fn().mockImplementation(() => {
        throw new Error('Simulated error');
      });

      const result = await errorRunner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      expect(result.success).toBe(true); // Should continue despite errors

      // Restore original method
      arcanaManager.dropArcana = originalDropArcana;
    });

    it('should pause on errors when pauseOnError is true', async () => {
      const pauseOnErrorRunner = createScenarioRunner({
        targetFrameRate: 60,
        enablePerformanceMonitoring: true,
        enableMetricsCollection: true,
        simulationSpeed: 1.0,
        maxExecutionTime: 5000,
        pauseOnError: true,
      });

      // Mock a method to throw an error
      const originalDropArcana = arcanaManager.dropArcana;
      arcanaManager.dropArcana = vi.fn().mockImplementation(() => {
        throw new Error('Simulated error');
      });

      const result = await pauseOnErrorRunner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      // Restore original method
      arcanaManager.dropArcana = originalDropArcana;
    });
  });

  describe('Metrics Integration', () => {
    it('should integrate with metrics collector', async () => {
      const result = await runner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        metricsCollector,
      );

      expect(result.success).toBe(true);

      // Check that metrics were collected
      const events = metricsCollector.getEvents();
      expect(events.length).toBeGreaterThan(0);

      const snapshots = metricsCollector.getSnapshots();
      expect(snapshots.length).toBeGreaterThan(0);
    });

    it('should work without metrics collector', async () => {
      const result = await runner.execute(
        testScenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
      );

      expect(result.success).toBe(true);
      expect(result.frameCount).toBeGreaterThan(0);
    });
  });
});
