/**
 * Collision Utilities
 *
 * Pure utility functions for AABB (Axis-Aligned Bounding Box) collision detection.
 * Uses 50% hitbox scaling for better game feel and performance.
 *
 * Phase 1 Combat Implementation - Utility Functions
 */

import type { Sprite } from 'pixi.js';

export interface CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Default hitbox scale factor (50% of sprite size)
 */
export const DEFAULT_HITBOX_SCALE = 0.5;

/**
 * Check if a sprite is valid for collision detection
 * @param sprite - Sprite to check
 * @returns true if sprite is valid
 */
function isSpriteValid(sprite: Sprite | null | undefined): sprite is Sprite {
  return sprite != null && !sprite.destroyed;
}

/**
 * Get scaled collision box for a sprite
 * @param sprite - Sprite to get collision box for
 * @param hitboxScale - Scale factor for hitbox (default: 0.5 = 50%)
 * @returns CollisionBox with scaled dimensions, or zero-size box if sprite invalid
 */
export function getCollisionBox(sprite: Sprite, hitboxScale = DEFAULT_HITBOX_SCALE): CollisionBox {
  // Safety check: return zero-size box if sprite is invalid
  if (!isSpriteValid(sprite)) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  // Get sprite bounds
  const bounds = sprite.getBounds();

  // Apply hitbox scaling (centered)
  const scaledWidth = bounds.width * hitboxScale;
  const scaledHeight = bounds.height * hitboxScale;

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
 * Check if two collision boxes are overlapping
 * @param boxA - First collision box
 * @param boxB - Second collision box
 * @returns true if boxes are overlapping
 */
export function checkBoxCollision(boxA: CollisionBox, boxB: CollisionBox): boolean {
  return (
    boxA.x < boxB.x + boxB.width &&
    boxA.x + boxA.width > boxB.x &&
    boxA.y < boxB.y + boxB.height &&
    boxA.y + boxA.height > boxB.y
  );
}

/**
 * Check if two sprites are colliding using AABB detection
 * @param spriteA - First sprite
 * @param spriteB - Second sprite
 * @param hitboxScale - Scale factor for hitbox (default: 0.5 = 50%)
 * @returns true if sprites are colliding, false if either sprite is invalid
 */
export function checkCollision(
  spriteA: Sprite,
  spriteB: Sprite,
  hitboxScale = DEFAULT_HITBOX_SCALE,
): boolean {
  // Safety check: both sprites must be valid
  if (!isSpriteValid(spriteA) || !isSpriteValid(spriteB)) {
    return false;
  }

  const boxA = getCollisionBox(spriteA, hitboxScale);
  const boxB = getCollisionBox(spriteB, hitboxScale);

  return checkBoxCollision(boxA, boxB);
}

/**
 * Check if a point is inside a sprite's collision box
 * @param point - Point to check (x, y coordinates)
 * @param sprite - Sprite to check against
 * @param hitboxScale - Scale factor for hitbox (default: 0.5 = 50%)
 * @returns true if point is inside sprite's collision box
 */
export function checkPointCollision(
  point: { x: number; y: number },
  sprite: Sprite,
  hitboxScale = DEFAULT_HITBOX_SCALE,
): boolean {
  const box = getCollisionBox(sprite, hitboxScale);

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
 * @returns Distance in pixels, or Infinity if either sprite is invalid
 */
export function getDistance(spriteA: Sprite, spriteB: Sprite): number {
  // Safety check: both sprites must be valid
  if (!isSpriteValid(spriteA) || !isSpriteValid(spriteB)) {
    return Infinity;
  }

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
export function isInRange(spriteA: Sprite, spriteB: Sprite, range: number): boolean {
  return getDistance(spriteA, spriteB) <= range;
}

/**
 * Find all sprites within range of a center sprite
 * @param centerSprite - Center sprite to check from
 * @param sprites - Array of sprites to check
 * @param range - Range in pixels
 * @returns Array of sprites within range (excludes invalid sprites)
 */
export function findSpritesInRange(centerSprite: Sprite, sprites: Sprite[], range: number): Sprite[] {
  // Safety check: filter out invalid sprites
  return sprites
    .filter((sprite) => isSpriteValid(sprite))
    .filter((sprite) => isInRange(centerSprite, sprite, range));
}

/**
 * Find closest sprite to a center sprite
 * @param centerSprite - Center sprite to check from
 * @param sprites - Array of sprites to check
 * @param maxRange - Optional maximum range to consider (default: Infinity)
 * @returns Closest sprite or null if none in range (excludes invalid sprites)
 */
export function findClosestSprite(
  centerSprite: Sprite,
  sprites: Sprite[],
  maxRange: number = Infinity,
): Sprite | null {
  let closestSprite: Sprite | null = null;
  let closestDistance = maxRange;

  for (const sprite of sprites) {
    // Safety check: skip invalid sprites
    if (!isSpriteValid(sprite)) {
      continue;
    }

    const distance = getDistance(centerSprite, sprite);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestSprite = sprite;
    }
  }

  return closestSprite;
}
