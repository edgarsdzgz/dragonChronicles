/**
 * Dragon Protagonist System
 *
 * Manages the dragon protagonist sprite that appears only when in a land during a journey.
 * Integrates with the land manager to show/hide the dragon appropriately.
 */

import { Sprite, Container, type Application } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { createAnimatedDragonSprite, type DragonAnimator } from '../dragon-sprites';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';

export interface DragonProtagonistConfig {
  x?: number;
  y?: number;
  scale?: number;
  visible?: boolean;
}

export interface DragonProtagonistState {
  isVisible: boolean;
  isInLand: boolean;
  isJourneyActive: boolean;
  currentLand: string | null;
  health: number;
  maxHealth: number;
}

/**
 * Dragon Protagonist Manager
 */
export class DragonProtagonistManager {
  private app: Application;
  private assetManager: AssetManager;
  private container: Container;
  private dragonSprite: Sprite | null = null;
  private dragonAnimator: DragonAnimator | null = null;
  private config: DragonProtagonistConfig;
  private state: DragonProtagonistState;
  private isInitialized: boolean = false;
  private resizeHandler: (() => void) | null = null;

  constructor(app: Application, assetManager: AssetManager, config: DragonProtagonistConfig = {}) {
    this.app = app;
    this.assetManager = assetManager;
    this.config = {
      x: 150, // Position on left side of action area
      y: 300, // Center vertically in action area
      scale: 1.0,
      visible: true,
      ...config,
    };

    this.state = {
      isVisible: false,
      isInLand: false,
      isJourneyActive: false,
      currentLand: null,
      health: 100,
      maxHealth: 100,
    };

    // Create container for dragon
    this.container = new Container();
    this.container.label = 'dragon-protagonist-container';
    setZIndex(this.container, Z_LAYERS.PLAYER);
    this.app.stage.addChild(this.container);
  }

  /**
   * Initialize the dragon protagonist
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

      // Configure sprite
      this.dragonSprite.x = this.config.x || 200;
      this.dragonSprite.y = this.config.y || 400;
      this.dragonSprite.scale.set(this.config.scale || 1.0);
      this.dragonSprite.visible = false; // Start hidden

      // Set proper z-index (above background, below UI)
      setZIndex(this.dragonSprite, Z_LAYERS.PLAYER);

      // Add to container
      this.container.addChild(this.dragonSprite);

      this.isInitialized = true;
      console.log('✅ Dragon Protagonist: Initialized successfully');
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
  update(deltaTime: number): void {
    if (!this.isInitialized || !this.dragonSprite || !this.dragonAnimator) {
      return;
    }

    // Only update if visible and in a land
    if (this.state.isVisible && this.state.isInLand) {
      // Start animation if not already playing
      if (!this.dragonAnimator.isAnimating()) {
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
   * Handle window resize for responsive behavior
   */
  handleResize(): void {
    console.log(
      `🐉 Dragon Protagonist: Handling resize - ${this.app.screen.width}x${this.app.screen.height}`,
    );

    // Force app to resize
    this.app.resize();

    // Update dragon position to maintain relative position
    if (this.dragonSprite) {
      // Keep dragon on left side of action area
      const actionAreaWidth = this.app.screen.width * 0.3; // 30% of screen width
      this.dragonSprite.x = Math.min(150, actionAreaWidth / 2);
      this.dragonSprite.y = this.app.screen.height * 0.4; // 40% from top

      console.log(
        `🐉 Dragon Protagonist: Updated dragon position to (${this.dragonSprite.x}, ${this.dragonSprite.y})`,
      );
    }

    // Force a render to ensure the changes are visible
    this.app.render();

    console.log(
      `🐉 Dragon Protagonist: Resize completed - ${this.app.screen.width}x${this.app.screen.height}`,
    );
  }

  /**
   * Set up resize handler for responsiveness
   */
  private setupResizeHandler(): void {
    this.resizeHandler = () => {
      this.handleResize();
    };
    window.addEventListener('resize', this.resizeHandler);

    // Also listen for zoom changes (visual viewport API)
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', this.resizeHandler);
    }
  }

  /**
   * Clean up resize handler
   */
  private cleanupResizeHandler(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);

      // Also remove visual viewport listener
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', this.resizeHandler);
      }

      this.resizeHandler = null;
    }
  }

  /**
   * Destroy the dragon protagonist system
   */
  destroy(): void {
    this.cleanupResizeHandler();

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
