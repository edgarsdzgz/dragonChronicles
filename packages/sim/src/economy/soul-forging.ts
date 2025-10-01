/**
 * Soul Forging System
 *
 * This file implements the Soul Forging system that allows players to extend
 * their enchant level caps through temporary (Arcana) and permanent (Soul Power) upgrades.
 */

import { v4 as uuidv4 } from 'uuid';
import type { EnchantConfig, SoulForgingTransaction, LocationType } from './enchant-types.js';
import { createEnchantCostCalculator, type EnchantCostCalculator } from './enchant-costs.js';

export interface SoulForgingSystem {
  readonly temporaryLevels: number;
  readonly permanentLevels: number;
  readonly totalCapExtension: number;
  readonly config: EnchantConfig;

  // Soul Forging operations
  purchaseTemporarySoulForging(_amount: number, _availableArcana: number): SoulForgingTransaction;
  purchasePermanentSoulForging(
    _amount: number,
    _availableSoulPower: number,
  ): SoulForgingTransaction;

  // Cap calculations
  calculateEffectiveCap(_baseCap: number): number;
  calculateTemporaryCost(_amount: number, _currentLevels: number): number;
  calculatePermanentCost(_amount: number): number;

  // State management
  resetTemporarySoulForging(): void;
  getSoulForgingHistory(): SoulForgingTransaction[];
  getSoulForgingStats(): SoulForgingStats;
}

export interface SoulForgingStats {
  totalTemporaryPurchases: number;
  totalPermanentPurchases: number;
  totalArcanaSpent: number;
  totalSoulPowerSpent: number;
  averageTemporaryCost: number;
  averagePermanentCost: number;
  totalCapExtension: number;
}

export class DefaultSoulForgingSystem implements SoulForgingSystem {
  private _temporaryLevels: number = 0;
  private _permanentLevels: number = 0;
  private _transactions: SoulForgingTransaction[] = [];
  private _config: EnchantConfig;
  private _costCalculator: EnchantCostCalculator;

  constructor(config: EnchantConfig) {
    this._config = config;
    this._costCalculator = createEnchantCostCalculator(config);
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

  get config(): EnchantConfig {
    return { ...this._config };
  }

  /**
   * Purchase temporary Soul Forging using Arcana
   * Can only be done during journeys
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

    const transaction = this.createSuccessfulTransaction(
      'temporary',
      amount,
      cost,
      'arcana',
      'journey',
    );

    this._transactions.push(transaction);
    return transaction;
  }

  /**
   * Purchase permanent Soul Forging using Soul Power
   * Can only be done in Draconia
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

    const transaction = this.createSuccessfulTransaction(
      'permanent',
      amount,
      cost,
      'soul_power',
      'draconia',
    );

    this._transactions.push(transaction);
    return transaction;
  }

  /**
   * Calculate the effective level cap including Soul Forging
   */
  calculateEffectiveCap(baseCap: number): number {
    return baseCap + this.totalCapExtension;
  }

  /**
   * Calculate cost for temporary Soul Forging
   * Based on current enchant levels and Soul Forging amount
   */
  calculateTemporaryCost(amount: number, currentLevels: number): number {
    // Use a base cost that scales with current Soul Forging levels
    const baseCost = this._config.temporarySoulForgingCost;
    const multiplier = Math.pow(this._config.growthRate, currentLevels);
    return Math.floor(baseCost * multiplier * amount);
  }

  /**
   * Calculate cost for permanent Soul Forging
   * Fixed high cost regardless of current levels
   */
  calculatePermanentCost(amount: number): number {
    return this._config.permanentSoulForgingCost * amount;
  }

  /**
   * Reset temporary Soul Forging (called at journey end)
   */
  resetTemporarySoulForging(): void {
    this._temporaryLevels = 0;
  }

  /**
   * Get transaction history
   */
  getSoulForgingHistory(): SoulForgingTransaction[] {
    return [...this._transactions];
  }

  /**
   * Get Soul Forging statistics
   */
  getSoulForgingStats(): SoulForgingStats {
    const temporaryTransactions = this._transactions.filter((t) => t.type === 'temporary');
    const permanentTransactions = this._transactions.filter((t) => t.type === 'permanent');

    const totalArcanaSpent = temporaryTransactions.reduce((sum, t) => sum + t.cost, 0);
    const totalSoulPowerSpent = permanentTransactions.reduce((sum, t) => sum + t.cost, 0);

    const averageTemporaryCost =
      temporaryTransactions.length > 0 ? totalArcanaSpent / temporaryTransactions.length : 0;

    const averagePermanentCost =
      permanentTransactions.length > 0 ? totalSoulPowerSpent / permanentTransactions.length : 0;

    return {
      totalTemporaryPurchases: temporaryTransactions.length,
      totalPermanentPurchases: permanentTransactions.length,
      totalArcanaSpent,
      totalSoulPowerSpent,
      averageTemporaryCost,
      averagePermanentCost,
      totalCapExtension: this.totalCapExtension,
    };
  }

  /**
   * Create a successful transaction
   */
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

  /**
   * Create a failed transaction
   */
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
 * Create a default Soul Forging system
 */
export function createSoulForgingSystem(config?: EnchantConfig): SoulForgingSystem {
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

  return new DefaultSoulForgingSystem(defaultConfig);
}

/**
 * Utility functions for Soul Forging
 */
export function calculateSoulForgingCapExtension(
  temporaryLevels: number,
  permanentLevels: number,
  multiplier: number = 60,
): number {
  return (temporaryLevels + permanentLevels) * multiplier;
}

export function validateSoulForgingPurchase(
  type: 'temporary' | 'permanent',
  amount: number,
  availableCurrency: number,
  config: EnchantConfig,
): { valid: boolean; cost: number; error?: string } {
  if (amount <= 0) {
    return { valid: false, cost: 0, error: 'Amount must be positive' };
  }

  let cost: number;
  if (type === 'temporary') {
    cost = config.temporarySoulForgingCost * amount;
  } else {
    cost = config.permanentSoulForgingCost * amount;
  }

  if (availableCurrency < cost) {
    return {
      valid: false,
      cost,
      error: `Insufficient currency. Required: ${cost}, Available: ${availableCurrency}`,
    };
  }

  return { valid: true, cost };
}

/**
 * Performance testing for Soul Forging calculations
 */
export function benchmarkSoulForgingCalculation(iterations: number = 1000): {
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalTime: number;
} {
  const system = createSoulForgingSystem();
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    system.calculateEffectiveCap(100);
    system.calculateTemporaryCost(1, i % 10);
    system.calculatePermanentCost(1);

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
