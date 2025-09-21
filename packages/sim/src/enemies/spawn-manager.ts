/**
 * @file Spawn manager for enemy spawning system
 * @description P1-E2-S1: Core spawn manager integrating pool, config, and RNG
 */

/**
 * Simple RNG interface for spawn manager
 * TODO: Integrate with @draconia/engine RNG system once enum issues are resolved
 */
export interface SimpleRng {
  randomFloat(): number;
  randomFloat(min: number, max: number): number;
  randomInt(min: number, max: number): number;
}

/**
 * Simple RNG implementation using Math.random
 * TODO: Replace with deterministic RNG from @draconia/engine
 */
export class SimpleRngImpl implements SimpleRng {
  randomFloat(min?: number, max?: number): number {
    if (min !== undefined && max !== undefined) {
      return min + Math.random() * (max - min);
    }
    return Math.random();
  }

  randomInt(min: number, max: number): number {
    return Math.floor(this.randomFloat(min, max + 1));
  }
}
import { PoolManager } from './pool-manager.js';
import {
  createSpawnConfig,
  calculateSpawnRate,
  selectEnemyFamily,
  getEnemyConfig,
} from './spawn-config.js';
import type { SpawnConfig } from './types.js';
import type { SpawnedEnemy, Family, LandId, WardId, Vector2, SpawnStats } from './types.js';

/**
 * Configuration for spawn manager
 */
export interface SpawnManagerConfig {
  /** Spawn configuration */
  spawnConfig: SpawnConfig;
  /** Maximum spawn attempts per update */
  maxSpawnAttempts: number;
  /** Enable spawn debugging */
  enableDebugLogging: boolean;
}

/**
 * Default spawn manager configuration
 */
export const DEFAULT_SPAWN_MANAGER_CONFIG: SpawnManagerConfig = {
  spawnConfig: createSpawnConfig(),
  maxSpawnAttempts: 10,
  enableDebugLogging: false,
};

/**
 * Spawn manager for coordinating enemy spawning
 *
 * Integrates object pooling, spawn configuration, and RNG
 * to manage enemy spawning based on distance progression and timing.
 */
export class SpawnManager {
  private poolManager: PoolManager;
  private config: SpawnManagerConfig;
  private spawnRng: SimpleRng;
  private lastSpawnTime: number = 0;
  private accumulatedSpawnTime: number = 0;
  private stats: SpawnStats;

  constructor(
    poolManager: PoolManager,
    spawnRng: SimpleRng = new SimpleRngImpl(),
    config: SpawnManagerConfig = DEFAULT_SPAWN_MANAGER_CONFIG,
  ) {
    this.poolManager = poolManager;
    this.config = config;
    this.spawnRng = spawnRng;
    this.stats = {
      spawnAttempts: 0,
      spawnedEnemies: 0,
      despawnedEnemies: 0,
      currentSpawnRate: 0,
    };
  }

  /**
   * Update spawn manager with current game state
   * @param currentTime - Current simulation time in milliseconds
   * @param distance - Current distance progression
   * @param playerPosition - Current player position
   * @param currentWard - Current ward ID
   * @param currentLand - Current land ID
   * @param deltaTime - Time elapsed since last update in milliseconds
   */
  update(
    currentTime: number,
    distance: number,
    playerPosition: Vector2,
    currentWard: WardId,
    currentLand: LandId,
    deltaTime: number,
  ): void {
    // Calculate current spawn rate based on distance
    const spawnRate = calculateSpawnRate(this.config.spawnConfig, distance);
    this.stats.currentSpawnRate = spawnRate;

    // Update accumulated spawn time
    this.accumulatedSpawnTime += deltaTime;

    // Calculate spawn interval (enemies per second -> milliseconds per enemy)
    const spawnInterval = spawnRate > 0 ? 1000 / spawnRate : Infinity;

    // Attempt to spawn enemies if enough time has passed
    if (this.accumulatedSpawnTime >= spawnInterval) {
      const spawnCount = Math.floor(this.accumulatedSpawnTime / spawnInterval);
      const actualSpawnCount = Math.min(spawnCount, this.config.maxSpawnAttempts);

      for (let i = 0; i < actualSpawnCount; i++) {
        this.attemptSpawn(currentTime, distance, playerPosition, currentWard, currentLand);
      }

      // Reset accumulated time
      this.accumulatedSpawnTime %= spawnInterval;
    }

    // Update spawn statistics
    this.stats.despawnedEnemies = this.poolManager.getStats().totalDestroyed;
  }

  /**
   * Attempt to spawn a single enemy
   * @param currentTime - Current simulation time
   * @param distance - Current distance progression
   * @param playerPosition - Current player position
   * @param currentWard - Current ward ID
   * @param currentLand - Current land ID
   * @returns Spawned enemy or null if spawn failed
   */
  private attemptSpawn(
    currentTime: number,
    distance: number,
    playerPosition: Vector2,
    currentWard: WardId,
    currentLand: LandId,
  ): SpawnedEnemy | null {
    this.stats.spawnAttempts++;

    // Check if we can spawn more enemies
    if (!this.poolManager.canSpawn()) {
      if (this.config.enableDebugLogging) {
        console.log('[SpawnManager] Cannot spawn - pool manager at limit');
      }
      return null;
    }

    // Select enemy family based on ward configuration
    const randomValue = this.spawnRng.randomFloat();
    const family = selectEnemyFamily(this.config.spawnConfig, currentWard, randomValue);

    if (!family) {
      if (this.config.enableDebugLogging) {
        console.log('[SpawnManager] No valid enemy family for ward', currentWard);
      }
      return null;
    }

    // Get enemy configuration
    const enemyConfig = getEnemyConfig(this.config.spawnConfig, currentWard, family);
    if (!enemyConfig) {
      if (this.config.enableDebugLogging) {
        console.log('[SpawnManager] No enemy config found for family', family);
      }
      return null;
    }

    // Calculate spawn position (off-screen, approaching player)
    const spawnPosition = this.calculateSpawnPosition(playerPosition, distance);

    // Spawn enemy through pool manager
    const enemy = this.poolManager.spawnEnemy(
      family,
      spawnPosition,
      currentWard,
      currentLand,
      distance,
    );

    if (enemy) {
      // Apply enemy configuration
      enemy.hp = enemyConfig.baseHp;
      enemy.maxHp = enemyConfig.baseHp;
      enemy.spd = enemyConfig.baseSpeed;
      enemy.contactDmg = enemyConfig.baseContactDmg;

      this.stats.spawnedEnemies++;
      this.lastSpawnTime = currentTime;

      if (this.config.enableDebugLogging) {
        console.log('[SpawnManager] Spawned enemy:', {
          id: enemy.id,
          family,
          position: spawnPosition,
          ward: currentWard,
          land: currentLand,
          distance,
        });
      }
    }

    return enemy;
  }

  /**
   * Calculate spawn position for enemy
   * @param playerPosition - Current player position
   * @param distance - Current distance progression
   * @returns Spawn position vector
   */
  private calculateSpawnPosition(playerPosition: Vector2, distance: number): Vector2 {
    // Spawn enemies off-screen, approaching from random directions
    const spawnDistance = 800 + distance * 0.1; // Spawn further away as distance increases
    const angle = this.spawnRng.randomFloat(0, Math.PI * 2);

    return {
      x: playerPosition.x + Math.cos(angle) * spawnDistance,
      y: playerPosition.y + Math.sin(angle) * spawnDistance,
    };
  }

  /**
   * Get current spawn statistics
   * @returns Current spawn statistics
   */
  getStats(): SpawnStats {
    return { ...this.stats };
  }

  /**
   * Get pool manager for direct access
   * @returns Pool manager instance
   */
  getPoolManager(): PoolManager {
    return this.poolManager;
  }

  /**
   * Update spawn manager configuration
   * @param newConfig - New configuration (partial)
   */
  updateConfig(newConfig: Partial<SpawnManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset spawn manager state
   */
  reset(): void {
    this.lastSpawnTime = 0;
    this.accumulatedSpawnTime = 0;
    this.stats = {
      spawnAttempts: 0,
      spawnedEnemies: 0,
      despawnedEnemies: 0,
      currentSpawnRate: 0,
    };
  }

  /**
   * Force spawn an enemy at specific position (for testing)
   * @param position - Position to spawn enemy
   * @param wardId - Ward ID
   * @param landId - Land ID
   * @param family - Enemy family (optional, will select randomly if not provided)
   * @returns Spawned enemy or null if spawn failed
   */
  forceSpawn(
    position: Vector2,
    wardId: WardId,
    landId: LandId,
    family?: Family,
  ): SpawnedEnemy | null {
    this.stats.spawnAttempts++;

    if (!this.poolManager.canSpawn()) {
      return null;
    }

    const selectedFamily =
      family || selectEnemyFamily(this.config.spawnConfig, wardId, this.spawnRng.randomFloat());
    if (!selectedFamily) {
      return null;
    }

    const enemy = this.poolManager.spawnEnemy(selectedFamily, position, wardId, landId, 0);

    if (enemy) {
      const enemyConfig = getEnemyConfig(this.config.spawnConfig, wardId, selectedFamily);
      if (enemyConfig) {
        enemy.hp = enemyConfig.baseHp;
        enemy.maxHp = enemyConfig.baseHp;
        enemy.spd = enemyConfig.baseSpeed;
        enemy.contactDmg = enemyConfig.baseContactDmg;
      }

      this.stats.spawnedEnemies++;
    }

    return enemy;
  }

  /**
   * Destroy all active enemies (for testing or game reset)
   */
  destroyAllEnemies(): void {
    const activeEnemies = this.poolManager.getActiveEnemies();
    const enemiesToDestroy = [...activeEnemies]; // Create a copy to avoid modification during iteration

    for (const enemy of enemiesToDestroy) {
      this.poolManager.destroyEnemy(enemy);
    }
    // Update despawned enemies count
    this.stats.despawnedEnemies += enemiesToDestroy.length;
  }
}
