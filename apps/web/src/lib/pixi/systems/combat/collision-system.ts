/**
 * Collision System
 *
 * Provides AABB (Axis-Aligned Bounding Box) collision detection for combat.
 * Uses 50% hitbox scaling for better game feel and performance.
 *
 * Phase 1 Combat Implementation - Core System
 */

import type { Sprite } from 'pixi.js';

export interface CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Configuration for collision detection
 */
export interface CollisionConfig {
  /** Hitbox scale factor (0.5 = 50% of sprite size) */
  hitboxScale: number;
}

/**
 * Default collision configuration
 */
export const DEFAULT_COLLISION_CONFIG: CollisionConfig = {
  hitboxScale: 0.5, // 50% hitbox for better game feel
};

/**
 * Collision System
 *
 * Pure utility class for AABB collision detection.
 * No state management - just collision detection logic.
 */
export class CollisionSystem {
  private config: CollisionConfig;

  constructor(config: CollisionConfig = DEFAULT_COLLISION_CONFIG) {
    this.config = config;
  }

  /**
   * Get scaled collision box for a sprite
   * @param sprite - Sprite to get collision box for
   * @returns CollisionBox with scaled dimensions
   */
  getCollisionBox(sprite: Sprite): CollisionBox {
    // Get sprite bounds
    const bounds = sprite.getBounds();

    // Apply hitbox scaling (centered)
    const scaledWidth = bounds.width * this.config.hitboxScale;
    const scaledHeight = bounds.height * this.config.hitboxScale;

    // Center the scaled hitbox
    const offsetX = (bounds.width - scaledWidth) / 2;
    const offsetY = (bounds.height - scaledHeight) / 2;

    return {
      x: bounds.x + offsetX,
      y: bounds.y + offsetY,
      width: scaledWidth,
      height: scaledHeight,
    };
  }

  /**
   * Check if two sprites are colliding using AABB detection
   * @param spriteA - First sprite
   * @param spriteB - Second sprite
   * @returns true if sprites are colliding
   */
  checkCollision(spriteA: Sprite, spriteB: Sprite): boolean {
    const boxA = this.getCollisionBox(spriteA);
    const boxB = this.getCollisionBox(spriteB);

    return this.checkBoxCollision(boxA, boxB);
  }

  /**
   * Check if two collision boxes are overlapping
   * @param boxA - First collision box
   * @param boxB - Second collision box
   * @returns true if boxes are overlapping
   */
  checkBoxCollision(boxA: CollisionBox, boxB: CollisionBox): boolean {
    return (
      boxA.x < boxB.x + boxB.width &&
      boxA.x + boxA.width > boxB.x &&
      boxA.y < boxB.y + boxB.height &&
      boxA.y + boxA.height > boxB.y
    );
  }

  /**
   * Check if a point is inside a sprite's collision box
   * @param point - Point to check (x, y coordinates)
   * @param sprite - Sprite to check against
   * @returns true if point is inside sprite's collision box
   */
  checkPointCollision(point: { x: number; y: number }, sprite: Sprite): boolean {
    const box = this.getCollisionBox(sprite);

    return (
      point.x >= box.x &&
      point.x <= box.x + box.width &&
      point.y >= box.y &&
      point.y <= box.y + box.height
    );
  }

  /**
   * Get distance between two sprites (center to center)
   * @param spriteA - First sprite
   * @param spriteB - Second sprite
   * @returns Distance in pixels
   */
  getDistance(spriteA: Sprite, spriteB: Sprite): number {
    const dx = spriteB.x - spriteA.x;
    const dy = spriteB.y - spriteA.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if spriteB is within range of spriteA
   * @param spriteA - Center sprite (e.g., dragon)
   * @param spriteB - Target sprite (e.g., enemy)
   * @param range - Range in pixels
   * @returns true if spriteB is within range
   */
  isInRange(spriteA: Sprite, spriteB: Sprite, range: number): boolean {
    return this.getDistance(spriteA, spriteB) <= range;
  }

  /**
   * Find all sprites within range of a center sprite
   * @param centerSprite - Center sprite to check from
   * @param sprites - Array of sprites to check
   * @param range - Range in pixels
   * @returns Array of sprites within range
   */
  findSpritesInRange(centerSprite: Sprite, sprites: Sprite[], range: number): Sprite[] {
    return sprites.filter((sprite) => this.isInRange(centerSprite, sprite, range));
  }

  /**
   * Find closest sprite to a center sprite
   * @param centerSprite - Center sprite to check from
   * @param sprites - Array of sprites to check
   * @param maxRange - Optional maximum range to consider (default: Infinity)
   * @returns Closest sprite or null if none in range
   */
  findClosestSprite(
    centerSprite: Sprite,
    sprites: Sprite[],
    maxRange: number = Infinity,
  ): Sprite | null {
    let closestSprite: Sprite | null = null;
    let closestDistance = maxRange;

    for (const sprite of sprites) {
      const distance = this.getDistance(centerSprite, sprite);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSprite = sprite;
      }
    }

    return closestSprite;
  }

  /**
   * Update collision configuration
   * @param newConfig - New configuration (partial)
   */
  updateConfig(newConfig: Partial<CollisionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current collision configuration
   * @returns Current configuration
   */
  getConfig(): CollisionConfig {
    return { ...this.config };
  }
}
