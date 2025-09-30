/**
 * Range detection system for Draconia Chronicles targeting
 * Handles distance calculations and range-based enemy filtering
 */

import type { Dragon, Enemy, RangeDetection } from './types.js';

/**
 * Default range detection implementation
 * Provides efficient distance calculations and range-based filtering
 */
export class DefaultRangeDetection implements RangeDetection {
  private readonly maxRange: number;
  private readonly spatialGrid: Map<string, Enemy[]> = new Map();
  private readonly gridSize: number;

  constructor(maxRange = 1000, gridSize = 100) {
    this.maxRange = maxRange;
    this.gridSize = gridSize;
  }

  /**
   * Calculate Euclidean distance between dragon and enemy
   */
  calculateDistance(dragon: Dragon, enemy: Enemy): number {
    const dx = dragon.position.x - enemy.position.x;
    const dy = dragon.position.y - enemy.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if enemy is within dragon's attack range
   */
  isWithinRange(dragon: Dragon, enemy: Enemy): boolean {
    const distance = this.calculateDistance(dragon, enemy);
    return distance <= dragon.attackRange;
  }

  /**
   * Get all enemies within dragon's attack range
   * Uses spatial partitioning for efficient filtering
   */
  getTargetsInRange(enemies: Enemy[], dragon: Dragon): Enemy[] {
    const targetsInRange: Enemy[] = [];

    // Filter enemies by range
    for (const enemy of enemies) {
      if (enemy.isAlive && this.isWithinRange(dragon, enemy)) {
        targetsInRange.push(enemy);
      }
    }

    return targetsInRange;
  }

  /**
   * Get optimal attack range for dragon
   * Returns the dragon's configured attack range
   */
  getOptimalRange(dragon: Dragon): number {
    return dragon.attackRange;
  }

  /**
   * Update spatial grid for efficient range queries
   * Groups enemies by grid cells for faster distance calculations
   */
  updateSpatialGrid(enemies: Enemy[]): void {
    this.spatialGrid.clear();

    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;

      const gridKey = this.getGridKey(enemy.position.x, enemy.position.y);
      if (!this.spatialGrid.has(gridKey)) {
        this.spatialGrid.set(gridKey, []);
      }
      this.spatialGrid.get(gridKey)!.push(enemy);
    }
  }

  /**
   * Get grid key for spatial partitioning
   */
  private getGridKey(x: number, y: number): string {
    const gridX = Math.floor(x / this.gridSize);
    const gridY = Math.floor(y / this.gridSize);
    return `${gridX},${gridY}`;
  }

  /**
   * Get enemies in nearby grid cells for efficient range checking
   */
  getEnemiesInNearbyCells(dragon: Dragon, radius = 2): Enemy[] {
    const nearbyEnemies: Enemy[] = [];
    const dragonGridX = Math.floor(dragon.position.x / this.gridSize);
    const dragonGridY = Math.floor(dragon.position.y / this.gridSize);

    // Check nearby grid cells
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const gridKey = `${dragonGridX + dx},${dragonGridY + dy}`;
        const enemiesInCell = this.spatialGrid.get(gridKey);
        if (enemiesInCell) {
          nearbyEnemies.push(...enemiesInCell);
        }
      }
    }

    return nearbyEnemies;
  }

  /**
   * Get enemies within range using spatial optimization
   * More efficient for large numbers of enemies
   */
  getTargetsInRangeOptimized(enemies: Enemy[], dragon: Dragon): Enemy[] {
    // Update spatial grid
    this.updateSpatialGrid(enemies);

    // Get enemies in nearby cells
    const nearbyEnemies = this.getEnemiesInNearbyCells(dragon);

    // Filter by actual range
    const targetsInRange: Enemy[] = [];
    for (const enemy of nearbyEnemies) {
      if (enemy.isAlive && this.isWithinRange(dragon, enemy)) {
        targetsInRange.push(enemy);
      }
    }

    return targetsInRange;
  }

  /**
   * Calculate distance squared (faster than full distance calculation)
   * Useful for comparing distances without needing square root
   */
  calculateDistanceSquared(dragon: Dragon, enemy: Enemy): number {
    const dx = dragon.position.x - enemy.position.x;
    const dy = dragon.position.y - enemy.position.y;
    return dx * dx + dy * dy;
  }

  /**
   * Check if enemy is within range using squared distance (faster)
   */
  isWithinRangeSquared(dragon: Dragon, enemy: Enemy): boolean {
    const distanceSquared = this.calculateDistanceSquared(dragon, enemy);
    const rangeSquared = dragon.attackRange * dragon.attackRange;
    return distanceSquared <= rangeSquared;
  }

  /**
   * Get the closest enemy to the dragon
   * Returns null if no enemies are in range
   */
  getClosestEnemy(enemies: Enemy[], dragon: Dragon): Enemy | null {
    let closestEnemy: Enemy | null = null;
    let closestDistance = Infinity;

    for (const enemy of enemies) {
      if (!enemy.isAlive || !this.isWithinRange(dragon, enemy)) continue;

      const distance = this.calculateDistance(dragon, enemy);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }

    return closestEnemy;
  }

  /**
   * Get enemies sorted by distance (closest first)
   */
  getEnemiesByDistance(enemies: Enemy[], dragon: Dragon): Enemy[] {
    const enemiesWithDistance = enemies
      .filter((enemy) => enemy.isAlive && this.isWithinRange(dragon, enemy))
      .map((enemy) => ({
        enemy,
        distance: this.calculateDistance(dragon, enemy),
      }))
      .sort((a, b) => a.distance - b.distance)
      .map((item) => item.enemy);

    return enemiesWithDistance;
  }

  /**
   * Get performance metrics for range detection
   */
  getPerformanceMetrics(): {
    spatialGridSize: number;
    gridCellCount: number;
    averageEnemiesPerCell: number;
  } {
    const totalEnemies = Array.from(this.spatialGrid.values()).reduce(
      (sum, enemies) => sum + enemies.length,
      0,
    );

    return {
      spatialGridSize: this.gridSize,
      gridCellCount: this.spatialGrid.size,
      averageEnemiesPerCell: this.spatialGrid.size > 0 ? totalEnemies / this.spatialGrid.size : 0,
    };
  }

  /**
   * Clear spatial grid (for cleanup)
   */
  clearSpatialGrid(): void {
    this.spatialGrid.clear();
  }
}

/**
 * Create a default range detection instance
 */
export function createRangeDetection(maxRange = 1000, gridSize = 100): RangeDetection {
  return new DefaultRangeDetection(maxRange, gridSize);
}

/**
 * Utility functions for range calculations
 */
export const RangeUtils = {
  /**
   * Calculate distance between two points
   */
  distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Calculate distance squared (faster)
   */
  distanceSquared(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  },

  /**
   * Check if point is within circular range
   */
  isWithinRange(
    centerX: number,
    centerY: number,
    targetX: number,
    targetY: number,
    range: number,
  ): boolean {
    return RangeUtils.distanceSquared(centerX, centerY, targetX, targetY) <= range * range;
  },

  /**
   * Get grid key for spatial partitioning
   */
  getGridKey(x: number, y: number, gridSize: number): string {
    const gridX = Math.floor(x / gridSize);
    const gridY = Math.floor(y / gridSize);
    return `${gridX},${gridY}`;
  },
};
