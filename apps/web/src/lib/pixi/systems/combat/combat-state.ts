/**
 * Combat State Data Structures
 *
 * Pure data structures for tracking combat state.
 * No logic - just data containers that can be passed between systems.
 *
 * Phase 1 Combat Implementation - Data Structures
 */

import type { DeathData } from './damage-utils';

/**
 * Dragon combat state
 */
export interface DragonCombatState {
  hp: number;
  maxHP: number;
  damage: number;
  fireRate: number; // ms
  attackRangePercent: number; // 0.30 (30% of screen)
  lastFireTime: number;
}

/**
 * Enemy combat state (extends EnemyData from enemy-manager)
 */
export interface EnemyCombatState {
  lastFireTime: number;
  fireRate: number; // ms between attacks
  attackRangePercent: number; // Percentage of screen (0.20-0.28)
  deathData?: DeathData;
  isDefeated: boolean;
}

/**
 * Combat configuration
 */
export interface CombatConfig {
  // Dragon stats
  dragonBaseHP: number;
  dragonBaseDamage: number;
  dragonFireRate: number; // ms
  dragonRangePercent: number; // 0.30 (30% of screen)

  // Enemy stats
  enemyFireRate: number; // ms

  // Screen metrics (for percentage calculations)
  screenWidth: number;
  dragonXPosition: number; // pixels from left

  // Stat scaling
  scalingInterval: number; // meters (100m)
  scalingGrowthRate: number; // 1.01 (1%)
}

/**
 * Default combat configuration (from Phase 1 spec)
 */
export const DEFAULT_COMBAT_CONFIG: CombatConfig = {
  // Dragon
  dragonBaseHP: 5,
  dragonBaseDamage: 2.5,
  dragonFireRate: 1250, // ms (0.8 attacks/s - 60% slower than original 500ms)
  dragonRangePercent: 0.3, // 30% of screen ahead

  // Enemy
  enemyFireRate: 2000, // ms (0.5 attacks/s)

  // Screen (1080p baseline)
  screenWidth: 1920,
  dragonXPosition: 115.2, // 6% of 1920

  // Scaling
  scalingInterval: 100, // meters
  scalingGrowthRate: 1.01, // 1% multiplicative
};

/**
 * Scaled enemy stats (calculated at spawn time)
 */
export interface ScaledEnemyStats {
  hp: number;
  damage: number;
}

/**
 * Calculate scaled enemy stats based on distance
 * @param distance - Current distance in meters
 * @param config - Combat configuration
 * @returns Scaled stats (HP and damage)
 */
export function calculateScaledStats(
  distance: number,
  config: CombatConfig = DEFAULT_COMBAT_CONFIG,
): ScaledEnemyStats {
  const scalingFactor = Math.pow(config.scalingGrowthRate, Math.floor(distance / config.scalingInterval));

  // Base stats
  const baseHP = 10;
  const baseDamageMin = 1.5;
  const baseDamageMax = 2.5;

  // Scale and roll damage
  const scaledHP = Math.floor(baseHP * scalingFactor);
  const scaledDamageMin = baseDamageMin * scalingFactor;
  const scaledDamageMax = baseDamageMax * scalingFactor;

  // Roll damage (fixed per enemy at spawn)
  const damage = Math.random() * (scaledDamageMax - scaledDamageMin) + scaledDamageMin;

  return {
    hp: scaledHP,
    damage: parseFloat(damage.toFixed(2)),
  };
}

/**
 * Calculate range in pixels from percentage
 * @param rangePercent - Range as percentage of visible screen (0.0 - 1.0)
 * @param config - Combat configuration
 * @returns Range in pixels
 */
export function calculateRangePixels(
  rangePercent: number,
  config: CombatConfig = DEFAULT_COMBAT_CONFIG,
): number {
  const visibleWidth = config.screenWidth - config.dragonXPosition;
  return visibleWidth * rangePercent;
}

/**
 * Create initial dragon combat state
 * @param config - Combat configuration
 * @returns Initial dragon combat state
 */
export function createDragonCombatState(config: CombatConfig = DEFAULT_COMBAT_CONFIG): DragonCombatState {
  return {
    hp: config.dragonBaseHP,
    maxHP: config.dragonBaseHP,
    damage: config.dragonBaseDamage,
    fireRate: config.dragonFireRate,
    attackRangePercent: config.dragonRangePercent,
    lastFireTime: 0,
  };
}

/**
 * Create initial enemy combat state
 * @param attackRangePercent - Enemy's attack range (percentage of screen)
 * @param config - Combat configuration
 * @returns Initial enemy combat state
 */
export function createEnemyCombatState(
  attackRangePercent: number,
  config: CombatConfig = DEFAULT_COMBAT_CONFIG,
): EnemyCombatState {
  return {
    lastFireTime: 0,
    fireRate: config.enemyFireRate,
    attackRangePercent,
    isDefeated: false,
  };
}
