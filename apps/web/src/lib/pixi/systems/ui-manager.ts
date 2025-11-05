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
import { HealthBarManager } from './health-bar-manager';
import type { EventBus, UIEvent } from '@draconia/shared';

/**
 * Currency data interface
 */
export interface CurrencyData {
  arcana: number;
  soulPower: number;
  gold: number;
  astralSeals: number;
}

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
  eventBus?: EventBus; // Event bus for event-driven communication
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
  private healthBarManager: HealthBarManager;
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

  // Topbar decorative UI (separate container - always visible, not part of fade)
  private topbarContainer: Container | null = null;
  private topbarGraphics: Graphics | null = null;

  // Currency display texts (2x2 grid inside topbar - separate entities for cutscene fading)
  private arcanaText!: Text;
  private soulPowerText!: Text;
  private goldText!: Text;
  private astralSealsText!: Text;

  // Event handlers
  private mouseHandler: ((event: MouseEvent) => void) | null = null;
  private resizeCallback: (() => void) | null = null;

  // Fade animation state
  private isFadingIn: boolean = false;
  private fadeProgress: number = 0; // 0 = fully transparent, 1 = fully opaque
  private fadeDuration: number = 1500; // 1.5 seconds fade-in

  // Event system
  private eventBus: EventBus | null = null;

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

    this.eventBus = config.eventBus || null;

    // Create topbar container (separate, always visible, scales with responsive)
    this.topbarContainer = new Container();
    this.topbarContainer.label = 'topbar-ui';
    setZIndex(this.topbarContainer, Z_LAYERS.UI_BACKGROUND);
    this.app.stage.addChild(this.topbarContainer);

    // Create main container (for fading UI elements)
    this.container = new Container();
    this.container.label = 'ui-manager';
    setZIndex(this.container, Z_LAYERS.UI_BACKGROUND);
    this.app.stage.addChild(this.container);

    // Create HealthBarManager as child of UI container
    // This creates proper hierarchy where hiding UIManager hides all UI including HP bars
    this.healthBarManager = new HealthBarManager(this.app, this.responsiveManager, this.container);

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

      // Load and create topbar decorative image with currency texts
      await this.createTopbarImage();
      this.createCurrencyTexts();

      // Create journey controls
      await this.createJourneyControls();

      // Create top bar UI (pass our container so it's properly managed)
      this.topBarUI = new TopBarUI(this.app, this.responsiveManager, this.container);

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
   * Set the dragon protagonist reference (for speed control and HP bar tracking)
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
   * Get topbar container (for cutscene zoom/pan control)
   */
  getTopbarContainer(): Container | null {
    return this.topbarContainer;
  }

  /**
   * Update currency values in the topbar
   */
  updateCurrencies(currencies: Partial<CurrencyData>): void {
    if (currencies.arcana !== undefined) {
      this.arcanaText.text = `Arcana: ${this.formatNumber(currencies.arcana)}`;
    }
    
    if (currencies.soulPower !== undefined) {
      this.soulPowerText.text = `Soul Power: ${this.formatNumber(currencies.soulPower)}`;
    }
    
    if (currencies.gold !== undefined) {
      this.goldText.text = `Gold: ${this.formatNumber(currencies.gold)}`;
    }
    
    if (currencies.astralSeals !== undefined) {
      this.astralSealsText.text = `Astral Seals: ${this.formatNumber(currencies.astralSeals)}`;
    }
  }

  /**
   * Create currency text elements in main UI container (for cutscene fading)
   */
  private createCurrencyTexts(): void {
    const textStyle = {
      fontFamily: 'Cinzel, serif',
      fontSize: 14,
      fontWeight: 'bold' as const,
      fill: 0xffffff, // White text for visibility
      align: 'left' as const,
    };

    // Arcana (top-left)
    this.arcanaText = new Text({
      text: 'Arcana: 0.00',
      style: textStyle,
    });
    this.container.addChild(this.arcanaText);

    // Soul Power (bottom-left)
    this.soulPowerText = new Text({
      text: 'Soul Power: 0',
      style: textStyle,
    });
    this.container.addChild(this.soulPowerText);

    // Gold (top-right)
    this.goldText = new Text({
      text: 'Gold: 0',
      style: textStyle,
    });
    this.container.addChild(this.goldText);

    // Astral Seals (bottom-right)
    this.astralSealsText = new Text({
      text: 'Astral Seals: 0',
      style: textStyle,
    });
    this.container.addChild(this.astralSealsText);

    // Position currency texts in tight 2x2 rectangle on left side
    this.updateCurrencyLayout();

    console.log('💰 UI Manager: Currency texts created in main UI container (cutscene fading enabled)');
  }

  /**
   * Format numbers with appropriate suffixes (K, M, B)
   * Always shows 2 decimal places for values < 1000
   */
  private formatNumber(num: number): string {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else {
      return num.toFixed(2); // Always show 2 decimal places for small numbers
    }
  }

  /**
   * Update currency text layout in tight 2x2 rectangle on left side
   */
  private updateCurrencyLayout(): void {
    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const { width: _screenWidth, height: _screenHeight } = this.app.screen;

    // Position currencies in tight 2x2 rectangle on left side of screen
    const leftMargin = 20 * gameWorldScale;
    const topMargin = 20 * gameWorldScale;
    const spacing = 8 * gameWorldScale; // Tight spacing between currencies
    
    // Calculate tight rectangle dimensions
    const currencyWidth = 120 * gameWorldScale; // Fixed width for tight layout
    const currencyHeight = 20 * gameWorldScale; // Fixed height for tight layout
    
    // Top row
    this.arcanaText.x = leftMargin;
    this.arcanaText.y = topMargin;
    this.arcanaText.scale.set(gameWorldScale);
    
    this.goldText.x = leftMargin + currencyWidth + spacing;
    this.goldText.y = topMargin;
    this.goldText.scale.set(gameWorldScale);
    
    // Bottom row
    this.soulPowerText.x = leftMargin;
    this.soulPowerText.y = topMargin + currencyHeight + spacing;
    this.soulPowerText.scale.set(gameWorldScale);
    
    this.astralSealsText.x = leftMargin + currencyWidth + spacing;
    this.astralSealsText.y = topMargin + currencyHeight + spacing;
    this.astralSealsText.scale.set(gameWorldScale);
  }

  /**
   * Create topbar decorative UI at top of screen
   * Purple background with double red outline and rounded corners
   */
  private async createTopbarImage(): Promise<void> {
    try {
      // Create graphics object
      this.topbarGraphics = new Graphics();

      // Topbar dimensions (full screen width, top bar for currency/settings only)
      const topbarWidth = 1920;
      const topbarHeight = 80; // 68px original PNG + 12px extra = 80px
      const cornerRadius = 12; // Rounded corners
      const lineThickness = 2;

      // Colors
      const backgroundColor = 0x4b0093; // Purple
      const outlineColor = 0xfe3030; // Red

      // Draw background with rounded corners
      this.topbarGraphics.roundRect(0, 0, topbarWidth, topbarHeight, cornerRadius);
      this.topbarGraphics.fill({ color: backgroundColor });

      // Draw outer outline (first red border)
      this.topbarGraphics.roundRect(0, 0, topbarWidth, topbarHeight, cornerRadius);
      this.topbarGraphics.stroke({ color: outlineColor, width: lineThickness });

      // Draw inner outline (second red border, parallel to outer)
      // Offset by 6px inward for parallel effect
      const innerOffset = 6;
      this.topbarGraphics.roundRect(
        innerOffset,
        innerOffset,
        topbarWidth - innerOffset * 2,
        topbarHeight - innerOffset * 2,
        cornerRadius - 3,
      );
      this.topbarGraphics.stroke({ color: outlineColor, width: lineThickness });

      // Position at top of screen
      this.topbarGraphics.x = 0;
      this.topbarGraphics.y = 0;

      // Add to topbar container (separate, always visible, not part of fade)
      if (this.topbarContainer) {
        this.topbarContainer.addChild(this.topbarGraphics);
      }

      // Update topbar scaling
      this.updateTopbarScale();

      console.log('🎮 UI Manager: Topbar UI created at (0, 0) - Purple with double red outline (always visible)');
    } catch (error) {
      console.error('❌ UI Manager: Failed to create topbar UI:', error);
    }
  }

  /**
   * Create journey control buttons (backward, pause, forward)
   * Positioned in underground area: underground top + 150px
   */
  private async createJourneyControls(): Promise<void> {
    console.log('🎮 UI Manager: Creating journey controls...');

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
    // Emit speed change event instead of direct call
    if (this.eventBus) {
      this.eventBus.emit<UIEvent>({
        category: 'ui',
        type: 'speed_changed',
        timestamp: Date.now(),
        source: 'ui-manager',
        payload: {
          speed: 400,
          multiplier: 4.0,
        },
      });
      console.log('🎮 UI Manager: Emitted speed change event (4x = 400 pps)');
    } else {
      console.warn('⚠️ UI Manager: No eventBus available, cannot change speed');
    }
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

      setZIndex(sprite, Z_LAYERS.UI_BACKGROUND);

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

    // Emit movement button clicked event
    if (this.eventBus) {
      this.eventBus.emit<UIEvent>({
        category: 'ui',
        type: 'movement_button_clicked',
        timestamp: Date.now(),
        source: 'ui-manager',
        payload: {
          buttonType,
          speedMultiplier: buttonType === 'forward' ? 1.0 : undefined,
        },
      });
    }

    // Reset dragon speed to 1x when clicking forward button (via event)
    if (buttonType === 'forward' && this.eventBus) {
      this.eventBus.emit<UIEvent>({
        category: 'ui',
        type: 'speed_changed',
        timestamp: Date.now(),
        source: 'ui-manager',
        payload: {
          speed: 100,
          multiplier: 1.0,
        },
      });
    }

    // Update button states (visual only - no manager calls)
    this.journeyButtons.forEach((button) => {
      if (button.type === buttonType) {
        button.state = 'selected';
      } else {
        button.state = button.isHovered ? 'hover' : 'neutral';
      }
      this.updateButtonVisual(button);
    });

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

    // Update dragon health bar position to follow dragon
    if (this.dragonProtagonist && this.dragonProtagonist.isVisible()) {
      this.updateDragonHealthBarPosition();
    }

    // Update fade-in animation
    if (this.isFadingIn) {
      this.fadeProgress += deltaTime / this.fadeDuration;

      if (this.fadeProgress >= 1.0) {
        this.fadeProgress = 1.0;
        this.isFadingIn = false;
        console.log('🎬 UI Manager: Fade-in complete');
      }

      // Apply fade progress to container alpha
      this.container.alpha = this.fadeProgress;
    }
  }

  /**
   * Update topbar scaling based on responsive manager
   * Topbar scales with background to avoid revealing dark blue space
   */
  private updateTopbarScale(): void {
    if (!this.topbarContainer) return;

    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    this.topbarContainer.scale.set(gameWorldScale);

    console.log(`🎮 UI Manager: Topbar scaled to ${gameWorldScale.toFixed(3)}x`);
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

    // Update topbar scaling (always visible, scales with background)
    this.updateTopbarScale();
    this.updateCurrencyLayout();

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

    // Re-render all HP bars with new gameWorldScale
    if (this.healthBarManager) {
      this.healthBarManager.rerender();
      console.log('🎮 UI Manager: Re-rendered HP bars with new scale');
    }

    // Update dragon health bar position immediately after dragon resizes
    if (this.dragonProtagonist && this.dragonProtagonist.isVisible()) {
      this.updateDragonHealthBarPosition();
      console.log('🎮 UI Manager: Updated dragon health bar position on resize');
    }

    console.log(
      `🎮 UI Manager: Resize completed - ${this.app.screen.width}x${this.app.screen.height}`,
    );
  }

  /**
   * Create dragon health bar
   * HP bar is a UI element and belongs in UI Manager's container hierarchy
   */
  createDragonHealthBar(): void {
    if (!this.healthBarManager || !this.dragonProtagonist) {
      console.warn('🎮 UI Manager: Cannot create health bar - missing dependencies');
      return;
    }

    const sprite = this.dragonProtagonist.getDragonSprite();
    if (!sprite) {
      console.warn('🎮 UI Manager: Cannot create health bar - dragon sprite not ready');
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

    console.log('✅ UI Manager: Dragon health bar created');
  }

  /**
   * Update dragon health bar position to follow dragon
   */
  updateDragonHealthBarPosition(): void {
    if (!this.healthBarManager || !this.dragonProtagonist) {
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
    if (!this.healthBarManager) {
      return;
    }

    this.healthBarManager.updateHealthBar('dragon-protagonist', health, maxHealth);
  }

  /**
   * Hide UI during cutscene (journey controls, top bar, HP bar, etc.)
   * Now works properly because all UI is in this container hierarchy
   */
  hideForCutscene(): void {
    this.container.visible = false;
    this.container.alpha = 0; // Start fully transparent
    this.fadeProgress = 0;
    this.isFadingIn = false;
    console.log('🎬 UI Manager: Hidden for cutscene (including TopBarUI and HP bar)');
  }

  /**
   * Show UI after cutscene with smooth fade-in animation
   */
  showAfterCutscene(): void {
    this.container.visible = true;
    this.fadeProgress = 0;
    this.isFadingIn = true;
    console.log('🎬 UI Manager: Starting fade-in animation (1.5s duration)');
  }

  /**
   * Set topbar cutscene state (zoom and Y offset)
   * Called by cutscene manager to control topbar during cutscene
   */
  setTopbarCutsceneState(scale: number, yOffset: number): void {
    if (!this.topbarContainer) return;

    const gameWorldScale = this.responsiveManager.getGameWorldScale();

    // Apply cutscene scale on top of responsive scale
    this.topbarContainer.scale.set(gameWorldScale * scale);

    // Apply Y offset (same as background)
    this.topbarContainer.y = yOffset * gameWorldScale;
  }

  /**
   * Reset topbar to normal state after cutscene
   */
  resetTopbarState(): void {
    if (!this.topbarContainer) return;

    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    this.topbarContainer.scale.set(gameWorldScale);
    this.topbarContainer.y = 0;

    console.log('🎬 UI Manager: Topbar reset to normal state');
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
