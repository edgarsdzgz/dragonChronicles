/**
 * Arcana drop manager for handling Arcana drops and balance
 *
 * This module manages the core Arcana drop system, including
 * drop calculations, balance tracking, and integration with
 * the combat system.
 */

import type {
  ArcanaDropManager,
  ArcanaBalance,
  ArcanaDrop,
  ArcanaSource,
  ArcanaDropConfig,
  EnemyType,
  BossType as _BossType,
  EconomicEvent,
} from './types.js';
import { createArcanaScaling, type ArcanaScaling } from './arcana-scaling.js';

/**
 * Arcana drop manager implementation
 */
export class DefaultArcanaDropManager implements ArcanaDropManager {
  private _balance: ArcanaBalance;
  private _config: ArcanaDropConfig;
  private _scaling: ArcanaScaling;
  private _journeyId: string;

  constructor(config: ArcanaDropConfig, journeyId: string = `journey_${Date.now()}`) {
    this._config = config;
    this._journeyId = journeyId;
    this._scaling = createArcanaScaling(config);

    this._balance = {
      current: 0,
      totalEarned: 0,
      totalSpent: 0,
      drops: [],
      journeyStartTime: Date.now(),
    };
  }

  /**
   * Get current Arcana balance
   */
  get balance(): ArcanaBalance {
    return { ...this._balance };
  }

  /**
   * Get drop configuration
   */
  get config(): ArcanaDropConfig {
    return { ...this._config };
  }

  /**
   * Drop Arcana from a source
   */
  dropArcana(amount: number, source: ArcanaSource): void {
    if (amount <= 0) {
      return;
    }

    const drop: ArcanaDrop = {
      amount,
      source,
      timestamp: Date.now(),
      scalingFactor: 1.0, // Will be calculated by scaling system
      baseAmount: amount,
    };

    // Add to balance
    this._balance.current += amount;
    this._balance.totalEarned += amount;
    this._balance.drops.push(drop);

    // Emit economic event
    this.emitEconomicEvent({
      type: 'arcana_drop',
      data: drop,
      timestamp: Date.now(),
    });
  }

  /**
   * Calculate drop amount for an enemy
   */
  calculateDropAmount(enemyType: EnemyType, distance: number, ward: number): number {
    const result = this._scaling.calculateDropAmount(enemyType, distance, ward);
    return result.finalAmount;
  }

  /**
   * Collect Arcana (add to balance)
   */
  collectArcana(amount: number): void {
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
   * Reset for new journey
   */
  resetForNewJourney(): void {
    this._journeyId = `journey_${Date.now()}`;
    this._balance = {
      current: 0,
      totalEarned: 0,
      totalSpent: 0,
      drops: [],
      journeyStartTime: Date.now(),
    };

    // Emit reset event
    this.emitEconomicEvent({
      type: 'arcana_reset',
      data: { journeyId: this._journeyId },
      timestamp: Date.now(),
    });
  }

  /**
   * Get drop history
   */
  getDropHistory(): ArcanaDrop[] {
    return [...this._balance.drops];
  }

  /**
   * Spend Arcana
   */
  spendArcana(amount: number, reason: string): boolean {
    if (amount <= 0 || this._balance.current < amount) {
      return false;
    }

    this._balance.current -= amount;
    this._balance.totalSpent += amount;

    // Emit spend event
    this.emitEconomicEvent({
      type: 'arcana_spend',
      data: { amount, reason },
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Get journey statistics
   */
  getJourneyStats(): {
    totalEarned: number;
    totalSpent: number;
    netGain: number;
    dropCount: number;
    journeyDuration: number;
  } {
    const now = Date.now();
    return {
      totalEarned: this._balance.totalEarned,
      totalSpent: this._balance.totalSpent,
      netGain: this._balance.totalEarned - this._balance.totalSpent,
      dropCount: this._balance.drops.length,
      journeyDuration: now - this._balance.journeyStartTime,
    };
  }

  /**
   * Get drops by source type
   */
  getDropsBySource(sourceType: ArcanaSource['type']): ArcanaDrop[] {
    return this._balance.drops.filter((drop) => drop.source.type === sourceType);
  }

  /**
   * Get total drops by source type
   */
  getTotalDropsBySource(sourceType: ArcanaSource['type']): number {
    return this.getDropsBySource(sourceType).reduce((total, drop) => total + drop.amount, 0);
  }

  /**
   * Emit economic event (placeholder for event system integration)
   */
  private emitEconomicEvent(event: EconomicEvent): void {
    // TODO: Integrate with event system when available
    console.log('Economic event:', event);
  }
}

/**
 * Create a new Arcana drop manager
 */
export function createArcanaDropManager(
  config?: ArcanaDropConfig,
  journeyId?: string,
): ArcanaDropManager {
  const defaultConfig = config || {
    baseDropAmount: 10,
    distanceScalingFactor: 1.05,
    wardScalingFactor: 1.15,
    bossRewardMultiplier: 5.0,
    eliteMultiplier: 2.0,
    miniBossMultiplier: 3.0,
  };

  return new DefaultArcanaDropManager(defaultConfig, journeyId);
}

/**
 * Create Arcana drop manager with default configuration
 */
export function createDefaultArcanaDropManager(journeyId?: string): ArcanaDropManager {
  return createArcanaDropManager(undefined, journeyId);
}
