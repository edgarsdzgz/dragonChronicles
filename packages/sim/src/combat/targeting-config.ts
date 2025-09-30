/**
 * Targeting configuration system for Draconia Chronicles
 * Manages player customization of targeting strategies and persistence modes
 */

import type { TargetingConfig, TargetingStrategy, TargetPersistenceMode, Dragon } from './types.js';
import { createStrategyRegistry } from './targeting-strategies.js';
import { createPersistenceModeRegistry } from './persistence-modes.js';

/**
 * Player targeting preferences and unlocks
 */
export interface PlayerTargetingPreferences {
  unlockedStrategies: TargetingStrategy[];
  unlockedPersistenceModes: TargetPersistenceMode[];
  preferredStrategy: TargetingStrategy;
  preferredPersistenceMode: TargetPersistenceMode;
  customConfigurations: Map<string, TargetingConfig>;
  presets: TargetingPreset[];
  analytics: TargetingAnalytics;
}

/**
 * Targeting preset for different playstyles
 */
export interface TargetingPreset {
  id: string;
  name: string;
  description: string;
  config: TargetingConfig;
  strategy: TargetingStrategy;
  persistenceMode: TargetPersistenceMode;
  isUnlocked: boolean;
  unlockRequirement?: string;
}

/**
 * Targeting analytics and performance data
 */
export interface TargetingAnalytics {
  totalTargets: number;
  averageTargetLifetime: number;
  strategyEffectiveness: Map<TargetingStrategy, number>;
  persistenceModeEffectiveness: Map<TargetPersistenceMode, number>;
  performanceMetrics: {
    averageUpdateTime: number;
    maxUpdateTime: number;
    minUpdateTime: number;
  };
  usageStats: {
    strategyUsage: Map<TargetingStrategy, number>;
    persistenceModeUsage: Map<TargetPersistenceMode, number>;
  };
}

/**
 * Targeting configuration manager
 */
export class TargetingConfigManager {
  private strategyRegistry = createStrategyRegistry();
  private persistenceRegistry = createPersistenceModeRegistry();
  private playerPreferences: PlayerTargetingPreferences;
  private defaultConfig: TargetingConfig;
  public config: TargetingConfig;

  constructor(initialPreferences?: Partial<PlayerTargetingPreferences>) {
    this.defaultConfig = this.createDefaultConfig();
    this.playerPreferences = this.initializePlayerPreferences(initialPreferences);
    this.config = { ...this.defaultConfig };
  }

  /**
   * Initialize player preferences with defaults
   */
  private initializePlayerPreferences(
    initialPreferences?: Partial<PlayerTargetingPreferences>,
  ): PlayerTargetingPreferences {
    const defaultPreferences: PlayerTargetingPreferences = {
      unlockedStrategies: ['closest', 'highest_threat', 'lowest_threat'],
      unlockedPersistenceModes: ['keep_target'],
      preferredStrategy: 'closest',
      preferredPersistenceMode: 'keep_target',
      customConfigurations: new Map(),
      presets: this.createDefaultPresets(),
      analytics: this.createDefaultAnalytics(),
    };

    return { ...defaultPreferences, ...initialPreferences };
  }

  /**
   * Create default targeting configuration
   */
  private createDefaultConfig(): TargetingConfig {
    return {
      primaryStrategy: 'closest',
      fallbackStrategy: 'highest_threat',
      range: 500,
      updateInterval: 100,
      switchThreshold: 0.1,
      enabledStrategies: ['closest', 'highest_threat', 'lowest_threat'],
      persistenceMode: 'keep_target',
      targetLockDuration: 5000,
      threatWeights: {
        proximity: 0.4,
        health: 0.3,
        damage: 0.2,
        speed: 0.1,
      },
      customSettings: {},
    };
  }

  /**
   * Create default targeting presets
   */
  private createDefaultPresets(): TargetingPreset[] {
    return [
      {
        id: 'balanced',
        name: 'Balanced',
        description: 'Balanced targeting for general gameplay',
        config: {
          primaryStrategy: 'highest_threat',
          fallbackStrategy: 'closest',
          range: 500,
          updateInterval: 100,
          switchThreshold: 0.15,
          enabledStrategies: ['closest', 'highest_threat', 'lowest_threat'],
          persistenceMode: 'switch_freely',
          targetLockDuration: 3000,
          threatWeights: {
            proximity: 0.3,
            health: 0.3,
            damage: 0.3,
            speed: 0.1,
          },
          customSettings: {},
        },
        strategy: 'highest_threat',
        persistenceMode: 'switch_freely',
        isUnlocked: true,
      },
      {
        id: 'aggressive',
        name: 'Aggressive',
        description: 'Aggressive targeting for maximum damage',
        config: {
          primaryStrategy: 'highest_damage',
          fallbackStrategy: 'highest_threat',
          range: 600,
          updateInterval: 50,
          switchThreshold: 0.05,
          enabledStrategies: ['highest_damage', 'highest_threat', 'closest'],
          persistenceMode: 'switch_aggressive',
          targetLockDuration: 1000,
          threatWeights: {
            proximity: 0.2,
            health: 0.2,
            damage: 0.5,
            speed: 0.1,
          },
          customSettings: {},
        },
        strategy: 'highest_damage',
        persistenceMode: 'switch_aggressive',
        isUnlocked: false,
        unlockRequirement: 'Reach level 10',
      },
      {
        id: 'defensive',
        name: 'Defensive',
        description: 'Defensive targeting to minimize damage taken',
        config: {
          primaryStrategy: 'lowest_threat',
          fallbackStrategy: 'closest',
          range: 400,
          updateInterval: 150,
          switchThreshold: 0.2,
          enabledStrategies: ['lowest_threat', 'closest', 'highest_armor'],
          persistenceMode: 'keep_target',
          targetLockDuration: 8000,
          threatWeights: {
            proximity: 0.5,
            health: 0.2,
            damage: 0.1,
            speed: 0.2,
          },
          customSettings: {},
        },
        strategy: 'lowest_threat',
        persistenceMode: 'keep_target',
        isUnlocked: false,
        unlockRequirement: 'Complete tutorial',
      },
      {
        id: 'speed',
        name: 'Speed Focus',
        description: 'Target fast enemies to prevent escapes',
        config: {
          primaryStrategy: 'fastest',
          fallbackStrategy: 'highest_threat',
          range: 550,
          updateInterval: 75,
          switchThreshold: 0.1,
          enabledStrategies: ['fastest', 'highest_threat', 'closest'],
          persistenceMode: 'switch_freely',
          targetLockDuration: 2000,
          threatWeights: {
            proximity: 0.3,
            health: 0.2,
            damage: 0.2,
            speed: 0.3,
          },
          customSettings: {},
        },
        strategy: 'fastest',
        persistenceMode: 'switch_freely',
        isUnlocked: false,
        unlockRequirement: 'Defeat 100 enemies',
      },
    ];
  }

  /**
   * Create default analytics
   */
  private createDefaultAnalytics(): TargetingAnalytics {
    return {
      totalTargets: 0,
      averageTargetLifetime: 0,
      strategyEffectiveness: new Map(),
      persistenceModeEffectiveness: new Map(),
      performanceMetrics: {
        averageUpdateTime: 0,
        maxUpdateTime: 0,
        minUpdateTime: Infinity,
      },
      usageStats: {
        strategyUsage: new Map(),
        persistenceModeUsage: new Map(),
      },
    };
  }

  /**
   * Get current targeting configuration
   */
  getCurrentConfig(): TargetingConfig {
    const preset = this.playerPreferences.presets.find((p) => p.isUnlocked);
    if (preset) {
      return preset.config;
    }

    return {
      ...this.defaultConfig,
      primaryStrategy: this.playerPreferences.preferredStrategy,
      persistenceMode: this.playerPreferences.preferredPersistenceMode,
      enabledStrategies: this.playerPreferences.unlockedStrategies,
    };
  }

  /**
   * Update targeting configuration
   */
  updateConfig(updates: Partial<TargetingConfig>): void {
    const currentConfig = this.getCurrentConfig();
    const newConfig = { ...currentConfig, ...updates };

    // Validate configuration
    if (this.validateConfig(newConfig)) {
      // Update player preferences
      this.playerPreferences.preferredStrategy = newConfig.primaryStrategy;
      this.playerPreferences.preferredPersistenceMode = newConfig.persistenceMode;
    }
  }

  /**
   * Validate targeting configuration
   */
  validateConfig(config: TargetingConfig): boolean {
    // Check if primary strategy is unlocked
    if (!this.playerPreferences.unlockedStrategies.includes(config.primaryStrategy)) {
      return false;
    }

    // Check if fallback strategy is unlocked
    if (!this.playerPreferences.unlockedStrategies.includes(config.fallbackStrategy)) {
      return false;
    }

    // Check if persistence mode is unlocked
    if (!this.playerPreferences.unlockedPersistenceModes.includes(config.persistenceMode)) {
      return false;
    }

    // Check if all enabled strategies are unlocked
    for (const strategy of config.enabledStrategies) {
      if (!this.playerPreferences.unlockedStrategies.includes(strategy)) {
        return false;
      }
    }

    // Validate numeric values
    if (
      config.range <= 0 ||
      config.updateInterval <= 0 ||
      config.switchThreshold < 0 ||
      config.switchThreshold > 1
    ) {
      return false;
    }

    return true;
  }

  /**
   * Unlock a targeting strategy
   */
  unlockStrategy(strategy: TargetingStrategy): boolean {
    if (!this.playerPreferences.unlockedStrategies.includes(strategy)) {
      this.playerPreferences.unlockedStrategies.push(strategy);
      return true;
    }
    return false;
  }

  /**
   * Unlock a persistence mode
   */
  unlockPersistenceMode(mode: TargetPersistenceMode): boolean {
    if (!this.playerPreferences.unlockedPersistenceModes.includes(mode)) {
      this.playerPreferences.unlockedPersistenceModes.push(mode);
      return true;
    }
    return false;
  }

  /**
   * Check if strategy is unlocked
   */
  isStrategyUnlocked(strategy: TargetingStrategy): boolean {
    return this.playerPreferences.unlockedStrategies.includes(strategy);
  }

  /**
   * Check if persistence mode is unlocked
   */
  isPersistenceModeUnlocked(mode: TargetPersistenceMode): boolean {
    return this.playerPreferences.unlockedPersistenceModes.includes(mode);
  }

  /**
   * Get unlocked strategies
   */
  getUnlockedStrategies(): TargetingStrategy[] {
    return [...this.playerPreferences.unlockedStrategies];
  }

  /**
   * Get unlocked persistence modes
   */
  getUnlockedPersistenceModes(): TargetPersistenceMode[] {
    return [...this.playerPreferences.unlockedPersistenceModes];
  }

  /**
   * Get all available presets
   */
  getPresets(): TargetingPreset[] {
    return [...this.playerPreferences.presets];
  }

  /**
   * Get unlocked presets
   */
  getUnlockedPresets(): TargetingPreset[] {
    return this.playerPreferences.presets.filter((preset) => preset.isUnlocked);
  }

  /**
   * Unlock a preset
   */
  unlockPreset(presetId: string): boolean {
    const preset = this.playerPreferences.presets.find((p) => p.id === presetId);
    if (preset && !preset.isUnlocked) {
      preset.isUnlocked = true;
      return true;
    }
    return false;
  }

  /**
   * Apply a preset configuration
   */
  applyPreset(presetId: string): boolean {
    const preset = this.playerPreferences.presets.find((p) => p.id === presetId);
    if (preset && preset.isUnlocked) {
      this.playerPreferences.preferredStrategy = preset.strategy;
      this.playerPreferences.preferredPersistenceMode = preset.persistenceMode;
      return true;
    }
    return false;
  }

  /**
   * Create custom configuration
   */
  createCustomConfig(name: string, config: TargetingConfig): boolean {
    if (this.validateConfig(config)) {
      this.playerPreferences.customConfigurations.set(name, config);
      return true;
    }
    return false;
  }

  /**
   * Get custom configuration
   */
  getCustomConfig(name: string): TargetingConfig | undefined {
    return this.playerPreferences.customConfigurations.get(name);
  }

  /**
   * Delete custom configuration
   */
  deleteCustomConfig(name: string): boolean {
    return this.playerPreferences.customConfigurations.delete(name);
  }

  /**
   * Get all custom configuration names
   */
  getCustomConfigNames(): string[] {
    return Array.from(this.playerPreferences.customConfigurations.keys());
  }

  /**
   * Update analytics
   */
  updateAnalytics(metrics: {
    targetLifetime?: number;
    updateTime?: number;
    strategy?: TargetingStrategy;
    persistenceMode?: TargetPersistenceMode;
  }): void {
    const analytics = this.playerPreferences.analytics;

    if (metrics.targetLifetime !== undefined) {
      analytics.totalTargets++;
      analytics.averageTargetLifetime =
        (analytics.averageTargetLifetime + metrics.targetLifetime) / 2;
    }

    if (metrics.updateTime !== undefined) {
      analytics.performanceMetrics.averageUpdateTime =
        (analytics.performanceMetrics.averageUpdateTime + metrics.updateTime) / 2;
      analytics.performanceMetrics.maxUpdateTime = Math.max(
        analytics.performanceMetrics.maxUpdateTime,
        metrics.updateTime,
      );
      analytics.performanceMetrics.minUpdateTime = Math.min(
        analytics.performanceMetrics.minUpdateTime,
        metrics.updateTime,
      );
    }

    if (metrics.strategy) {
      const currentUsage = analytics.usageStats.strategyUsage.get(metrics.strategy) || 0;
      analytics.usageStats.strategyUsage.set(metrics.strategy, currentUsage + 1);
    }

    if (metrics.persistenceMode) {
      const currentUsage =
        analytics.usageStats.persistenceModeUsage.get(metrics.persistenceMode) || 0;
      analytics.usageStats.persistenceModeUsage.set(metrics.persistenceMode, currentUsage + 1);
    }
  }

  /**
   * Get analytics data
   */
  getAnalytics(): TargetingAnalytics {
    return { ...this.playerPreferences.analytics };
  }

  /**
   * Reset analytics
   */
  resetAnalytics(): void {
    this.playerPreferences.analytics = this.createDefaultAnalytics();
  }

  /**
   * Get player preferences
   */
  getPlayerPreferences(): PlayerTargetingPreferences {
    return { ...this.playerPreferences };
  }

  /**
   * Update player preferences
   */
  updatePlayerPreferences(updates: Partial<PlayerTargetingPreferences>): void {
    this.playerPreferences = { ...this.playerPreferences, ...updates };
  }

  /**
   * Save configuration to storage
   */
  saveToStorage(): void {
    try {
      const data = JSON.stringify(this.playerPreferences, (key, value) => {
        if (value instanceof Map) {
          return Array.from(value.entries());
        }
        return value;
      });
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('draconia_targeting_config', data);
      }
    } catch (error) {
      console.error('Failed to save targeting configuration:', error);
    }
  }

  /**
   * Load configuration from storage
   */
  loadFromStorage(): boolean {
    try {
      const data =
        typeof window !== 'undefined' && window.localStorage
          ? window.localStorage.getItem('draconia_targeting_config')
          : null;
      if (data) {
        const parsed = JSON.parse(data, (key, value) => {
          if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'string') {
            return new Map(value);
          }
          return value;
        });
        this.playerPreferences = { ...this.playerPreferences, ...parsed };
        return true;
      }
    } catch (error) {
      console.error('Failed to load targeting configuration:', error);
    }
    return false;
  }

  /**
   * Export configuration
   */
  exportConfig(): string {
    return JSON.stringify(this.playerPreferences, null, 2);
  }

  /**
   * Import configuration
   */
  importConfig(configData: string): boolean {
    try {
      const imported = JSON.parse(configData);
      this.playerPreferences = { ...this.playerPreferences, ...imported };
      return true;
    } catch (error) {
      console.error('Failed to import targeting configuration:', error);
      return false;
    }
  }
}

/**
 * Create a targeting configuration manager
 */
export function createTargetingConfigManager(
  initialPreferences?: Partial<PlayerTargetingPreferences>,
): TargetingConfigManager {
  return new TargetingConfigManager(initialPreferences);
}

/**
 * Utility functions for targeting configuration
 */
export const TargetingConfigUtils = {
  /**
   * Get recommended configuration for dragon type
   */
  getRecommendedConfigForDragon(dragon: Dragon): TargetingConfig {
    const baseConfig: TargetingConfig = {
      primaryStrategy: 'closest' as TargetingStrategy,
      fallbackStrategy: 'highest_threat' as TargetingStrategy,
      range: dragon.attackRange,
      updateInterval: 100,
      switchThreshold: 0.1,
      enabledStrategies: ['closest', 'highest_threat', 'lowest_threat'],
      persistenceMode: 'keep_target' as TargetPersistenceMode,
      targetLockDuration: 5000,
      threatWeights: {
        proximity: 0.4,
        health: 0.3,
        damage: 0.2,
        speed: 0.1,
      },
      customSettings: {},
    };

    // Adjust based on dragon's elemental type
    switch (dragon.elementalType) {
      case 'fire':
        baseConfig.enabledStrategies.push('elemental_weak');
        break;
      case 'ice':
        baseConfig.enabledStrategies.push('elemental_weak');
        break;
      case 'lightning':
        baseConfig.enabledStrategies.push('elemental_weak');
        break;
    }

    return baseConfig;
  },

  /**
   * Validate strategy compatibility
   */
  isStrategyCompatible(strategy: TargetingStrategy, dragon: Dragon): boolean {
    // Elemental strategies require elemental type
    if (strategy === 'elemental_weak' || strategy === 'elemental_strong') {
      return dragon.elementalType !== undefined;
    }

    return true;
  },

  /**
   * Get strategy effectiveness score
   */
  getStrategyEffectiveness(strategy: TargetingStrategy, analytics: TargetingAnalytics): number {
    return analytics.strategyEffectiveness.get(strategy) || 0;
  },

  /**
   * Get persistence mode effectiveness score
   */
  getPersistenceModeEffectiveness(
    mode: TargetPersistenceMode,
    analytics: TargetingAnalytics,
  ): number {
    return analytics.persistenceModeEffectiveness.get(mode) || 0;
  },

  /**
   * Calculate configuration score
   */
  calculateConfigScore(config: TargetingConfig, analytics: TargetingAnalytics): number {
    const strategyScore = this.getStrategyEffectiveness(config.primaryStrategy, analytics);
    const modeScore = this.getPersistenceModeEffectiveness(config.persistenceMode, analytics);

    return (strategyScore + modeScore) / 2;
  },
};
