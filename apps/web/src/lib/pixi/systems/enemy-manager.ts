/**
 * Enemy Manager System
 *
 * Manages enemy spawning, movement, and lifecycle for the journey.
 * All enemies currently use Mantair sprite for Phase 1.
 */

import type { Application, Container, Sprite } from 'pixi.js';
import { createAnimatedEnemySprite, type EnemyAnimator, type EnemyType } from '../enemy-sprites';
import type { ResponsiveManager } from './responsive-manager';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';

export interface EnemyData {
  id: number;
  sprite: Sprite;
  animator: EnemyAnimator;
  x: number;
  y: number;
  type: EnemyType;
  isMoving: boolean;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
}

export interface EnemyManagerConfig {
  maxEnemies?: number;
  spawnInterval?: number; // ms between spawns
  enemySpeed?: number; // pixels per second
  spawnBuffer?: number; // pixels offscreen to spawn
}

/**
 * Enemy Manager
 *
 * Handles enemy spawning and management during journey
 */
export class EnemyManager {
  private app: Application;
  private responsiveManager: ResponsiveManager;
  private config: EnemyManagerConfig;
  private enemies: EnemyData[] = [];
  private nextEnemyId = 1;
  private lastSpawnTime = 0;
  private isSpawning = false;
  private enemyContainer: Container | null = null;

  constructor(
    app: Application,
    responsiveManager: ResponsiveManager,
    config: EnemyManagerConfig = {},
  ) {
    this.app = app;
    this.responsiveManager = responsiveManager;
    this.config = {
      maxEnemies: 10,
      spawnInterval: 3000, // 3 seconds between spawns
      enemySpeed: 100, // pixels per second
      spawnBuffer: 100, // spawn 100px offscreen
      ...config,
    };

    console.log('👾 Enemy Manager: Initialized');
  }

  /**
   * Initialize enemy container and add to stage
   */
  async initialize(parentContainer?: Container): Promise<void> {
    // Create enemy container
    this.enemyContainer = parentContainer || this.app.stage;

    console.log('✅ Enemy Manager: Ready to spawn enemies');
  }

  /**
   * Start spawning enemies
   */
  start(): void {
    this.isSpawning = true;
    this.lastSpawnTime = performance.now();
    console.log('👾 Enemy Manager: Started spawning');
  }

  /**
   * Stop spawning enemies
   */
  stop(): void {
    this.isSpawning = false;
    console.log('👾 Enemy Manager: Stopped spawning');
  }

  /**
   * Spawn a single enemy
   */
  async spawnEnemy(type: EnemyType = 'mantair-corsair'): Promise<EnemyData | null> {
    if (!this.enemyContainer) {
      console.error('❌ Enemy container not initialized');
      return null;
    }

    if (this.enemies.length >= this.config.maxEnemies!) {
      console.log('⚠️ Max enemies reached, skipping spawn');
      return null;
    }

    try {
      // Create animated enemy sprite (always using Mantair for now)
      const { sprite, animator } = await createAnimatedEnemySprite(
        type,
        this.app.renderer,
        this.app.stage,
      );

      // Position enemy offscreen to the right
      const screenWidth = this.app.screen.width;
      const screenHeight = this.app.screen.height;
      const scale = this.responsiveManager.getGameWorldScale();

      const spawnX = screenWidth + this.config.spawnBuffer!;
      // Spawn in upper 60% of screen (sky area)
      const spawnY = screenHeight * 0.2 + Math.random() * (screenHeight * 0.4);

      sprite.position.set(spawnX, spawnY);
      sprite.scale.set(scale);
      sprite.visible = true;
      setZIndex(sprite, Z_LAYERS.ENEMIES);

      // Add to container
      this.enemyContainer.addChild(sprite);

      // Start animation
      await animator.start();
      animator.setFPS(8);

      // Create enemy data
      const enemyData: EnemyData = {
        id: this.nextEnemyId++,
        sprite,
        animator,
        x: spawnX,
        y: spawnY,
        type,
        isMoving: true,
        health: 13, // Mantair health
        maxHealth: 13,
        damage: 8, // Mantair damage
        speed: this.config.enemySpeed!,
      };

      this.enemies.push(enemyData);
      console.log(
        `👾 Spawned enemy ${enemyData.id} (${this.enemies.length}/${this.config.maxEnemies})`,
      );

      return enemyData;
    } catch (error) {
      console.error('❌ Failed to spawn enemy:', error);
      return null;
    }
  }

  /**
   * Update all enemies
   */
  update(deltaTime: number): void {
    const deltaSeconds = deltaTime / 1000;
    const currentTime = performance.now();

    // Auto-spawn enemies if enabled
    if (this.isSpawning && currentTime - this.lastSpawnTime >= this.config.spawnInterval!) {
      this.spawnEnemy('mantair-corsair');
      this.lastSpawnTime = currentTime;
    }

    // Update enemy positions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy.isMoving) {
        // Move enemy left
        enemy.x -= enemy.speed * deltaSeconds;
        enemy.sprite.position.x = enemy.x;

        // Remove if offscreen to the left
        if (enemy.x < -enemy.sprite.width) {
          this.removeEnemy(i);
        }
      }
    }
  }

  /**
   * Remove an enemy by index
   */
  private removeEnemy(index: number): void {
    if (index < 0 || index >= this.enemies.length) return;

    const enemy = this.enemies[index];
    enemy.animator.stop();
    enemy.sprite.destroy();
    this.enemies.splice(index, 1);

    console.log(`👾 Removed enemy ${enemy.id} (${this.enemies.length} remaining)`);
  }

  /**
   * Get all active enemies
   */
  getEnemies(): readonly EnemyData[] {
    return this.enemies;
  }

  /**
   * Get enemy count
   */
  getEnemyCount(): number {
    return this.enemies.length;
  }

  /**
   * Clear all enemies
   */
  clearAllEnemies(): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.removeEnemy(i);
    }
    console.log('👾 Cleared all enemies');
  }

  /**
   * Handle resize
   */
  handleResize(): void {
    const scale = this.responsiveManager.getGameWorldScale();

    // Update enemy scales
    for (const enemy of this.enemies) {
      enemy.sprite.scale.set(scale);
    }
  }

  /**
   * Destroy enemy manager
   */
  destroy(): void {
    this.stop();
    this.clearAllEnemies();
    this.enemyContainer = null;
    console.log('👾 Enemy Manager: Destroyed');
  }
}
