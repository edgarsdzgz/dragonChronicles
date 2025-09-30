/**
 * Arcana scaling system for distance and ward-based drop calculations
 *
 * This module handles the scaling of Arcana drops based on distance
 * traveled and ward progression, ensuring meaningful progression
 * throughout the journey.
 */

import type {
  ArcanaScaling,
  ArcanaScalingResult,
  ArcanaDropConfig,
  EnemyType,
  BossType,
} from './types.js';

/**
 * Default Arcana drop configuration
 */
export const DEFAULT_ARCANA_CONFIG: ArcanaDropConfig = {
  baseDropAmount: 10,
  distanceScalingFactor: 1.05,
  wardScalingFactor: 1.15,
  bossRewardMultiplier: 5.0,
  eliteMultiplier: 2.0,
  miniBossMultiplier: 3.0,
};

/**
 * Base drop amounts by enemy type
 */
const ENEMY_BASE_DROPS: Record<EnemyType, number> = {
  basic: 10,
  elite: 25,
  boss: 100,
  mini_boss: 50,
};

/**
 * Boss reward multipliers by boss type
 */
const BOSS_MULTIPLIERS: Record<BossType, number> = {
  ward_boss: 5.0,
  mini_boss: 3.0,
  elite_boss: 7.0,
};

/**
 * Arcana scaling calculator implementation
 */
export class DefaultArcanaScaling implements ArcanaScaling {
  private config: ArcanaDropConfig;

  constructor(config: ArcanaDropConfig = DEFAULT_ARCANA_CONFIG) {
    this.config = config;
  }

  /**
   * Calculate scaling factor for distance and ward
   */
  calculateScalingFactor(distance: number, ward: number): number {
    const distanceFactor = Math.pow(this.config.distanceScalingFactor, distance);
    const wardFactor = Math.pow(this.config.wardScalingFactor, ward);
    return distanceFactor * wardFactor;
  }

  /**
   * Get base drop amount for enemy type
   */
  getBaseDropAmount(enemyType: EnemyType): number {
    const baseAmount = ENEMY_BASE_DROPS[enemyType];

    // Apply enemy-specific multipliers
    switch (enemyType) {
      case 'elite':
        return baseAmount * this.config.eliteMultiplier;
      case 'mini_boss':
        return baseAmount * this.config.miniBossMultiplier;
      case 'boss':
        return baseAmount * this.config.bossRewardMultiplier;
      default:
        return baseAmount;
    }
  }

  /**
   * Get boss reward multiplier
   */
  getBossRewardMultiplier(bossType: BossType): number {
    return BOSS_MULTIPLIERS[bossType];
  }

  /**
   * Calculate final drop amount with all scaling factors
   */
  calculateDropAmount(enemyType: EnemyType, distance: number, ward: number): ArcanaScalingResult {
    const baseAmount = this.getBaseDropAmount(enemyType);
    const distanceFactor = Math.pow(this.config.distanceScalingFactor, distance);
    const wardFactor = Math.pow(this.config.wardScalingFactor, ward);
    const totalFactor = distanceFactor * wardFactor;
    const finalAmount = Math.floor(baseAmount * totalFactor);

    return {
      baseAmount,
      distanceFactor,
      wardFactor,
      totalFactor,
      finalAmount,
    };
  }
}

/**
 * Create a new Arcana scaling calculator
 */
export function createArcanaScaling(config?: ArcanaDropConfig): ArcanaScaling {
  return new DefaultArcanaScaling(config);
}

/**
 * Calculate Arcana drop amount for a specific scenario
 */
export function calculateArcanaDrop(
  enemyType: EnemyType,
  distance: number,
  ward: number,
  config?: ArcanaDropConfig,
): ArcanaScalingResult {
  const scaling = createArcanaScaling(config);
  return scaling.calculateDropAmount(enemyType, distance, ward);
}

/**
 * Get scaling factor for distance only
 */
export function getDistanceScalingFactor(
  distance: number,
  config: ArcanaDropConfig = DEFAULT_ARCANA_CONFIG,
): number {
  return Math.pow(config.distanceScalingFactor, distance);
}

/**
 * Get scaling factor for ward only
 */
export function getWardScalingFactor(
  ward: number,
  config: ArcanaDropConfig = DEFAULT_ARCANA_CONFIG,
): number {
  return Math.pow(config.wardScalingFactor, ward);
}

/**
 * Calculate total scaling factor
 */
export function getTotalScalingFactor(
  distance: number,
  ward: number,
  config: ArcanaDropConfig = DEFAULT_ARCANA_CONFIG,
): number {
  const distanceFactor = getDistanceScalingFactor(distance, config);
  const wardFactor = getWardScalingFactor(ward, config);
  return distanceFactor * wardFactor;
}
