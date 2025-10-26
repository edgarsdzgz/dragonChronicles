/**
 * UI Manager System
 *
 * Manages all UI elements in the game including:
 * - Journey Controls (backward/pause/forward movement buttons)
 * - Top Bar (currency display) - Future
 * - Enchant Buttons (stat modifications) - Future
 *
 * GAME WORLD COORDINATES:
 * All UI elements positioned using ResponsiveManager's game world scaling
 */

import { Application, Container, Sprite, Graphics, Text } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';
import { ResponsiveManager } from './responsive-manager';
import type { LandManager } from './land-manager';
import { TopBarUI } from './top-bar-ui';
import type { JourneyProgressionManager } from './journey-progression-manager';
import type { DragonProtagonistManager } from './dragon-protagonist';

/**
 * Journey button types
 */
export type JourneyButtonType = 'backward' | 'pause' | 'forward';

/**
 * Journey button states
 */
export type JourneyButtonState = 'neutral' | 'hover' | 'selected';

/**
 * Journey button configuration
 */
interface JourneyButton {
  type: JourneyButtonType;
  sprite: Sprite;
  state: JourneyButtonState;
  x: number; // Game world X position
  y: number; // Game world Y position
  isHovered: boolean;
}

/**
 * UI Manager configuration
 */
export interface UIManagerConfig {
  journeyButtonSize?: number; // Size in game world pixels (default: 80)
  journeyButtonSpacing?: number; // Spacing between buttons in game world pixels (default: 15)
}

/**
 * UI Manager class
 */
export class UIManager {
  private app: Application;
  private assetManager: AssetManager;
  private responsiveManager: ResponsiveManager;
  private landManager: LandManager | null = null;
  private journeyProgressionManager: JourneyProgressionManager | null = null;
  private dragonProtagonist: DragonProtagonistManager | null = null;
  private container: Container;
  private config: UIManagerConfig;
  private isInitialized: boolean = false;

  // Journey Controls
  private journeyControlsContainer: Container;
  private journeyButtons: Map<JourneyButtonType, JourneyButton> = new Map();
  private currentJourneyState: JourneyButtonType = 'forward'; // Default: moving forward

  // Test Controls (temporary for development)
  private test4xButton: Container | null = null;

  // Top Bar UI
  private topBarUI: TopBarUI | null = null;

  // Event handlers
  private mouseHandler: ((event: MouseEvent) => void) | null = null;
  private resizeCallback: (() => void) | null = null;

  constructor(
    app: Application,
    assetManager: AssetManager,
    responsiveManager: ResponsiveManager,
    config: UIManagerConfig = {},
  ) {
    this.app = app;
    this.assetManager = assetManager;
    this.responsiveManager = responsiveManager;

    this.config = {
      journeyButtonSize: 80, // 80x80 pixels in game world
      journeyButtonSpacing: 15, // 15px spacing between buttons
      ...config,
    };

    // Create main container
    this.container = new Container();
    this.container.label = 'ui-manager';
    setZIndex(this.container, Z_LAYERS.UI_BACKGROUND_ELEMENTS);
    this.app.stage.addChild(this.container);

    // Create journey controls container
    this.journeyControlsContainer = new Container();
    this.journeyControlsContainer.label = 'journey-controls';
    this.container.addChild(this.journeyControlsContainer);

    // Subscribe to responsive manager resize events
    this.resizeCallback = () => this.handleResize();
    this.responsiveManager.onResize(this.resizeCallback);
  }

  /**
   * Initialize the UI Manager
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      console.log('🎮 UI Manager: Initializing...');

      // Create journey controls
      await this.createJourneyControls();

      // Create top bar UI
      this.topBarUI = new TopBarUI(this.app, this.responsiveManager);

      // Setup mouse event handlers
      this.setupMouseHandlers();

      this.isInitialized = true;
      console.log('✅ UI Manager: Initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ UI Manager: Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Set the land manager reference (for controlling movement)
   */
  setLandManager(landManager: LandManager): void {
    this.landManager = landManager;
    console.log('🎮 UI Manager: Land manager reference set');
  }

  /**
   * Set the journey progression manager reference (for distance tracking)
   */
  setJourneyProgressionManager(manager: JourneyProgressionManager): void {
    this.journeyProgressionManager = manager;
    if (this.topBarUI) {
      this.topBarUI.setJourneyProgressionManager(manager);
    }
    console.log('🎮 UI Manager: Journey progression manager reference set');
  }

  /**
   * Set the dragon protagonist reference (for speed control)
   */
  setDragonProtagonist(dragon: DragonProtagonistManager): void {
    this.dragonProtagonist = dragon;
    // Create test 4x speed button
    this.create4xSpeedTestButton();
    console.log('🎮 UI Manager: Dragon protagonist reference set');
  }

  /**
   * Get the top bar UI reference (for cutscene control)
   */
  getTopBarUI(): TopBarUI | null {
    return this.topBarUI;
  }

  /**
   * Create journey control buttons (backward, pause, forward)
   * Positioned in underground area: underground top + 150px
   */
  private async createJourneyControls(): Promise<void> {
    console.log('🎮 UI Manager: Creating journey controls...');

    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const buttonSize = this.config.journeyButtonSize!;
    const spacing = this.config.journeyButtonSpacing!;

    // Calculate positions
    // Underground area starts at ~483px (ground Y position)
    // Buttons positioned at underground + 150px - 75px = 565px
    const baseY = 565; // Underground area top + 150px, pulled up 75px total

    // Position buttons on left side, with pause centered below dragon + 45px right
    // Dragon X = 115.2 (6% of 1920)
    // Pause button center = dragon X + 45 = 160.2
    // Pause button left edge = 160.2 - (80/2) = 120.2
    const pauseX = 160.2 - buttonSize / 2; // Center pause button under dragon, shifted right 45px

    // Button positions (in game world coordinates)
    const buttonPositions: Array<{ type: JourneyButtonType; x: number }> = [
      { type: 'backward', x: pauseX - buttonSize - spacing }, // Left of pause
      { type: 'pause', x: pauseX }, // Centered under dragon
      { type: 'forward', x: pauseX + buttonSize + spacing }, // Right of pause
    ];

    // Create each button
    for (const { type, x } of buttonPositions) {
      const button = await this.createJourneyButton(type, x, baseY);
      if (button) {
        this.journeyButtons.set(type, button);
        this.journeyControlsContainer.addChild(button.sprite);
      }
    }

    console.log('✅ UI Manager: Journey controls created');
  }

  /**
   * Create test 4x speed button (temporary for testing)
   */
  private create4xSpeedTestButton(): void {
    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const buttonSize = this.config.journeyButtonSize!;
    const spacing = this.config.journeyButtonSpacing!;
    const baseY = 565;
    const pauseX = 160.2 - buttonSize / 2;
    const forwardX = pauseX + buttonSize + spacing;

    // Position 4x button to the right of forward button
    const test4xX = forwardX + buttonSize + spacing;

    // Create container for test button
    this.test4xButton = new Container();
    this.test4xButton.label = 'test-4x-button';

    // Create background
    const bg = new Graphics();
    bg.rect(0, 0, buttonSize, buttonSize);
    bg.fill(0xff6600); // Orange background
    bg.stroke({ width: 2, color: 0xffffff });
    this.test4xButton.addChild(bg);

    // Create text
    const text = new Text({
      text: '4X',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
      },
    });
    text.anchor.set(0.5);
    text.x = buttonSize / 2;
    text.y = buttonSize / 2;
    this.test4xButton.addChild(text);

    // Position and scale
    this.test4xButton.x = test4xX * gameWorldScale;
    this.test4xButton.y = baseY * gameWorldScale;
    this.test4xButton.scale.set(gameWorldScale);

    // Make interactive
    this.test4xButton.eventMode = 'static';
    this.test4xButton.cursor = 'pointer';
    this.test4xButton.on('pointerdown', () => this.handle4xSpeedClick());

    this.journeyControlsContainer.addChild(this.test4xButton);
    console.log('🎮 UI Manager: Test 4x speed button created');
  }

  /**
   * Handle 4x speed test button click
   */
  private handle4xSpeedClick(): void {
    if (!this.dragonProtagonist) return;

    // Set to 4x speed (400 pixels/second)
    this.dragonProtagonist.setMovementSpeed(400);
    console.log('🎮 UI Manager: Dragon speed set to 4x (400 pps)');
  }

  /**
   * Create a single journey button
   */
  private async createJourneyButton(
    type: JourneyButtonType,
    x: number,
    y: number,
  ): Promise<JourneyButton | null> {
    try {
      // Determine initial state (forward starts selected, others neutral)
      const initialState: JourneyButtonState = type === 'forward' ? 'selected' : 'neutral';

      // Load texture for initial state
      const assetId = `journey-${type}-${initialState}`;
      const assetResult = await this.assetManager.loadAsset(assetId);

      if (!assetResult.success || !assetResult.asset) {
        console.error(`❌ UI Manager: Failed to load button texture: ${assetId}`);
        return null;
      }

      // Create sprite
      const sprite = new Sprite(assetResult.asset);
      const gameWorldScale = this.responsiveManager.getGameWorldScale();
      const buttonSize = this.config.journeyButtonSize!;

      // Scale button from 128x128 native to 80x80 in game world
      const scale = (buttonSize / 128) * gameWorldScale;
      sprite.scale.set(scale);
      sprite.x = x * gameWorldScale;
      sprite.y = y * gameWorldScale;

      // Enable interactivity
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';

      setZIndex(sprite, Z_LAYERS.UI_BACKGROUND_ELEMENTS);

      const button: JourneyButton = {
        type,
        sprite,
        state: initialState,
        x,
        y,
        isHovered: false,
      };

      console.log(`🎮 UI Manager: Created ${type} button at (${x}, ${y})`);
      return button;
    } catch (error) {
      console.error(`❌ UI Manager: Failed to create ${type} button:`, error);
      return null;
    }
  }

  /**
   * Setup mouse event handlers for button interactions
   */
  private setupMouseHandlers(): void {
    this.mouseHandler = (event: MouseEvent) => {
      const rect = this.app.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Check hover state for each button
      this.journeyButtons.forEach((button) => {
        const wasHovered = button.isHovered;
        button.isHovered = this.isPointInButton(mouseX, mouseY, button);

        // Update texture if hover state changed
        if (button.isHovered !== wasHovered) {
          this.updateButtonVisual(button);
        }
      });
    };

    // Mouse click handler
    this.app.canvas.addEventListener('click', (event: MouseEvent) => {
      const rect = this.app.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Check if any button was clicked
      this.journeyButtons.forEach((button) => {
        if (this.isPointInButton(mouseX, mouseY, button)) {
          this.handleJourneyButtonClick(button.type);
        }
      });
    });

    // Mouse move handler
    this.app.canvas.addEventListener('mousemove', this.mouseHandler);
  }

  /**
   * Check if a point is inside a button's bounds
   */
  private isPointInButton(x: number, y: number, button: JourneyButton): boolean {
    const sprite = button.sprite;
    const bounds = sprite.getBounds();
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    );
  }

  /**
   * Handle journey button click
   */
  private handleJourneyButtonClick(buttonType: JourneyButtonType): void {
    console.log(`🎮 UI Manager: ${buttonType} button clicked`);

    // Update current state
    const previousState = this.currentJourneyState;
    this.currentJourneyState = buttonType;

    // Reset dragon speed to 1x when clicking forward button
    if (buttonType === 'forward' && this.dragonProtagonist) {
      this.dragonProtagonist.setMovementSpeed(100); // Reset to 1x speed
      console.log('🎮 UI Manager: Dragon speed reset to 1x (100 pps)');
    }

    // Update button states
    this.journeyButtons.forEach((button) => {
      if (button.type === buttonType) {
        button.state = 'selected';
      } else {
        button.state = button.isHovered ? 'hover' : 'neutral';
      }
      this.updateButtonVisual(button);
    });

    // Notify land manager of movement change
    if (this.landManager) {
      this.landManager.setMovementState(buttonType);
    }

    console.log(`🎮 UI Manager: Journey state changed: ${previousState} → ${buttonType}`);
  }

  /**
   * Update button visual based on current state
   */
  private async updateButtonVisual(button: JourneyButton): Promise<void> {
    // Determine which state to show
    let visualState: JourneyButtonState;
    if (button.state === 'selected') {
      visualState = 'selected';
    } else if (button.isHovered) {
      visualState = 'hover';
    } else {
      visualState = 'neutral';
    }

    // Load and apply texture
    const assetId = `journey-${button.type}-${visualState}`;
    const assetResult = await this.assetManager.loadAsset(assetId);

    if (assetResult.success && assetResult.asset) {
      button.sprite.texture = assetResult.asset;
    }
  }

  /**
   * Get current journey movement state
   */
  getCurrentJourneyState(): JourneyButtonType {
    return this.currentJourneyState;
  }

  /**
   * Update UI elements (called from game loop)
   */
  update(deltaTime: number): void {
    // Update top bar UI
    if (this.topBarUI) {
      this.topBarUI.update(deltaTime);
    }

    // Future: Update animations, states, etc.
  }

  /**
   * Handle resize events from ResponsiveManager
   */
  handleResize(): void {
    console.log(
      `🎮 UI Manager: Handling resize - ${this.app.screen.width}x${this.app.screen.height}`,
    );

    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const buttonSize = this.config.journeyButtonSize!;

    // Update journey button positions and scales
    this.journeyButtons.forEach((button) => {
      const scale = (buttonSize / 128) * gameWorldScale;
      button.sprite.scale.set(scale);
      button.sprite.x = button.x * gameWorldScale;
      button.sprite.y = button.y * gameWorldScale;
    });

    // Update top bar UI
    if (this.topBarUI) {
      this.topBarUI.handleResize();
    }

    console.log(
      `🎮 UI Manager: Resize completed - ${this.app.screen.width}x${this.app.screen.height}`,
    );
  }

  /**
   * Hide UI during cutscene (journey controls, top bar, etc.)
   */
  hideForCutscene(): void {
    this.container.visible = false;
    console.log('🎬 UI Manager: Hidden for cutscene');
  }

  /**
   * Show UI after cutscene
   */
  showAfterCutscene(): void {
    this.container.visible = true;
    console.log('🎬 UI Manager: Shown after cutscene');
  }

  /**
   * Destroy the UI Manager
   */
  destroy(): void {
    // Unsubscribe from responsive manager
    if (this.resizeCallback) {
      this.responsiveManager.offResize(this.resizeCallback);
      this.resizeCallback = null;
    }

    // Remove mouse handlers
    if (this.mouseHandler) {
      this.app.canvas.removeEventListener('mousemove', this.mouseHandler);
      this.mouseHandler = null;
    }

    // Destroy journey buttons
    this.journeyButtons.forEach((button) => {
      button.sprite.destroy();
    });
    this.journeyButtons.clear();

    // Destroy top bar UI
    if (this.topBarUI) {
      this.topBarUI.destroy();
      this.topBarUI = null;
    }

    // Destroy containers
    this.journeyControlsContainer.destroy();
    this.app.stage.removeChild(this.container);
    this.container.destroy();

    console.log('🎮 UI Manager: Destroyed');
  }
}
