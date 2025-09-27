/**
 * @file Spawn configuration system for Draconia Chronicles
 * @description P1-E2-S1: Spawn rate calculations and ward-based configurations
 */

import type { Family, LandId, WardId } from './types.js';
import type { SpawnConfig, WardSpawnConfig, EnemySpawnConfig } from './types.js';

// Re-export SpawnConfig for external use
export type { SpawnConfig };

/**
 * Default spawn configuration for Phase 1
 * These values will be balanced and tuned during development
 */
export const DEFAULT_SPAWN_CONFIG: SpawnConfig = {
  // Base spawn rate: 1 enemy per 2 seconds initially
  baseRate: 0.5,

  // Distance multiplier: spawn rate increases with distance
  distanceMultiplier: 1.1,

  // Maximum spawn rate cap (enemies per second)
  maxSpawnRate: 5.0,

  // Distance thresholds for spawn rate scaling
  distanceThresholds: [
    { distance: 0, spawnRateMultiplier: 1.0 },
    { distance: 100, spawnRateMultiplier: 1.2 },
    { distance: 500, spawnRateMultiplier: 1.5 },
    { distance: 1000, spawnRateMultiplier: 2.0 },
    { distance: 2500, spawnRateMultiplier: 2.5 },
    { distance: 5000, spawnRateMultiplier: 3.0 },
  ],

  // Ward configurations (will be populated by createWardConfigs)
  wardConfigs: new Map(),
};

/**
 * Creates ward-specific spawn configurations
 * For Phase 1, we'll have basic configurations for the first land
 */
export function createWardConfigs(): Map<WardId, WardSpawnConfig> {
  const wardConfigs = new Map<WardId, WardSpawnConfig>();

  // Phase 1: Basic configurations for first land/ward
  // These will be expanded in future phases with actual land/ward data

  const landId = 1 as LandId;

  // Ward 1 configuration
  wardConfigs.set(1 as WardId, {
    wardId: 1 as WardId,
    landId,
    spawnRateMultiplier: 1.0,
    availableEnemyTypes: [1, 2], // Family._Melee = 1, Family._Ranged = 2
    enemyConfigs: new Map([
      [1, createMeleeEnemyConfig()],
      [2, createRangedEnemyConfig()],
    ]),
  });

  // Ward 2 configuration (for testing)
  wardConfigs.set(2 as WardId, {
    wardId: 2 as WardId,
    landId,
    spawnRateMultiplier: 1.2,
    availableEnemyTypes: [1, 2], // Family._Melee = 1, Family._Ranged = 2
    enemyConfigs: new Map([
      [1, createMeleeEnemyConfig()],
      [2, createRangedEnemyConfig()],
    ]),
  });

  return wardConfigs;
}

/**
 * Creates melee enemy configuration
 */
function createMeleeEnemyConfig(): EnemySpawnConfig {
  return {
    family: 1, // Family._Melee
    baseHp: 100,
    baseSpeed: 50, // units per second
    baseContactDmg: 10,
    spawnWeight: 0.6, // 60% chance
  };
}

/**
 * Creates ranged enemy configuration
 */
function createRangedEnemyConfig(): EnemySpawnConfig {
  return {
    family: 2, // Family._Ranged
    baseHp: 80,
    baseSpeed: 40, // units per second
    baseContactDmg: 15,
    spawnWeight: 0.4, // 40% chance
  };
}

/**
 * Calculates spawn rate based on distance
 * @param config - Spawn configuration
 * @param distance - Current distance
 * @returns Calculated spawn rate (enemies per second)
 */
export function calculateSpawnRate(config: SpawnConfig, distance: number): number {
  // Handle negative distances by returning base rate
  if (distance < 0) {
    return config.baseRate;
  }

  // Find the appropriate distance threshold
  let multiplier = 1.0;

  for (const threshold of config.distanceThresholds) {
    if (distance >= threshold.distance) {
      multiplier = threshold.spawnRateMultiplier;
    } else {
      break;
    }
  }

  // Calculate base rate with distance multiplier
  let rate = config.baseRate * multiplier;

  // Apply distance-based exponential growth (only for distances beyond thresholds)
  // Only apply exponential growth if distance is beyond the highest threshold
  const maxThreshold = Math.max(...config.distanceThresholds.map((t: { distance: number }) => t.distance));
  if (distance > maxThreshold) {
    const extraDistance = distance - maxThreshold;
    rate *= Math.pow(config.distanceMultiplier, Math.floor(extraDistance / 100));
  }

  // Cap at maximum spawn rate
  return Math.min(rate, config.maxSpawnRate);
}

/**
 * Gets enemy spawn configuration for a specific ward and family
 * @param config - Spawn configuration
 * @param wardId - Ward identifier
 * @param family - Enemy family type
 * @returns Enemy spawn configuration or undefined if not found
 */
export function getEnemyConfig(
  config: SpawnConfig,
  wardId: WardId,
  family: Family,
): EnemySpawnConfig | undefined {
  const wardConfig = config.wardConfigs.get(wardId);
  return wardConfig?.enemyConfigs.get(family);
}

/**
 * Selects an enemy family based on spawn weights
 * @param config - Spawn configuration
 * @param wardId - Ward identifier
 * @param randomValue - Random value between 0 and 1
 * @returns Selected enemy family or undefined if no valid families
 */
export function selectEnemyFamily(
  config: SpawnConfig,
  wardId: WardId,
  randomValue: number,
): Family | undefined {
  const wardConfig = config.wardConfigs.get(wardId);
  if (!wardConfig) {
    return undefined;
  }

  // Calculate total weight
  let totalWeight = 0;
  for (const family of wardConfig.availableEnemyTypes) {
    const enemyConfig = wardConfig.enemyConfigs.get(family);
    if (enemyConfig) {
      totalWeight += enemyConfig.spawnWeight;
    }
  }

  // Select based on weighted random
  let currentWeight = 0;
  for (const family of wardConfig.availableEnemyTypes) {
    const enemyConfig = wardConfig.enemyConfigs.get(family);
    if (enemyConfig) {
      currentWeight += enemyConfig.spawnWeight / totalWeight;
      if (randomValue <= currentWeight) {
        return family;
      }
    }
  }

  // Fallback to first available family
  return wardConfig.availableEnemyTypes[0];
}

/**
 * Creates a complete spawn configuration with ward configs
 * @returns Complete spawn configuration
 */
export function createSpawnConfig(): SpawnConfig {
  const config = { ...DEFAULT_SPAWN_CONFIG };
  config.wardConfigs = createWardConfigs();
  return config;
}

/**
 * Validates spawn configuration
 * @param config - Spawn configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateSpawnConfig(config: SpawnConfig): string[] {
  const errors: string[] = [];

  if (config.baseRate <= 0) {
    errors.push('Base spawn rate must be positive');
  }

  if (config.maxSpawnRate <= config.baseRate) {
    errors.push('Maximum spawn rate must be greater than base rate');
  }

  if (config.distanceMultiplier <= 1.0) {
    errors.push('Distance multiplier must be greater than 1.0');
  }

  if (config.wardConfigs.size === 0) {
    errors.push('At least one ward configuration is required');
  }

  // Validate distance thresholds are sorted
  for (let i = 1; i < config.distanceThresholds.length; i++) {
    const current = config.distanceThresholds[i];
    const previous = config.distanceThresholds[i - 1];
    if (current && previous && current.distance <= previous.distance) {
      errors.push('Distance thresholds must be in ascending order');
      break;
    }
  }

  // Validate ward configurations
  for (const [wardId, wardConfig] of config.wardConfigs) {
    if (wardConfig.availableEnemyTypes.length === 0) {
      errors.push(`Ward ${wardId} must have at least one enemy type`);
    }

    if (wardConfig.spawnRateMultiplier <= 0) {
      errors.push(`Ward ${wardId} spawn rate multiplier must be positive`);
    }
  }

  return errors;
}
