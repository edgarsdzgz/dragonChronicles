/**
 * Soul Power drop manager for handling Soul Power drops and balance
 *
 * This module manages the core Soul Power drop system, including
 * chance-based drops, balance tracking, and integration with
 * the combat system. Soul Power is permanent and never lost.
 */

import type {
  SoulPowerDropManager,
  SoulPowerBalance,
  SoulPowerDrop,
  SoulPowerSource,
  SoulPowerDropConfig,
  SoulPowerScalingResult,
  EnemyType,
  BossType as _BossType,
  EconomicEvent,
} from './types.js';
import { createSoulPowerScaling, type SoulPowerScaling } from './soul-power-scaling.js';

/**
 * Soul Power drop manager implementation
 */
export class DefaultSoulPowerDropManager implements SoulPowerDropManager {
  private _balance: SoulPowerBalance;
  private _config: SoulPowerDropConfig;
  private _scaling: SoulPowerScaling;

  constructor(config: SoulPowerDropConfig) {
    this._config = config;
    this._scaling = createSoulPowerScaling(config);

    this._balance = {
      current: 0,
      totalEarned: 0,
      totalSpent: 0,
      drops: [],
      accountStartTime: Date.now(),
    };
  }

  /**
   * Get current Soul Power balance
   */
  get balance(): SoulPowerBalance {
    return { ...this._balance };
  }

  /**
   * Get drop configuration
   */
  get config(): SoulPowerDropConfig {
    return { ...this._config };
  }

  /**
   * Drop Soul Power from a source
   */
  dropSoulPower(
    amount: number,
    source: SoulPowerSource,
    dropChance: number,
    scalingFactor: number = 1.0,
  ): void {
    if (amount <= 0) {
      return;
    }

    // Apply scaling to amount and chance
    const scaledAmount = Math.floor(amount * scalingFactor);
    const scaledChance = Math.min(dropChance * scalingFactor, 1.0); // Cap at 100%

    const drop: SoulPowerDrop = {
      amount: scaledAmount,
      source,
      timestamp: Date.now(),
      scalingFactor,
      baseAmount: amount,
      dropChance: scaledChance,
    };

    // Add to balance (permanent)
    this._balance.current += scaledAmount;
    this._balance.totalEarned += scaledAmount;
    this._balance.drops.push(drop);

    // Emit economic event
    this.emitEconomicEvent({
      type: 'soul_power_drop',
      data: drop,
      timestamp: Date.now(),
    });
  }

  /**
   * Calculate drop chance and amount for an enemy
   */
  calculateSoulPowerDrop(
    enemyType: EnemyType,
    distance: number,
    ward: number,
    arcanaAmount: number,
  ): SoulPowerScalingResult {
    return this._scaling.calculateSoulPowerDrop(enemyType, distance, ward, arcanaAmount);
  }

  /**
   * Collect Soul Power (add to balance)
   */
  collectSoulPower(amount: number): void {
    if (amount <= 0) {
      return;
    }

    this._balance.current += amount;
    this._balance.totalEarned += amount;
  }

  /**
   * Get current balance
   */
  getCurrentBalance(): number {
    return this._balance.current;
  }

  /**
   * Spend Soul Power (permanent)
   */
  spendSoulPower(amount: number, reason: string): boolean {
    if (amount <= 0 || this._balance.current < amount) {
      return false;
    }

    this._balance.current -= amount;
    this._balance.totalSpent += amount;

    // Emit spend event
    this.emitEconomicEvent({
      type: 'soul_power_spend',
      data: { amount, reason },
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Get drop history
   */
  getDropHistory(): SoulPowerDrop[] {
    return [...this._balance.drops];
  }

  /**
   * Get lifetime statistics
   */
  getLifetimeStats(): {
    totalEarned: number;
    totalSpent: number;
    netGain: number;
    dropCount: number;
    accountAge: number;
  } {
    const now = Date.now();
    return {
      totalEarned: this._balance.totalEarned,
      totalSpent: this._balance.totalSpent,
      netGain: this._balance.totalEarned - this._balance.totalSpent,
      dropCount: this._balance.drops.length,
      accountAge: now - this._balance.accountStartTime,
    };
  }

  /**
   * Get drops by source type
   */
  getDropsBySource(sourceType: SoulPowerSource['type']): SoulPowerDrop[] {
    return this._balance.drops.filter((drop) => drop.source.type === sourceType);
  }

  /**
   * Get total drops by source type
   */
  getTotalDropsBySource(sourceType: SoulPowerSource['type']): number {
    return this.getDropsBySource(sourceType).reduce((total, drop) => total + drop.amount, 0);
  }

  /**
   * Get drops by enemy type
   */
  getDropsByEnemyType(enemyType: EnemyType): SoulPowerDrop[] {
    return this._balance.drops.filter((drop) => {
      return drop.source.type === 'enemy_kill' && drop.source.enemyId?.includes(enemyType);
    });
  }

  /**
   * Get drop rate statistics
   */
  getDropRateStats(): {
    totalAttempts: number;
    successfulDrops: number;
    dropRate: number;
    averageDropAmount: number;
    totalSoulPowerEarned: number;
  } {
    const enemyKills = this.getDropsBySource('enemy_kill');
    const totalAttempts = this._balance.drops.length; // This is a simplified calculation
    const successfulDrops = enemyKills.length;
    const dropRate = totalAttempts > 0 ? successfulDrops / totalAttempts : 0;
    const averageDropAmount =
      successfulDrops > 0
        ? enemyKills.reduce((sum, drop) => sum + drop.amount, 0) / successfulDrops
        : 0;
    const totalSoulPowerEarned = this._balance.totalEarned;

    return {
      totalAttempts,
      successfulDrops,
      dropRate,
      averageDropAmount,
      totalSoulPowerEarned,
    };
  }

  /**
   * Get scaling statistics
   */
  getScalingStats(): {
    averageDistance: number;
    averageWard: number;
    averageScalingFactor: number;
    maxScalingFactor: number;
    minScalingFactor: number;
  } {
    const drops = this._balance.drops;
    if (drops.length === 0) {
      return {
        averageDistance: 0,
        averageWard: 0,
        averageScalingFactor: 1.0,
        maxScalingFactor: 1.0,
        minScalingFactor: 1.0,
      };
    }

    const distances = drops.map((drop) => drop.source.distance || 0);
    const wards = drops.map((drop) => drop.source.ward || 0);
    const scalingFactors = drops.map((drop) => drop.scalingFactor);

    return {
      averageDistance: distances.reduce((sum, dist) => sum + dist, 0) / distances.length,
      averageWard: wards.reduce((sum, ward) => sum + ward, 0) / wards.length,
      averageScalingFactor:
        scalingFactors.reduce((sum, factor) => sum + factor, 0) / scalingFactors.length,
      maxScalingFactor: Math.max(...scalingFactors),
      minScalingFactor: Math.min(...scalingFactors),
    };
  }

  /**
   * Emit economic event (placeholder for event system integration)
   */
  private emitEconomicEvent(event: EconomicEvent): void {
    // TODO: Integrate with event system when available
    console.log('Soul Power economic event:', event);
  }
}

/**
 * Create a new Soul Power drop manager
 */
export function createSoulPowerDropManager(config?: SoulPowerDropConfig): SoulPowerDropManager {
  const defaultConfig = config || {
    baseDropChance: 0.03, // 3%
    baseDropPercentage: 0.02, // 2% of Arcana
    minDropAmount: 1,
    maxDropAmount: 10,
    distanceScalingFactor: 1.02, // Slower than Arcana
    wardScalingFactor: 1.08, // Slower than Arcana
    bossChanceMultiplier: 2.0,
    bossAmountMultiplier: 3.0,
    eliteChanceMultiplier: 1.5,
    eliteAmountMultiplier: 2.0,
    miniBossChanceMultiplier: 1.8,
    miniBossAmountMultiplier: 2.5,
  };

  return new DefaultSoulPowerDropManager(defaultConfig);
}

/**
 * Create Soul Power drop manager with default configuration
 */
export function createDefaultSoulPowerDropManager(): SoulPowerDropManager {
  return createSoulPowerDropManager();
}
