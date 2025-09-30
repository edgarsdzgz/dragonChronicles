/**
 * Enchant Manager
 *
 * This file implements the core enchant system that manages Firepower and Scales
 * enchants, integrates with Soul Forging, and enforces location-based spending restrictions.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  EnchantType,
  EnchantCategory,
  EnchantSystem,
  EnchantConfig,
  EnchantManager,
  EnchantTransaction,
  LocationType,
  EnchantAnalytics,
} from './enchant-types.js';
import { createEnchantCostCalculator, type EnchantCostCalculator } from './enchant-costs.js';
import { createSoulForgingSystem, type SoulForgingSystem } from './soul-forging.js';

export class DefaultEnchantManager implements EnchantManager {
  private _system: EnchantSystem;
  private _config: EnchantConfig;
  private _location: LocationType;
  private _costCalculator: EnchantCostCalculator;
  private _soulForgingSystem: SoulForgingSystem;
  private _transactions: EnchantTransaction[] = [];

  constructor(config: EnchantConfig, initialLocation: LocationType = 'draconia') {
    this._config = config;
    this._location = initialLocation;
    this._costCalculator = createEnchantCostCalculator(config);
    this._soulForgingSystem = createSoulForgingSystem(config);

    this._system = {
      temporary: {
        firepower: 0,
        scales: 0,
      },
      permanent: {
        firepower: 0,
        scales: 0,
      },
      soulForging: {
        temporary: 0,
        permanent: 0,
      },
      effective: {
        firepower: 0,
        scales: 0,
        cap: this._config.baseCap,
      },
    };

    this.updateEffectiveLevels();
  }

  get system(): EnchantSystem {
    return { ...this._system };
  }

  get config(): EnchantConfig {
    return { ...this._config };
  }

  get location(): LocationType {
    return this._location;
  }

  /**
   * Get current enchant level for a specific type and category
   */
  getEnchantLevel(type: EnchantType, category: EnchantCategory): number {
    return this._system[category][type];
  }

  /**
   * Get the effective level cap for an enchant type
   */
  getEnchantCap(type: EnchantType): number {
    return this._system.effective.cap;
  }

  /**
   * Get the cost for a specific enchant type and level
   */
  getEnchantCost(type: EnchantType, level: number): number {
    return this._costCalculator.calculateCost(type, level);
  }

  /**
   * Purchase enchant levels
   */
  purchaseEnchant(
    type: EnchantType,
    category: EnchantCategory,
    amount: number,
    currency: 'arcana' | 'soul_power',
  ): EnchantTransaction {
    // Validate location restrictions
    if (!this.canSpendCurrency(currency)) {
      return this.createFailedTransaction(
        type,
        category,
        amount,
        0,
        currency,
        this._location,
        `Cannot spend ${currency} in ${this._location}`,
      );
    }

    if (amount <= 0) {
      return this.createFailedTransaction(
        type,
        category,
        amount,
        0,
        currency,
        this._location,
        'Amount must be positive',
      );
    }

    const currentLevel = this.getEnchantLevel(type, category);
    const totalCost = this._costCalculator.getTotalCost(type, currentLevel, currentLevel + amount);

    // Check if purchase would exceed cap
    const newLevel = currentLevel + amount;
    if (newLevel > this.getEnchantCap(type)) {
      return this.createFailedTransaction(
        type,
        category,
        amount,
        totalCost,
        currency,
        this._location,
        `Purchase would exceed level cap. Current: ${currentLevel}, Cap: ${this.getEnchantCap(type)}`,
      );
    }

    // Create successful transaction
    const transaction = this.createSuccessfulTransaction(
      type,
      category,
      amount,
      totalCost,
      currency,
      this._location,
    );

    // Update enchant levels
    this._system[category][type] += amount;
    this.updateEffectiveLevels();
    this._transactions.push(transaction);

    return transaction;
  }

  /**
   * Purchase Soul Forging
   */
  purchaseSoulForging(type: 'temporary' | 'permanent', amount: number): EnchantTransaction {
    const currency = type === 'temporary' ? 'arcana' : 'soul_power';

    // Validate location restrictions
    if (!this.canSpendCurrency(currency)) {
      return this.createFailedTransaction(
        'firepower', // Dummy type for Soul Forging
        'temporary', // Dummy category
        amount,
        0,
        currency,
        this._location,
        `Cannot spend ${currency} in ${this._location}`,
      );
    }

    // Use Soul Forging system for the actual purchase
    let soulForgingTransaction;
    if (type === 'temporary') {
      soulForgingTransaction = this._soulForgingSystem.purchaseTemporarySoulForging(
        amount,
        1000000,
      ); // Mock available currency
    } else {
      soulForgingTransaction = this._soulForgingSystem.purchasePermanentSoulForging(
        amount,
        1000000,
      ); // Mock available currency
    }

    if (!soulForgingTransaction.success) {
      return this.createFailedTransaction(
        'firepower', // Dummy type
        'temporary', // Dummy category
        amount,
        soulForgingTransaction.cost,
        currency,
        this._location,
        soulForgingTransaction.error || 'Soul Forging purchase failed',
      );
    }

    // Update Soul Forging levels
    this._system.soulForging[type] += amount;
    this.updateEffectiveLevels();

    // Create enchant transaction for Soul Forging
    const transaction = this.createSuccessfulTransaction(
      'firepower', // Dummy type for Soul Forging
      'temporary', // Dummy category
      amount,
      soulForgingTransaction.cost,
      currency,
      this._location,
    );

    this._transactions.push(transaction);
    return transaction;
  }

  /**
   * Set location and validate spending restrictions
   */
  setLocation(location: LocationType): void {
    this._location = location;
  }

  /**
   * Check if a currency can be spent in the current location
   */
  canSpendCurrency(currency: 'arcana' | 'soul_power'): boolean {
    if (currency === 'arcana') {
      // Arcana can be spent anywhere during journeys
      return this._location === 'journey';
    } else if (currency === 'soul_power') {
      // Soul Power can only be spent in Draconia
      return this._location === 'draconia';
    }
    return false;
  }

  /**
   * Reset temporary enchants (called at journey end)
   */
  resetTemporaryEnchants(): void {
    this._system.temporary.firepower = 0;
    this._system.temporary.scales = 0;
    this._system.soulForging.temporary = 0;
    this._soulForgingSystem.resetTemporarySoulForging();
    this.updateEffectiveLevels();
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(): EnchantTransaction[] {
    return [...this._transactions];
  }

  /**
   * Get Soul Forging transaction history
   */
  getSoulForgingHistory(): EnchantTransaction[] {
    return this._transactions.filter((t) => t.type === 'soul_forging');
  }

  /**
   * Get enchant analytics
   */
  getAnalytics(): EnchantAnalytics {
    const transactions = this._transactions;
    const arcanaSpent = transactions
      .filter((t) => t.currency === 'arcana')
      .reduce((sum, t) => sum + t.cost, 0);
    const soulPowerSpent = transactions
      .filter((t) => t.currency === 'soul_power')
      .reduce((sum, t) => sum + t.cost, 0);

    const draconiaTransactions = transactions.filter((t) => t.location === 'draconia').length;
    const journeyTransactions = transactions.filter((t) => t.location === 'journey').length;

    const soulForgingStats = this._soulForgingSystem.getSoulForgingStats();

    return {
      totalPurchases: transactions.length,
      totalSpent: {
        arcana: arcanaSpent,
        soul_power: soulPowerSpent,
      },
      averageLevel: {
        firepower: (this._system.temporary.firepower + this._system.permanent.firepower) / 2,
        scales: (this._system.temporary.scales + this._system.permanent.scales) / 2,
      },
      soulForgingStats: {
        temporary: this._system.soulForging.temporary,
        permanent: this._system.soulForging.permanent,
        totalCapExtension: this._system.effective.cap - this._config.baseCap,
      },
      locationStats: {
        draconia: draconiaTransactions,
        journey: journeyTransactions,
      },
    };
  }

  /**
   * Update effective levels including Soul Forging
   */
  private updateEffectiveLevels(): void {
    this._system.effective.firepower =
      this._system.temporary.firepower + this._system.permanent.firepower;
    this._system.effective.scales = this._system.temporary.scales + this._system.permanent.scales;
    this._system.effective.cap = this._soulForgingSystem.calculateEffectiveCap(
      this._config.baseCap,
    );
  }

  /**
   * Create a successful transaction
   */
  private createSuccessfulTransaction(
    type: EnchantType,
    category: EnchantCategory,
    amount: number,
    cost: number,
    currency: 'arcana' | 'soul_power',
    location: LocationType,
  ): EnchantTransaction {
    return {
      id: uuidv4(),
      type: 'purchase',
      enchantType: type,
      category,
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
    type: EnchantType,
    category: EnchantCategory,
    amount: number,
    cost: number,
    currency: 'arcana' | 'soul_power',
    location: LocationType,
    error: string,
  ): EnchantTransaction {
    return {
      id: uuidv4(),
      type: 'purchase',
      enchantType: type,
      category,
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
 * Create a default enchant manager
 */
export function createEnchantManager(
  config?: EnchantConfig,
  initialLocation?: LocationType,
): EnchantManager {
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

  return new DefaultEnchantManager(defaultConfig, initialLocation);
}

/**
 * Utility functions for enchant management
 */
export function validateEnchantPurchase(
  type: EnchantType,
  category: EnchantCategory,
  amount: number,
  currentLevel: number,
  cap: number,
  currency: 'arcana' | 'soul_power',
  location: LocationType,
): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be positive' };
  }

  if (currentLevel + amount > cap) {
    return { valid: false, error: 'Purchase would exceed level cap' };
  }

  // Validate location restrictions
  if (currency === 'arcana' && location !== 'journey') {
    return { valid: false, error: 'Arcana can only be spent during journeys' };
  }

  if (currency === 'soul_power' && location !== 'draconia') {
    return { valid: false, error: 'Soul Power can only be spent in Draconia' };
  }

  return { valid: true };
}

/**
 * Performance testing for enchant operations
 */
export function benchmarkEnchantOperations(iterations: number = 1000): {
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalTime: number;
} {
  const manager = createEnchantManager();
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    manager.getEnchantLevel('firepower', 'temporary');
    manager.getEnchantCap('firepower');
    manager.getEnchantCost('firepower', i % 100);

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
