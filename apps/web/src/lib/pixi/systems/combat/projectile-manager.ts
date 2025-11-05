/**
 * Projectile Manager
 *
 * Manages all projectile lifecycle for combat:
 * - Dragon homing projectiles
 * - Enemy straight-line projectiles
 * - Pierce mechanics (70ms delay after hit)
 * - Collision detection integration
 *
 * Phase 1 Combat Implementation - Core System
 */

import type { Application, Container, Sprite } from 'pixi.js';
import {
  createProjectile,
  getDragonProjectileType,
  getProjectileTypeForEnemy,
  type Projectile,
} from '../../projectile-sprites';
import type { EnemyType } from '../../enemy-sprites';
import { Z_LAYERS, setZIndex } from '../rendering/layer-manager';

export interface ProjectileData {
  id: number;
  projectile: Projectile;
  type: 'dragon' | 'enemy';
  hasHit: boolean;
  hitTime: number;
  pierceDelay: number; // 70ms after hit before destruction
  target?: Sprite; // For dragon homing projectiles
}

export interface ProjectileManagerConfig {
  dragonProjectileSpeed?: number; // pixels per second
  enemyProjectileSpeed?: number; // pixels per second
  pierceDelay?: number; // ms delay after hit before destruction
  maxProjectiles?: number; // max concurrent projectiles
}

/**
 * Default configuration for projectiles
 */
export const DEFAULT_PROJECTILE_CONFIG: ProjectileManagerConfig = {
  dragonProjectileSpeed: 250, // fast dragon projectiles
  enemyProjectileSpeed: 150, // slower enemy projectiles
  pierceDelay: 70, // 70ms pierce delay
  maxProjectiles: 100, // max 100 concurrent projectiles
};

/**
 * Projectile Manager
 *
 * Manages all projectiles in the game independently.
 * Collision detection is handled via callbacks passed to fire methods.
 */
export class ProjectileManager {
  private app: Application;
  private config: ProjectileManagerConfig;
  private projectiles: ProjectileData[] = [];
  private nextProjectileId = 1;
  private projectileContainer: Container | null = null;

  constructor(
    app: Application,
    config: ProjectileManagerConfig = {},
  ) {
    this.app = app;
    this.config = { ...DEFAULT_PROJECTILE_CONFIG, ...config };
  }

  /**
   * Initialize projectile container
   */
  async initialize(parentContainer?: Container): Promise<void> {
    this.projectileContainer = parentContainer || this.app.stage;
    setZIndex(this.projectileContainer, Z_LAYERS.PROJECTILES);
  }

  /**
   * Fire a dragon projectile (homing)
   * @param startX - Starting X position
   * @param startY - Starting Y position
   * @param target - Target enemy sprite (for homing)
   * @param collisionCallback - Callback when projectile hits
   * @returns ProjectileData or null if failed
   */
  async fireDragonProjectile(
    startX: number,
    startY: number,
    target: Sprite,
    collisionCallback: (_projectileSprite: Sprite) => boolean,
  ): Promise<ProjectileData | null> {
    if (!this.projectileContainer) {
      console.error('❌ Projectile container not initialized');
      return null;
    }

    if (this.projectiles.length >= this.config.maxProjectiles!) {
      console.warn('⚠️ Max projectiles reached, skipping spawn');
      return null;
    }

    try {
      const projectileType = getDragonProjectileType();
      const projectile = await createProjectile(
        projectileType,
        startX,
        startY,
        target.x,
        target.y,
        this.app.renderer,
        this.projectileContainer,
        collisionCallback,
      );

      // Enable homing to track the target
      projectile.enableHoming(() => {
        if (!target || target.destroyed) {
          return null; // Target is gone
        }
        return { x: target.x, y: target.y };
      });

      // Set projectile speed
      projectile.setFPS(8); // 8 FPS animation

      const projectileData: ProjectileData = {
        id: this.nextProjectileId++,
        projectile,
        type: 'dragon',
        hasHit: false,
        hitTime: 0,
        pierceDelay: this.config.pierceDelay!,
        target,
      };

      this.projectiles.push(projectileData);
      return projectileData;
    } catch (error) {
      console.error('❌ Failed to create dragon projectile:', error);
      return null;
    }
  }

  /**
   * Fire an enemy projectile (straight-line)
   * @param startX - Starting X position
   * @param startY - Starting Y position
   * @param targetX - Target X position
   * @param targetY - Target Y position
   * @param enemyType - Type of enemy firing
   * @param collisionCallback - Callback when projectile hits
   * @returns ProjectileData or null if failed
   */
  async fireEnemyProjectile(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    enemyType: EnemyType,
    collisionCallback: (_projectileSprite: Sprite) => boolean,
  ): Promise<ProjectileData | null> {
    if (!this.projectileContainer) {
      console.error('❌ Projectile container not initialized');
      return null;
    }

    if (this.projectiles.length >= this.config.maxProjectiles!) {
      console.warn('⚠️ Max projectiles reached, skipping spawn');
      return null;
    }

    try {
      const projectileType = getProjectileTypeForEnemy(enemyType);
      const projectile = await createProjectile(
        projectileType,
        startX,
        startY,
        targetX,
        targetY,
        this.app.renderer,
        this.projectileContainer,
        collisionCallback,
      );

      // Enemy projectiles are NOT homing - straight line to target position
      projectile.setFPS(8); // 8 FPS animation

      const projectileData: ProjectileData = {
        id: this.nextProjectileId++,
        projectile,
        type: 'enemy',
        hasHit: false,
        hitTime: 0,
        pierceDelay: this.config.pierceDelay!,
      };

      this.projectiles.push(projectileData);
      return projectileData;
    } catch (error) {
      console.error('❌ Failed to create enemy projectile:', error);
      return null;
    }
  }

  /**
   * Update all projectiles
   */
  update(deltaTime: number): void {
    const currentTime = performance.now();

    // Update projectiles and check for removal
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectileData = this.projectiles[i];

      // Safety check: skip if projectileData is undefined (race condition during clear)
      if (!projectileData) {
        continue;
      }

      // Check if projectile has hit and pierce delay has expired
      if (projectileData.hasHit) {
        const timeSinceHit = currentTime - projectileData.hitTime;
        if (timeSinceHit >= projectileData.pierceDelay) {
          // Pierce delay expired, destroy projectile
          this.removeProjectile(i);
          continue;
        }
      }

      // Update projectile (returns false if should be removed)
      const isAlive = projectileData.projectile.update(deltaTime);
      if (!isAlive) {
        this.removeProjectile(i);
      }
    }
  }

  /**
   * Mark projectile as hit (starts pierce delay timer)
   * @param projectileData - Projectile that hit
   */
  markProjectileHit(projectileData: ProjectileData): void {
    if (!projectileData.hasHit) {
      projectileData.hasHit = true;
      projectileData.hitTime = performance.now();
    }
  }

  /**
   * Remove a projectile by index
   */
  private removeProjectile(index: number): void {
    if (index < 0 || index >= this.projectiles.length) return;

    const projectileData = this.projectiles[index];
    projectileData.projectile.destroy();
    this.projectiles.splice(index, 1);
  }

  /**
   * Get all active projectiles
   */
  getProjectiles(): readonly ProjectileData[] {
    return this.projectiles;
  }

  /**
   * Get dragon projectiles only
   */
  getDragonProjectiles(): readonly ProjectileData[] {
    return this.projectiles.filter((p) => p.type === 'dragon');
  }

  /**
   * Get enemy projectiles only
   */
  getEnemyProjectiles(): readonly ProjectileData[] {
    return this.projectiles.filter((p) => p.type === 'enemy');
  }

  /**
   * Get projectile count
   */
  getProjectileCount(): number {
    return this.projectiles.length;
  }

  /**
   * Clear all projectiles
   */
  clearAllProjectiles(): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      this.removeProjectile(i);
    }
  }

  /**
   * Destroy projectile manager
   */
  destroy(): void {
    this.clearAllProjectiles();
    this.projectileContainer = null;
  }
}
