/**
 * Entity Manager System
 *
 * Centralizes creation and management of all game entities (dragon, enemies, etc.).
 * Ensures single responsibility and prevents duplicate entity creation.
 * HP bars are managed by UIManager (UI elements, not entity logic).
 */

import type { Application } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { DragonProtagonistManager } from './dragon-protagonist';
import { EnemyManager } from './enemy-manager';
import type { ResponsiveManager } from './responsive-manager';
import { ItemInventory, SeededRNG, getItemsByRarity, type ItemRarity } from '@draconia/sim';

export interface EntityManagerConfig {
  enableHealthBars?: boolean;
}

/**
 * Entity Manager
 *
 * Single source of truth for entity creation and lifecycle management.
 * Follows the Single Responsibility Principle by:
 * - Managing entity creation (not rendering)
 * - HP bars managed by UIManager (UI elements, not entity logic)
 * - Providing clean API for entity access
 */
export class EntityManager {
  private app: Application;
  private assetManager: AssetManager;
  private responsiveManager: ResponsiveManager;
  private config: EntityManagerConfig;
  private resizeCallback: (() => void) | null = null;

  // Entity references (singleton pattern for unique entities)
  private dragonProtagonist: DragonProtagonistManager | null = null;

  // Entity collections (for multiple entities)
  private enemies: Map<string, unknown> = new Map();
  private enemyManager: EnemyManager | null = null;

  // Item system (Phase 1: simple drops)
  private itemInventory: ItemInventory = new ItemInventory();
  private dropRNG: SeededRNG;

  constructor(
    app: Application,
    assetManager: AssetManager,
    responsiveManager: ResponsiveManager,
    config: EntityManagerConfig = {},
    profileId: string = 'default-profile', // TODO: Get from actual profile system
  ) {
    this.app = app;
    this.assetManager = assetManager;
    this.responsiveManager = responsiveManager;
    this.config = {
      enableHealthBars: true,
      ...config,
    };

    // Initialize item drop RNG (seeded for anti-save-scum)
    this.dropRNG = new SeededRNG(profileId);

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
   * Create and initialize the enemy manager
   */
  async createEnemyManager(config?: {
    maxEnemies?: number;
    spawnInterval?: number;
  }): Promise<EnemyManager> {
    // Return existing instance if already created
    if (this.enemyManager) {
      console.log('🎯 Entity Manager: Enemy manager already exists, returning existing instance');
      return this.enemyManager;
    }

    console.log('🎯 Entity Manager: Creating enemy manager...');

    // Create enemy manager
    this.enemyManager = new EnemyManager(this.app, this.responsiveManager, config);

    await this.enemyManager.initialize();

    console.log('✅ Entity Manager: Enemy manager created');

    return this.enemyManager;
  }

  /**
   * Get the enemy manager instance
   */
  getEnemyManager(): EnemyManager | null {
    return this.enemyManager;
  }

  /**
   * Update all entities
   */
  update(deltaTime: number): void {
    // Update dragon protagonist
    if (this.dragonProtagonist) {
      this.dragonProtagonist.update(deltaTime);
    }

    // Update enemy manager
    if (this.enemyManager) {
      this.enemyManager.update(deltaTime);
    }
  }

  /**
   * Handle resize events from ResponsiveManager
   */
  handleResize(): void {
    console.log('🎯 Entity Manager: Handling resize...');

    // Update enemy manager
    if (this.enemyManager) {
      this.enemyManager.handleResize();
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
   * Handle enemy death - roll for item drops
   * Phase 1: Simple 15% drop chance, weighted by rarity
   */
  handleEnemyDeath(enemy: { type: string; landId: number; id?: number }): void {
    console.log(`💀 Enemy died: ${enemy.type}`);

    // 15% chance to drop an item
    if (this.dropRNG.random() < 0.15) {
      const item = this.selectRandomItem();

      if (item) {
        this.itemInventory.addItem(item.id);
      }
    }
  }

  /**
   * Select random item using weighted rarity distribution
   * Common: 50%, Uncommon: 30%, Rare: 15%, Epic: 4%, Legendary: 1%
   */
  private selectRandomItem() {
    const roll = this.dropRNG.random();

    let targetRarity: ItemRarity;
    if (roll < 0.5)
      targetRarity = 1; // Common (50%)
    else if (roll < 0.8)
      targetRarity = 2; // Uncommon (30%)
    else if (roll < 0.95)
      targetRarity = 3; // Rare (15%)
    else if (roll < 0.99)
      targetRarity = 4; // Epic (4%)
    else targetRarity = 5; // Legendary (1%)

    // Get all items of that rarity
    const itemsOfRarity = getItemsByRarity(targetRarity);

    if (itemsOfRarity.length === 0) {
      console.warn(`⚠️  No items found for rarity ${targetRarity}`);
      return null;
    }

    // Pick random one
    const index = this.dropRNG.randomInt(0, itemsOfRarity.length - 1);
    return itemsOfRarity[index];
  }

  /**
   * Get item inventory (for UI and database saving)
   */
  getItemInventory(): ItemInventory {
    return this.itemInventory;
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

    // Destroy enemy manager
    if (this.enemyManager) {
      this.enemyManager.destroy();
      this.enemyManager = null;
    }

    // Destroy dragon protagonist
    if (this.dragonProtagonist) {
      this.dragonProtagonist.destroy();
      this.dragonProtagonist = null;
    }

    // HP bar cleanup is handled by UIManager (UI owns all health bars)

    // Destroy all enemies (future)
    this.enemies.clear();

    console.log('🎯 Entity Manager: Destroyed');
  }
}
