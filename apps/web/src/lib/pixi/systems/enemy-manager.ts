/**
 * Enemy Manager System
 *
 * Manages enemy spawning, movement, and lifecycle for the journey.
 * All enemies currently use Mantair sprite for Phase 1.
 */

import type { Application, Container, Sprite } from 'pixi.js';
import {
  createAnimatedEnemySprite,
  enemyConfigs,
  type EnemyAnimator,
  type EnemyType,
} from '../enemy-sprites';
import type { ResponsiveManager } from './responsive-manager';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';
import type { EventBus, EventSubscription, CombatEvent } from '@draconia/shared';

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
  baseArcana?: number; // Base arcana reward when this enemy is defeated
  isDefeated?: boolean; // Whether enemy is defeated
  deathTime?: number; // When enemy was defeated (for animation tracking)
}

export interface EnemyManagerConfig {
  maxEnemies?: number;
  enemySpawnInterval?: number; // ms between individual enemy spawns (2s)
  waveCooldown?: number; // ms cooldown after wave completes (15s)
  enemySpeed?: number; // pixels per second
  spawnBuffer?: number; // pixels offscreen to spawn
  eventBus?: EventBus; // Event bus for event-driven communication
  deathAnimationDuration?: number; // Duration of death animation in ms (default: 330)
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

  // Wave spawning state
  private waveState: 'ready' | 'spawning' | 'cooldown' = 'ready';
  private currentWaveSize = 0;
  private currentWaveSpawned = 0;
  private lastEnemySpawnTime = 0;
  private waveCooldownStartTime = 0;

  // Event system
  private eventBus: EventBus | null = null;
  private eventSubscriptions: EventSubscription[] = [];
  private deathAnimationDuration: number = 330; // Default 330ms

  // Defeated enemy queue for batch processing
  private defeatedEnemies: Map<number, { enemy: EnemyData; deathTime: number }> = new Map();

  constructor(
    app: Application,
    responsiveManager: ResponsiveManager,
    config: EnemyManagerConfig = {},
  ) {
    this.app = app;
    this.responsiveManager = responsiveManager;
    this.config = {
      maxEnemies: 10,
      enemySpawnInterval: 2000, // 2 seconds between individual enemy spawns
      waveCooldown: 15000, // 15 seconds cooldown after wave
      enemySpeed: 100, // pixels per second
      spawnBuffer: 100, // spawn 100px offscreen
      deathAnimationDuration: 330, // 330ms death animation
      ...config,
    };

    this.deathAnimationDuration = this.config.deathAnimationDuration ?? 330;
    this.eventBus = config.eventBus || null;

    // Set up event listeners if eventBus is provided
    if (this.eventBus) {
      this.setupEventListeners();
    }

    console.log('👾 Enemy Manager: Initialized');
  }

  /**
   * Set up event listeners for enemy defeat flow
   */
  private setupEventListeners(): void {
    if (!this.eventBus) return;

    // Listen for arcana_awarded to remove enemy
    const arcanaAwardedSub = this.eventBus.on<CombatEvent>(
      'combat',
      'arcana_awarded',
      (event) => {
        const payload = event.payload as { enemyId: number | string };
        this.removeDefeatedEnemy(payload.enemyId as number);
      },
    );
    this.eventSubscriptions.push(arcanaAwardedSub);
  }

  /**
   * Mark an enemy as defeated and emit event
   */
  markDefeated(enemy: EnemyData): void {
    if (enemy.isDefeated) return; // Already defeated

    enemy.isDefeated = true;
    enemy.deathTime = performance.now();

    // Add to defeated queue
    this.defeatedEnemies.set(enemy.id, {
      enemy,
      deathTime: enemy.deathTime,
    });

    // Emit enemy_defeated event
    if (this.eventBus) {
      this.eventBus.emit<CombatEvent>({
        category: 'combat',
        type: 'enemy_defeated',
        timestamp: Date.now(),
        source: 'enemy-manager',
        payload: {
          enemyId: enemy.id,
          enemyType: enemy.type,
          baseArcana: enemy.baseArcana || 0,
          defeatMethod: 'projectile', // Default for now
          position: { x: enemy.x, y: enemy.y },
          enemy, // Full enemy data for reference
        },
      });

      // Emit death_animation_started event
      this.eventBus.emit<CombatEvent>({
        category: 'combat',
        type: 'death_animation_started',
        timestamp: Date.now(),
        source: 'enemy-manager',
        payload: {
          enemyId: enemy.id,
          animationStartTime: enemy.deathTime,
          animationDuration: this.deathAnimationDuration,
        },
      });
    }
  }

  /**
   * Get defeated enemies that have completed their death animations
   */
  getCompletedDefeats(): EnemyData[] {
    const currentTime = performance.now();
    const completed: EnemyData[] = [];

    for (const [_enemyId, entry] of this.defeatedEnemies.entries()) {
      const timeSinceDeath = currentTime - entry.deathTime;
      if (timeSinceDeath >= this.deathAnimationDuration) {
        completed.push(entry.enemy);
      }
    }

    return completed;
  }

  /**
   * Remove processed defeated enemies from queue
   */
  removeProcessedDefeats(enemyIds: Array<number | string>): void {
    for (const enemyId of enemyIds) {
      this.defeatedEnemies.delete(enemyId as number);
    }
  }

  /**
   * Remove a defeated enemy after arcana is awarded
   */
  private removeDefeatedEnemy(enemyId: number | string): void {
    const id = typeof enemyId === 'string' ? parseInt(enemyId, 10) : enemyId;
    const index = this.enemies.findIndex((e) => e.id === id);

    if (index !== -1) {
      // Emit enemy_removed event before removal
      if (this.eventBus) {
        this.eventBus.emit<CombatEvent>({
          category: 'combat',
          type: 'enemy_removed',
          timestamp: Date.now(),
          source: 'enemy-manager',
          payload: {
            enemyId: id,
          },
        });
      }

      this.removeEnemy(index);
      this.defeatedEnemies.delete(id);
    }
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
    this.waveState = 'ready';
    this.currentWaveSize = 0;
    this.currentWaveSpawned = 0;
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
      // Spawn in upper 45% of screen (sky area only - above ground)
      const spawnY = screenHeight * 0.15 + Math.random() * (screenHeight * 0.30);

      sprite.position.set(spawnX, spawnY);
      sprite.scale.set(scale);
      sprite.visible = true;
      setZIndex(sprite, Z_LAYERS.ENEMIES);

      // Add to container
      this.enemyContainer.addChild(sprite);

      // Start animation
      await animator.start();
      animator.setFPS(8);

      // Get enemy config for baseArcana
      const enemyConfig = enemyConfigs[type];

      // Create enemy data
      const enemyData: EnemyData = {
        id: this.nextEnemyId++,
        sprite,
        animator,
        x: spawnX,
        y: spawnY,
        type,
        isMoving: true,
        health: enemyConfig.health,
        maxHealth: enemyConfig.health,
        damage: enemyConfig.damage,
        speed: this.config.enemySpeed!,
        baseArcana: enemyConfig.baseArcana, // Store base arcana from config
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

    // Wave spawning state machine
    if (this.isSpawning) {
      switch (this.waveState) {
        case 'ready':
          // Start a new wave
          this.currentWaveSize = Math.floor(Math.random() * 3) + 1; // 1-3 enemies
          this.currentWaveSpawned = 0;
          this.waveState = 'spawning';
          this.lastEnemySpawnTime = currentTime;
          console.log(`👾 Starting new wave: ${this.currentWaveSize} enemies`);
          // Immediately spawn first enemy
          this.spawnEnemy('mantair-corsair');
          this.currentWaveSpawned++;
          break;

        case 'spawning':
          // Spawn next enemy in wave every 2 seconds
          if (this.currentWaveSpawned < this.currentWaveSize) {
            if (currentTime - this.lastEnemySpawnTime >= this.config.enemySpawnInterval!) {
              this.spawnEnemy('mantair-corsair');
              this.currentWaveSpawned++;
              this.lastEnemySpawnTime = currentTime;
              console.log(
                `👾 Wave progress: ${this.currentWaveSpawned}/${this.currentWaveSize} enemies spawned`,
              );
            }
          } else {
            // Wave complete, start cooldown
            this.waveState = 'cooldown';
            this.waveCooldownStartTime = currentTime;
            console.log(`👾 Wave complete. Starting 15s cooldown...`);
          }
          break;

        case 'cooldown':
          // Wait 15 seconds before next wave
          if (currentTime - this.waveCooldownStartTime >= this.config.waveCooldown!) {
            this.waveState = 'ready';
            console.log(`👾 Cooldown complete. Ready for next wave.`);
          }
          break;
      }
    }

    // Check for completed death animations
    if (this.eventBus) {
      const completedDefeats = this.getCompletedDefeats();
      for (const enemy of completedDefeats) {
        // Emit death_animation_complete event
        this.eventBus.emit<CombatEvent>({
          category: 'combat',
          type: 'death_animation_complete',
          timestamp: Date.now(),
          source: 'enemy-manager',
          payload: {
            enemyId: enemy.id,
            enemy, // Full enemy data for reward calculation
          },
        });
      }

      // Remove completed defeats from queue (they'll be fully removed when arcana is awarded)
      if (completedDefeats.length > 0) {
        const completedIds = completedDefeats.map((e) => e.id);
        this.removeProcessedDefeats(completedIds);
      }
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

    // Clean up event subscriptions
    for (const subscription of this.eventSubscriptions) {
      subscription.unsubscribe();
    }
    this.eventSubscriptions = [];
    this.defeatedEnemies.clear();

    this.enemyContainer = null;
    console.log('👾 Enemy Manager: Destroyed');
  }
}
