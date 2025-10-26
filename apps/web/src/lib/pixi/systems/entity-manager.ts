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
import type { ResponsiveManager } from './responsive-manager';

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
  private responsiveManager: ResponsiveManager;
  private healthBarManager: HealthBarManager | null = null;
  private config: EntityManagerConfig;
  private resizeCallback: (() => void) | null = null;

  // Entity references (singleton pattern for unique entities)
  private dragonProtagonist: DragonProtagonistManager | null = null;

  // Entity collections (for multiple entities)
  private enemies: Map<string, unknown> = new Map();

  constructor(
    app: Application,
    assetManager: AssetManager,
    responsiveManager: ResponsiveManager,
    healthBarManager?: HealthBarManager,
    config: EntityManagerConfig = {},
  ) {
    this.app = app;
    this.assetManager = assetManager;
    this.responsiveManager = responsiveManager;
    this.healthBarManager = healthBarManager || null;
    this.config = {
      enableHealthBars: true,
      ...config,
    };

    // Subscribe to responsive manager resize events
    this.resizeCallback = () => this.handleResize();
    this.responsiveManager.onResize(this.resizeCallback);

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
    this.dragonProtagonist = new DragonProtagonistManager(
      this.app,
      this.assetManager,
      this.responsiveManager,
      config,
    );

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

    // Calculate HP bar offset using game world coordinates
    // Dragon: 128px sprite * 0.8 scale = 102.4px visual width, half = 51.2px
    // HP bar: Arc from 120° to 240° with 50px radius
    //   - Rightmost point of arc is at 120° = radius * cos(120°) = -radius/2 from center
    // Gap: 8px desired spacing at baseline
    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const dragonHalfWidth = (128 * 0.8) / 2; // 51.2px at baseline
    const hpBarRadius = 50; // Baseline radius
    const desiredGap = 8; // Baseline gap in pixels
    // Offset = -(dragon half-width + gap - HP bar rightmost extent)
    const hpBarOffsetX = -(dragonHalfWidth + desiredGap - hpBarRadius / 2) * gameWorldScale;

    // Create health bar to the left of dragon at head level
    // Offset accounts for dragon size, HP bar size, and desired gap - all scaled uniformly
    this.healthBarManager.createHealthBar(
      'dragon-protagonist',
      sprite.x + hpBarOffsetX,
      sprite.y + 1, // Raised ~1.75% total (19px up from original +20)
      state.maxHealth,
      state.health,
      // Using default classic-green palette
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

    // Calculate HP bar offset using game world coordinates (same as creation)
    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const dragonHalfWidth = (128 * 0.8) / 2; // 51.2px at baseline
    const hpBarRadius = 50; // Baseline radius
    const desiredGap = 8; // Baseline gap in pixels
    // Offset accounts for arc geometry: rightmost point is at 120° = -radius/2 from center
    const hpBarOffsetX = -(dragonHalfWidth + desiredGap - hpBarRadius / 2) * gameWorldScale;

    // Keep HP bar positioned properly (same as creation)
    this.healthBarManager.setHealthBarPosition(
      'dragon-protagonist',
      sprite.x + hpBarOffsetX,
      sprite.y + 1,
    );
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
   * Handle resize events from ResponsiveManager
   * Re-render HP bars at new scale and update positions
   */
  handleResize(): void {
    console.log('🎯 Entity Manager: Handling resize...');

    // Re-render all HP bars with new gameWorldScale
    if (this.healthBarManager) {
      this.healthBarManager.rerender();
      console.log('🎯 Entity Manager: Re-rendered HP bars with new scale');
    }

    // Update dragon health bar position immediately after dragon resizes
    if (this.dragonProtagonist && this.dragonProtagonist.isVisible()) {
      this.updateDragonHealthBarPosition();
      console.log('🎯 Entity Manager: Updated dragon health bar position on resize');
    }
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
    // Unsubscribe from responsive manager
    if (this.resizeCallback) {
      this.responsiveManager.offResize(this.resizeCallback);
      this.resizeCallback = null;
    }

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
