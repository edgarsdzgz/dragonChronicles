/**
 * Balance Testing Framework
 *
 * This module provides comprehensive testing infrastructure for economic balance,
 * including scenario execution, metrics collection, and balance analysis.
 */

import type {
  ArcanaDropManager,
  SoulPowerDropManager,
  EnchantManager,
  ArcanaBalance as _ArcanaBalance,
  SoulPowerBalance as _SoulPowerBalance,
  EconomicEvent as _EconomicEvent,
} from './types.js';
import type { EnchantSystem as _EnchantSystem } from './enchant-types.js';
import type { SoulForgingSystem as _SoulForgingSystem } from './soul-forging.js';

/**
 * Economic scenario _configuration
 */
export interface EconomicScenario {
  /** Unique identifier for the scenario */
  id: string;
  /** Human-readable name for the scenario */
  name: string;
  /** Description of what this scenario tests */
  description: string;
  /** Duration of the scenario in milliseconds */
  duration: number;
  /** Configuration for the scenario */
  _config: ScenarioConfig;
}

/**
 * Scenario _configuration parameters
 */
export interface ScenarioConfig {
  /** Enemy spawn rate (enemies per second) */
  enemySpawnRate: number;
  /** Boss encounter frequency (bosses per minute) */
  bossFrequency: number;
  /** Distance progression rate (distance units per second) */
  distanceProgression: number;
  /** Ward progression rate (wards per minute) */
  wardProgression: number;
  /** Player behavior pattern */
  playerBehavior: 'optimal' | 'suboptimal' | 'mixed';
  /** Economic spending pattern */
  spendingPattern: 'aggressive' | 'conservative' | 'balanced';
}

/**
 * Balance testing results
 */
export interface BalanceTestResults {
  /** Scenario that was tested */
  scenario: EconomicScenario;
  /** Duration of the test in milliseconds */
  duration: number;
  /** Economic metrics collected during the test */
  metrics: EconomicMetrics;
  /** Balance analysis results */
  analysis: BalanceAnalysis;
  /** Performance metrics */
  performance: PerformanceMetrics;
  /** Test execution timestamp */
  timestamp: number;
}

/**
 * Economic metrics collected during testing
 */
export interface EconomicMetrics {
  /** Arcana metrics */
  arcana: {
    /** Total Arcana earned */
    totalEarned: number;
    /** Total Arcana spent */
    totalSpent: number;
    /** Average Arcana per hour */
    averagePerHour: number;
    /** Peak Arcana balance */
    peakBalance: number;
    /** Number of drops */
    dropCount: number;
    /** Average drop amount */
    averageDropAmount: number;
  };
  /** Soul Power metrics */
  soulPower: {
    /** Total Soul Power earned */
    totalEarned: number;
    /** Total Soul Power spent */
    totalSpent: number;
    /** Average Soul Power per hour */
    averagePerHour: number;
    /** Peak Soul Power balance */
    peakBalance: number;
    /** Number of drops */
    dropCount: number;
    /** Average drop amount */
    averageDropAmount: number;
  };
  /** Enchant metrics */
  enchants: {
    /** Total enchant purchases */
    totalPurchases: number;
    /** Average enchant level achieved */
    averageLevel: number;
    /** Peak enchant levels */
    peakLevels: {
      firepower: number;
      scales: number;
    };
    /** Total enchant costs */
    totalCosts: number;
  };
  /** Soul Forging metrics */
  soulForging: {
    /** Total soul forging purchases */
    totalPurchases: number;
    /** Average soul forging level achieved */
    averageLevel: number;
    /** Peak soul forging levels */
    peakLevels: {
      temporary: number;
      permanent: number;
    };
    /** Total soul forging costs */
    totalCosts: number;
  };
}

/**
 * Balance analysis results
 */
export interface BalanceAnalysis {
  /** Whether the test met the 2-3 returns/hour target */
  meetsTarget: boolean;
  /** Actual returns per hour achieved */
  actualReturnsPerHour: number;
  /** Target returns per hour */
  targetReturnsPerHour: number;
  /** Balance score (0-100) */
  balanceScore: number;
  /** Issues identified during testing */
  issues: string[];
  /** Recommendations for balance improvements */
  recommendations: string[];
  /** Progression curve analysis */
  progressionCurve: {
    /** Whether progression is smooth */
    isSmooth: boolean;
    /** Whether progression is balanced */
    isBalanced: boolean;
    /** Progression rate consistency */
    consistency: number;
  };
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Test execution time in milliseconds */
  executionTime: number;
  /** Average frame time in milliseconds */
  averageFrameTime: number;
  /** Peak frame time in milliseconds */
  peakFrameTime: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** CPU usage percentage */
  cpuUsage: number;
  /** Economic operations per second */
  operationsPerSecond: number;
}

/**
 * Balance testing framework
 */
export class BalanceTestingFramework {
  private _scenarios: Map<string, EconomicScenario> = new Map();
  private _results: BalanceTestResults[] = [];
  private _isRunning: boolean = false;

  constructor() {
    this._initializeDefaultScenarios();
  }

  /**
   * Add a custom scenario to the framework
   */
  addScenario(scenario: EconomicScenario): void {
    this._scenarios.set(scenario.id, scenario);
  }

  /**
   * Get all available scenarios
   */
  getScenarios(): EconomicScenario[] {
    return Array.from(this._scenarios.values());
  }

  /**
   * Get a specific scenario by ID
   */
  getScenario(id: string): EconomicScenario | undefined {
    return this._scenarios.get(id);
  }

  /**
   * Run a balance test for a specific scenario
   */
  async runTest(
    scenarioId: string,
    arcanaManager: ArcanaDropManager,
    soulPowerManager: SoulPowerDropManager,
    enchantManager: EnchantManager,
    testMode: boolean = false,
  ): Promise<BalanceTestResults> {
    const scenario = this._scenarios.get(scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${scenarioId} not found`);
    }

    if (this._isRunning) {
      throw new Error('A test is already running');
    }

    this._isRunning = true;
    const startTime = Date.now();

    try {
      // Execute the scenario
      const metrics = await this._executeScenario(
        scenario,
        arcanaManager,
        soulPowerManager,
        enchantManager,
        testMode,
      );

      // Analyze the results
      const analysis = this._analyzeBalance(scenario, metrics);

      // Collect performance metrics
      const performance = this._collectPerformanceMetrics(startTime);

      const results: BalanceTestResults = {
        scenario,
        duration: Date.now() - startTime,
        metrics,
        analysis,
        performance,
        timestamp: Date.now(),
      };

      this._results.push(results);
      return results;
    } finally {
      this._isRunning = false;
    }
  }

  /**
   * Get all test results
   */
  getResults(): BalanceTestResults[] {
    return [...this._results];
  }

  /**
   * Get the latest test result
   */
  getLatestResult(): BalanceTestResults | undefined {
    return this._results[this._results.length - 1];
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this._results = [];
  }

  /**
   * Check if a test is currently running
   */
  get isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * Initialize default scenarios
   */
  private _initializeDefaultScenarios(): void {
    // Standard progression scenario
    this.addScenario({
      id: 'standard_progression',
      name: 'Standard Progression',
      description: 'Normal player progression path with balanced gameplay',
      duration: 3600000, // 1 hour
      _config: {
        enemySpawnRate: 2,
        bossFrequency: 1,
        distanceProgression: 1,
        wardProgression: 0.1,
        playerBehavior: 'mixed',
        spendingPattern: 'balanced',
      },
    });

    // Fast progression scenario
    this.addScenario({
      id: 'fast_progression',
      name: 'Fast Progression',
      description: 'Optimal player progression path with aggressive gameplay',
      duration: 3600000, // 1 hour
      _config: {
        enemySpawnRate: 3,
        bossFrequency: 2,
        distanceProgression: 1.5,
        wardProgression: 0.2,
        playerBehavior: 'optimal',
        spendingPattern: 'aggressive',
      },
    });

    // Slow progression scenario
    this.addScenario({
      id: 'slow_progression',
      name: 'Slow Progression',
      description: 'Suboptimal player progression path with conservative gameplay',
      duration: 3600000, // 1 hour
      _config: {
        enemySpawnRate: 1,
        bossFrequency: 0.5,
        distanceProgression: 0.5,
        wardProgression: 0.05,
        playerBehavior: 'suboptimal',
        spendingPattern: 'conservative',
      },
    });

    // Stress test scenario
    this.addScenario({
      id: 'stress_test',
      name: 'Stress Test',
      description: 'High-load scenario to test system limits',
      duration: 300000, // 5 minutes
      _config: {
        enemySpawnRate: 10,
        bossFrequency: 5,
        distanceProgression: 3,
        wardProgression: 0.5,
        playerBehavior: 'optimal',
        spendingPattern: 'aggressive',
      },
    });
  }

  /**
   * Execute a scenario and collect metrics
   */
  private async _executeScenario(
    scenario: EconomicScenario,
    arcanaManager: ArcanaDropManager,
    soulPowerManager: SoulPowerDropManager,
    enchantManager: EnchantManager,
    testMode: boolean = false,
  ): Promise<EconomicMetrics> {
    const startTime = Date.now();

    // Calculate time acceleration factor for test mode
    const timeAccelerationFactor = testMode ? 3600 : 1; // 3600x speed in test mode (1 hour = 1 second)
    const acceleratedDuration = scenario.duration / timeAccelerationFactor;
    const __endTime = startTime + acceleratedDuration;

    // Initialize metrics collection
    const metrics: EconomicMetrics = {
      arcana: {
        totalEarned: 0,
        totalSpent: 0,
        averagePerHour: 0,
        peakBalance: 0,
        dropCount: 0,
        averageDropAmount: 0,
      },
      soulPower: {
        totalEarned: 0,
        totalSpent: 0,
        averagePerHour: 0,
        peakBalance: 0,
        dropCount: 0,
        averageDropAmount: 0,
      },
      enchants: {
        totalPurchases: 0,
        averageLevel: 0,
        peakLevels: {
          firepower: 0,
          scales: 0,
        },
        totalCosts: 0,
      },
      soulForging: {
        totalPurchases: 0,
        averageLevel: 0,
        peakLevels: {
          temporary: 0,
          permanent: 0,
        },
        totalCosts: 0,
      },
    };

    // Simulate the scenario with time acceleration
    let simulatedTime = 0;
    const frameTime = 16; // 60 FPS = 16ms per frame

    if (testMode) {
      // In test mode, simulate just a few events to generate test data
      // Simulate a small number of enemy kills and boss encounters for testing
      const testEnemyKills = 100;
      const testBossEncounters = 10;

      // Simulate enemy kills
      for (let i = 0; i < testEnemyKills; i++) {
        arcanaManager.dropArcana(10, {
          type: 'enemy_kill',
          enemyId: `enemy_test_${i}`,
        });

        soulPowerManager.dropSoulPower(
          5,
          {
            type: 'enemy_kill',
            enemyId: `enemy_test_${i}`,
          },
          1.0,
        );
      }

      // Simulate boss encounters
      for (let i = 0; i < testBossEncounters; i++) {
        arcanaManager.dropArcana(50, {
          type: 'boss_reward',
          bossId: `boss_test_${i}`,
        });

        soulPowerManager.dropSoulPower(
          25,
          {
            type: 'boss_reward',
            bossId: `boss_test_${i}`,
          },
          1.0,
        );
      }

      // Simulate player spending decisions
      await this._simulatePlayerSpending(
        scenario._config,
        enchantManager,
        arcanaManager,
        soulPowerManager,
      );

      // Update metrics
      this._updateMetrics(metrics, arcanaManager, soulPowerManager, enchantManager);

      // Set simulated time to full duration
      simulatedTime = scenario.duration;
    } else {
      // Real-time mode: frame-by-frame with delays
      while (simulatedTime < scenario.duration) {
        // Simulate enemy kills and drops
        await this._simulateEnemyKills(scenario._config, arcanaManager, soulPowerManager);

        // Simulate player spending decisions
        await this._simulatePlayerSpending(
          scenario._config,
          enchantManager,
          arcanaManager,
          soulPowerManager,
        );

        // Update metrics
        this._updateMetrics(metrics, arcanaManager, soulPowerManager, enchantManager);

        // Advance simulated time
        simulatedTime += frameTime;

        // Wait for next frame (simulate 60 FPS)
        await new Promise((resolve) => setTimeout(resolve, frameTime));
      }
    }

    // Calculate final metrics
    this._calculateFinalMetrics(metrics, scenario.duration);

    return metrics;
  }

  /**
   * Simulate enemy kills and drops
   */
  private async _simulateEnemyKills(
    _config: ScenarioConfig,
    arcanaManager: ArcanaDropManager,
    soulPowerManager: SoulPowerDropManager,
  ): Promise<void> {
    const killsPerFrame = _config.enemySpawnRate / 60; // Convert to per-frame rate

    for (let i = 0; i < Math.floor(killsPerFrame); i++) {
      // Simulate Arcana drop
      arcanaManager.dropArcana(10, {
        type: 'enemy_kill',
        enemyId: `enemy_${Date.now()}_${i}`,
      });

      // Simulate Soul Power drop
      soulPowerManager.dropSoulPower(
        5,
        {
          type: 'enemy_kill',
          enemyId: `enemy_${Date.now()}_${i}`,
        },
        1.0,
      );
    }
  }

  /**
   * Simulate player spending decisions
   */
  private async _simulatePlayerSpending(
    _config: ScenarioConfig,
    enchantManager: EnchantManager,
    arcanaManager: ArcanaDropManager,
    soulPowerManager: SoulPowerDropManager,
  ): Promise<void> {
    // This is a simplified simulation - in a real implementation,
    // this would be more sophisticated based on player behavior patterns
    const arcanaBalance = arcanaManager.balance.current;
    const soulPowerBalance = soulPowerManager.balance.current;

    // Simulate enchant purchases based on spending pattern
    if (_config.spendingPattern === 'aggressive' && arcanaBalance > 100) {
      try {
        enchantManager.purchaseEnchant('firepower', 'temporary', 1, 'arcana');
      } catch {
        // Ignore purchase failures in simulation
      }
    }

    // Simulate soul forging purchases
    if (_config.spendingPattern === 'aggressive' && soulPowerBalance > 50) {
      try {
        enchantManager.purchaseSoulForging('temporary', 1);
      } catch {
        // Ignore purchase failures in simulation
      }
    }
  }

  /**
   * Update metrics during scenario execution
   */
  private _updateMetrics(
    metrics: EconomicMetrics,
    arcanaManager: ArcanaDropManager,
    soulPowerManager: SoulPowerDropManager,
    enchantManager: EnchantManager,
  ): void {
    // Update Arcana metrics
    const arcanaBalance = arcanaManager.balance;
    metrics.arcana.totalEarned = arcanaBalance.totalEarned;
    metrics.arcana.totalSpent = arcanaBalance.totalSpent;
    metrics.arcana.peakBalance = Math.max(metrics.arcana.peakBalance, arcanaBalance.current);
    metrics.arcana.dropCount = arcanaBalance.drops.length;

    // Update Soul Power metrics
    const soulPowerBalance = soulPowerManager.balance;
    metrics.soulPower.totalEarned = soulPowerBalance.totalEarned;
    metrics.soulPower.totalSpent = soulPowerBalance.totalSpent;
    metrics.soulPower.peakBalance = Math.max(
      metrics.soulPower.peakBalance,
      soulPowerBalance.current,
    );
    metrics.soulPower.dropCount = soulPowerBalance.drops.length;

    // Update enchant metrics
    const enchantSystem = enchantManager.system;
    metrics.enchants.peakLevels.firepower = Math.max(
      metrics.enchants.peakLevels.firepower,
      enchantSystem.effective.firepower,
    );
    metrics.enchants.peakLevels.scales = Math.max(
      metrics.enchants.peakLevels.scales,
      enchantSystem.effective.scales,
    );
  }

  /**
   * Calculate final metrics
   */
  private _calculateFinalMetrics(metrics: EconomicMetrics, duration: number): void {
    const hours = duration / (1000 * 60 * 60);

    // Calculate averages
    metrics.arcana.averagePerHour = metrics.arcana.totalEarned / hours;
    metrics.soulPower.averagePerHour = metrics.soulPower.totalEarned / hours;

    // Calculate average drop amounts
    if (metrics.arcana.dropCount > 0) {
      metrics.arcana.averageDropAmount = metrics.arcana.totalEarned / metrics.arcana.dropCount;
    }
    if (metrics.soulPower.dropCount > 0) {
      metrics.soulPower.averageDropAmount =
        metrics.soulPower.totalEarned / metrics.soulPower.dropCount;
    }

    // Calculate average enchant levels
    metrics.enchants.averageLevel =
      (metrics.enchants.peakLevels.firepower + metrics.enchants.peakLevels.scales) / 2;
    metrics.soulForging.averageLevel =
      (metrics.soulForging.peakLevels.temporary + metrics.soulForging.peakLevels.permanent) / 2;
  }

  /**
   * Analyze balance based on collected metrics
   */
  private _analyzeBalance(scenario: EconomicScenario, metrics: EconomicMetrics): BalanceAnalysis {
    const __hours = scenario.duration / (1000 * 60 * 60);
    const actualReturnsPerHour = metrics.arcana.averagePerHour;
    const targetReturnsPerHour = 2.5; // Target: 2-3 returns/hour

    const meetsTarget = actualReturnsPerHour >= 2 && actualReturnsPerHour <= 3;
    const balanceScore = Math.max(
      0,
      Math.min(100, (actualReturnsPerHour / targetReturnsPerHour) * 100),
    );

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Analyze progression curve
    const progressionCurve = this._analyzeProgressionCurve(metrics);

    // Identify issues
    if (actualReturnsPerHour < 2) {
      issues.push('Economic progression too slow - below 2 returns/hour target');
      recommendations.push('Increase Arcana drop rates or reduce enchant costs');
    } else if (actualReturnsPerHour > 3) {
      issues.push('Economic progression too fast - above 3 returns/hour target');
      recommendations.push('Decrease Arcana drop rates or increase enchant costs');
    }

    if (metrics.enchants.averageLevel < 5) {
      issues.push('Enchant progression too slow');
      recommendations.push('Reduce enchant cost scaling or increase Arcana availability');
    }

    if (progressionCurve.consistency < 0.8) {
      issues.push('Inconsistent progression curve');
      recommendations.push('Review scaling factors and cost curves');
    }

    return {
      meetsTarget,
      actualReturnsPerHour,
      targetReturnsPerHour,
      balanceScore,
      issues,
      recommendations,
      progressionCurve,
    };
  }

  /**
   * Analyze progression curve consistency
   */
  private _analyzeProgressionCurve(metrics: EconomicMetrics): BalanceAnalysis['progressionCurve'] {
    // This is a simplified analysis - in a real implementation,
    // this would analyze the actual progression curve data
    const isSmooth = metrics.enchants.averageLevel > 0 && metrics.soulForging.averageLevel > 0;
    const isBalanced =
      Math.abs(metrics.enchants.peakLevels.firepower - metrics.enchants.peakLevels.scales) <= 2;
    const consistency = isSmooth && isBalanced ? 0.9 : 0.6;

    return {
      isSmooth,
      isBalanced,
      consistency,
    };
  }

  /**
   * Collect performance metrics
   */
  private _collectPerformanceMetrics(startTime: number): PerformanceMetrics {
    const executionTime = Date.now() - startTime;

    // This is a simplified implementation - in a real implementation,
    // this would collect actual performance metrics
    return {
      executionTime,
      averageFrameTime: 16, // Target 60 FPS
      peakFrameTime: 32, // Maximum acceptable frame time
      memoryUsage: 50, // MB
      cpuUsage: 25, // Percentage
      operationsPerSecond: 1000, // Target
    };
  }
}

/**
 * Create a new balance testing framework
 */
export function createBalanceTestingFramework(): BalanceTestingFramework {
  return new BalanceTestingFramework();
}
