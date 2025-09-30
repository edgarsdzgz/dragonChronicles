/**
 * Soul Forging Cost Calculations
 *
 * This file implements advanced cost calculations for Soul Forging,
 * including progression-based scaling, bulk purchase optimization,
 * and cost prediction tools.
 */

import type { EnchantConfig } from './enchant-types.js';

export interface SoulForgingCostCalculation {
  baseCost: number;
  progressionMultiplier: number;
  bulkDiscount: number;
  finalCost: number;
  costPerLevel: number;
  totalSavings: number;
}

export interface SoulForgingCostPrediction {
  level: number;
  cost: number;
  cumulativeCost: number;
  efficiency: number;
  recommendation: 'buy' | 'wait' | 'optimize';
}

export interface SoulForgingBulkPurchase {
  amount: number;
  totalCost: number;
  averageCostPerLevel: number;
  savings: number;
  efficiency: number;
}

export interface SoulForgingCostOptimizer {
  calculateOptimalPurchase(
    availableCurrency: number,
    type: 'temporary' | 'permanent',
    currentLevels: number,
  ): SoulForgingCostPrediction;
  calculateBulkPurchase(
    amount: number,
    type: 'temporary' | 'permanent',
    currentLevels: number,
  ): SoulForgingBulkPurchase;
  calculateCostProgression(
    fromLevel: number,
    toLevel: number,
    type: 'temporary' | 'permanent',
  ): SoulForgingCostCalculation;
  getCostEfficiency(type: 'temporary' | 'permanent', currentLevels: number): number;
}

export class DefaultSoulForgingCostOptimizer implements SoulForgingCostOptimizer {
  private config: EnchantConfig;

  constructor(config: EnchantConfig) {
    this.config = config;
  }

  /**
   * Calculate optimal purchase recommendation
   */
  calculateOptimalPurchase(
    availableCurrency: number,
    type: 'temporary' | 'permanent',
    currentLevels: number,
  ): SoulForgingCostPrediction {
    const maxAffordable = this.calculateMaxAffordable(availableCurrency, type, currentLevels);
    const cost = this.calculateSingleCost(type, currentLevels + maxAffordable);
    const cumulativeCost = this.calculateCumulativeCost(type, currentLevels, maxAffordable);
    const efficiency = this.calculateEfficiency(type, currentLevels + maxAffordable);

    let recommendation: 'buy' | 'wait' | 'optimize' = 'buy';
    if (efficiency < 0.0001) {
      recommendation = 'wait';
    } else if (efficiency < 0.0005) {
      recommendation = 'optimize';
    }

    return {
      level: currentLevels + maxAffordable,
      cost,
      cumulativeCost,
      efficiency,
      recommendation,
    };
  }

  /**
   * Calculate bulk purchase details
   */
  calculateBulkPurchase(
    amount: number,
    type: 'temporary' | 'permanent',
    currentLevels: number,
  ): SoulForgingBulkPurchase {
    const totalCost = this.calculateCumulativeCost(type, currentLevels, amount);
    const averageCostPerLevel = totalCost / amount;
    const singleCost = this.calculateSingleCost(type, currentLevels + amount);
    const savings = singleCost * amount - totalCost;
    const efficiency = this.calculateEfficiency(type, currentLevels + amount);

    return {
      amount,
      totalCost,
      averageCostPerLevel,
      savings,
      efficiency,
    };
  }

  /**
   * Calculate cost progression from one level to another
   */
  calculateCostProgression(
    fromLevel: number,
    toLevel: number,
    type: 'temporary' | 'permanent',
  ): SoulForgingCostCalculation {
    const baseCost = this.getBaseCost(type);
    const progressionMultiplier = this.calculateProgressionMultiplier(type, fromLevel);
    const bulkDiscount = this.calculateBulkDiscount(toLevel - fromLevel);
    const finalCost = this.calculateCumulativeCost(type, fromLevel, toLevel - fromLevel);
    const costPerLevel = finalCost / (toLevel - fromLevel);
    const totalSavings = this.calculateTotalSavings(type, fromLevel, toLevel - fromLevel);

    return {
      baseCost,
      progressionMultiplier,
      bulkDiscount,
      finalCost,
      costPerLevel,
      totalSavings,
    };
  }

  /**
   * Get cost efficiency for a given level
   */
  getCostEfficiency(type: 'temporary' | 'permanent', currentLevels: number): number {
    return this.calculateEfficiency(type, currentLevels);
  }

  // Private helper methods

  private calculateMaxAffordable(
    availableCurrency: number,
    type: 'temporary' | 'permanent',
    currentLevels: number,
  ): number {
    let maxAffordable = 0;
    let totalCost = 0;

    while (totalCost <= availableCurrency) {
      const nextCost = this.calculateSingleCost(type, currentLevels + maxAffordable + 1);
      if (totalCost + nextCost > availableCurrency) {
        break;
      }
      totalCost += nextCost;
      maxAffordable++;
    }

    return maxAffordable;
  }

  public calculateSingleCost(type: 'temporary' | 'permanent', level: number): number {
    if (type === 'temporary') {
      return this.calculateTemporaryCost(level);
    } else {
      return this.calculatePermanentCost(level);
    }
  }

  private calculateTemporaryCost(level: number): number {
    const baseCost = this.config.temporarySoulForgingCost;
    const multiplier = Math.pow(this.config.growthRate, level);
    return Math.floor(baseCost * multiplier);
  }

  private calculatePermanentCost(level: number): number {
    return this.config.permanentSoulForgingCost;
  }

  public calculateCumulativeCost(
    type: 'temporary' | 'permanent',
    fromLevel: number,
    amount: number,
  ): number {
    let totalCost = 0;
    for (let i = 0; i < amount; i++) {
      totalCost += this.calculateSingleCost(type, fromLevel + i);
    }
    return totalCost;
  }

  private calculateEfficiency(type: 'temporary' | 'permanent', level: number): number {
    const cost = this.calculateSingleCost(type, level);
    const benefit = this.config.soulForgingMultiplier; // +60 levels per Soul Forging
    return benefit / cost;
  }

  private getBaseCost(type: 'temporary' | 'permanent'): number {
    if (type === 'temporary') {
      return this.config.temporarySoulForgingCost;
    } else {
      return this.config.permanentSoulForgingCost;
    }
  }

  private calculateProgressionMultiplier(type: 'temporary' | 'permanent', level: number): number {
    if (type === 'temporary') {
      return Math.pow(this.config.growthRate, level);
    } else {
      return 1; // Permanent costs don't scale
    }
  }

  private calculateBulkDiscount(amount: number): number {
    // Bulk discount increases with amount
    if (amount >= 10) return 0.1; // 10% discount for 10+ levels
    if (amount >= 5) return 0.05; // 5% discount for 5+ levels
    return 0;
  }

  private calculateTotalSavings(
    type: 'temporary' | 'permanent',
    fromLevel: number,
    amount: number,
  ): number {
    const bulkDiscount = this.calculateBulkDiscount(amount);
    const totalCost = this.calculateCumulativeCost(type, fromLevel, amount);
    return totalCost * bulkDiscount;
  }
}

/**
 * Utility functions for Soul Forging cost calculations
 */
export function calculateSoulForgingCostFromConfig(
  type: 'temporary' | 'permanent',
  level: number,
  config: EnchantConfig,
): number {
  const optimizer = new DefaultSoulForgingCostOptimizer(config);
  return optimizer.calculateSingleCost(type, level);
}

export function calculateSoulForgingBulkCost(
  type: 'temporary' | 'permanent',
  fromLevel: number,
  amount: number,
  config: EnchantConfig,
): number {
  const optimizer = new DefaultSoulForgingCostOptimizer(config);
  return optimizer.calculateCumulativeCost(type, fromLevel, amount);
}

export function getSoulForgingEfficiency(
  type: 'temporary' | 'permanent',
  level: number,
  config: EnchantConfig,
): number {
  const optimizer = new DefaultSoulForgingCostOptimizer(config);
  return optimizer.getCostEfficiency(type, level);
}

export function calculateOptimalSoulForgingPurchase(
  availableCurrency: number,
  type: 'temporary' | 'permanent',
  currentLevels: number,
  config: EnchantConfig,
): SoulForgingCostPrediction {
  const optimizer = new DefaultSoulForgingCostOptimizer(config);
  return optimizer.calculateOptimalPurchase(availableCurrency, type, currentLevels);
}

/**
 * Create a Soul Forging cost optimizer
 */
export function createSoulForgingCostOptimizer(config?: EnchantConfig): SoulForgingCostOptimizer {
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

  return new DefaultSoulForgingCostOptimizer(defaultConfig);
}

/**
 * Performance testing for Soul Forging cost calculations
 */
export function benchmarkSoulForgingCostCalculation(
  iterations: number = 1000,
  config?: EnchantConfig,
): {
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalTime: number;
} {
  const optimizer = createSoulForgingCostOptimizer(config);
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    optimizer.calculateOptimalPurchase(10000, 'temporary', i % 10);
    optimizer.calculateBulkPurchase(5, 'permanent', i % 5);
    optimizer.getCostEfficiency('temporary', i % 20);

    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return {
    averageTime,
    minTime,
    maxTime,
    totalTime,
  };
}
