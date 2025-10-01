/**
 * Enhanced Soul Forging Manager
 *
 * This file implements an advanced Soul Forging system with enhanced features,
 * state persistence, analytics, and comprehensive tracking.
 */

import { v4 as uuidv4 } from 'uuid';
import type { EnchantConfig, SoulForgingTransaction, LocationType } from './enchant-types.js';
import { createEnchantCostCalculator, type EnchantCostCalculator } from './enchant-costs.js';

export interface SoulForgingProgression {
  currentLevel: number;
  totalLevels: number;
  milestones: SoulForgingMilestone[];
  achievements: SoulForgingAchievement[];
}

export interface SoulForgingMilestone {
  id: string;
  name: string;
  description: string;
  requirement: number;
  reward: SoulForgingReward;
  achieved: boolean;
  achievedAt?: number;
}

export interface SoulForgingAchievement {
  id: string;
  name: string;
  description: string;
  type: 'temporary' | 'permanent' | 'combined';
  requirement: number;
  achieved: boolean;
  achievedAt?: number;
}

export interface SoulForgingReward {
  type: 'currency' | 'cap_extension' | 'cost_reduction';
  amount: number;
  description: string;
}

export interface SoulForgingAnalytics {
  totalPurchases: number;
  totalArcanaSpent: number;
  totalSoulPowerSpent: number;
  averageCostPerLevel: number;
  costEfficiency: number;
  progressionRate: number;
  milestonesAchieved: number;
  achievementsUnlocked: number;
}

export interface SoulForgingProgressionStats {
  currentLevel: number;
  totalLevels: number;
  nextMilestone: SoulForgingMilestone | null;
  progressionPercentage: number;
  estimatedTimeToNext: number;
  recommendedActions: string[];
}

export interface SoulForgingCostEfficiency {
  currentEfficiency: number;
  optimalEfficiency: number;
  costSavings: number;
  recommendations: string[];
}

export interface SoulForgingRecommendation {
  type: 'temporary' | 'permanent';
  amount: number;
  cost: number;
  benefit: number;
  efficiency: number;
  reasoning: string;
}

export interface SoulForgingValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface SoulForgingState {
  temporaryLevels: number;
  permanentLevels: number;
  totalPurchases: number;
  totalArcanaSpent: number;
  totalSoulPowerSpent: number;
  milestones: SoulForgingMilestone[];
  achievements: SoulForgingAchievement[];
  lastUpdated: number;
  version: string;
}

export interface EnhancedSoulForgingSystem {
  readonly temporaryLevels: number;
  readonly permanentLevels: number;
  readonly totalCapExtension: number;
  readonly progression: SoulForgingProgression;
  readonly analytics: SoulForgingAnalytics;
  readonly config: EnchantConfig;

  // Enhanced operations
  purchaseTemporarySoulForging(_amount: number, _availableArcana: number): SoulForgingTransaction;
  purchasePermanentSoulForging(
    _amount: number,
    _availableSoulPower: number,
  ): SoulForgingTransaction;

  // Advanced features
  calculateOptimalSoulForging(
    _availableCurrency: number,
    _type: 'temporary' | 'permanent',
  ): SoulForgingRecommendation;
  getSoulForgingMilestones(): SoulForgingMilestone[];
  validateSoulForgingProgression(): SoulForgingValidation;

  // State management
  saveState(): SoulForgingState;
  loadState(_state: SoulForgingState): boolean;
  resetTemporarySoulForging(): void;

  // Analytics
  getSoulForgingAnalytics(): SoulForgingAnalytics;
  getProgressionStats(): SoulForgingProgressionStats;
  getCostEfficiency(): SoulForgingCostEfficiency;
}

export class DefaultEnhancedSoulForgingSystem implements EnhancedSoulForgingSystem {
  private _temporaryLevels: number = 0;
  private _permanentLevels: number = 0;
  private _transactions: SoulForgingTransaction[] = [];
  private _config: EnchantConfig;
  private _costCalculator: EnchantCostCalculator;
  private _milestones: SoulForgingMilestone[] = [];
  private _achievements: SoulForgingAchievement[] = [];
  private _totalPurchases: number = 0;
  private _totalArcanaSpent: number = 0;
  private _totalSoulPowerSpent: number = 0;

  constructor(config: EnchantConfig) {
    this._config = config;
    this._costCalculator = createEnchantCostCalculator(config);
    this.initializeMilestones();
    this.initializeAchievements();
  }

  get temporaryLevels(): number {
    return this._temporaryLevels;
  }

  get permanentLevels(): number {
    return this._permanentLevels;
  }

  get totalCapExtension(): number {
    return (this._temporaryLevels + this._permanentLevels) * this._config.soulForgingMultiplier;
  }

  get progression(): SoulForgingProgression {
    return {
      currentLevel: this._temporaryLevels + this._permanentLevels,
      totalLevels: this._temporaryLevels + this._permanentLevels,
      milestones: this._milestones,
      achievements: this._achievements,
    };
  }

  get analytics(): SoulForgingAnalytics {
    return this.getSoulForgingAnalytics();
  }

  get config(): EnchantConfig {
    return { ...this._config };
  }

  /**
   * Purchase temporary Soul Forging using Arcana
   */
  purchaseTemporarySoulForging(amount: number, availableArcana: number): SoulForgingTransaction {
    if (amount <= 0) {
      return this.createFailedTransaction(
        'temporary',
        amount,
        0,
        'arcana',
        'journey',
        'Amount must be positive',
      );
    }

    const cost = this.calculateTemporaryCost(amount, this._temporaryLevels);

    if (availableArcana < cost) {
      return this.createFailedTransaction(
        'temporary',
        amount,
        cost,
        'arcana',
        'journey',
        `Insufficient Arcana. Required: ${cost}, Available: ${availableArcana}`,
      );
    }

    this._temporaryLevels += amount;
    this._totalPurchases++;
    this._totalArcanaSpent += cost;

    const transaction = this.createSuccessfulTransaction(
      'temporary',
      amount,
      cost,
      'arcana',
      'journey',
    );

    this._transactions.push(transaction);
    this.checkMilestones();
    this.checkAchievements();

    return transaction;
  }

  /**
   * Purchase permanent Soul Forging using Soul Power
   */
  purchasePermanentSoulForging(amount: number, availableSoulPower: number): SoulForgingTransaction {
    if (amount <= 0) {
      return this.createFailedTransaction(
        'permanent',
        amount,
        0,
        'soul_power',
        'draconia',
        'Amount must be positive',
      );
    }

    const cost = this.calculatePermanentCost(amount);

    if (availableSoulPower < cost) {
      return this.createFailedTransaction(
        'permanent',
        amount,
        cost,
        'soul_power',
        'draconia',
        `Insufficient Soul Power. Required: ${cost}, Available: ${availableSoulPower}`,
      );
    }

    this._permanentLevels += amount;
    this._totalPurchases++;
    this._totalSoulPowerSpent += cost;

    const transaction = this.createSuccessfulTransaction(
      'permanent',
      amount,
      cost,
      'soul_power',
      'draconia',
    );

    this._transactions.push(transaction);
    this.checkMilestones();
    this.checkAchievements();

    return transaction;
  }

  /**
   * Calculate optimal Soul Forging recommendation
   */
  calculateOptimalSoulForging(
    availableCurrency: number,
    type: 'temporary' | 'permanent',
  ): SoulForgingRecommendation {
    const maxAffordable = this.calculateMaxAffordable(type, availableCurrency);
    const cost = this.calculateCost(type, maxAffordable);
    const benefit = maxAffordable * this._config.soulForgingMultiplier;
    const efficiency = benefit / cost;

    return {
      type,
      amount: maxAffordable,
      cost,
      benefit,
      efficiency,
      reasoning: this.generateReasoning(type, maxAffordable, efficiency),
    };
  }

  /**
   * Get Soul Forging milestones
   */
  getSoulForgingMilestones(): SoulForgingMilestone[] {
    return [...this._milestones];
  }

  /**
   * Validate Soul Forging progression
   */
  validateSoulForgingProgression(): SoulForgingValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check for invalid levels
    if (this._temporaryLevels < 0) {
      errors.push('Temporary Soul Forging levels cannot be negative');
    }

    if (this._permanentLevels < 0) {
      errors.push('Permanent Soul Forging levels cannot be negative');
    }

    // Check for progression efficiency
    const totalLevels = this._temporaryLevels + this._permanentLevels;
    if (totalLevels > 0 && this._totalPurchases === 0) {
      warnings.push('Soul Forging levels exist but no purchases recorded');
    }

    // Check for cost efficiency
    if (this._totalArcanaSpent > 0 && this._totalSoulPowerSpent > 0) {
      const arcanaEfficiency = this._temporaryLevels / this._totalArcanaSpent;
      const soulPowerEfficiency = this._permanentLevels / this._totalSoulPowerSpent;

      if (arcanaEfficiency < 0.001) {
        recommendations.push('Consider optimizing temporary Soul Forging purchases');
      }

      if (soulPowerEfficiency < 0.0001) {
        recommendations.push('Consider optimizing permanent Soul Forging purchases');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      recommendations,
    };
  }

  /**
   * Save Soul Forging state
   */
  saveState(): SoulForgingState {
    return {
      temporaryLevels: this._temporaryLevels,
      permanentLevels: this._permanentLevels,
      totalPurchases: this._totalPurchases,
      totalArcanaSpent: this._totalArcanaSpent,
      totalSoulPowerSpent: this._totalSoulPowerSpent,
      milestones: this._milestones,
      achievements: this._achievements,
      lastUpdated: Date.now(),
      version: '1.0.0',
    };
  }

  /**
   * Load Soul Forging state
   */
  loadState(state: SoulForgingState): boolean {
    try {
      // Validate state before loading
      if (state.temporaryLevels < 0 || state.permanentLevels < 0) {
        console.error('Invalid Soul Forging state: negative levels');
        return false;
      }

      if (state.totalPurchases < 0 || state.totalArcanaSpent < 0 || state.totalSoulPowerSpent < 0) {
        console.error('Invalid Soul Forging state: negative values');
        return false;
      }

      this._temporaryLevels = state.temporaryLevels;
      this._permanentLevels = state.permanentLevels;
      this._totalPurchases = state.totalPurchases;
      this._totalArcanaSpent = state.totalArcanaSpent;
      this._totalSoulPowerSpent = state.totalSoulPowerSpent;
      this._milestones = state.milestones;
      this._achievements = state.achievements;

      return true;
    } catch (error) {
      console.error('Failed to load Soul Forging state:', error);
      return false;
    }
  }

  /**
   * Reset temporary Soul Forging
   */
  resetTemporarySoulForging(): void {
    this._temporaryLevels = 0;
  }

  /**
   * Get Soul Forging analytics
   */
  getSoulForgingAnalytics(): SoulForgingAnalytics {
    const totalLevels = this._temporaryLevels + this._permanentLevels;
    const totalSpent = this._totalArcanaSpent + this._totalSoulPowerSpent;
    const averageCostPerLevel = totalLevels > 0 ? totalSpent / totalLevels : 0;
    const costEfficiency = totalSpent > 0 ? totalLevels / totalSpent : 0;
    const progressionRate = this._totalPurchases > 0 ? totalLevels / this._totalPurchases : 0;

    const milestonesAchieved = this._milestones.filter((m) => m.achieved).length;
    const achievementsUnlocked = this._achievements.filter((a) => a.achieved).length;

    return {
      totalPurchases: this._totalPurchases,
      totalArcanaSpent: this._totalArcanaSpent,
      totalSoulPowerSpent: this._totalSoulPowerSpent,
      averageCostPerLevel,
      costEfficiency,
      progressionRate,
      milestonesAchieved,
      achievementsUnlocked,
    };
  }

  /**
   * Get progression statistics
   */
  getProgressionStats(): SoulForgingProgressionStats {
    const currentLevel = this._temporaryLevels + this._permanentLevels;
    const nextMilestone = this._milestones.find((m) => !m.achieved);
    const progressionPercentage = nextMilestone
      ? (currentLevel / nextMilestone.requirement) * 100
      : 100;

    return {
      currentLevel,
      totalLevels: currentLevel,
      nextMilestone: nextMilestone || null,
      progressionPercentage,
      estimatedTimeToNext: this.estimateTimeToNext(),
      recommendedActions: this.generateRecommendedActions(),
    };
  }

  /**
   * Get cost efficiency analysis
   */
  getCostEfficiency(): SoulForgingCostEfficiency {
    const currentEfficiency = this.calculateCurrentEfficiency();
    const optimalEfficiency = this.calculateOptimalEfficiency();
    const costSavings = (optimalEfficiency - currentEfficiency) * this._totalArcanaSpent;

    return {
      currentEfficiency,
      optimalEfficiency,
      costSavings,
      recommendations: this.generateEfficiencyRecommendations(),
    };
  }

  // Private helper methods

  private calculateTemporaryCost(amount: number, currentLevels: number): number {
    const baseCost = this._config.temporarySoulForgingCost;
    const multiplier = Math.pow(this._config.growthRate, currentLevels);
    return Math.floor(baseCost * multiplier * amount);
  }

  private calculatePermanentCost(amount: number): number {
    return this._config.permanentSoulForgingCost * amount;
  }

  private calculateCost(type: 'temporary' | 'permanent', amount: number): number {
    if (type === 'temporary') {
      return this.calculateTemporaryCost(amount, this._temporaryLevels);
    } else {
      return this.calculatePermanentCost(amount);
    }
  }

  private calculateMaxAffordable(
    type: 'temporary' | 'permanent',
    availableCurrency: number,
  ): number {
    let maxAffordable = 0;
    let totalCost = 0;

    while (totalCost <= availableCurrency) {
      const nextCost = this.calculateCost(type, maxAffordable + 1);
      if (totalCost + nextCost > availableCurrency) {
        break;
      }
      totalCost += nextCost;
      maxAffordable++;
    }

    return maxAffordable;
  }

  private generateReasoning(
    type: 'temporary' | 'permanent',
    amount: number,
    efficiency: number,
  ): string {
    if (type === 'temporary') {
      return `Temporary Soul Forging: ${amount} levels for current journey. Efficiency: ${efficiency.toFixed(2)}`;
    } else {
      return `Permanent Soul Forging: ${amount} levels for all future journeys. Efficiency: ${efficiency.toFixed(2)}`;
    }
  }

  private initializeMilestones(): void {
    this._milestones = [
      {
        id: 'first_soul_forging',
        name: 'First Soul Forging',
        description: 'Complete your first Soul Forging',
        requirement: 1,
        reward: { type: 'cap_extension', amount: 60, description: '+60 level cap' },
        achieved: false,
      },
      {
        id: 'soul_forging_novice',
        name: 'Soul Forging Novice',
        description: 'Reach 5 total Soul Forging levels',
        requirement: 5,
        reward: { type: 'cost_reduction', amount: 0.05, description: '5% cost reduction' },
        achieved: false,
      },
      {
        id: 'soul_forging_adept',
        name: 'Soul Forging Adept',
        description: 'Reach 10 total Soul Forging levels',
        requirement: 10,
        reward: { type: 'cap_extension', amount: 120, description: '+120 level cap' },
        achieved: false,
      },
    ];
  }

  private initializeAchievements(): void {
    this._achievements = [
      {
        id: 'temporary_master',
        name: 'Temporary Master',
        description: 'Reach 10 temporary Soul Forging levels',
        type: 'temporary',
        requirement: 10,
        achieved: false,
      },
      {
        id: 'permanent_master',
        name: 'Permanent Master',
        description: 'Reach 5 permanent Soul Forging levels',
        type: 'permanent',
        requirement: 5,
        achieved: false,
      },
      {
        id: 'soul_forging_legend',
        name: 'Soul Forging Legend',
        description: 'Reach 20 total Soul Forging levels',
        type: 'combined',
        requirement: 20,
        achieved: false,
      },
    ];
  }

  private checkMilestones(): void {
    const totalLevels = this._temporaryLevels + this._permanentLevels;
    this._milestones.forEach((milestone) => {
      if (!milestone.achieved && totalLevels >= milestone.requirement) {
        milestone.achieved = true;
        milestone.achievedAt = Date.now();
      }
    });
  }

  private checkAchievements(): void {
    const totalLevels = this._temporaryLevels + this._permanentLevels;
    this._achievements.forEach((achievement) => {
      if (!achievement.achieved) {
        let requirementMet = false;
        switch (achievement.type) {
          case 'temporary':
            requirementMet = this._temporaryLevels >= achievement.requirement;
            break;
          case 'permanent':
            requirementMet = this._permanentLevels >= achievement.requirement;
            break;
          case 'combined':
            requirementMet = totalLevels >= achievement.requirement;
            break;
        }

        if (requirementMet) {
          achievement.achieved = true;
          achievement.achievedAt = Date.now();
        }
      }
    });
  }

  private calculateCurrentEfficiency(): number {
    const totalLevels = this._temporaryLevels + this._permanentLevels;
    const totalSpent = this._totalArcanaSpent + this._totalSoulPowerSpent;
    return totalSpent > 0 ? totalLevels / totalSpent : 0;
  }

  private calculateOptimalEfficiency(): number {
    // This would be calculated based on optimal Soul Forging strategies
    return 0.001; // Placeholder value
  }

  private estimateTimeToNext(): number {
    // This would estimate time based on current progression rate
    return 0; // Placeholder value
  }

  private generateRecommendedActions(): string[] {
    const recommendations: string[] = [];
    const totalLevels = this._temporaryLevels + this._permanentLevels;

    if (totalLevels === 0) {
      recommendations.push('Start with temporary Soul Forging for immediate benefits');
    } else if (totalLevels < 5) {
      recommendations.push('Consider permanent Soul Forging for long-term benefits');
    } else {
      recommendations.push('Focus on optimizing Soul Forging efficiency');
    }

    return recommendations;
  }

  private generateEfficiencyRecommendations(): string[] {
    const recommendations: string[] = [];
    const currentEfficiency = this.calculateCurrentEfficiency();

    if (currentEfficiency < 0.0005) {
      recommendations.push('Consider bulk Soul Forging purchases for better efficiency');
    }

    if (this._temporaryLevels > this._permanentLevels * 2) {
      recommendations.push('Balance temporary and permanent Soul Forging');
    }

    return recommendations;
  }

  private createSuccessfulTransaction(
    type: 'temporary' | 'permanent',
    amount: number,
    cost: number,
    currency: 'arcana' | 'soul_power',
    location: LocationType,
  ): SoulForgingTransaction {
    return {
      id: uuidv4(),
      type,
      amount,
      cost,
      currency,
      location,
      timestamp: Date.now(),
      success: true,
    };
  }

  private createFailedTransaction(
    type: 'temporary' | 'permanent',
    amount: number,
    cost: number,
    currency: 'arcana' | 'soul_power',
    location: LocationType,
    error: string,
  ): SoulForgingTransaction {
    return {
      id: uuidv4(),
      type,
      amount,
      cost,
      currency,
      location,
      timestamp: Date.now(),
      success: false,
      error,
    };
  }
}

/**
 * Create an enhanced Soul Forging system
 */
export function createEnhancedSoulForgingSystem(config?: EnchantConfig): EnhancedSoulForgingSystem {
  const defaultConfig = config || {
    baseCosts: {
      firepower: 10,
      scales: 10,
    },
    growthRate: 1.12,
    baseCap: 100,
    soulForgingMultiplier: 60,
    temporarySoulForgingCost: 20,
    permanentSoulForgingCost: 5000,
  };

  return new DefaultEnhancedSoulForgingSystem(defaultConfig);
}
