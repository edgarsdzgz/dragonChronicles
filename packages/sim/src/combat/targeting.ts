/**
 * Main targeting system for Draconia Chronicles
 * Coordinates range detection, threat assessment, and target selection
 */

import type {
  Dragon,
  Enemy,
  TargetingSystem,
  TargetingConfig,
  TargetingState,
  TargetingStrategy,
  TargetPersistenceMode,
} from './types.js';
import { DefaultRangeDetection, createRangeDetection } from './range-detection.js';
import { DefaultThreatAssessment, createThreatAssessment } from './threat-assessment.js';

/**
 * Performance metrics for targeting system
 */
interface TargetingMetrics {
  targetSelectionTime: number;
  rangeDetectionTime: number;
  threatAssessmentTime: number;
  totalUpdateTime: number;
  targetSwitchCount: number;
  averageTargetLifetime: number;
  strategyEffectiveness: Map<TargetingStrategy, number>;
}

/**
 * Default targeting system implementation
 * Provides comprehensive targeting functionality with configurable strategies
 */
export class DefaultTargetingSystem implements TargetingSystem {
  private readonly rangeDetection: DefaultRangeDetection;
  private readonly threatAssessment: DefaultThreatAssessment;
  private readonly metrics: TargetingMetrics;
  private readonly performanceHistory: number[] = [];
  private readonly maxHistorySize = 100;

  constructor(
    public config: TargetingConfig,
    public _state: TargetingState,
  ) {
    this.rangeDetection = createRangeDetection(config.range);
    this.threatAssessment = createThreatAssessment();
    this.metrics = {
      targetSelectionTime: 0,
      rangeDetectionTime: 0,
      threatAssessmentTime: 0,
      totalUpdateTime: 0,
      targetSwitchCount: 0,
      averageTargetLifetime: 0,
      strategyEffectiveness: new Map(),
    };
  }

  /**
   * Find the best target from available enemies
   */
  findTarget(enemies: Enemy[]): Enemy | null {
    const startTime = performance.now();

    try {
      // Filter enemies in range
      const enemiesInRange = this.rangeDetection.getTargetsInRange(
        enemies,
        this.getDragonFromState(),
      );

      if (enemiesInRange.length === 0) {
        return null;
      }

      // Calculate distances for all enemies
      const distances = new Map<string, number>();
      for (const enemy of enemiesInRange) {
        const distance = this.rangeDetection.calculateDistance(this.getDragonFromState(), enemy);
        distances.set(enemy.id, distance);
      }

      // Sort enemies by strategy
      const sortedEnemies = this.threatAssessment.sortEnemiesByThreat(
        enemiesInRange,
        this.getDragonFromState(),
        this._state.strategy,
        distances,
      );

      // Return the best target
      const bestTarget = sortedEnemies[0] || null;

      // Update metrics
      this.metrics.targetSelectionTime = performance.now() - startTime;

      return bestTarget;
    } catch (error) {
      console.error('Error in findTarget:', error);
      return null;
    }
  }

  /**
   * Update the current target based on available enemies
   */
  updateTarget(enemies: Enemy[]): void {
    const startTime = performance.now();

    try {
      // Check if we should switch targets based on persistence mode
      if (!this.shouldSwitchTarget(enemies)) {
        return;
      }

      // Find new target
      const newTarget = this.findTarget(enemies);

      // Switch to new target if different
      if (newTarget && newTarget.id !== this._state.currentTarget?.id) {
        this.switchToTarget(newTarget);
      } else if (!newTarget && this._state.currentTarget) {
        // Clear target if no valid target found
        this.clearTarget();
      }

      // Update metrics
      this.metrics.totalUpdateTime = performance.now() - startTime;
      this.recordPerformanceMetrics();
    } catch (error) {
      console.error('Error in updateTarget:', error);
    }
  }

  /**
   * Switch to a new target
   */
  private switchToTarget(newTarget: Enemy): void {
    // Update target history
    if (this._state.currentTarget) {
      this._state.targetHistory.push(this._state.currentTarget);
      if (this._state.targetHistory.length > 10) {
        this._state.targetHistory.shift(); // Keep only last 10 targets
      }
    }

    // Update state
    this._state.lastTarget = this._state.currentTarget;
    this._state.currentTarget = newTarget;
    this._state.targetLockStartTime = Date.now();
    this._state.targetSwitchCount++;
    this._state.lastUpdateTime = Date.now();

    // Update metrics
    this.metrics.targetSwitchCount++;
  }

  /**
   * Clear current target
   */
  private clearTarget(): void {
    if (this._state.currentTarget) {
      this._state.targetHistory.push(this._state.currentTarget);
      if (this._state.targetHistory.length > 10) {
        this._state.targetHistory.shift();
      }
    }

    this._state.lastTarget = this._state.currentTarget;
    this._state.currentTarget = null;
    this._state.lastUpdateTime = Date.now();
  }

  /**
   * Switch to a new targeting strategy
   */
  switchStrategy(strategy: TargetingStrategy): void {
    this._state.strategy = strategy;
    this._state.lastStrategyChange = Date.now();

    // Force target recalculation on strategy change
    this._state.isTargetLocked = false;
  }

  /**
   * Lock target to prevent switching
   */
  lockTarget(enemy: Enemy): void {
    this._state.currentTarget = enemy;
    this._state.isTargetLocked = true;
    this._state.targetLockStartTime = Date.now();
  }

  /**
   * Unlock target to allow switching
   */
  unlockTarget(): void {
    this._state.isTargetLocked = false;
  }

  /**
   * Check if enemy is within range
   */
  isInRange(enemy: Enemy): boolean {
    return this.rangeDetection.isWithinRange(this.getDragonFromState(), enemy);
  }

  /**
   * Calculate threat level for an enemy
   */
  calculateThreatLevel(enemy: Enemy): number {
    const distance = this.rangeDetection.calculateDistance(this.getDragonFromState(), enemy);
    return this.threatAssessment.calculateThreatLevel(enemy, this.getDragonFromState(), distance);
  }

  /**
   * Check if we should switch targets based on persistence mode
   */
  shouldSwitchTarget(enemies: Enemy[]): boolean {
    // Don't switch if target is locked
    if (this._state.isTargetLocked) {
      return false;
    }

    // Don't switch if no current target
    if (!this._state.currentTarget) {
      return true;
    }

    // Check if current target is still valid
    const currentTarget = enemies.find((e) => e.id === this._state.currentTarget!.id);
    if (!currentTarget || !currentTarget.isAlive) {
      return true;
    }

    // Check if current target is still in range
    if (!this.isInRange(currentTarget)) {
      return true;
    }

    // Apply persistence mode logic
    switch (this.config.persistenceMode) {
      case 'keep_target':
        // Only switch when target dies or goes out of range (already checked above)
        return false;

      case 'switch_freely':
        // Switch if significantly better target available
        return this.shouldSwitchToBetterTarget(enemies);

      case 'switch_aggressive':
        // Always switch to best available target
        return this.shouldSwitchToBestTarget(enemies);

      case 'manual_only': {
        // Only switch when strategy is manually changed
        const timeSinceStrategyChange = Date.now() - this._state.lastStrategyChange;
        return timeSinceStrategyChange < 1000; // 1 second window
      }

      default:
        return false;
    }
  }

  /**
   * Check if we can switch targets
   */
  canSwitchTarget(): boolean {
    return !this._state.isTargetLocked;
  }

  /**
   * Set persistence mode
   */
  setPersistenceMode(mode: TargetPersistenceMode): void {
    this.config.persistenceMode = mode;
  }

  /**
   * Check if we should switch to a better target
   */
  private shouldSwitchToBetterTarget(enemies: Enemy[]): boolean {
    const newTarget = this.findTarget(enemies);
    if (!newTarget || !this._state.currentTarget) {
      return newTarget !== null;
    }

    const currentThreat = this.calculateThreatLevel(this._state.currentTarget);
    const newThreat = this.calculateThreatLevel(newTarget);
    const threatDifference = Math.abs(newThreat - currentThreat);

    return threatDifference > this.config.switchThreshold;
  }

  /**
   * Check if we should switch to the best target
   */
  private shouldSwitchToBestTarget(enemies: Enemy[]): boolean {
    const newTarget = this.findTarget(enemies);
    if (!newTarget || !this._state.currentTarget) {
      return newTarget !== null;
    }

    const currentThreat = this.calculateThreatLevel(this._state.currentTarget);
    const newThreat = this.calculateThreatLevel(newTarget);

    return newThreat > currentThreat;
  }

  /**
   * Get dragon from state (placeholder - would be injected in real implementation)
   */
  private getDragonFromState(): Dragon {
    // This would be injected or retrieved from game state in real implementation
    return {
      position: { x: 0, y: 0 },
      attackRange: this.config.range,
      elementalType: 'fire',
      targetingConfig: this.config,
    };
  }

  /**
   * Record performance metrics
   */
  private recordPerformanceMetrics(): void {
    this.performanceHistory.push(this.metrics.totalUpdateTime);
    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory.shift();
    }

    // Update average target lifetime
    if (this._state.currentTarget) {
      const targetLifetime = Date.now() - this._state.targetLockStartTime;
      this.metrics.averageTargetLifetime =
        (this.metrics.averageTargetLifetime + targetLifetime) / 2;
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): TargetingMetrics & {
    averageUpdateTime: number;
    maxUpdateTime: number;
    minUpdateTime: number;
  } {
    const averageUpdateTime =
      this.performanceHistory.length > 0
        ? this.performanceHistory.reduce((sum, time) => sum + time, 0) /
          this.performanceHistory.length
        : 0;

    const maxUpdateTime =
      this.performanceHistory.length > 0 ? Math.max(...this.performanceHistory) : 0;

    const minUpdateTime =
      this.performanceHistory.length > 0 ? Math.min(...this.performanceHistory) : 0;

    return {
      ...this.metrics,
      averageUpdateTime,
      maxUpdateTime,
      minUpdateTime,
    };
  }

  /**
   * Get targeting system status
   */
  getStatus(): {
    hasTarget: boolean;
    targetId: string | null;
    strategy: TargetingStrategy;
    persistenceMode: TargetPersistenceMode;
    isLocked: boolean;
    switchCount: number;
  } {
    return {
      hasTarget: this._state.currentTarget !== null,
      targetId: this._state.currentTarget?.id || null,
      strategy: this._state.strategy,
      persistenceMode: this.config.persistenceMode,
      isLocked: this._state.isTargetLocked,
      switchCount: this._state.targetSwitchCount,
    };
  }

  /**
   * Reset targeting system
   */
  reset(): void {
    this._state.currentTarget = null;
    this._state.lastTarget = null;
    this._state.targetHistory = [];
    this._state.isTargetLocked = false;
    this._state.targetSwitchCount = 0;
    this._state.lastUpdateTime = Date.now();
    this.performanceHistory.length = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TargetingConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update range detection if range changed
    if (newConfig.range !== undefined) {
      this.rangeDetection = createRangeDetection(newConfig.range);
    }
  }
}

/**
 * Create a default targeting system
 */
export function createTargetingSystem(
  config: TargetingConfig,
  initialState?: Partial<TargetingState>,
): TargetingSystem {
  const defaultState: TargetingState = {
    currentTarget: null,
    lastTarget: null,
    targetHistory: [],
    lastUpdateTime: Date.now(),
    strategy: config.primaryStrategy,
    isTargetLocked: false,
    targetLockStartTime: Date.now(),
    targetSwitchCount: 0,
    lastStrategyChange: Date.now(),
    ...initialState,
  };

  return new DefaultTargetingSystem(config, defaultState);
}

/**
 * Create default targeting configuration
 */
export function createDefaultTargetingConfig(): TargetingConfig {
  return {
    primaryStrategy: 'closest',
    fallbackStrategy: 'highest_threat',
    range: 500,
    updateInterval: 100, // 100ms
    switchThreshold: 0.1, // 10% difference
    enabledStrategies: [
      'closest',
      'highest_threat',
      'lowest_threat',
      'highest_hp',
      'lowest_hp',
      'highest_damage',
      'lowest_damage',
      'fastest',
      'slowest',
      'highest_armor',
      'lowest_armor',
      'shielded',
      'unshielded',
      'elemental_weak',
      'elemental_strong',
    ],
    persistenceMode: 'keep_target',
    targetLockDuration: 5000, // 5 seconds
  };
}

/**
 * Utility functions for targeting
 */
export const TargetingUtils = {
  /**
   * Check if targeting system is performing well
   */
  isPerformanceGood(metrics: TargetingMetrics): boolean {
    return metrics.totalUpdateTime < 0.1; // Less than 0.1ms
  },

  /**
   * Get strategy effectiveness score
   */
  getStrategyEffectiveness(strategy: TargetingStrategy, metrics: TargetingMetrics): number {
    return metrics.strategyEffectiveness.get(strategy) || 0;
  },

  /**
   * Calculate targeting efficiency
   */
  calculateEfficiency(metrics: TargetingMetrics): number {
    const targetLifetime = metrics.averageTargetLifetime;
    const switchCount = metrics.targetSwitchCount;

    if (switchCount === 0) return 1.0;

    // Higher efficiency = longer target lifetime, fewer switches
    return Math.min(1.0, targetLifetime / (switchCount * 1000));
  },
};
