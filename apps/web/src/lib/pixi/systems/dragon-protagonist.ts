/**
 * Dragon Protagonist System
 *
 * Manages the dragon protagonist sprite that appears only when in a land during a journey.
 * Integrates with the land manager to show/hide the dragon appropriately.
 *
 * GAME WORLD COORDINATES:
 * - Dragon positioned at (86.4, 302.4) in game world (4.5%, 28% of 1920x1080)
 * - Dragon intended scale: 0.8 at baseline
 * - ResponsiveManager.getGameWorldScale() applied to position and scale
 */

import { Sprite, Container, type Application } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { createAnimatedDragonSprite, type DragonAnimator } from '../dragon-sprites';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';
import type { ResponsiveManager } from './responsive-manager';
import type { EventBus, EventSubscription, UIEvent } from '@draconia/shared';

/**
 * Dragon position in game world coordinates (at 1080p baseline)
 */
const DRAGON_GAME_WORLD_X = 115.2; // 6% of 1920
const DRAGON_GAME_WORLD_Y = 302.4; // 28% of 1080
const DRAGON_INTENDED_SCALE = 0.8; // Scale at 1080p baseline
const DRAGON_BASE_MOVEMENT_SPEED = 100; // Pixels per second (base speed for journey scrolling)

export interface DragonProtagonistConfig {
  x?: number;
  y?: number;
  scale?: number;
  visible?: boolean;
  movementSpeed?: number; // Pixels per second (for journey scrolling)
  eventBus?: EventBus; // Event bus for event-driven communication
}

export interface DragonProtagonistState {
  isVisible: boolean;
  isInLand: boolean;
  isJourneyActive: boolean;
  currentLand: string | null;
  health: number;
  maxHealth: number;
  movementSpeed: number; // Pixels per second (for journey scrolling)
}

/**
 * Dragon Protagonist Manager
 */
export class DragonProtagonistManager {
  private app: Application;
  private assetManager: AssetManager;
  private responsiveManager: ResponsiveManager;
  private container: Container;
  private dragonSprite: Sprite | null = null;
  private dragonAnimator: DragonAnimator | null = null;
  private config: DragonProtagonistConfig;
  private state: DragonProtagonistState;
  private isInitialized: boolean = false;
  private resizeCallback: (() => void) | null = null;
  private disableAutoRestart: boolean = false; // For cutscenes to control animation

  // Event system
  private eventBus: EventBus | null = null;
  private eventSubscriptions: EventSubscription[] = [];

  constructor(
    app: Application,
    assetManager: AssetManager,
    responsiveManager: ResponsiveManager,
    config: DragonProtagonistConfig = {},
  ) {
    this.app = app;
    this.assetManager = assetManager;
    this.responsiveManager = responsiveManager;
    this.config = {
      // x and y removed - always use game world constants for consistency
      scale: 1.0,
      visible: true,
      ...config,
    };

    this.state = {
      isVisible: false,
      isInLand: false,
      isJourneyActive: false,
      currentLand: null,
      health: 10000,
      maxHealth: 10000,
      movementSpeed: config.movementSpeed ?? DRAGON_BASE_MOVEMENT_SPEED,
    };

    // Create container for dragon
    this.container = new Container();
    this.container.label = 'dragon-protagonist-container';
    setZIndex(this.container, Z_LAYERS.PLAYER);
    this.app.stage.addChild(this.container);

    // Subscribe to responsive manager resize events
    this.resizeCallback = () => this.handleResize();
    this.responsiveManager.onResize(this.resizeCallback);

    // Set up event bus and listeners
    this.eventBus = config.eventBus || null;
    if (this.eventBus) {
      this.setupEventListeners();
    }
  }

  /**
   * Set up event listeners for UI events
   */
  private setupEventListeners(): void {
    if (!this.eventBus) return;

    // Listen for speed change events
    const speedSub = this.eventBus.on<UIEvent>('ui', 'speed_changed', (event) => {
      const payload = event.payload as { speed: number };
      this.setMovementSpeed(payload.speed);
    });
    this.eventSubscriptions.push(speedSub);
  }

  /**
   * Initialize the dragon protagonist
   * Uses UNIFIED GAME WORLD SCALING
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      console.log('🐉 Dragon Protagonist: Initializing...');

      // Create animated dragon sprite
      console.log('🐉 Dragon Protagonist: Creating animated dragon sprite...');
      const { sprite, animator } = await createAnimatedDragonSprite();

      this.dragonSprite = sprite;
      this.dragonAnimator = animator;
      console.log('🐉 Dragon Protagonist: Dragon sprite created successfully');

      // Get uniform game world scale
      const gameWorldScale = this.responsiveManager.getGameWorldScale();

      // Configure sprite using game world coordinates
      // Position: (115.2, 302.4) in game world = (6%, 28%) of (1920, 1080)
      // Scale: 0.8 at baseline * game world scale
      // IMPORTANT: Always scale coordinates, whether from config or constants
      this.dragonSprite.x = (this.config.x ?? DRAGON_GAME_WORLD_X) * gameWorldScale;
      this.dragonSprite.y = (this.config.y ?? DRAGON_GAME_WORLD_Y) * gameWorldScale;
      this.dragonSprite.scale.set((this.config.scale ?? DRAGON_INTENDED_SCALE) * gameWorldScale);
      this.dragonSprite.visible = false; // Start hidden

      // Set proper z-index (above background, below UI)
      setZIndex(this.dragonSprite, Z_LAYERS.PLAYER);

      // Add to container
      this.container.addChild(this.dragonSprite);

      this.isInitialized = true;
      console.log(
        `✅ Dragon Protagonist: Initialized at (${this.dragonSprite.x.toFixed(1)}, ${this.dragonSprite.y.toFixed(1)}), scale: ${this.dragonSprite.scale.x.toFixed(3)}`,
      );
      return true;
    } catch (error) {
      console.error('❌ Dragon Protagonist: Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Show the dragon when entering a land during a journey
   */
  async enterLand(landId: string): Promise<void> {
    if (!this.isInitialized) {
      console.log('🐉 Dragon Protagonist: Not initialized, initializing now...');
      await this.initialize();
    }

    this.state.isInLand = true;
    this.state.currentLand = landId;
    this.state.isJourneyActive = true;

    if (this.dragonSprite) {
      console.log('🐉 Dragon Protagonist: Making dragon visible...');
      this.dragonSprite.visible = true;
      this.state.isVisible = true;

      console.log(
        `🐉 Dragon Protagonist: Dragon visible at (${this.dragonSprite.x}, ${this.dragonSprite.y})`,
      );
    } else {
      console.error('🐉 Dragon Protagonist: Dragon sprite is null!');
    }

    console.log(`🐉 Dragon Protagonist: Entered land ${landId}`);
  }

  /**
   * Hide the dragon when leaving a land
   */
  exitLand(): void {
    this.state.isInLand = false;
    this.state.currentLand = null;

    if (this.dragonSprite) {
      this.dragonSprite.visible = false;
      this.state.isVisible = false;
    }

    console.log('🐉 Dragon Protagonist: Exited land');
  }

  /**
   * Start a journey (dragon will appear when entering lands)
   */
  startJourney(): void {
    this.state.isJourneyActive = true;
    console.log('🐉 Dragon Protagonist: Journey started');
  }

  /**
   * End a journey (dragon will be hidden)
   */
  endJourney(): void {
    this.state.isJourneyActive = false;
    this.state.isInLand = false;
    this.state.currentLand = null;

    if (this.dragonSprite) {
      this.dragonSprite.visible = false;
      this.state.isVisible = false;
    }

    console.log('🐉 Dragon Protagonist: Journey ended');
  }

  /**
   * Update dragon animation and position
   */
  update(_deltaTime: number): void {
    if (!this.isInitialized || !this.dragonSprite || !this.dragonAnimator) {
      return;
    }

    // Only update if visible and in a land
    if (this.state.isVisible && this.state.isInLand) {
      // Start animation if not already playing (unless cutscene has disabled auto-restart)
      if (!this.dragonAnimator.isAnimating() && !this.disableAutoRestart) {
        this.dragonAnimator.start();
      }
    }
  }

  /**
   * Set dragon position
   */
  setPosition(x: number, y: number): void {
    if (this.dragonSprite) {
      this.dragonSprite.x = x;
      this.dragonSprite.y = y;
    }
  }

  /**
   * Set dragon scale
   */
  setScale(scale: number): void {
    if (this.dragonSprite) {
      this.dragonSprite.scale.set(scale);
    }
  }

  /**
   * Get dragon sprite (for other systems that need to reference it)
   */
  getDragonSprite(): Sprite | null {
    return this.dragonSprite;
  }

  /**
   * Get dragon animator (for other systems that need to reference it)
   */
  getDragonAnimator(): DragonAnimator | null {
    return this.dragonAnimator;
  }

  /**
   * Get dragon container (for other systems that need to control position)
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Set animation speed as a multiplier (1.0 = normal, 2.0 = double speed)
   * Used by cutscenes and special effects
   */
  setAnimationSpeed(multiplier: number): void {
    if (!this.dragonAnimator) return;

    const baseFPS = 8; // Default FPS for dragon animation
    const targetFPS = baseFPS * multiplier;

    // Get stack trace to see who's calling this during debug
    const stack = new Error().stack;
    const caller = stack?.split('\n')[2]?.trim() || 'unknown';

    this.dragonAnimator.setFPS(targetFPS);

    console.log(`🐉 Dragon Protagonist: Animation speed set to ${multiplier}x (${targetFPS} FPS) - called from: ${caller}`);
  }

  /**
   * Get current animation speed multiplier
   */
  getAnimationSpeed(): number {
    if (!this.dragonAnimator) return 1.0;

    const baseFPS = 8; // Default FPS for dragon animation
    const currentFPS = this.dragonAnimator.getFPS();
    return currentFPS / baseFPS;
  }

  /**
   * Get current state
   */
  getState(): DragonProtagonistState {
    return { ...this.state };
  }

  /**
   * Check if dragon is visible
   */
  isVisible(): boolean {
    return this.state.isVisible;
  }

  /**
   * Check if dragon is in a land
   */
  isInLand(): boolean {
    return this.state.isInLand;
  }

  /**
   * Disable auto-restart of animation (for cutscenes to control animation manually)
   */
  disableAnimationAutoRestart(): void {
    this.disableAutoRestart = true;
    console.log('🐉 Dragon Protagonist: Animation auto-restart DISABLED (cutscene control)');
  }

  /**
   * Enable auto-restart of animation (restore normal behavior after cutscene)
   */
  enableAnimationAutoRestart(): void {
    this.disableAutoRestart = false;
    console.log('🐉 Dragon Protagonist: Animation auto-restart ENABLED (normal behavior)');
  }

  /**
   * Check if journey is active
   */
  isJourneyActive(): boolean {
    return this.state.isJourneyActive;
  }

  /**
   * Get current land ID
   */
  getCurrentLand(): string | null {
    return this.state.currentLand;
  }

  /**
   * Update dragon health
   * Note: Health bar is now managed by HealthBarManager via EntityManager
   */
  setHealth(health: number): void {
    this.state.health = Math.max(0, Math.min(health, this.state.maxHealth));
  }

  /**
   * Get dragon movement speed (pixels per second)
   */
  getMovementSpeed(): number {
    return this.state.movementSpeed;
  }

  /**
   * Set dragon movement speed (pixels per second)
   * Used by enchantments, upgrades, or other systems that modify dragon speed
   */
  setMovementSpeed(speed: number): void {
    this.state.movementSpeed = Math.max(0, speed); // Ensure non-negative
    console.log(
      `🐉 Dragon Protagonist: Movement speed set to ${this.state.movementSpeed} pixels/second`,
    );
  }

  /**
   * Handle resize events from ResponsiveManager
   * ResponsiveManager has already handled app.resize() and app.render()
   * Uses UNIFIED GAME WORLD SCALING - dragon scales uniformly with all elements
   */
  handleResize(): void {
    console.log(
      `🐉 Dragon Protagonist: Handling resize - ${this.app.screen.width}x${this.app.screen.height}`,
    );

    if (!this.dragonSprite) return;

    // Get uniform game world scale
    const gameWorldScale = this.responsiveManager.getGameWorldScale();

    // Apply game world coordinates and scale
    // Position: (86.4, 302.4) in game world = (4.5%, 28%) of (1920, 1080)
    // Scale: 0.8 at baseline * game world scale
    this.dragonSprite.x = DRAGON_GAME_WORLD_X * gameWorldScale;
    this.dragonSprite.y = DRAGON_GAME_WORLD_Y * gameWorldScale;
    this.dragonSprite.scale.set(DRAGON_INTENDED_SCALE * gameWorldScale);

    console.log(
      `🐉 Dragon Protagonist: Updated dragon - pos: (${this.dragonSprite.x.toFixed(1)}, ${this.dragonSprite.y.toFixed(1)}), scale: ${this.dragonSprite.scale.x.toFixed(3)}, gameWorldScale: ${gameWorldScale.toFixed(3)}`,
    );

    console.log(
      `🐉 Dragon Protagonist: Resize completed - ${this.app.screen.width}x${this.app.screen.height}`,
    );
  }

  /**
   * Destroy the dragon protagonist system
   */
  destroy(): void {
    // Unsubscribe from event listeners
    for (const subscription of this.eventSubscriptions) {
      subscription.unsubscribe();
    }
    this.eventSubscriptions = [];

    // Unsubscribe from responsive manager
    if (this.resizeCallback) {
      this.responsiveManager.offResize(this.resizeCallback);
      this.resizeCallback = null;
    }

    if (this.dragonSprite) {
      this.container.removeChild(this.dragonSprite);
      this.dragonSprite.destroy();
      this.dragonSprite = null;
    }

    if (this.dragonAnimator) {
      this.dragonAnimator.destroy();
      this.dragonAnimator = null;
    }

    this.app.stage.removeChild(this.container);
    this.container.destroy();

    console.log('🐉 Dragon Protagonist: Destroyed');
  }
}
