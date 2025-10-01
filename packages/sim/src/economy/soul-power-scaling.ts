/**
 * Soul Power scaling system for chance-based drop calculations
 *
 * This module handles the scaling of Soul Power drops based on distance
 * traveled and ward progression, with chance-based mechanics and slower
 * scaling than Arcana to maintain rarity.
 */

import type {
  SoulPowerScaling,
  SoulPowerScalingResult,
  SoulPowerDropConfig,
  EnemyType,
  BossType,
} from './types.js';

// Re-export the interface for external use
export type { SoulPowerScaling };

/**
 * Default Soul Power drop configuration
 */
export const DEFAULT_SOUL_POWER_CONFIG: SoulPowerDropConfig = {
  baseDropChance: 0.03, // 3% base chance
  baseDropPercentage: 0.02, // 2% of Arcana amount
  minDropAmount: 1,
  maxDropAmount: 10,
  distanceScalingFactor: 1.03, // Slower than Arcana (1.05) but more noticeable
  wardScalingFactor: 1.1, // Slower than Arcana (1.15) but more noticeable
  bossChanceMultiplier: 2.0,
  bossAmountMultiplier: 3.0,
  eliteChanceMultiplier: 1.5,
  eliteAmountMultiplier: 2.0,
  miniBossChanceMultiplier: 1.8,
  miniBossAmountMultiplier: 2.5,
};

/**
 * Base drop chances by enemy type
 */
const ENEMY_BASE_CHANCES: Record<EnemyType, number> = {
  basic: 0.03, // 3%
  elite: 0.045, // 4.5%
  boss: 0.06, // 6%
  mini_boss: 0.054, // 5.4%
};

/**
 * Boss chance multipliers by boss type
 */
const BOSS_CHANCE_MULTIPLIERS: Record<BossType, number> = {
  ward_boss: 2.0,
  mini_boss: 1.8,
  elite_boss: 2.5,
};

/**
 * Boss amount multipliers by boss type
 */
const BOSS_AMOUNT_MULTIPLIERS: Record<BossType, number> = {
  ward_boss: 3.0,
  mini_boss: 2.5,
  elite_boss: 4.0,
};

/**
 * Soul Power scaling calculator implementation
 */
export class DefaultSoulPowerScaling implements SoulPowerScaling {
  private config: SoulPowerDropConfig;

  constructor(config: SoulPowerDropConfig = DEFAULT_SOUL_POWER_CONFIG) {
    this.config = config;
  }

  /**
   * Calculate drop chance for enemy type
   */
  calculateDropChance(enemyType: EnemyType, distance: number, ward: number): number {
    const baseChance = ENEMY_BASE_CHANCES[enemyType];

    // Apply enemy-specific multipliers
    let chanceMultiplier = 1.0;
    switch (enemyType) {
      case 'elite':
        chanceMultiplier = this.config.eliteChanceMultiplier;
        break;
      case 'mini_boss':
        chanceMultiplier = this.config.miniBossChanceMultiplier;
        break;
      case 'boss':
        chanceMultiplier = this.config.bossChanceMultiplier;
        break;
    }

    // Apply distance and ward scaling (slower than Arcana)
    const distanceFactor = Math.pow(this.config.distanceScalingFactor, distance);
    const wardFactor = Math.pow(this.config.wardScalingFactor, ward);
    const totalFactor = Math.max(distanceFactor * wardFactor, 1.01); // Minimum 1% scaling

    return Math.min(baseChance * chanceMultiplier * totalFactor, 0.5); // Cap at 50%
  }

  /**
   * Calculate drop amount based on Arcana amount
   */
  calculateDropAmount(
    arcanaAmount: number,
    enemyType: EnemyType,
    distance: number,
    ward: number,
  ): number {
    // Start with percentage of Arcana amount
    let baseAmount = Math.floor(arcanaAmount * this.config.baseDropPercentage);

    // Apply enemy-specific multipliers
    let amountMultiplier = 1.0;
    switch (enemyType) {
      case 'elite':
        amountMultiplier = this.config.eliteAmountMultiplier;
        break;
      case 'mini_boss':
        amountMultiplier = this.config.miniBossAmountMultiplier;
        break;
      case 'boss':
        amountMultiplier = this.config.bossAmountMultiplier;
        break;
    }

    // Apply distance and ward scaling (slower than Arcana)
    const distanceFactor = Math.pow(this.config.distanceScalingFactor, distance);
    const wardFactor = Math.pow(this.config.wardScalingFactor, ward);
    const totalFactor = Math.max(distanceFactor * wardFactor, 1.01); // Minimum 1% scaling

    const finalAmount = Math.round(baseAmount * amountMultiplier * totalFactor);

    // Apply min/max constraints
    return Math.max(this.config.minDropAmount, Math.min(finalAmount, this.config.maxDropAmount));
  }

  /**
   * Calculate final drop chance and amount
   */
  calculateSoulPowerDrop(
    enemyType: EnemyType,
    distance: number,
    ward: number,
    arcanaAmount: number,
  ): SoulPowerScalingResult {
    const baseChance = ENEMY_BASE_CHANCES[enemyType];
    const dropChance = this.calculateDropChance(enemyType, distance, ward);
    const dropAmount = this.calculateDropAmount(arcanaAmount, enemyType, distance, ward);

    const distanceFactor = Math.pow(this.config.distanceScalingFactor, distance);
    const wardFactor = Math.pow(this.config.wardScalingFactor, ward);
    const totalFactor = distanceFactor * wardFactor;

    // Simulate drop chance
    const randomValue = Math.random();
    const triggered = randomValue < dropChance;

    return {
      baseChance,
      baseAmount: Math.floor(arcanaAmount * this.config.baseDropPercentage),
      distanceFactor,
      wardFactor,
      totalFactor,
      finalChance: dropChance, // This is already scaled in calculateDropChance
      finalAmount: dropAmount, // This is already scaled in calculateDropAmount
      triggered,
    };
  }
}

/**
 * Create a new Soul Power scaling calculator
 */
export function createSoulPowerScaling(config?: SoulPowerDropConfig): SoulPowerScaling {
  return new DefaultSoulPowerScaling(config);
}

/**
 * Calculate Soul Power drop for a specific scenario
 */
export function calculateSoulPowerDrop(
  enemyType: EnemyType,
  distance: number,
  ward: number,
  arcanaAmount: number,
  config?: SoulPowerDropConfig,
): SoulPowerScalingResult {
  const scaling = createSoulPowerScaling(config);
  return scaling.calculateSoulPowerDrop(enemyType, distance, ward, arcanaAmount);
}

/**
 * Get drop chance for distance only
 */
export function getSoulPowerDistanceChance(
  distance: number,
  config: SoulPowerDropConfig = DEFAULT_SOUL_POWER_CONFIG,
): number {
  return Math.pow(config.distanceScalingFactor, distance);
}

/**
 * Get drop chance for ward only
 */
export function getSoulPowerWardChance(
  ward: number,
  config: SoulPowerDropConfig = DEFAULT_SOUL_POWER_CONFIG,
): number {
  return Math.pow(config.wardScalingFactor, ward);
}

/**
 * Calculate total scaling factor for Soul Power
 */
export function getSoulPowerTotalScaling(
  distance: number,
  ward: number,
  config: SoulPowerDropConfig = DEFAULT_SOUL_POWER_CONFIG,
): number {
  const distanceFactor = getSoulPowerDistanceChance(distance, config);
  const wardFactor = getSoulPowerWardChance(ward, config);
  return distanceFactor * wardFactor;
}
