/**
 * Player unlock system for targeting strategies and persistence modes
 * Manages progression and unlocking of targeting features
 */

import type { TargetingStrategy, TargetPersistenceMode } from './types.js';
import { createTargetingConfigManager } from './targeting-config.js';

/**
 * Unlock requirement types
 */
export type UnlockRequirementType =
  | 'level'
  | 'enemies_defeated'
  | 'time_played'
  | 'achievement'
  | 'currency'
  | 'research'
  | 'story_progress'
  | 'custom';

/**
 * Unlock requirement definition
 */
export interface UnlockRequirement {
  type: UnlockRequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

/**
 * Targeting unlock definition
 */
export interface TargetingUnlock {
  id: string;
  type: 'strategy' | 'persistence_mode' | 'preset';
  target: TargetingStrategy | TargetPersistenceMode | string;
  requirements: UnlockRequirement[];
  isUnlocked: boolean;
  unlockDate?: Date;
  description: string;
  category: string;
  priority: number;
}

/**
 * Player progress tracking
 */
export interface PlayerProgress {
  level: number;
  enemiesDefeated: number;
  timePlayed: number; // in seconds
  achievements: string[];
  currency: number;
  researchPoints: number;
  storyProgress: number; // 0-100
  customProgress: Map<string, number>;
}

/**
 * Unlock system manager
 */
export class TargetingUnlockSystem {
  private configManager = createTargetingConfigManager();
  private playerProgress: PlayerProgress;
  private unlocks: Map<string, TargetingUnlock> = new Map();
  private unlockHistory: TargetingUnlock[] = [];

  constructor(initialProgress?: Partial<PlayerProgress>) {
    this.playerProgress = this.initializePlayerProgress(initialProgress);
    this.initializeUnlocks();
  }

  /**
   * Initialize player progress with defaults
   */
  private initializePlayerProgress(initialProgress?: Partial<PlayerProgress>): PlayerProgress {
    const defaultProgress: PlayerProgress = {
      level: 1,
      enemiesDefeated: 0,
      timePlayed: 0,
      achievements: [],
      currency: 0,
      researchPoints: 0,
      storyProgress: 0,
      customProgress: new Map(),
    };

    return { ...defaultProgress, ...initialProgress };
  }

  /**
   * Initialize all targeting unlocks
   */
  private initializeUnlocks(): void {
    // Basic strategy unlocks
    this.addUnlock({
      id: 'closest_strategy',
      type: 'strategy',
      target: 'closest',
      requirements: [],
      isUnlocked: true,
      description: 'Target the nearest enemy',
      category: 'Basic',
      priority: 1,
    });

    this.addUnlock({
      id: 'highest_threat_strategy',
      type: 'strategy',
      target: 'highest_threat',
      requirements: [
        {
          type: 'level',
          value: 3,
          description: 'Reach level 3',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target the most dangerous enemy',
      category: 'Basic',
      priority: 2,
    });

    this.addUnlock({
      id: 'lowest_threat_strategy',
      type: 'strategy',
      target: 'lowest_threat',
      requirements: [
        {
          type: 'level',
          value: 5,
          description: 'Reach level 5',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target the easiest enemy to kill',
      category: 'Basic',
      priority: 3,
    });

    // Health-based strategy unlocks
    this.addUnlock({
      id: 'highest_hp_strategy',
      type: 'strategy',
      target: 'highest_hp',
      requirements: [
        {
          type: 'enemies_defeated',
          value: 50,
          description: 'Defeat 50 enemies',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target the enemy with the most health',
      category: 'Health',
      priority: 4,
    });

    this.addUnlock({
      id: 'lowest_hp_strategy',
      type: 'strategy',
      target: 'lowest_hp',
      requirements: [
        {
          type: 'enemies_defeated',
          value: 100,
          description: 'Defeat 100 enemies',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target the enemy with the least health',
      category: 'Health',
      priority: 5,
    });

    // Damage-based strategy unlocks
    this.addUnlock({
      id: 'highest_damage_strategy',
      type: 'strategy',
      target: 'highest_damage',
      requirements: [
        {
          type: 'level',
          value: 8,
          description: 'Reach level 8',
          isMet: false,
        },
        {
          type: 'enemies_defeated',
          value: 200,
          description: 'Defeat 200 enemies',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target the enemy dealing the most damage',
      category: 'Damage',
      priority: 6,
    });

    this.addUnlock({
      id: 'lowest_damage_strategy',
      type: 'strategy',
      target: 'lowest_damage',
      requirements: [
        {
          type: 'level',
          value: 10,
          description: 'Reach level 10',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target the enemy dealing the least damage',
      category: 'Damage',
      priority: 7,
    });

    // Speed-based strategy unlocks
    this.addUnlock({
      id: 'fastest_strategy',
      type: 'strategy',
      target: 'fastest',
      requirements: [
        {
          type: 'time_played',
          value: 1800, // 30 minutes
          description: 'Play for 30 minutes',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target the fastest moving enemy',
      category: 'Speed',
      priority: 8,
    });

    this.addUnlock({
      id: 'slowest_strategy',
      type: 'strategy',
      target: 'slowest',
      requirements: [
        {
          type: 'time_played',
          value: 3600, // 1 hour
          description: 'Play for 1 hour',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target the slowest moving enemy',
      category: 'Speed',
      priority: 9,
    });

    // Defense-based strategy unlocks
    this.addUnlock({
      id: 'highest_armor_strategy',
      type: 'strategy',
      target: 'highest_armor',
      requirements: [
        {
          type: 'level',
          value: 12,
          description: 'Reach level 12',
          isMet: false,
        },
        {
          type: 'enemies_defeated',
          value: 500,
          description: 'Defeat 500 enemies',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target the enemy with the most armor',
      category: 'Defense',
      priority: 10,
    });

    this.addUnlock({
      id: 'lowest_armor_strategy',
      type: 'strategy',
      target: 'lowest_armor',
      requirements: [
        {
          type: 'level',
          value: 15,
          description: 'Reach level 15',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target the enemy with the least armor',
      category: 'Defense',
      priority: 11,
    });

    this.addUnlock({
      id: 'shielded_strategy',
      type: 'strategy',
      target: 'shielded',
      requirements: [
        {
          type: 'achievement',
          value: 1,
          description: 'Complete "Shield Breaker" achievement',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target shielded enemies first',
      category: 'Defense',
      priority: 12,
    });

    this.addUnlock({
      id: 'unshielded_strategy',
      type: 'strategy',
      target: 'unshielded',
      requirements: [
        {
          type: 'level',
          value: 18,
          description: 'Reach level 18',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target unshielded enemies first',
      category: 'Defense',
      priority: 13,
    });

    // Elemental strategy unlocks
    this.addUnlock({
      id: 'elemental_weak_strategy',
      type: 'strategy',
      target: 'elemental_weak',
      requirements: [
        {
          type: 'research',
          value: 100,
          description: 'Spend 100 research points',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target enemies weak to your element',
      category: 'Elemental',
      priority: 14,
    });

    this.addUnlock({
      id: 'elemental_strong_strategy',
      type: 'strategy',
      target: 'elemental_strong',
      requirements: [
        {
          type: 'research',
          value: 200,
          description: 'Spend 200 research points',
          isMet: false,
        },
        {
          type: 'level',
          value: 20,
          description: 'Reach level 20',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Target enemies strong against your element',
      category: 'Elemental',
      priority: 15,
    });

    // Custom strategy unlock
    this.addUnlock({
      id: 'custom_strategy',
      type: 'strategy',
      target: 'custom',
      requirements: [
        {
          type: 'story_progress',
          value: 80,
          description: 'Complete 80% of story',
          isMet: false,
        },
        {
          type: 'currency',
          value: 10000,
          description: 'Spend 10,000 currency',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Create custom targeting strategies',
      category: 'Advanced',
      priority: 16,
    });

    // Persistence mode unlocks
    this.addUnlock({
      id: 'keep_target_mode',
      type: 'persistence_mode',
      target: 'keep_target',
      requirements: [],
      isUnlocked: true,
      description: 'Keep current target until it dies',
      category: 'Basic',
      priority: 1,
    });

    this.addUnlock({
      id: 'switch_freely_mode',
      type: 'persistence_mode',
      target: 'switch_freely',
      requirements: [
        {
          type: 'level',
          value: 5,
          description: 'Reach level 5',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Switch targets when better options are available',
      category: 'Basic',
      priority: 2,
    });

    this.addUnlock({
      id: 'switch_aggressive_mode',
      type: 'persistence_mode',
      target: 'switch_aggressive',
      requirements: [
        {
          type: 'level',
          value: 10,
          description: 'Reach level 10',
          isMet: false,
        },
        {
          type: 'enemies_defeated',
          value: 300,
          description: 'Defeat 300 enemies',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Always target the best available enemy',
      category: 'Advanced',
      priority: 3,
    });

    this.addUnlock({
      id: 'manual_only_mode',
      type: 'persistence_mode',
      target: 'manual_only',
      requirements: [
        {
          type: 'level',
          value: 15,
          description: 'Reach level 15',
          isMet: false,
        },
        {
          type: 'time_played',
          value: 7200, // 2 hours
          description: 'Play for 2 hours',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Only switch targets when you manually change strategy',
      category: 'Advanced',
      priority: 4,
    });

    // Preset unlocks
    this.addUnlock({
      id: 'balanced_preset',
      type: 'preset',
      target: 'balanced',
      requirements: [],
      isUnlocked: true,
      description: 'Balanced targeting preset',
      category: 'Presets',
      priority: 1,
    });

    this.addUnlock({
      id: 'aggressive_preset',
      type: 'preset',
      target: 'aggressive',
      requirements: [
        {
          type: 'level',
          value: 10,
          description: 'Reach level 10',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Aggressive targeting preset',
      category: 'Presets',
      priority: 2,
    });

    this.addUnlock({
      id: 'defensive_preset',
      type: 'preset',
      target: 'defensive',
      requirements: [
        {
          type: 'achievement',
          value: 1,
          description: 'Complete "Survivor" achievement',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Defensive targeting preset',
      category: 'Presets',
      priority: 3,
    });

    this.addUnlock({
      id: 'speed_preset',
      type: 'preset',
      target: 'speed',
      requirements: [
        {
          type: 'enemies_defeated',
          value: 100,
          description: 'Defeat 100 enemies',
          isMet: false,
        },
      ],
      isUnlocked: false,
      description: 'Speed-focused targeting preset',
      category: 'Presets',
      priority: 4,
    });
  }

  /**
   * Add an unlock definition
   */
  private addUnlock(unlock: TargetingUnlock): void {
    this.unlocks.set(unlock.id, unlock);
  }

  /**
   * Update player progress
   */
  updateProgress(updates: Partial<PlayerProgress>): void {
    this.playerProgress = { ...this.playerProgress, ...updates };
    this.checkUnlocks();
  }

  /**
   * Check all unlock requirements
   */
  private checkUnlocks(): void {
    for (const unlock of this.unlocks.values()) {
      if (!unlock.isUnlocked) {
        const wasUnlocked = this.checkUnlockRequirements(unlock);
        if (wasUnlocked) {
          this.unlockTargetingFeature(unlock);
        }
      }
    }
  }

  /**
   * Check if unlock requirements are met
   */
  private checkUnlockRequirements(unlock: TargetingUnlock): boolean {
    for (const requirement of unlock.requirements) {
      requirement.isMet = this.isRequirementMet(requirement);
      if (!requirement.isMet) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if a specific requirement is met
   */
  private isRequirementMet(requirement: UnlockRequirement): boolean {
    switch (requirement.type) {
      case 'level':
        return this.playerProgress.level >= requirement.value;
      case 'enemies_defeated':
        return this.playerProgress.enemiesDefeated >= requirement.value;
      case 'time_played':
        return this.playerProgress.timePlayed >= requirement.value;
      case 'achievement':
        return this.playerProgress.achievements.length >= requirement.value;
      case 'currency':
        return this.playerProgress.currency >= requirement.value;
      case 'research':
        return this.playerProgress.researchPoints >= requirement.value;
      case 'story_progress':
        return this.playerProgress.storyProgress >= requirement.value;
      case 'custom': {
        const customValue = this.playerProgress.customProgress.get(requirement.description) || 0;
        return customValue >= requirement.value;
      }
      default:
        return false;
    }
  }

  /**
   * Unlock a targeting feature
   */
  private unlockTargetingFeature(unlock: TargetingUnlock): void {
    unlock.isUnlocked = true;
    unlock.unlockDate = new Date();
    this.unlockHistory.push(unlock);

    // Apply the unlock to the configuration manager
    switch (unlock.type) {
      case 'strategy':
        this.configManager.unlockStrategy(unlock.target as TargetingStrategy);
        break;
      case 'persistence_mode':
        this.configManager.unlockPersistenceMode(unlock.target as TargetPersistenceMode);
        break;
      case 'preset':
        this.configManager.unlockPreset(unlock.target as string);
        break;
    }
  }

  /**
   * Get all unlocks
   */
  getAllUnlocks(): TargetingUnlock[] {
    return Array.from(this.unlocks.values());
  }

  /**
   * Get unlocked features
   */
  getUnlockedFeatures(): TargetingUnlock[] {
    return Array.from(this.unlocks.values()).filter((unlock) => unlock.isUnlocked);
  }

  /**
   * Get locked features
   */
  getLockedFeatures(): TargetingUnlock[] {
    return Array.from(this.unlocks.values()).filter((unlock) => !unlock.isUnlocked);
  }

  /**
   * Get unlocks by category
   */
  getUnlocksByCategory(category: string): TargetingUnlock[] {
    return Array.from(this.unlocks.values()).filter((unlock) => unlock.category === category);
  }

  /**
   * Get next available unlocks
   */
  getNextAvailableUnlocks(limit = 5): TargetingUnlock[] {
    const lockedUnlocks = this.getLockedFeatures();
    const almostUnlocked = lockedUnlocks.filter((unlock) => {
      const unmetRequirements = unlock.requirements.filter((req) => !req.isMet);
      return unmetRequirements.length === 1; // Only one requirement left
    });

    return almostUnlocked.sort((a, b) => a.priority - b.priority).slice(0, limit);
  }

  /**
   * Get unlock progress for a specific feature
   */
  getUnlockProgress(unlockId: string): {
    unlock: TargetingUnlock;
    progress: number;
    nextRequirement?: UnlockRequirement;
  } | null {
    const unlock = this.unlocks.get(unlockId);
    if (!unlock) return null;

    if (unlock.isUnlocked) {
      return { unlock, progress: 100 };
    }

    const metRequirements = unlock.requirements.filter((req) => req.isMet).length;
    const totalRequirements = unlock.requirements.length;
    const progress = (metRequirements / totalRequirements) * 100;

    const nextRequirement = unlock.requirements.find((req) => !req.isMet);

    return { unlock, progress, nextRequirement };
  }

  /**
   * Get player progress
   */
  getPlayerProgress(): PlayerProgress {
    return { ...this.playerProgress };
  }

  /**
   * Get unlock history
   */
  getUnlockHistory(): TargetingUnlock[] {
    return [...this.unlockHistory];
  }

  /**
   * Get configuration manager
   */
  getConfigManager(): ReturnType<typeof createTargetingConfigManager> {
    return this.configManager;
  }

  /**
   * Save unlock system state
   */
  saveToStorage(): void {
    try {
      const data = {
        playerProgress: this.playerProgress,
        unlocks: Array.from(this.unlocks.entries()),
        unlockHistory: this.unlockHistory,
      };
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('draconia_targeting_unlocks', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to save targeting unlock system:', error);
    }
  }

  /**
   * Load unlock system state
   */
  loadFromStorage(): boolean {
    try {
      const data =
        typeof window !== 'undefined' && window.localStorage
          ? window.localStorage.getItem('draconia_targeting_unlocks')
          : null;
      if (data) {
        const parsed = JSON.parse(data);
        this.playerProgress = { ...this.playerProgress, ...parsed.playerProgress };
        this.unlocks = new Map(parsed.unlocks);
        this.unlockHistory = parsed.unlockHistory || [];
        return true;
      }
    } catch (error) {
      console.error('Failed to load targeting unlock system:', error);
    }
    return false;
  }
}

/**
 * Create a targeting unlock system
 */
export function createTargetingUnlockSystem(
  initialProgress?: Partial<PlayerProgress>,
): TargetingUnlockSystem {
  return new TargetingUnlockSystem(initialProgress);
}

/**
 * Utility functions for targeting unlocks
 */
export const TargetingUnlockUtils = {
  /**
   * Get requirement description
   */
  getRequirementDescription(requirement: UnlockRequirement, progress: PlayerProgress): string {
    const currentValue = this.getCurrentRequirementValue(requirement, progress);
    const targetValue = requirement.value;
    const percentage = Math.min(100, (currentValue / targetValue) * 100);

    return `${requirement.description} (${currentValue}/${targetValue} - ${percentage.toFixed(0)}%)`;
  },

  /**
   * Get current requirement value
   */
  getCurrentRequirementValue(requirement: UnlockRequirement, progress: PlayerProgress): number {
    switch (requirement.type) {
      case 'level':
        return progress.level;
      case 'enemies_defeated':
        return progress.enemiesDefeated;
      case 'time_played':
        return progress.timePlayed;
      case 'achievement':
        return progress.achievements.length;
      case 'currency':
        return progress.currency;
      case 'research':
        return progress.researchPoints;
      case 'story_progress':
        return progress.storyProgress;
      case 'custom':
        return progress.customProgress.get(requirement.description) || 0;
      default:
        return 0;
    }
  },

  /**
   * Calculate unlock priority score
   */
  calculateUnlockPriority(unlock: TargetingUnlock, _progress: PlayerProgress): number {
    const metRequirements = unlock.requirements.filter((req) => req.isMet).length;
    const totalRequirements = unlock.requirements.length;
    const progressRatio = metRequirements / totalRequirements;

    // Higher priority for unlocks that are closer to completion
    return progressRatio * 100 + unlock.priority;
  },

  /**
   * Get recommended next unlock
   */
  getRecommendedNextUnlock(
    unlocks: TargetingUnlock[],
    progress: PlayerProgress,
  ): TargetingUnlock | null {
    const lockedUnlocks = unlocks.filter((unlock) => !unlock.isUnlocked);
    if (lockedUnlocks.length === 0) return null;

    const scoredUnlocks = lockedUnlocks.map((unlock) => ({
      unlock,
      score: this.calculateUnlockPriority(unlock, progress),
    }));

    scoredUnlocks.sort((a, b) => b.score - a.score);
    return scoredUnlocks[0].unlock;
  },
};
