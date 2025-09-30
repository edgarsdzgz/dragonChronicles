/**
 * Target persistence mode implementations for Draconia Chronicles
 * Handles different target switching behaviors based on player preferences
 */

import type {
  Enemy,
  TargetPersistenceMode,
  TargetPersistenceHandler,
  TargetingState,
  TargetingConfig,
} from './types.js';
import { createThreatAssessment } from './threat-assessment.js';

/**
 * Base persistence handler implementation
 */
abstract class BasePersistenceHandler implements TargetPersistenceHandler {
  public mode: TargetPersistenceMode;
  public isUnlocked: boolean;

  constructor(mode: TargetPersistenceMode, isUnlocked: boolean = true) {
    this.mode = mode;
    this.isUnlocked = isUnlocked;
  }

  abstract shouldSwitchTarget(
    _currentTarget: Enemy | null,
    _newTarget: Enemy | null,
    _state: TargetingState,
    _config: TargetingConfig,
  ): boolean;

  abstract getDescription(): string;

  /**
   * Check if current target is still valid (alive and in range)
   */
  protected isCurrentTargetValid(
    currentTarget: Enemy | null,
    _state: TargetingState,
    _config: TargetingConfig,
  ): boolean {
    if (!currentTarget) return false;
    if (!currentTarget.isAlive) return false;

    // Check if target is still in range (simplified check)
    // In real implementation, this would use the range detection system
    return true;
  }

  /**
   * Calculate threat difference between targets
   */
  protected calculateThreatDifference(
    currentTarget: Enemy | null,
    newTarget: Enemy | null,
  ): number {
    if (!currentTarget || !newTarget) return 0;

    const _threatAssessment = createThreatAssessment();
    // Simplified threat calculation - in real implementation would use proper dragon context
    const currentThreat = currentTarget.threatLevel || 0;
    const newThreat = newTarget.threatLevel || 0;

    return Math.abs(newThreat - currentThreat);
  }
}

/**
 * Keep target persistence mode (default)
 * Only switches when current target dies or goes out of range
 */
export class KeepTargetPersistenceHandler extends BasePersistenceHandler {
  constructor() {
    super('keep_target', true);
  }

  shouldSwitchTarget(
    currentTarget: Enemy | null,
    newTarget: Enemy | null,
    state: TargetingState,
    config: TargetingConfig,
  ): boolean {
    // Don't switch if target is locked
    if (state.isTargetLocked) {
      return false;
    }

    // Switch if no current target
    if (!currentTarget) {
      return newTarget !== null;
    }

    // Switch if current target is no longer valid
    if (!this.isCurrentTargetValid(currentTarget, state, config)) {
      return true;
    }

    // Don't switch if current target is still valid
    return false;
  }

  getDescription(): string {
    return 'Keep current target until it dies or goes out of range';
  }
}

/**
 * Switch freely persistence mode
 * Switches targets based on strategy changes and significant threat differences
 */
export class SwitchFreelyPersistenceHandler extends BasePersistenceHandler {
  constructor() {
    super('switch_freely', true);
  }

  shouldSwitchTarget(
    currentTarget: Enemy | null,
    newTarget: Enemy | null,
    state: TargetingState,
    config: TargetingConfig,
  ): boolean {
    // Don't switch if target is locked
    if (state.isTargetLocked) {
      return false;
    }

    // Switch if no current target
    if (!currentTarget) {
      return newTarget !== null;
    }

    // Switch if current target is no longer valid
    if (!this.isCurrentTargetValid(currentTarget, state, config)) {
      return true;
    }

    // Switch if new target is significantly better
    if (newTarget) {
      const threatDifference = this.calculateThreatDifference(currentTarget, newTarget);
      return threatDifference > config.switchThreshold;
    }

    return false;
  }

  getDescription(): string {
    return 'Switch targets when significantly better options are available';
  }
}

/**
 * Switch aggressive persistence mode
 * Always switches to the best available target
 */
export class SwitchAggressivePersistenceHandler extends BasePersistenceHandler {
  constructor() {
    super('switch_aggressive', true);
  }

  shouldSwitchTarget(
    currentTarget: Enemy | null,
    newTarget: Enemy | null,
    state: TargetingState,
    config: TargetingConfig,
  ): boolean {
    // Don't switch if target is locked
    if (state.isTargetLocked) {
      return false;
    }

    // Switch if no current target
    if (!currentTarget) {
      return newTarget !== null;
    }

    // Switch if current target is no longer valid
    if (!this.isCurrentTargetValid(currentTarget, state, config)) {
      return true;
    }

    // Always switch if new target is better
    if (newTarget) {
      const currentThreat = currentTarget.threatLevel || 0;
      const newThreat = newTarget.threatLevel || 0;
      return newThreat > currentThreat;
    }

    return false;
  }

  getDescription(): string {
    return 'Always target the best available enemy';
  }
}

/**
 * Manual only persistence mode
 * Only switches targets when player manually changes strategy
 */
export class ManualOnlyPersistenceHandler extends BasePersistenceHandler {
  constructor() {
    super('manual_only', true);
  }

  shouldSwitchTarget(
    currentTarget: Enemy | null,
    newTarget: Enemy | null,
    state: TargetingState,
    config: TargetingConfig,
  ): boolean {
    // Don't switch if target is locked
    if (state.isTargetLocked) {
      return false;
    }

    // Switch if no current target
    if (!currentTarget) {
      return newTarget !== null;
    }

    // Switch if current target is no longer valid
    if (!this.isCurrentTargetValid(currentTarget, state, config)) {
      return true;
    }

    // Only switch if strategy was recently changed
    const timeSinceStrategyChange = Date.now() - state.lastStrategyChange;
    const strategyChangeWindow = 1000; // 1 second window after strategy change

    return timeSinceStrategyChange < strategyChangeWindow;
  }

  getDescription(): string {
    return 'Only switch targets when you manually change strategy';
  }
}

/**
 * Persistence mode registry for managing all persistence modes
 */
export class PersistenceModeRegistry {
  private modes: Map<TargetPersistenceMode, TargetPersistenceHandler> = new Map();

  constructor() {
    this.registerDefaultModes();
  }

  /**
   * Register all default persistence modes
   */
  private registerDefaultModes(): void {
    this.modes.set('keep_target', new KeepTargetPersistenceHandler());
    this.modes.set('switch_freely', new SwitchFreelyPersistenceHandler());
    this.modes.set('switch_aggressive', new SwitchAggressivePersistenceHandler());
    this.modes.set('manual_only', new ManualOnlyPersistenceHandler());
  }

  /**
   * Get persistence handler by mode
   */
  getMode(mode: TargetPersistenceMode): TargetPersistenceHandler | undefined {
    return this.modes.get(mode);
  }

  /**
   * Get all available persistence modes
   */
  getAllModes(): TargetPersistenceHandler[] {
    return Array.from(this.modes.values());
  }

  /**
   * Get unlocked persistence modes only
   */
  getUnlockedModes(): TargetPersistenceHandler[] {
    return this.getAllModes().filter((mode) => mode.isUnlocked);
  }

  /**
   * Register a custom persistence mode
   */
  registerMode(mode: TargetPersistenceMode, handler: TargetPersistenceHandler): void {
    this.modes.set(mode, handler);
  }

  /**
   * Unregister a persistence mode
   */
  unregisterMode(mode: TargetPersistenceMode): boolean {
    return this.modes.delete(mode);
  }

  /**
   * Get mode descriptions
   */
  getModeDescriptions(): Map<TargetPersistenceMode, string> {
    const descriptions = new Map<TargetPersistenceMode, string>();
    for (const [mode, handler] of this.modes) {
      descriptions.set(mode, handler.getDescription());
    }
    return descriptions;
  }
}

/**
 * Create a persistence mode registry instance
 */
export function createPersistenceModeRegistry(): PersistenceModeRegistry {
  return new PersistenceModeRegistry();
}

/**
 * Utility functions for persistence mode management
 */
export const PersistenceUtils = {
  /**
   * Get persistence mode by name
   */
  getModeByName(name: string): TargetPersistenceMode | null {
    const validModes: TargetPersistenceMode[] = [
      'keep_target',
      'switch_freely',
      'switch_aggressive',
      'manual_only',
    ];

    return validModes.includes(name as TargetPersistenceMode)
      ? (name as TargetPersistenceMode)
      : null;
  },

  /**
   * Check if persistence mode is valid
   */
  isValidMode(mode: string): mode is TargetPersistenceMode {
    return PersistenceUtils.getModeByName(mode) !== null;
  },

  /**
   * Get persistence mode category
   */
  getModeCategory(mode: TargetPersistenceMode): string {
    switch (mode) {
      case 'keep_target':
        return 'Conservative';
      case 'switch_freely':
        return 'Balanced';
      case 'switch_aggressive':
        return 'Aggressive';
      case 'manual_only':
        return 'Manual';
      default:
        return 'Unknown';
    }
  },

  /**
   * Get recommended persistence mode for strategy
   */
  getRecommendedMode(strategy: string): TargetPersistenceMode {
    // Basic strategies work well with keep_target
    if (['closest', 'highest_threat', 'lowest_threat'].includes(strategy)) {
      return 'keep_target';
    }

    // Health and damage strategies work well with switch_freely
    if (['highest_hp', 'lowest_hp', 'highest_damage', 'lowest_damage'].includes(strategy)) {
      return 'switch_freely';
    }

    // Speed and defense strategies work well with switch_aggressive
    if (['fastest', 'slowest', 'highest_armor', 'lowest_armor'].includes(strategy)) {
      return 'switch_aggressive';
    }

    // Elemental strategies work well with manual_only
    if (['elemental_weak', 'elemental_strong'].includes(strategy)) {
      return 'manual_only';
    }

    // Default to keep_target
    return 'keep_target';
  },

  /**
   * Calculate persistence mode effectiveness
   */
  calculateEffectiveness(
    mode: TargetPersistenceMode,
    targetLifetime: number,
    switchCount: number,
  ): number {
    // Higher effectiveness = longer target lifetime, fewer switches
    if (switchCount === 0) return 1.0;

    const averageLifetime = targetLifetime / switchCount;

    switch (mode) {
      case 'keep_target':
        // Keep target should have long lifetimes
        return Math.min(1.0, averageLifetime / 5000); // 5 seconds baseline
      case 'switch_freely':
        // Switch freely should have moderate lifetimes
        return Math.min(1.0, averageLifetime / 3000); // 3 seconds baseline
      case 'switch_aggressive':
        // Switch aggressive should have short lifetimes but high efficiency
        return Math.min(1.0, averageLifetime / 2000); // 2 seconds baseline
      case 'manual_only':
        // Manual only should have very long lifetimes
        return Math.min(1.0, averageLifetime / 10000); // 10 seconds baseline
      default:
        return 0.5;
    }
  },
};
