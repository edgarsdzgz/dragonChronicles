/**
 * @file Enemy types and interfaces for Draconia Chronicles
 * @description P1-E2-S1: Extended enemy types for spawning system
 */

// Temporary local types until engine package enum issues are resolved
export type Family = 1 | 2; // _Melee = 1, _Ranged = 2
export type LandId = number;
export type WardId = number;

/**
 * Base enemy entity (simplified for P1-E2-S1)
 */
export type Enemy = {
  id: number;
  family: Family;
  hp: number;
  maxHp: number;
  spd: number; // units/s
  contactDmg: number;
};

/**
 * Vector2 interface for position and velocity
 */
export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Extended enemy entity with spawn-specific properties
 * Extends the base Enemy type from @draconia/engine
 */
export type SpawnedEnemy = Enemy & {
  // Position and movement
  position: Vector2;
  velocity: Vector2;

  // Spawn metadata
  spawnTime: number;
  spawnDistance: number;
  wardId: WardId;
  landId: LandId;

  // State management
  isActive: boolean;
  poolIndex: number;

  // AI state (for future P1-E2-S2)
  state: EnemyState;
};

/**
 * Enemy AI states (for future integration with P1-E2-S2)
 */
/* eslint-disable no-unused-vars -- enum values used in enemy-pool.ts and tests */
export enum EnemyState {
  APPROACH = 'approach',
  STOP = 'stop',
  ATTACK = 'attack',
  DEATH = 'death',
}
/* eslint-enable no-unused-vars */

/**
 * Enemy spawn configuration for different families
 */
export interface EnemySpawnConfig {
  family: Family;
  baseHp: number;
  baseSpeed: number;
  baseContactDmg: number;
  spawnWeight: number; // Relative spawn probability
}

/**
 * Ward-specific spawn configuration
 */
export interface WardSpawnConfig {
  wardId: WardId;
  landId: LandId;
  spawnRateMultiplier: number;
  availableEnemyTypes: Family[];
  enemyConfigs: Map<Family, EnemySpawnConfig>;
}

/**
 * Global spawn configuration
 */
export interface SpawnConfig {
  // Base spawn rates (enemies per second)
  baseRate: number;
  distanceMultiplier: number;
  maxSpawnRate: number;

  // Ward configurations
  wardConfigs: Map<WardId, WardSpawnConfig>;

  // Distance-based scaling
  distanceThresholds: DistanceThreshold[];
}

/**
 * Distance threshold for spawn rate scaling
 */
export interface DistanceThreshold {
  distance: number;
  spawnRateMultiplier: number;
}

/**
 * Spawn manager statistics
 */
export interface SpawnStats {
  spawnAttempts: number;
  spawnedEnemies: number;
  despawnedEnemies: number;
  currentSpawnRate: number; // enemies per second
}

/**
 * Pool statistics for monitoring
 */
export interface PoolStats {
  totalSize: number;
  activeCount: number;
  availableCount: number;
  utilizationRate: number;
  peakUsage: number;
}

/**
 * Spawn event for tracking and debugging
 */
export interface SpawnEvent {
  enemyId: number;
  family: Family;
  position: Vector2;
  spawnTime: number;
  distance: number;
  wardId: WardId;
  landId: LandId;
}

/**
 * Enemy lifecycle events
 */
export interface EnemyLifecycleEvent {
  enemyId: number;
  event: 'spawned' | 'activated' | 'deactivated' | 'destroyed';
  timestamp: number;
  data?: Record<string, unknown>;
}
