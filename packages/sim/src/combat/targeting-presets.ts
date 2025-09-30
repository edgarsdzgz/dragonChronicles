/**
 * Targeting Presets System for Draconia Chronicles
 * Provides pre-configured targeting strategies for different playstyles
 */

import type {
  TargetingStrategy,
  TargetPersistenceMode,
  TargetingConfig,
  PlayerTargetingPreferences,
} from './types.js';

/**
 * Preset definition interface
 */
export interface TargetingPreset {
  id: string;
  name: string;
  description: string;
  category: 'combat' | 'defensive' | 'aggressive' | 'balanced' | 'specialized' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  config: TargetingConfig;
  preferences: PlayerTargetingPreferences;
  tags: string[];
  unlockRequirements?: PresetUnlockRequirement[];
  isDefault: boolean;
  isUnlocked: boolean;
  usageCount: number;
  lastUsed: number;
  rating: number;
  author: string;
  version: string;
}

/**
 * Preset unlock requirement
 */
export interface PresetUnlockRequirement {
  type: 'level' | 'achievement' | 'currency' | 'time' | 'story' | 'custom';
  value: number | string;
  description: string;
  isMet: boolean;
}

/**
 * Preset category information
 */
export interface PresetCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  presets: TargetingPreset[];
}

/**
 * Preset usage statistics
 */
export interface PresetUsageStats {
  presetId: string;
  totalUses: number;
  averageSessionTime: number;
  successRate: number;
  playerRating: number;
  lastUsed: number;
  favoriteCount: number;
}

/**
 * Preset recommendation
 */
export interface PresetRecommendation {
  preset: TargetingPreset;
  score: number;
  reasons: string[];
  confidence: number;
}

/**
 * Targeting Presets Manager
 */
export class TargetingPresetsManager {
  private presets: Map<string, TargetingPreset> = new Map();
  private categories: Map<string, PresetCategory> = new Map();
  private usageStats: Map<string, PresetUsageStats> = new Map();
  private playerProgress: PlayerProgress = {
    level: 1,
    experience: 0,
    achievements: [],
    currency: 0,
    playTime: 0,
    storyProgress: 0,
    customProgress: new Map(),
  };

  constructor() {
    this.initializeDefaultPresets();
    this.initializeCategories();
  }

  /**
   * Get all presets
   */
  getAllPresets(): TargetingPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get presets by category
   */
  getPresetsByCategory(categoryId: string): TargetingPreset[] {
    const category = this.categories.get(categoryId);
    return category ? category.presets : [];
  }

  /**
   * Get preset by ID
   */
  getPreset(presetId: string): TargetingPreset | null {
    return this.presets.get(presetId) || null;
  }

  /**
   * Get all categories
   */
  getCategories(): PresetCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * Get category by ID
   */
  getCategory(categoryId: string): PresetCategory | null {
    return this.categories.get(categoryId) || null;
  }

  /**
   * Get unlocked presets
   */
  getUnlockedPresets(): TargetingPreset[] {
    return this.getAllPresets().filter((preset) => preset.isUnlocked);
  }

  /**
   * Get presets by difficulty
   */
  getPresetsByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  ): TargetingPreset[] {
    return this.getAllPresets().filter((preset) => preset.difficulty === difficulty);
  }

  /**
   * Get recommended presets
   */
  getRecommendedPresets(limit = 5): PresetRecommendation[] {
    const unlockedPresets = this.getUnlockedPresets();
    const recommendations: PresetRecommendation[] = [];

    for (const preset of unlockedPresets) {
      const score = this.calculatePresetScore(preset);
      const reasons = this.getRecommendationReasons(preset);
      const confidence = this.calculateConfidence(preset);

      recommendations.push({
        preset,
        score,
        reasons,
        confidence,
      });
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Use preset
   */
  usePreset(presetId: string): TargetingConfig | null {
    const preset = this.getPreset(presetId);
    if (!preset || !preset.isUnlocked) {
      return null;
    }

    // Update usage statistics
    this.updateUsageStats(presetId);

    // Update preset usage count
    preset.usageCount++;
    preset.lastUsed = Date.now();

    return { ...preset.config };
  }

  /**
   * Create custom preset
   */
  createCustomPreset(
    name: string,
    description: string,
    config: TargetingConfig,
    preferences: PlayerTargetingPreferences,
    tags: string[] = [],
  ): TargetingPreset {
    const presetId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const preset: TargetingPreset = {
      id: presetId,
      name,
      description,
      category: 'custom',
      difficulty: 'intermediate',
      config,
      preferences,
      tags,
      isDefault: false,
      isUnlocked: true,
      usageCount: 0,
      lastUsed: 0,
      rating: 0,
      author: 'Player',
      version: '1.0.0',
    };

    this.presets.set(presetId, preset);
    return preset;
  }

  /**
   * Update preset
   */
  updatePreset(presetId: string, updates: Partial<TargetingPreset>): boolean {
    const preset = this.getPreset(presetId);
    if (!preset) return false;

    Object.assign(preset, updates);
    return true;
  }

  /**
   * Delete preset
   */
  deletePreset(presetId: string): boolean {
    const preset = this.getPreset(presetId);
    if (!preset || preset.isDefault) return false;

    this.presets.delete(presetId);
    this.usageStats.delete(presetId);
    return true;
  }

  /**
   * Rate preset
   */
  ratePreset(presetId: string, rating: number): boolean {
    const preset = this.getPreset(presetId);
    if (!preset) return false;

    // Update rating (weighted average)
    const totalRatings = preset.usageCount;
    preset.rating = (preset.rating * totalRatings + rating) / (totalRatings + 1);

    return true;
  }

  /**
   * Check if preset is unlocked
   */
  isPresetUnlocked(presetId: string): boolean {
    const preset = this.getPreset(presetId);
    if (!preset) return false;

    if (preset.isDefault) return true;
    if (preset.isUnlocked) return true;

    // Check unlock requirements
    if (preset.unlockRequirements) {
      return preset.unlockRequirements.every((req) => req.isMet);
    }

    return false;
  }

  /**
   * Update player progress
   */
  updatePlayerProgress(progress: Partial<PlayerProgress>): void {
    Object.assign(this.playerProgress, progress);
    this.updateUnlockStatus();
  }

  /**
   * Get usage statistics
   */
  getUsageStats(presetId: string): PresetUsageStats | null {
    return this.usageStats.get(presetId) || null;
  }

  /**
   * Get all usage statistics
   */
  getAllUsageStats(): PresetUsageStats[] {
    return Array.from(this.usageStats.values());
  }

  /**
   * Export presets
   */
  exportPresets(): string {
    const presetsData = {
      version: '1.0.0',
      timestamp: Date.now(),
      presets: Array.from(this.presets.values()),
      categories: Array.from(this.categories.values()),
      usageStats: Array.from(this.usageStats.values()),
    };

    return JSON.stringify(presetsData, null, 2);
  }

  /**
   * Import presets
   */
  importPresets(data: string): boolean {
    try {
      const presetsData = JSON.parse(data);

      if (presetsData.version !== '1.0.0') {
        throw new Error('Unsupported preset format version');
      }

      // Import presets
      if (presetsData.presets) {
        for (const preset of presetsData.presets) {
          this.presets.set(preset.id, preset);
        }
      }

      // Import categories
      if (presetsData.categories) {
        for (const category of presetsData.categories) {
          this.categories.set(category.id, category);
        }
      }

      // Import usage stats
      if (presetsData.usageStats) {
        for (const stats of presetsData.usageStats) {
          this.usageStats.set(stats.presetId, stats);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to import presets:', error);
      return false;
    }
  }

  /**
   * Initialize default presets
   */
  private initializeDefaultPresets(): void {
    // Beginner presets
    this.addPreset({
      id: 'beginner_balanced',
      name: 'Balanced Beginner',
      description: 'A well-rounded approach for new players',
      category: 'balanced',
      difficulty: 'beginner',
      config: {
        primaryStrategy: 'closest',
        fallbackStrategy: 'highest_threat',
        persistenceMode: 'keep_target',
        range: 400,
        targetLockDuration: 2000,
        threatWeights: {
          proximity: 0.4,
          health: 0.3,
          damage: 0.2,
          speed: 0.1,
        },
        customSettings: {},
      },
      preferences: {
        unlockedStrategies: ['closest', 'highest_threat'],
        unlockedPersistenceModes: ['keep_target'],
        favoriteStrategies: ['closest'],
        favoritePersistenceModes: ['keep_target'],
        customSettings: {},
      },
      tags: ['beginner', 'balanced', 'safe'],
      isDefault: true,
      isUnlocked: true,
      usageCount: 0,
      lastUsed: 0,
      rating: 0,
      author: 'System',
      version: '1.0.0',
    });

    // Aggressive presets
    this.addPreset({
      id: 'aggressive_berserker',
      name: 'Berserker',
      description: 'Maximum aggression, target the most dangerous enemies',
      category: 'aggressive',
      difficulty: 'intermediate',
      config: {
        primaryStrategy: 'highest_threat',
        fallbackStrategy: 'highest_damage',
        persistenceMode: 'switch_aggressive',
        range: 600,
        targetLockDuration: 500,
        threatWeights: {
          proximity: 0.2,
          health: 0.1,
          damage: 0.4,
          speed: 0.3,
        },
        customSettings: {},
      },
      preferences: {
        unlockedStrategies: ['highest_threat', 'highest_damage', 'fastest'],
        unlockedPersistenceModes: ['switch_aggressive', 'switch_freely'],
        favoriteStrategies: ['highest_threat'],
        favoritePersistenceModes: ['switch_aggressive'],
        customSettings: {},
      },
      tags: ['aggressive', 'damage', 'threat'],
      isDefault: true,
      isUnlocked: true,
      usageCount: 0,
      lastUsed: 0,
      rating: 0,
      author: 'System',
      version: '1.0.0',
    });

    // Defensive presets
    this.addPreset({
      id: 'defensive_turtle',
      name: 'Turtle',
      description: 'Defensive approach, prioritize survival over damage',
      category: 'defensive',
      difficulty: 'beginner',
      config: {
        primaryStrategy: 'lowest_threat',
        fallbackStrategy: 'slowest',
        persistenceMode: 'keep_target',
        range: 300,
        targetLockDuration: 3000,
        threatWeights: {
          proximity: 0.5,
          health: 0.3,
          damage: 0.1,
          speed: 0.1,
        },
        customSettings: {},
      },
      preferences: {
        unlockedStrategies: ['lowest_threat', 'slowest', 'closest'],
        unlockedPersistenceModes: ['keep_target'],
        favoriteStrategies: ['lowest_threat'],
        favoritePersistenceModes: ['keep_target'],
        customSettings: {},
      },
      tags: ['defensive', 'survival', 'safe'],
      isDefault: true,
      isUnlocked: true,
      usageCount: 0,
      lastUsed: 0,
      rating: 0,
      author: 'System',
      version: '1.0.0',
    });

    // Specialized presets
    this.addPreset({
      id: 'specialized_elemental',
      name: 'Elemental Master',
      description: 'Leverage elemental advantages for maximum effectiveness',
      category: 'specialized',
      difficulty: 'advanced',
      config: {
        primaryStrategy: 'elemental_weakness',
        fallbackStrategy: 'highest_threat',
        persistenceMode: 'switch_freely',
        range: 500,
        targetLockDuration: 1000,
        threatWeights: {
          proximity: 0.3,
          health: 0.2,
          damage: 0.3,
          speed: 0.2,
        },
        customSettings: {
          elementalPriority: true,
          weaknessMultiplier: 1.5,
        },
      },
      preferences: {
        unlockedStrategies: ['elemental_weakness', 'elemental_strength', 'highest_threat'],
        unlockedPersistenceModes: ['switch_freely', 'keep_target'],
        favoriteStrategies: ['elemental_weakness'],
        favoritePersistenceModes: ['switch_freely'],
        customSettings: {
          elementalFocus: true,
        },
      },
      tags: ['elemental', 'specialized', 'advanced'],
      isDefault: true,
      isUnlocked: false,
      usageCount: 0,
      lastUsed: 0,
      rating: 0,
      author: 'System',
      version: '1.0.0',
    });

    // Expert presets
    this.addPreset({
      id: 'expert_adaptive',
      name: 'Adaptive Tactician',
      description: 'Dynamically adapts strategy based on combat situation',
      category: 'specialized',
      difficulty: 'expert',
      config: {
        primaryStrategy: 'highest_threat',
        fallbackStrategy: 'elemental_weakness',
        persistenceMode: 'manual_only',
        range: 450,
        targetLockDuration: 800,
        threatWeights: {
          proximity: 0.25,
          health: 0.25,
          damage: 0.25,
          speed: 0.25,
        },
        customSettings: {
          adaptiveStrategy: true,
          situationAnalysis: true,
          dynamicWeights: true,
        },
      },
      preferences: {
        unlockedStrategies: ['highest_threat', 'elemental_weakness', 'closest', 'highest_damage'],
        unlockedPersistenceModes: ['manual_only', 'switch_freely'],
        favoriteStrategies: ['highest_threat'],
        favoritePersistenceModes: ['manual_only'],
        customSettings: {
          adaptiveMode: true,
          expertMode: true,
        },
      },
      tags: ['expert', 'adaptive', 'tactical'],
      isDefault: true,
      isUnlocked: false,
      usageCount: 0,
      lastUsed: 0,
      rating: 0,
      author: 'System',
      version: '1.0.0.0',
    });
  }

  /**
   * Initialize categories
   */
  private initializeCategories(): void {
    this.addCategory({
      id: 'combat',
      name: 'Combat',
      description: 'Direct combat-focused strategies',
      icon: '⚔️',
      color: '#ff4444',
      presets: [],
    });

    this.addCategory({
      id: 'defensive',
      name: 'Defensive',
      description: 'Survival and defensive strategies',
      icon: '🛡️',
      color: '#4444ff',
      presets: [],
    });

    this.addCategory({
      id: 'aggressive',
      name: 'Aggressive',
      description: 'High-risk, high-reward strategies',
      icon: '🔥',
      color: '#ff8800',
      presets: [],
    });

    this.addCategory({
      id: 'balanced',
      name: 'Balanced',
      description: 'Well-rounded approaches',
      icon: '⚖️',
      color: '#44ff44',
      presets: [],
    });

    this.addCategory({
      id: 'specialized',
      name: 'Specialized',
      description: 'Advanced and specialized strategies',
      icon: '🎯',
      color: '#8844ff',
      presets: [],
    });

    this.addCategory({
      id: 'custom',
      name: 'Custom',
      description: 'Player-created presets',
      icon: '✨',
      color: '#ff44ff',
      presets: [],
    });

    // Categorize presets
    this.categorizePresets();
  }

  /**
   * Add preset
   */
  private addPreset(preset: TargetingPreset): void {
    this.presets.set(preset.id, preset);
  }

  /**
   * Add category
   */
  private addCategory(category: PresetCategory): void {
    this.categories.set(category.id, category);
  }

  /**
   * Categorize presets
   */
  private categorizePresets(): void {
    for (const preset of this.presets.values()) {
      const category = this.categories.get(preset.category);
      if (category) {
        category.presets.push(preset);
      }
    }
  }

  /**
   * Calculate preset score for recommendations
   */
  private calculatePresetScore(preset: TargetingPreset): number {
    let score = 0;

    // Base score from rating
    score += preset.rating * 20;

    // Usage frequency bonus
    score += Math.min(preset.usageCount * 0.1, 10);

    // Difficulty appropriateness
    const difficultyScores = {
      beginner: 10,
      intermediate: 8,
      advanced: 6,
      expert: 4,
    };
    score += difficultyScores[preset.difficulty];

    // Recency bonus
    const daysSinceLastUse = (Date.now() - preset.lastUsed) / (1000 * 60 * 60 * 24);
    if (daysSinceLastUse < 7) {
      score += 5;
    }

    return score;
  }

  /**
   * Get recommendation reasons
   */
  private getRecommendationReasons(preset: TargetingPreset): string[] {
    const reasons: string[] = [];

    if (preset.rating > 4) {
      reasons.push('Highly rated by players');
    }

    if (preset.usageCount > 10) {
      reasons.push('Popular choice');
    }

    if (preset.difficulty === 'beginner') {
      reasons.push('Great for beginners');
    }

    if (preset.tags.includes('balanced')) {
      reasons.push('Well-rounded approach');
    }

    if (preset.tags.includes('aggressive')) {
      reasons.push('High damage potential');
    }

    if (preset.tags.includes('defensive')) {
      reasons.push('Safe and reliable');
    }

    return reasons;
  }

  /**
   * Calculate recommendation confidence
   */
  private calculateConfidence(preset: TargetingPreset): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence with more data
    if (preset.usageCount > 5) confidence += 0.2;
    if (preset.usageCount > 20) confidence += 0.2;

    // Increase confidence with higher ratings
    if (preset.rating > 3) confidence += 0.1;
    if (preset.rating > 4) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Update usage statistics
   */
  private updateUsageStats(presetId: string): void {
    const existing = this.usageStats.get(presetId);
    if (existing) {
      existing.totalUses++;
      existing.lastUsed = Date.now();
    } else {
      this.usageStats.set(presetId, {
        presetId,
        totalUses: 1,
        averageSessionTime: 0,
        successRate: 0,
        playerRating: 0,
        lastUsed: Date.now(),
        favoriteCount: 0,
      });
    }
  }

  /**
   * Update unlock status
   */
  private updateUnlockStatus(): void {
    for (const preset of this.presets.values()) {
      if (preset.isDefault) {
        preset.isUnlocked = true;
      } else if (preset.unlockRequirements) {
        preset.isUnlocked = preset.unlockRequirements.every((req) => req.isMet);
      }
    }
  }
}

/**
 * Player progress interface
 */
interface PlayerProgress {
  level: number;
  experience: number;
  achievements: string[];
  currency: number;
  playTime: number;
  storyProgress: number;
  customProgress: Map<string, number>;
}

/**
 * Create targeting presets manager
 */
export function createTargetingPresetsManager(): TargetingPresetsManager {
  return new TargetingPresetsManager();
}

/**
 * Targeting presets utilities
 */
export const TargetingPresetsUtils = {
  /**
   * Create preset from configuration
   */
  createPresetFromConfig(
    name: string,
    description: string,
    config: TargetingConfig,
    category:
      | 'combat'
      | 'defensive'
      | 'aggressive'
      | 'balanced'
      | 'specialized'
      | 'custom' = 'custom',
  ): TargetingPreset {
    return {
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      difficulty: 'intermediate',
      config,
      preferences: {
        unlockedStrategies: [config.primaryStrategy, config.fallbackStrategy],
        unlockedPersistenceModes: [config.persistenceMode],
        favoriteStrategies: [config.primaryStrategy],
        favoritePersistenceModes: [config.persistenceMode],
        customSettings: {},
      },
      tags: [],
      isDefault: false,
      isUnlocked: true,
      usageCount: 0,
      lastUsed: 0,
      rating: 0,
      author: 'Player',
      version: '1.0.0',
    };
  },

  /**
   * Validate preset configuration
   */
  validatePresetConfig(config: TargetingConfig): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.primaryStrategy) {
      errors.push('Primary strategy is required');
    }

    if (!config.fallbackStrategy) {
      errors.push('Fallback strategy is required');
    }

    if (!config.persistenceMode) {
      errors.push('Persistence mode is required');
    }

    if (config.range <= 0) {
      errors.push('Range must be positive');
    }

    if (config.targetLockDuration < 0) {
      errors.push('Target lock duration cannot be negative');
    }

    if (config.range > 1000) {
      warnings.push('Very large range may impact performance');
    }

    if (config.targetLockDuration > 10000) {
      warnings.push('Very long lock duration may feel unresponsive');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Get preset difficulty description
   */
  getDifficultyDescription(
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  ): string {
    const descriptions = {
      beginner: 'Easy to use, forgiving mistakes',
      intermediate: 'Requires some game knowledge',
      advanced: 'Complex strategies for experienced players',
      expert: 'Master-level tactics and timing',
    };
    return descriptions[difficulty];
  },

  /**
   * Get category description
   */
  getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      combat: 'Direct, aggressive combat strategies',
      defensive: 'Survival-focused, cautious approaches',
      aggressive: 'High-risk, high-reward tactics',
      balanced: 'Well-rounded, adaptable strategies',
      specialized: 'Advanced, situation-specific tactics',
      custom: 'Player-created configurations',
    };
    return descriptions[category] || 'Custom category';
  },

  /**
   * Format preset for display
   */
  formatPresetForDisplay(preset: TargetingPreset): string {
    return `${preset.name} (${preset.difficulty}) - ${preset.description}`;
  },

  /**
   * Get preset tags as string
   */
  getPresetTagsString(preset: TargetingPreset): string {
    return preset.tags.join(', ');
  },

  /**
   * Calculate preset complexity score
   */
  calculatePresetComplexity(preset: TargetingPreset): number {
    let complexity = 0;

    // Strategy complexity
    const strategyComplexity = {
      closest: 1,
      highest_threat: 2,
      lowest_threat: 2,
      highest_health: 1,
      lowest_health: 1,
      highest_damage: 2,
      lowest_damage: 2,
      fastest: 1,
      slowest: 1,
      highest_armor: 2,
      lowest_armor: 2,
      highest_shield: 2,
      lowest_shield: 2,
      elemental_weakness: 3,
      elemental_strength: 3,
      custom: 5,
    };

    complexity += strategyComplexity[preset.config.primaryStrategy] || 1;
    complexity += strategyComplexity[preset.config.fallbackStrategy] || 1;

    // Persistence mode complexity
    const persistenceComplexity = {
      keep_target: 1,
      switch_freely: 2,
      switch_aggressive: 3,
      manual_only: 4,
    };

    complexity += persistenceComplexity[preset.config.persistenceMode] || 1;

    // Custom settings complexity
    if (preset.config.customSettings && Object.keys(preset.config.customSettings).length > 0) {
      complexity += Object.keys(preset.config.customSettings).length;
    }

    return Math.min(complexity, 10); // Cap at 10
  },
};
