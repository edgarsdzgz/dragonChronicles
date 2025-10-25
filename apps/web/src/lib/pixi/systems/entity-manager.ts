/**
 * Entity Manager System
 *
 * Centralizes creation and management of all game entities (dragon, enemies, etc.).
 * Ensures single responsibility and prevents duplicate entity creation.
 * Delegates health bar creation to HealthBarManager.
 */

import type { Application } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { DragonProtagonistManager } from './dragon-protagonist';
import { HealthBarManager } from './health-bar-manager';

export interface EntityManagerConfig {
  enableHealthBars?: boolean;
}

/**
 * Entity Manager
 *
 * Single source of truth for entity creation and lifecycle management.
 * Follows the Single Responsibility Principle by:
 * - Managing entity creation (not rendering)
 * - Delegating health bars to HealthBarManager
 * - Providing clean API for entity access
 */
export class EntityManager {
  private app: Application;
  private assetManager: AssetManager;
  private healthBarManager: HealthBarManager | null = null;
  private config: EntityManagerConfig;

  // Entity references (singleton pattern for unique entities)
  private dragonProtagonist: DragonProtagonistManager | null = null;

  // Entity collections (for multiple entities)
  private enemies: Map<string, unknown> = new Map();

  constructor(
    app: Application,
    assetManager: AssetManager,
    healthBarManager?: HealthBarManager,
    config: EntityManagerConfig = {},
  ) {
    this.app = app;
    this.assetManager = assetManager;
    this.healthBarManager = healthBarManager || null;
    this.config = {
      enableHealthBars: true,
      ...config,
    };

    console.log('🎯 Entity Manager: Initialized');
  }

  /**
   * Create the dragon protagonist (singleton)
   * Returns existing instance if already created
   */
  async createDragonProtagonist(config?: {
    x?: number;
    y?: number;
    scale?: number;
    visible?: boolean;
  }): Promise<DragonProtagonistManager> {
    // Return existing instance if already created
    if (this.dragonProtagonist) {
      console.log(
        '🎯 Entity Manager: Dragon protagonist already exists, returning existing instance',
      );
      return this.dragonProtagonist;
    }

    console.log('🎯 Entity Manager: Creating dragon protagonist...');

    // Create dragon protagonist
    this.dragonProtagonist = new DragonProtagonistManager(this.app, this.assetManager, config);

    await this.dragonProtagonist.initialize();

    console.log('✅ Entity Manager: Dragon protagonist created');

    return this.dragonProtagonist;
  }

  /**
   * Get the dragon protagonist instance
   */
  getDragonProtagonist(): DragonProtagonistManager | null {
    return this.dragonProtagonist;
  }

  /**
   * Create health bar for dragon protagonist
   * Delegates to HealthBarManager
   */
  createDragonHealthBar(): void {
    if (!this.config.enableHealthBars || !this.healthBarManager) {
      return;
    }

    if (!this.dragonProtagonist) {
      console.warn('🎯 Entity Manager: Cannot create health bar - dragon not initialized');
      return;
    }

    const sprite = this.dragonProtagonist.getDragonSprite();
    if (!sprite) {
      console.warn('🎯 Entity Manager: Cannot create health bar - dragon sprite not ready');
      return;
    }

    const state = this.dragonProtagonist.getState();

    // Create health bar above dragon
    this.healthBarManager.createHealthBar(
      'dragon-protagonist',
      sprite.x - 30, // Center the bar (60px width / 2)
      sprite.y - 40, // Above the dragon
      60, // Width
      8, // Height
      state.maxHealth,
      state.health,
    );

    console.log('✅ Entity Manager: Dragon health bar created');
  }

  /**
   * Update dragon health bar position
   */
  updateDragonHealthBarPosition(): void {
    if (!this.config.enableHealthBars || !this.healthBarManager || !this.dragonProtagonist) {
      return;
    }

    const sprite = this.dragonProtagonist.getDragonSprite();
    if (!sprite) return;

    this.healthBarManager.setHealthBarPosition('dragon-protagonist', sprite.x - 30, sprite.y - 40);
  }

  /**
   * Update dragon health bar value
   */
  updateDragonHealth(health: number, maxHealth: number): void {
    if (!this.config.enableHealthBars || !this.healthBarManager) {
      return;
    }

    this.healthBarManager.updateHealthBar('dragon-protagonist', health, maxHealth);
  }

  /**
   * Enter a land with the dragon
   */
  async enterLandWithDragon(landId: string): Promise<void> {
    if (!this.dragonProtagonist) {
      console.warn('🎯 Entity Manager: Cannot enter land - dragon not created');
      return;
    }

    await this.dragonProtagonist.enterLand(landId);

    // Create health bar after dragon enters land
    if (this.config.enableHealthBars) {
      this.createDragonHealthBar();
    }

    console.log(`🎯 Entity Manager: Dragon entered land ${landId}`);
  }

  /**
   * Exit land with the dragon
   */
  exitLandWithDragon(): void {
    if (!this.dragonProtagonist) {
      return;
    }

    this.dragonProtagonist.exitLand();

    // Remove health bar when dragon exits land
    if (this.healthBarManager) {
      this.healthBarManager.removeHealthBar('dragon-protagonist');
    }

    console.log('🎯 Entity Manager: Dragon exited land');
  }

  /**
   * Update all entities
   */
  update(deltaTime: number): void {
    // Update dragon protagonist
    if (this.dragonProtagonist) {
      this.dragonProtagonist.update(deltaTime);

      // Update health bar position to follow dragon
      if (this.dragonProtagonist.isVisible()) {
        this.updateDragonHealthBarPosition();
      }
    }

    // Update enemies (future)
    // this.enemies.forEach(enemy => enemy.update(deltaTime));
  }

  /**
   * Spawn an enemy (future implementation)
   */
  spawnEnemy(_type: string, _position: { x: number; y: number }): string {
    // Future implementation for enemy spawning
    console.warn('🎯 Entity Manager: Enemy spawning not yet implemented');
    return '';
  }

  /**
   * Despawn an enemy (future implementation)
   */
  despawnEnemy(_enemyId: string): void {
    // Future implementation for enemy despawning
    console.warn('🎯 Entity Manager: Enemy despawning not yet implemented');
  }

  /**
   * Destroy the entity manager
   */
  destroy(): void {
    // Destroy dragon protagonist
    if (this.dragonProtagonist) {
      this.dragonProtagonist.destroy();
      this.dragonProtagonist = null;
    }

    // Remove dragon health bar
    if (this.healthBarManager) {
      this.healthBarManager.removeHealthBar('dragon-protagonist');
    }

    // Destroy all enemies (future)
    this.enemies.clear();

    console.log('🎯 Entity Manager: Destroyed');
  }
}
