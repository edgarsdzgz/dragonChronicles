/**
 * Enchant Cost Calculation System
 *
 * This file implements the geometric cost progression system for enchants
 * and Soul Forging, with proper validation and error handling.
 */

import type {
  EnchantType,
  EnchantConfig,
  EnchantCost,
  EnchantCostCalculator,
} from './enchant-types.js';

// Re-export the interface for external use
export type { EnchantCostCalculator };

export class DefaultEnchantCostCalculator implements EnchantCostCalculator {
  private config: EnchantConfig;

  constructor(config: EnchantConfig) {
    this.config = config;
  }

  /**
   * Calculate the cost for a specific enchant type and level
   * Formula: cost(level) = baseCost * growthRate^level
   */
  calculateCost(type: EnchantType, level: number): number {
    if (level < 0) {
      throw new Error(`Invalid enchant level: ${level}. Level must be non-negative.`);
    }

    const baseCost = this.config.baseCosts[type];
    const growthRate = this.config.growthRate;

    // Handle level 0 case
    if (level === 0) {
      return baseCost;
    }

    const cost = baseCost * Math.pow(growthRate, level);
    return Math.floor(cost);
  }

  /**
   * Calculate Soul Forging costs
   * Temporary: 15-25× last level cost (Arcana)
   * Permanent: High Soul Power cost
   */
  calculateSoulForgingCost(
    type: 'temporary' | 'permanent',
    currentLevel: number,
    baseCost: number,
  ): number {
    if (type === 'temporary') {
      // Temporary Soul Forging: 15-25× last level cost
      const multiplier = this.config.temporarySoulForgingCost;
      return Math.floor(baseCost * multiplier);
    } else {
      // Permanent Soul Forging: High Soul Power cost
      return this.config.permanentSoulForgingCost;
    }
  }

  /**
   * Calculate total cost for upgrading from one level to another
   */
  getTotalCost(type: EnchantType, fromLevel: number, toLevel: number): number {
    if (fromLevel < 0 || toLevel < fromLevel) {
      throw new Error(`Invalid level range: ${fromLevel} to ${toLevel}`);
    }

    if (fromLevel === toLevel) {
      return 0;
    }

    let totalCost = 0;
    for (let level = fromLevel; level < toLevel; level++) {
      totalCost += this.calculateCost(type, level);
    }

    return totalCost;
  }

  /**
   * Get detailed cost information for an enchant type and level
   */
  getEnchantCostInfo(type: EnchantType, level: number): EnchantCost {
    const baseCost = this.config.baseCosts[type];
    const growthRate = this.config.growthRate;
    const currentCost = this.calculateCost(type, level);
    const nextCost = this.calculateCost(type, level + 1);

    return {
      baseCost,
      growthRate,
      currentCost,
      nextCost,
    };
  }

  /**
   * Calculate the effective level cap including Soul Forging
   */
  calculateEffectiveCap(
    baseCap: number,
    temporarySoulForging: number,
    permanentSoulForging: number,
  ): number {
    const soulForgingExtension =
      (temporarySoulForging + permanentSoulForging) * this.config.soulForgingMultiplier;
    return baseCap + soulForgingExtension;
  }

  /**
   * Calculate Soul Forging cost based on current enchant levels
   */
  calculateSoulForgingCostFromLevels(
    type: 'temporary' | 'permanent',
    firepowerLevel: number,
    scalesLevel: number,
  ): number {
    // Use the higher of the two enchant levels for cost calculation
    const maxLevel = Math.max(firepowerLevel, scalesLevel);
    const baseCost = Math.max(
      this.calculateCost('firepower', maxLevel),
      this.calculateCost('scales', maxLevel),
    );

    return this.calculateSoulForgingCost(type, maxLevel, baseCost);
  }

  /**
   * Get cost breakdown for multiple enchant purchases
   */
  getBulkPurchaseCost(
    purchases: Array<{ type: EnchantType; fromLevel: number; toLevel: number }>,
  ): number {
    return purchases.reduce((total, purchase) => {
      return total + this.getTotalCost(purchase.type, purchase.fromLevel, purchase.toLevel);
    }, 0);
  }

  /**
   * Validate if a purchase is affordable
   */
  canAffordPurchase(
    type: EnchantType,
    fromLevel: number,
    toLevel: number,
    availableCurrency: number,
  ): boolean {
    const totalCost = this.getTotalCost(type, fromLevel, toLevel);
    return availableCurrency >= totalCost;
  }

  /**
   * Get the maximum level affordable with given currency
   */
  getMaxAffordableLevel(type: EnchantType, fromLevel: number, availableCurrency: number): number {
    let maxLevel = fromLevel;
    let totalCost = 0;

    while (totalCost <= availableCurrency) {
      const nextLevelCost = this.calculateCost(type, maxLevel);
      if (totalCost + nextLevelCost > availableCurrency) {
        break;
      }
      totalCost += nextLevelCost;
      maxLevel++;
    }

    return maxLevel;
  }
}

/**
 * Create a default enchant cost calculator
 */
export function createEnchantCostCalculator(config?: EnchantConfig): EnchantCostCalculator {
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

  return new DefaultEnchantCostCalculator(defaultConfig);
}

/**
 * Utility functions for cost calculations
 */
export function calculateEnchantCost(
  type: EnchantType,
  level: number,
  config?: EnchantConfig,
): number {
  const calculator = createEnchantCostCalculator(config);
  return calculator.calculateCost(type, level);
}

export function calculateSoulForgingCost(
  type: 'temporary' | 'permanent',
  currentLevel: number,
  baseCost: number,
  config?: EnchantConfig,
): number {
  const calculator = createEnchantCostCalculator(config);
  return calculator.calculateSoulForgingCost(type, currentLevel, baseCost);
}

export function calculateTotalEnchantCost(
  type: EnchantType,
  fromLevel: number,
  toLevel: number,
  config?: EnchantConfig,
): number {
  const calculator = createEnchantCostCalculator(config);
  return calculator.getTotalCost(type, fromLevel, toLevel);
}

/**
 * Cost validation utilities
 */
export function validateEnchantLevel(level: number): boolean {
  return Number.isInteger(level) && level >= 0;
}

export function validateCostCalculation(
  type: EnchantType,
  level: number,
  expectedCost: number,
  config?: EnchantConfig,
): boolean {
  const calculatedCost = calculateEnchantCost(type, level, config);
  return Math.abs(calculatedCost - expectedCost) < 0.01; // Allow for floating point precision
}

/**
 * Performance testing utilities
 */
export function benchmarkCostCalculation(
  type: EnchantType,
  maxLevel: number,
  iterations: number = 1000,
): {
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalTime: number;
} {
  const calculator = createEnchantCostCalculator();
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    for (let level = 0; level < maxLevel; level++) {
      calculator.calculateCost(type, level);
    }

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
