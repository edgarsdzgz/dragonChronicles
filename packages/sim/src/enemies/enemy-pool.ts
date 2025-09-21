/**
 * @file Enemy object pool manager for Draconia Chronicles
 * @description P1-E2-S1: Object pooling system for performance optimization
 */

import type { SpawnedEnemy, PoolStats, Vector2, Family, LandId, WardId } from './types.js';
import { EnemyState } from './types.js';

/**
 * Configuration for enemy pool initialization
 */
export interface EnemyPoolConfig {
  /** Initial pool size */
  initialSize: number;
  /** Maximum pool size */
  maxSize: number;
  /** Growth factor when pool needs to expand */
  growthFactor: number;
  /** Maximum growth size per expansion */
  maxGrowthSize: number;
}

/**
 * Default pool configuration for Phase 1
 */
export const DEFAULT_POOL_CONFIG: EnemyPoolConfig = {
  initialSize: 50, // Start with 50 pre-allocated enemies
  maxSize: 300, // Maximum 300 enemies in pool
  growthFactor: 1.5, // Grow by 50% when needed
  maxGrowthSize: 100, // Don't grow by more than 100 at once
};

/**
 * Enemy object pool for performance optimization
 *
 * Pre-allocates enemy objects and reuses them to minimize garbage collection
 * and improve spawn/despawn performance.
 */
export class EnemyPool {
  private pool: SpawnedEnemy[];
  private activeEnemies: SpawnedEnemy[];
  private availableIndices: number[];
  private activeCount: number;
  private totalAllocated: number;
  private peakUsage: number;
  private config: EnemyPoolConfig;
  private nextId: number;

  constructor(config: EnemyPoolConfig = DEFAULT_POOL_CONFIG) {
    this.config = config;
    this.pool = [];
    this.activeEnemies = [];
    this.availableIndices = [];
    this.activeCount = 0;
    this.totalAllocated = 0;
    this.peakUsage = 0;
    this.nextId = 1;

    this.initializePool();
  }

  /**
   * Initialize the pool with pre-allocated enemy objects
   */
  private initializePool(): void {
    for (let i = 0; i < this.config.initialSize; i++) {
      this.createEnemyObject();
    }
    this.totalAllocated = this.config.initialSize;
  }

  /**
   * Create a new enemy object and add it to the pool
   */
  private createEnemyObject(): SpawnedEnemy {
    const enemy: SpawnedEnemy = {
      // Base enemy properties
      id: 0, // Will be set when allocated
      family: 1, // Will be set when allocated
      hp: 0,
      maxHp: 0,
      spd: 0,
      contactDmg: 0,

      // Spawn-specific properties
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      spawnTime: 0,
      spawnDistance: 0,
      wardId: 0,
      landId: 0,
      isActive: false,
      poolIndex: this.pool.length,
      state: EnemyState.APPROACH, // Will be set when allocated
    };

    this.pool.push(enemy);
    this.availableIndices.push(this.pool.length - 1);

    return enemy;
  }

  /**
   * Expand the pool by creating additional enemy objects
   */
  private expandPool(): void {
    const currentSize = this.pool.length;
    const growthSize = Math.min(
      Math.floor(currentSize * (this.config.growthFactor - 1)),
      this.config.maxGrowthSize,
    );

    if (currentSize + growthSize > this.config.maxSize) {
      throw new Error(`Pool expansion would exceed maximum size of ${this.config.maxSize}`);
    }

    for (let i = 0; i < growthSize; i++) {
      this.createEnemyObject();
    }

    this.totalAllocated = this.pool.length;
  }

  /**
   * Allocate an enemy from the pool
   * @param family - Enemy family type
   * @param position - Spawn position
   * @param wardId - Ward identifier
   * @param landId - Land identifier
   * @param spawnDistance - Distance when spawned
   * @returns Allocated enemy or null if pool is full
   */
  allocate(
    family: Family,
    position: Vector2,
    wardId: WardId,
    landId: LandId,
    spawnDistance: number,
  ): SpawnedEnemy | null {
    // Check if we need to expand the pool
    if (this.availableIndices.length === 0) {
      try {
        this.expandPool();
      } catch (error) {
        // Pool is at maximum size and full
        return null;
      }
    }

    // Get an available enemy from the pool
    const poolIndex = this.availableIndices.pop()!;
    const enemy = this.pool[poolIndex];

    if (!enemy) {
      return null; // This should never happen, but TypeScript safety
    }

    // Initialize the enemy with provided data
    enemy.id = this.nextId++;
    enemy.family = family;
    enemy.position = { ...position };
    enemy.velocity = { x: 0, y: 0 };
    enemy.spawnTime = Date.now();
    enemy.spawnDistance = spawnDistance;
    enemy.wardId = wardId;
    enemy.landId = landId;
    enemy.isActive = true;
    enemy.poolIndex = poolIndex;
    enemy.state = EnemyState.APPROACH;

    // Add to active enemies list
    this.activeEnemies.push(enemy);
    this.activeCount++;

    // Update peak usage
    this.peakUsage = Math.max(this.peakUsage, this.activeCount);

    return enemy;
  }

  /**
   * Deallocate an enemy and return it to the pool
   * @param enemy - Enemy to deallocate
   */
  deallocate(enemy: SpawnedEnemy): void {
    if (!enemy.isActive) {
      return; // Already deallocated
    }

    // Remove from active enemies list
    const activeIndex = this.activeEnemies.indexOf(enemy);
    if (activeIndex !== -1) {
      this.activeEnemies.splice(activeIndex, 1);
    }

    // Reset enemy properties
    enemy.id = 0;
    enemy.family = 1;
    enemy.hp = 0;
    enemy.maxHp = 0;
    enemy.spd = 0;
    enemy.contactDmg = 0;
    enemy.position = { x: 0, y: 0 };
    enemy.velocity = { x: 0, y: 0 };
    enemy.spawnTime = 0;
    enemy.spawnDistance = 0;
    enemy.wardId = 0;
    enemy.landId = 0;
    enemy.isActive = false;
    enemy.state = EnemyState.APPROACH;

    // Return to available pool
    this.availableIndices.push(enemy.poolIndex);
    this.activeCount--;
  }

  /**
   * Get all currently active enemies
   * @returns Array of active enemies
   */
  getActiveEnemies(): readonly SpawnedEnemy[] {
    return this.activeEnemies;
  }

  /**
   * Get pool statistics for monitoring
   * @returns Pool statistics
   */
  getStats(): PoolStats {
    return {
      totalSize: this.pool.length,
      activeCount: this.activeCount,
      availableCount: this.availableIndices.length,
      utilizationRate: this.activeCount / this.pool.length,
      peakUsage: this.peakUsage,
    };
  }

  /**
   * Check if the pool is full (no available enemies)
   * @returns True if pool is full
   */
  isFull(): boolean {
    return this.availableIndices.length === 0 && this.pool.length >= this.config.maxSize;
  }

  /**
   * Get the number of active enemies
   * @returns Active enemy count
   */
  getActiveCount(): number {
    return this.activeCount;
  }

  /**
   * Get the total pool size
   * @returns Total allocated enemies
   */
  getTotalSize(): number {
    return this.pool.length;
  }

  /**
   * Clean up inactive enemies (for maintenance)
   * This is a no-op for object pooling, but kept for interface compatibility
   */
  cleanup(): void {
    // Object pooling doesn't need cleanup, but this method exists for
    // compatibility with other enemy management systems
  }

  /**
   * Reset the pool (for testing or game reset)
   */
  reset(): void {
    // Deallocate all active enemies
    for (const enemy of this.activeEnemies) {
      this.deallocate(enemy);
    }

    // Reset counters
    this.activeCount = 0;
    this.peakUsage = 0;
    this.nextId = 1;

    // Clear active enemies list
    this.activeEnemies = [];
  }

  /**
   * Update pool configuration
   * @param newConfig - New configuration (partial)
   */
  updateConfig(newConfig: Partial<EnemyPoolConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
