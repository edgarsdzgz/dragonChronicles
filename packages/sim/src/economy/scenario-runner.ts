/**
 * Scenario Runner
 *
 * This module provides the execution engine for economic scenarios,
 * including simulation control, timing, and coordination.
 */

import type { ArcanaDropManager, SoulPowerDropManager, EnchantManager } from './types.js';
import type { EconomicScenario, ScenarioConfig } from './balance-testing.js';
import type { EconomicMetricsCollector } from './economic-metrics.js';

/**
 * Scenario execution state
 */
export interface ScenarioExecutionState {
  /** Whether the scenario is currently running */
  isRunning: boolean;
  /** Current simulation time in milliseconds */
  currentTime: number;
  /** Scenario start time */
  startTime: number;
  /** Scenario end time */
  endTime: number;
  /** Current frame number */
  frameNumber: number;
  /** Target frame rate (FPS) */
  targetFrameRate: number;
  /** Actual frame rate achieved */
  actualFrameRate: number;
  /** Performance metrics */
  performance: {
    /** Average frame time in milliseconds */
    averageFrameTime: number;
    /** Peak frame time in milliseconds */
    peakFrameTime: number;
    /** Frame time history (last 100 frames) */
    frameTimeHistory: number[];
    /** Memory usage in MB */
    memoryUsage: number;
  };
}

/**
 * Scenario execution options
 */
export interface ScenarioExecutionOptions {
  /** Target frame rate (FPS) */
  targetFrameRate: number;
  /** Whether to enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  /** Whether to enable metrics collection */
  enableMetricsCollection: boolean;
  /** Simulation speed multiplier (1.0 = real-time) */
  simulationSpeed: number;
  /** Maximum execution time in milliseconds */
  maxExecutionTime: number;
  /** Whether to pause on errors */
  pauseOnError: boolean;
  /** Whether to run in test mode (no frame delays) */
  testMode?: boolean;
}

/**
 * Scenario execution result
 */
export interface ScenarioExecutionResult {
  /** Whether the scenario completed successfully */
  success: boolean;
  /** Total execution time in milliseconds */
  executionTime: number;
  /** Number of frames executed */
  frameCount: number;
  /** Average frame rate achieved */
  averageFrameRate: number;
  /** Performance metrics */
  performance: ScenarioExecutionState['performance'];
  /** Error message if execution failed */
  error?: string;
  /** Execution statistics */
  statistics: {
    /** Total economic events processed */
    totalEvents: number;
    /** Average events per frame */
    averageEventsPerFrame: number;
    /** Peak events per frame */
    peakEventsPerFrame: number;
  };
}

/**
 * Scenario runner implementation
 */
export class ScenarioRunner {
  private _state: ScenarioExecutionState;
  private _options: ScenarioExecutionOptions;
  private _metricsCollector: EconomicMetricsCollector | undefined;
  private _frameTimeHistory: number[] = [];
  private _lastFrameTime: number = 0;
  private _eventCount: number = 0;
  private _eventsPerFrame: number[] = [];

  constructor(
    options: ScenarioExecutionOptions = {
      targetFrameRate: 60,
      enablePerformanceMonitoring: true,
      enableMetricsCollection: true,
      simulationSpeed: 1.0,
      maxExecutionTime: 300000, // 5 minutes
      pauseOnError: false,
      testMode: false,
    },
  ) {
    this._options = { testMode: false, ...options };
    this._state = this._createInitialState();
  }

  /**
   * Execute a scenario
   */
  async execute(
    scenario: EconomicScenario,
    arcanaManager: ArcanaDropManager,
    soulPowerManager: SoulPowerDropManager,
    enchantManager: EnchantManager,
    metricsCollector?: EconomicMetricsCollector,
  ): Promise<ScenarioExecutionResult> {
    this._metricsCollector = metricsCollector;
    this._state = this._createInitialState();
    this._state.startTime = Date.now();

    // Calculate time acceleration factor for test mode
    const timeAccelerationFactor = this._options.testMode ? 3600 : 1; // 3600x speed in test mode (1 hour = 1 second)
    const acceleratedDuration = scenario.duration / timeAccelerationFactor;
    this._state.endTime = this._state.startTime + acceleratedDuration;
    this._state.isRunning = true;

    const startTime = Date.now();
    let frameCount = 0;
    let lastFrameTime = startTime;

    try {
      // Initialize metrics collection if enabled
      if (this._options.enableMetricsCollection && this._metricsCollector) {
        this._metricsCollector.startCollection();
      }

      // Calculate target frame time
      const targetFrameTime = 1000 / this._options.targetFrameRate;
      const _acceleratedFrameTime = targetFrameTime * timeAccelerationFactor;

      if (this._options.testMode) {
        // In test mode, simulate just a few events to generate test data
        const testEnemyKills = 100;
        const testBossEncounters = 10;

        try {
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

          // Simulate player actions
          await this._simulatePlayerActions(
            scenario._config,
            enchantManager,
            arcanaManager,
            soulPowerManager,
          );
        } catch (error) {
          if (this._options.pauseOnError) {
            throw error;
          }
          // Log error but continue execution
          console.warn(`Test mode simulation error: ${error}`);
        }

        // Set final state
        this._state.currentTime = scenario.duration;
        this._state.frameNumber = testEnemyKills + testBossEncounters;
        this._state.actualFrameRate = this._options.targetFrameRate;
        this._state.isRunning = false; // Mark as completed
        frameCount = this._state.frameNumber;
      } else {
        // Real-time mode: frame-by-frame simulation
        while (this._state.isRunning && this._state.currentTime < this._state.endTime) {
          const frameStartTime = Date.now();

          // Check for timeout
          if (Date.now() - startTime > this._options.maxExecutionTime) {
            throw new Error(`Scenario execution timeout after ${this._options.maxExecutionTime}ms`);
          }

          // Execute one frame
          await this._executeFrame(scenario, arcanaManager, soulPowerManager, enchantManager);

          // Update frame timing
          const frameTime = Date.now() - frameStartTime;
          this._updateFrameTiming(frameTime);
          frameCount++;

          // Calculate delay
          const delay = Math.max(0, targetFrameTime - frameTime);
          if (delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          // Update state
          this._state.currentTime = Date.now() - this._state.startTime;
          this._state.frameNumber = frameCount;

          // Calculate actual frame rate
          const currentTime = Date.now();
          const elapsedTime = currentTime - lastFrameTime;
          if (elapsedTime >= 1000) {
            // Update every second
            this._state.actualFrameRate = frameCount / ((currentTime - startTime) / 1000);
            lastFrameTime = currentTime;
          }
        }
      }

      // Stop metrics collection
      if (this._options.enableMetricsCollection && this._metricsCollector) {
        this._metricsCollector.stopCollection();
      }

      // Calculate final statistics
      const executionTime = Date.now() - startTime;
      const averageFrameRate = this._options.testMode
        ? this._options.targetFrameRate // In test mode, use target frame rate
        : frameCount / (executionTime / 1000); // In real-time mode, calculate actual rate

      return {
        success: true,
        executionTime,
        frameCount,
        averageFrameRate,
        performance: this._state.performance,
        statistics: {
          totalEvents: this._eventCount,
          averageEventsPerFrame: this._eventCount / frameCount,
          peakEventsPerFrame: Math.max(...this._eventsPerFrame, 0),
        },
      };
    } catch (error) {
      // Stop metrics collection on error
      if (this._options.enableMetricsCollection && this._metricsCollector) {
        this._metricsCollector.stopCollection();
      }

      const executionTime = Date.now() - startTime;
      const averageFrameRate = frameCount / (executionTime / 1000);

      return {
        success: false,
        executionTime,
        frameCount,
        averageFrameRate,
        performance: this._state.performance,
        error: error instanceof Error ? error.message : 'Unknown error',
        statistics: {
          totalEvents: this._eventCount,
          averageEventsPerFrame: this._eventCount / frameCount,
          peakEventsPerFrame: Math.max(...this._eventsPerFrame, 0),
        },
      };
    }
  }

  /**
   * Stop the current scenario execution
   */
  stop(): void {
    this._state.isRunning = false;
  }

  /**
   * Get current execution state
   */
  getState(): ScenarioExecutionState {
    return { ...this._state };
  }

  /**
   * Check if scenario is currently running
   */
  get isRunning(): boolean {
    return this._state.isRunning;
  }

  /**
   * Get execution progress (0-1)
   */
  get progress(): number {
    if (this._state.endTime === 0) {
      return 0;
    }
    return Math.min(1, this._state.currentTime / (this._state.endTime - this._state.startTime));
  }

  /**
   * Create initial execution state
   */
  private _createInitialState(): ScenarioExecutionState {
    return {
      isRunning: false,
      currentTime: 0,
      startTime: 0,
      endTime: 0,
      frameNumber: 0,
      targetFrameRate: this._options.targetFrameRate,
      actualFrameRate: 0,
      performance: {
        averageFrameTime: 0,
        peakFrameTime: 0,
        frameTimeHistory: [],
        memoryUsage: 0,
      },
    };
  }

  /**
   * Execute one simulation frame
   */
  private async _executeFrame(
    scenario: EconomicScenario,
    arcanaManager: ArcanaDropManager,
    soulPowerManager: SoulPowerDropManager,
    enchantManager: EnchantManager,
  ): Promise<void> {
    const frameStartTime = Date.now();
    let frameEventCount = 0;

    try {
      // Simulate enemy spawns and kills
      await this._simulateEnemySpawns(scenario._config, arcanaManager, soulPowerManager);
      frameEventCount += this._calculateEnemySpawnCount(scenario._config);

      // Simulate boss encounters
      await this._simulateBossEncounters(scenario._config, arcanaManager, soulPowerManager);
      frameEventCount += this._calculateBossEncounterCount(scenario._config);

      // Simulate player actions
      await this._simulatePlayerActions(
        scenario._config,
        enchantManager,
        arcanaManager,
        soulPowerManager,
      );
      frameEventCount += this._calculatePlayerActionCount(scenario._config);

      // Take metrics snapshot periodically
      if (
        this._options.enableMetricsCollection &&
        this._metricsCollector &&
        this._state.frameNumber % 60 === 0
      ) {
        this._metricsCollector.takeSnapshot(arcanaManager, soulPowerManager, enchantManager);
      }

      // Record frame performance
      const frameTime = Date.now() - frameStartTime;
      if (this._options.enablePerformanceMonitoring) {
        this._recordFramePerformance(frameTime);
      }

      // Update event counts
      this._eventCount += frameEventCount;
      this._eventsPerFrame.push(frameEventCount);

      // Trim event history to prevent memory leaks
      if (this._eventsPerFrame.length > 1000) {
        this._eventsPerFrame = this._eventsPerFrame.slice(-1000);
      }
    } catch (error) {
      if (this._options.pauseOnError) {
        throw error;
      }
      // Log error but continue execution
      console.warn(`Frame execution error: ${error}`);
    }
  }

  /**
   * Simulate enemy spawns and kills
   */
  private async _simulateEnemySpawns(
    _config: ScenarioConfig,
    arcanaManager: ArcanaDropManager,
    soulPowerManager: SoulPowerDropManager,
  ): Promise<void> {
    const spawnsPerFrame = _config.enemySpawnRate / this._options.targetFrameRate;

    for (let i = 0; i < Math.floor(spawnsPerFrame); i++) {
      // Simulate Arcana drop
      arcanaManager.dropArcana(10, {
        type: 'enemy_kill',
        enemyId: `enemy_${this._state.frameNumber}_${i}`,
      });

      // Simulate Soul Power drop
      soulPowerManager.dropSoulPower(
        5,
        {
          type: 'enemy_kill',
          enemyId: `enemy_${this._state.frameNumber}_${i}`,
        },
        1.0,
      );

      // Record metrics
      if (this._metricsCollector) {
        this._metricsCollector.recordEvent('arcana_drop', {
          enemyId: `enemy_${this._state.frameNumber}_${i}`,
          amount: arcanaManager.balance.drops[arcanaManager.balance.drops.length - 1]?.amount || 0,
        });

        this._metricsCollector.recordEvent('soul_power_drop', {
          enemyId: `enemy_${this._state.frameNumber}_${i}`,
          amount:
            soulPowerManager.balance.drops[soulPowerManager.balance.drops.length - 1]?.amount || 0,
        });
      }
    }
  }

  /**
   * Simulate boss encounters
   */
  private async _simulateBossEncounters(
    _config: ScenarioConfig,
    arcanaManager: ArcanaDropManager,
    soulPowerManager: SoulPowerDropManager,
  ): Promise<void> {
    const encountersPerFrame = _config.bossFrequency / (this._options.targetFrameRate * 60); // Convert to per-frame

    if (Math.random() < encountersPerFrame) {
      // Simulate boss Arcana reward
      arcanaManager.dropArcana(50, {
        type: 'boss_reward',
        bossId: `boss_${this._state.frameNumber}`,
      });

      // Simulate boss Soul Power reward
      soulPowerManager.dropSoulPower(
        25,
        {
          type: 'boss_reward',
          bossId: `boss_${this._state.frameNumber}`,
        },
        1.0,
      );

      // Record metrics
      if (this._metricsCollector) {
        this._metricsCollector.recordEvent('arcana_drop', {
          bossId: `boss_${this._state.frameNumber}`,
          amount: arcanaManager.balance.drops[arcanaManager.balance.drops.length - 1]?.amount || 0,
        });

        this._metricsCollector.recordEvent('soul_power_drop', {
          bossId: `boss_${this._state.frameNumber}`,
          amount:
            soulPowerManager.balance.drops[soulPowerManager.balance.drops.length - 1]?.amount || 0,
        });
      }
    }
  }

  /**
   * Simulate player actions
   */
  private async _simulatePlayerActions(
    _config: ScenarioConfig,
    enchantManager: EnchantManager,
    arcanaManager: ArcanaDropManager,
    soulPowerManager: SoulPowerDropManager,
  ): Promise<void> {
    const arcanaBalance = arcanaManager.balance.current;
    const soulPowerBalance = soulPowerManager.balance.current;

    // Simulate enchant purchases based on player behavior
    if (this._shouldPurchaseEnchant(_config, arcanaBalance)) {
      try {
        const enchantType = Math.random() < 0.5 ? 'firepower' : 'scales';
        enchantManager.purchaseEnchant(enchantType, 'temporary', 1, 'arcana');

        // Record metrics
        if (this._metricsCollector) {
          this._metricsCollector.recordEvent('enchant_purchase', {
            type: enchantType,
            category: 'temporary',
            cost: arcanaManager.balance.totalSpent - arcanaManager.balance.totalSpent,
          });
        }
      } catch {
        // Ignore purchase failures in simulation
      }
    }

    // Simulate soul forging purchases
    if (this._shouldPurchaseSoulForging(_config, soulPowerBalance)) {
      try {
        const soulForgingType = Math.random() < 0.5 ? 'temporary' : 'permanent';
        enchantManager.purchaseSoulForging(soulForgingType, 1);

        // Record metrics
        if (this._metricsCollector) {
          this._metricsCollector.recordEvent('soul_forging_purchase', {
            type: soulForgingType,
            cost: soulPowerManager.balance.totalSpent - soulPowerManager.balance.totalSpent,
          });
        }
      } catch {
        // Ignore purchase failures in simulation
      }
    }
  }

  /**
   * Determine if player should purchase an enchant
   */
  private _shouldPurchaseEnchant(_config: ScenarioConfig, arcanaBalance: number): boolean {
    const baseThreshold = 100;
    const threshold = baseThreshold * this._getSpendingMultiplier(_config.spendingPattern);
    return arcanaBalance >= threshold && Math.random() < 0.1; // 10% chance per frame
  }

  /**
   * Determine if player should purchase soul forging
   */
  private _shouldPurchaseSoulForging(_config: ScenarioConfig, soulPowerBalance: number): boolean {
    const baseThreshold = 50;
    const threshold = baseThreshold * this._getSpendingMultiplier(_config.spendingPattern);
    return soulPowerBalance >= threshold && Math.random() < 0.05; // 5% chance per frame
  }

  /**
   * Get spending multiplier based on spending pattern
   */
  private _getSpendingMultiplier(spendingPattern: ScenarioConfig['spendingPattern']): number {
    switch (spendingPattern) {
      case 'aggressive':
        return 0.5;
      case 'conservative':
        return 2.0;
      case 'balanced':
        return 1.0;
      default:
        return 1.0;
    }
  }

  /**
   * Calculate enemy spawn count for metrics
   */
  private _calculateEnemySpawnCount(config: ScenarioConfig): number {
    return Math.floor(config.enemySpawnRate / this._options.targetFrameRate);
  }

  /**
   * Calculate boss encounter count for metrics
   */
  private _calculateBossEncounterCount(config: ScenarioConfig): number {
    const encountersPerFrame = config.bossFrequency / (this._options.targetFrameRate * 60);
    return Math.random() < encountersPerFrame ? 1 : 0;
  }

  /**
   * Calculate player action count for metrics
   */
  private _calculatePlayerActionCount(_config: ScenarioConfig): number {
    let count = 0;
    if (Math.random() < 0.1) count++; // Enchant purchase chance
    if (Math.random() < 0.05) count++; // Soul forging purchase chance
    return count;
  }

  /**
   * Update frame timing metrics
   */
  private _updateFrameTiming(frameTime: number): void {
    this._frameTimeHistory.push(frameTime);
    if (this._frameTimeHistory.length > 100) {
      this._frameTimeHistory = this._frameTimeHistory.slice(-100);
    }

    this._state.performance.averageFrameTime =
      this._frameTimeHistory.reduce((a, b) => a + b, 0) / this._frameTimeHistory.length;
    this._state.performance.peakFrameTime = Math.max(...this._frameTimeHistory);
    this._state.performance.frameTimeHistory = [...this._frameTimeHistory];
    this._state.performance.memoryUsage = this._getMemoryUsage();
  }

  /**
   * Record frame performance
   */
  private _recordFramePerformance(frameTime: number): void {
    if (this._metricsCollector) {
      this._metricsCollector.recordEvent(
        'performance_event',
        {
          frameNumber: this._state.frameNumber,
          frameTime,
          memoryUsage: this._getMemoryUsage(),
        },
        frameTime,
      );
    }
  }

  /**
   * Get memory usage
   */
  private _getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const perfMemory = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
      return perfMemory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }
}

/**
 * Create a new scenario runner
 */
export function createScenarioRunner(options?: ScenarioExecutionOptions): ScenarioRunner {
  return new ScenarioRunner(options);
}
