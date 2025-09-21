/**
 * @file Pool manager for enemy lifecycle management
 * @description P1-E2-S1: High-level pool management and enemy lifecycle
 */

import { EnemyPool, type EnemyPoolConfig } from './enemy-pool.js';
import type { SpawnedEnemy, PoolStats, Vector2, Family, LandId, WardId } from './types.js';

/**
 * Pool manager configuration
 */
export interface PoolManagerConfig extends EnemyPoolConfig {
  /** Maximum active enemies allowed */
  maxActiveEnemies: number;
  /** Cleanup interval in milliseconds */
  cleanupInterval: number;
  /** Enable automatic cleanup */
  enableAutoCleanup: boolean;
}

/**
 * Default pool manager configuration
 */
export const DEFAULT_POOL_MANAGER_CONFIG: PoolManagerConfig = {
  ...{
    initialSize: 50,
    maxSize: 300,
    growthFactor: 1.5,
    maxGrowthSize: 100,
  },
  maxActiveEnemies: 200, // Performance limit
  cleanupInterval: 5000, // 5 seconds
  enableAutoCleanup: true, // Enable automatic cleanup
};

/**
 * Pool manager for high-level enemy lifecycle management
 *
 * Provides a higher-level interface for enemy pooling, including
 * automatic cleanup, performance monitoring, and spawn integration.
 */
export class PoolManager {
  private pool: EnemyPool;
  private config: PoolManagerConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private totalSpawned: number = 0;
  private totalDestroyed: number = 0;

  constructor(config: PoolManagerConfig = DEFAULT_POOL_MANAGER_CONFIG) {
    this.config = config;
    this.pool = new EnemyPool(config);
    this.startAutoCleanup();
  }

  /**
   * Start automatic cleanup if enabled
   */
  private startAutoCleanup(): void {
    if (this.config.enableAutoCleanup) {
      this.cleanupTimer = setInterval(() => {
        this.performCleanup();
      }, this.config.cleanupInterval);
    }
  }

  /**
   * Stop automatic cleanup
   */
  private stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Spawn a new enemy using the pool
   * @param family - Enemy family type
   * @param position - Spawn position
   * @param wardId - Ward identifier
   * @param landId - Land identifier
   * @param spawnDistance - Distance when spawned
   * @returns Spawned enemy or null if limit reached or pool full
   */
  spawnEnemy(
    family: Family,
    position: Vector2,
    wardId: WardId,
    landId: LandId,
    spawnDistance: number,
  ): SpawnedEnemy | null {
    // Check if we've reached the active enemy limit
    if (this.pool.getActiveCount() >= this.config.maxActiveEnemies) {
      return null;
    }

    // Try to allocate from pool
    const enemy = this.pool.allocate(family, position, wardId, landId, spawnDistance);

    if (enemy) {
      this.totalSpawned++;
    }

    return enemy;
  }

  /**
   * Destroy an enemy and return it to the pool
   * @param enemy - Enemy to destroy
   */
  destroyEnemy(enemy: SpawnedEnemy): void {
    this.pool.deallocate(enemy);
    this.totalDestroyed++;
  }

  /**
   * Destroy all enemies of a specific family
   * @param family - Family type to destroy
   * @returns Number of enemies destroyed
   */
  destroyEnemiesByFamily(family: Family): number {
    const activeEnemies = this.pool.getActiveEnemies();
    const enemiesToDestroy = activeEnemies.filter((enemy) => enemy.family === family);

    for (const enemy of enemiesToDestroy) {
      this.destroyEnemy(enemy);
    }

    return enemiesToDestroy.length;
  }

  /**
   * Destroy all enemies within a certain distance of a point
   * @param center - Center point
   * @param radius - Radius to destroy within
   * @returns Number of enemies destroyed
   */
  destroyEnemiesInRadius(center: Vector2, radius: number): number {
    const activeEnemies = this.pool.getActiveEnemies();
    let destroyed = 0;

    for (const enemy of activeEnemies) {
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - center.x, 2) + Math.pow(enemy.position.y - center.y, 2),
      );

      if (distance <= radius) {
        this.destroyEnemy(enemy);
        destroyed++;
      }
    }

    return destroyed;
  }

  /**
   * Get all active enemies
   * @returns Array of active enemies
   */
  getActiveEnemies(): readonly SpawnedEnemy[] {
    return this.pool.getActiveEnemies();
  }

  /**
   * Get all active enemies of a specific family
   * @param family - Family type to filter by
   * @returns Array of active enemies of the specified family
   */
  getActiveEnemiesByFamily(family: Family): SpawnedEnemy[] {
    return this.pool.getActiveEnemies().filter((enemy) => enemy.family === family);
  }

  /**
   * Get enemies within a certain distance of a point
   * @param center - Center point
   * @param radius - Radius to search within
   * @returns Array of enemies within radius
   */
  getEnemiesInRadius(center: Vector2, radius: number): SpawnedEnemy[] {
    const activeEnemies = this.pool.getActiveEnemies();

    return activeEnemies.filter((enemy) => {
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - center.x, 2) + Math.pow(enemy.position.y - center.y, 2),
      );
      return distance <= radius;
    });
  }

  /**
   * Perform maintenance cleanup
   */
  private performCleanup(): void {
    // Object pooling doesn't require cleanup, but this method
    // exists for interface compatibility and future enhancements
    this.pool.cleanup();
  }

  /**
   * Get comprehensive pool statistics
   * @returns Pool statistics including manager-level metrics
   */
  getStats(): PoolStats & {
    totalSpawned: number;
    totalDestroyed: number;
    activeEnemiesByFamily: Record<Family, number>;
  } {
    const poolStats = this.pool.getStats();
    const activeEnemies = this.pool.getActiveEnemies();

    // Count enemies by family
    const activeEnemiesByFamily: Record<Family, number> = {
      1: 0, // Melee
      2: 0, // Ranged
    };

    for (const enemy of activeEnemies) {
      activeEnemiesByFamily[enemy.family]++;
    }

    return {
      ...poolStats,
      totalSpawned: this.totalSpawned,
      totalDestroyed: this.totalDestroyed,
      activeEnemiesByFamily,
    };
  }

  /**
   * Check if we can spawn more enemies
   * @returns True if we can spawn more enemies
   */
  canSpawn(): boolean {
    return this.pool.getActiveCount() < this.config.maxActiveEnemies && !this.pool.isFull();
  }

  /**
   * Get the number of available spawn slots
   * @returns Number of enemies that can still be spawned
   */
  getAvailableSpawnSlots(): number {
    return Math.max(0, this.config.maxActiveEnemies - this.pool.getActiveCount());
  }

  /**
   * Update pool manager configuration
   * @param newConfig - New configuration (partial)
   */
  updateConfig(newConfig: Partial<PoolManagerConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Update pool configuration
    this.pool.updateConfig(this.config);

    // Handle auto-cleanup changes
    if (oldConfig.enableAutoCleanup !== this.config.enableAutoCleanup) {
      if (this.config.enableAutoCleanup) {
        this.startAutoCleanup();
      } else {
        this.stopAutoCleanup();
      }
    }
  }

  /**
   * Reset the pool manager (for testing or game reset)
   */
  reset(): void {
    this.stopAutoCleanup();
    this.pool.reset();
    this.totalSpawned = 0;
    this.totalDestroyed = 0;
    this.startAutoCleanup();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopAutoCleanup();
    this.pool.reset();
  }
}
