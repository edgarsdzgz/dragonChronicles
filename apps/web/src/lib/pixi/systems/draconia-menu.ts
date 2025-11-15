/**
 * Draconia Menu Manager
 *
 * CRITICAL Z-INDEX FIX (2025-11-13):
 * ===================================
 * PROBLEM: Buttons were invisible after fade-in despite being created and positioned correctly.
 *
 * ROOT CAUSE:
 * 1. Z_LAYERS.UI does not exist in layer-manager.ts (only UI_BACKGROUND, UI_ELEMENTS, UI_FOREGROUND)
 * 2. Using undefined Z_LAYERS.UI resulted in NaN z-index values for buttons
 * 3. The buttonContainer had no z-index set (defaulted to 0, same as background)
 * 4. Background sprite was rendering on top of buttons, covering them completely
 *
 * THE FIX:
 * 1. Replaced all Z_LAYERS.UI references with proper constants:
 *    - Button graphics: Z_LAYERS.UI_BACKGROUND (9)
 *    - Button text: Z_LAYERS.UI_ELEMENTS (10)
 *    - Decorations & sparkles: Z_LAYERS.UI_FOREGROUND (11)
 * 2. Set buttonContainer z-index to Z_LAYERS.UI_ELEMENTS (10)
 * 3. Background remains at Z_LAYERS.BACKGROUND (0)
 *
 * Z-INDEX HIERARCHY (ascending):
 * - Background sprite: 0 (Z_LAYERS.BACKGROUND)
 * - Button container: 10 (Z_LAYERS.UI_ELEMENTS)
 *   - Button graphics inside: 9 (UI_BACKGROUND)
 *   - Button text inside: 10 (UI_ELEMENTS)
 *   - Decorations inside: 11 (UI_FOREGROUND)
 * - Main container: 1000 (ensures menu is always on top)
 *
 * WHY IT WORKS:
 * - sortableChildren = true enables z-index sorting within containers
 * - Higher z-index values render on top of lower values
 * - buttonContainer (10) renders above background (0)
 * - This creates proper visual hierarchy: background → buttons → decorations
 *
 * PREVENTION:
 * - Always verify Z_LAYERS constants exist before using them
 * - Set explicit z-index on all containers that need specific rendering order
 * - Test visibility after implementing fade animations (fades can mask z-index bugs)
 */

import { Application, Container, Graphics, Text, Sprite } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';
import { ResponsiveManager } from './responsive-manager';

export interface DraconiaMenuConfig {
  backgroundColor?: number;
  textColor?: number;
  fontSize?: number;
  fontFamily?: string;
  buttonColor?: number;
  buttonHoverColor?: number;
  buttonTextColor?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  onJourneyStart?: () => void;
}

interface DraconiaMenuState {
  isVisible: boolean;
  isFadingIn: boolean;
  isFadingOut: boolean;
  isComplete: boolean;
  fadeProgress: number;
}

interface Sparkle {
  graphics: Graphics;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  scale: number;
  rotation: number;
  rotationSpeed: number;
}

interface MenuButton {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  graphics: Graphics;
  textSprite: Text;
  isHovered: boolean;
  isPressed: boolean;
  decoration?: Sprite | undefined; // Optional decoration sprite
  sparkles: Sparkle[];
  sparkleContainer: Container;
}

/**
 * Menu state for building transition animations
 */
enum MenuState {
  HIDDEN = 'hidden',
  MENU = 'menu',
  TRANSITIONING_TO_BUILDING = 'transitioning-to-building',
  BUILDING_INTERIOR = 'building-interior',
  TRANSITIONING_TO_MENU = 'transitioning-to-menu',
}

/**
 * Animation state for tracking transitions
 */
interface TransitionState {
  startTime: number;
  duration: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromAlpha: number;
  toAlpha: number;
}

export class DraconiaMenuManager {
  private app: Application;
  private assetManager: AssetManager;
  private config: DraconiaMenuConfig;
  private container: Container;
  private backgroundSprite: Sprite | null = null;
  private buttons: Map<string, MenuButton> = new Map();
  private isInitialized: boolean = false;
  private state: DraconiaMenuState;
  private responsiveManager: ResponsiveManager;

  // Animation
  private fadeInStartTime: number = 0;
  private fadeOutStartTime: number = 0;

  // Event handling
  private mouseHandler: ((_event: MouseEvent) => void) | null = null;
  private wheelHandler: ((_event: WheelEvent) => void) | null = null;
  private resizeCallback: (() => void) | null = null;

  // Sparkle animation
  private sparkleTimer: number = 0;
  private sparkleInterval: number = 100; // Spawn sparkle every 100ms

  // Scrolling
  private scrollOffset: number = 0;
  private maxScroll: number = 0;
  private isScrollable: boolean = false;
  private scrollbar: Graphics | null = null;
  private scrollbarTrack: Graphics | null = null;
  private buttonContainer: Container | null = null;

  // Resize guard
  private isResizing: boolean = false;

  // Building transition state management
  private menuState: MenuState = MenuState.HIDDEN;
  private selectedBuilding: MenuButton | null = null;
  private selectedBuildingOriginalPosition: { x: number; y: number } | null = null;
  private returnButton: MenuButton | null = null;
  private transitionState: TransitionState | null = null;
  private transitionDuration: number = 400; // ms
  private isAnimating: boolean = false;

  // Building interior content
  private buildingContentContainer: Container | null = null;

  constructor(
    app: Application,
    assetManager: AssetManager,
    responsiveManager: ResponsiveManager,
    config: DraconiaMenuConfig = {},
  ) {
    this.app = app;
    this.assetManager = assetManager;
    this.responsiveManager = responsiveManager;

    this.config = {
      backgroundColor: 0x0d4f3c, // Dark green
      textColor: 0xffffff, // White text
      fontSize: 24,
      fontFamily: 'Cinzel, serif',
      buttonColor: 0x2d5a3d, // Darker green for buttons
      buttonHoverColor: 0x4a7c59, // Lighter green for hover
      buttonTextColor: 0xffffff, // White button text
      fadeInDuration: 1000, // 1 second
      fadeOutDuration: 500, // 0.5 seconds
      ...config,
    };
    this.state = {
      isVisible: false,
      isFadingIn: false,
      isFadingOut: false,
      isComplete: false,
      fadeProgress: 0,
    };

    // Create container that fills the entire screen
    this.container = new Container();
    this.container.label = 'draconia-menu-container';
    this.container.x = 0;
    this.container.y = 0;
    this.container.width = this.app.screen.width;
    this.container.height = this.app.screen.height;
    this.container.sortableChildren = true; // Enable z-index sorting
    setZIndex(this.container, 1000); // Put menu on top of everything with very high z-index
    this.app.stage.addChild(this.container); // Add to stage

    // Create button container for scrolling
    this.buttonContainer = new Container();
    this.buttonContainer.label = 'button-container';
    this.buttonContainer.sortableChildren = true; // Enable z-index sorting for buttons
    setZIndex(this.buttonContainer, Z_LAYERS.UI_ELEMENTS); // Ensure buttons render above background
    this.container.addChild(this.buttonContainer);

    // Subscribe to responsive manager resize events
    this.resizeCallback = () => this.handleResize();
    this.responsiveManager.onResize(this.resizeCallback);
  }

  /**
   * Initialize the Draconia menu
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      console.log('🏰 Draconia Menu: Initializing...');

      // Create background
      await this.createBackground();

      // Create menu buttons
      await this.createMenuButtons();

      // Set up event handlers
      this.setupMouseHandler();
      this.setupWheelHandler();

      this.isInitialized = true;
      console.log('✅ Draconia Menu: Ready');
      return true;
    } catch (error) {
      console.error('❌ Draconia Menu: Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Show the Draconia menu
   */
  async show(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Force refresh layout before showing
    this.handleResize();

    this.state.isVisible = true;
    this.state.isFadingIn = true;
    this.state.isFadingOut = false;
    this.state.isComplete = false;
    this.state.fadeProgress = 0;
    this.fadeInStartTime = performance.now();

    // Set menu state to MENU (normal borough grid view)
    this.menuState = MenuState.MENU;

    // Make container visible
    this.container.visible = true;
    this.container.alpha = 0;

    console.log('🏰 Draconia Menu: Showing menu');
  }

  /**
   * Hide the Draconia menu with fade out
   */
  hide(): void {
    if (!this.state.isVisible) {
      return;
    }

    this.state.isFadingOut = true;
    this.state.isFadingIn = false;
    this.fadeOutStartTime = performance.now();

    console.log('🏰 Draconia Menu: Hiding menu');
  }

  /**
   * Update Draconia menu animation
   */
  update(deltaTime: number): void {
    if (!this.state.isVisible) {
      return;
    }

    const currentTime = performance.now();

    // Handle fade in
    if (this.state.isFadingIn) {
      const elapsed = currentTime - this.fadeInStartTime;
      this.state.fadeProgress = Math.min(elapsed / this.config.fadeInDuration!, 1);
      this.container.alpha = this.state.fadeProgress;

      if (this.state.fadeProgress >= 1) {
        this.state.isFadingIn = false;
        console.log('🏰 Draconia Menu: Fade in complete');
      }
    }

    // Handle fade out
    if (this.state.isFadingOut) {
      const elapsed = currentTime - this.fadeOutStartTime;
      const fadeProgress = Math.min(elapsed / this.config.fadeOutDuration!, 1);
      this.container.alpha = 1 - fadeProgress;

      if (fadeProgress >= 1) {
        this.state.isVisible = false;
        this.state.isComplete = true;
        this.container.visible = false;
        console.log('🏰 Draconia Menu: Fade out complete');
      }
    }

    // Update sparkles
    this.updateSparkles(deltaTime);
  }

  /**
   * Check if Draconia menu is complete (hidden)
   */
  isComplete(): boolean {
    return this.state.isComplete;
  }

  /**
   * Check if Draconia menu is visible
   */
  isVisible(): boolean {
    return this.state.isVisible;
  }

  /**
   * Handle resize events from ResponsiveManager
   * ResponsiveManager has already handled app.resize() and app.render()
   * Recreates all visuals to ensure proper rendering at new screen size
   */
  async handleResize(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    // Guard against concurrent resize operations
    if (this.isResizing) {
      return;
    }

    this.isResizing = true;

    try {
      // Update container size
      this.container.width = this.app.screen.width;
      this.container.height = this.app.screen.height;
      this.container.x = 0;
      this.container.y = 0;

      // Recreate background (handles cleanup internally)
      await this.createBackground();

      // Store selected building ID if in interior mode
      const wasInBuildingInterior = this.menuState === MenuState.BUILDING_INTERIOR;
      const selectedBuildingId = this.selectedBuilding?.id;

      // Recreate all buttons (handles cleanup internally)
      await this.createMenuButtons();

      // Position buttons according to new screen size
      this.updateButtonPositions();

      // Handle special positioning for building interior mode
      if (wasInBuildingInterior && selectedBuildingId) {
        // Get the recreated selected building
        const newSelectedBuilding = this.buttons.get(selectedBuildingId);
        if (newSelectedBuilding) {
          this.selectedBuilding = newSelectedBuilding;

          // Reposition selected building to top-left corner
          const padding = 40;
          const targetX = padding + newSelectedBuilding.width / 2;
          const targetY = padding + newSelectedBuilding.height / 2;
          this.positionButton(newSelectedBuilding, targetX, targetY);

          // Update original position for return animation (current grid position)
          this.selectedBuildingOriginalPosition = {
            x: this.buttons.get(selectedBuildingId)?.x || 0,
            y: this.buttons.get(selectedBuildingId)?.y || 0
          };

          // Recreate and reposition return button
          if (this.returnButton) {
            const returnButtonX = padding + this.returnButton.width / 2;
            const returnButtonY = padding + newSelectedBuilding.height + 20 + this.returnButton.height / 2;
            this.positionButton(this.returnButton, returnButtonX, returnButtonY);
            this.returnButton.graphics.alpha = 1;
            this.returnButton.textSprite.alpha = 1;
          }

          // Hide other buildings
          this.buttons.forEach((button) => {
            if (button.id !== selectedBuildingId) {
              button.graphics.alpha = 0;
              button.textSprite.alpha = 0;
              if (button.decoration) {
                button.decoration.alpha = 0;
              }
            }
          });

          // Hide scrollbar during interior mode
          this.hideScrollbar();
        }
      }
    } finally {
      this.isResizing = false;
    }
  }

  /**
   * Create background
   * Safe to call multiple times - cleans up existing background first
   */
  private async createBackground(): Promise<void> {
    // Clean up existing background if it exists
    if (this.backgroundSprite) {
      this.container.removeChild(this.backgroundSprite);
      this.backgroundSprite.destroy();
      this.backgroundSprite = null;
    }

    // Create a solid color background that fills the entire screen
    const graphics = new Graphics();
    graphics.rect(0, 0, this.app.screen.width, this.app.screen.height);
    graphics.fill(this.config.backgroundColor!);

    // Convert graphics to texture using the correct PixiJS v8 method
    const texture = this.app.renderer.generateTexture(graphics);
    this.backgroundSprite = new Sprite(texture);
    this.backgroundSprite.width = this.app.screen.width;
    this.backgroundSprite.height = this.app.screen.height;
    this.backgroundSprite.x = 0;
    this.backgroundSprite.y = 0;

    setZIndex(this.backgroundSprite, Z_LAYERS.BACKGROUND);
    this.container.addChild(this.backgroundSprite);

    // Background created silently
  }

  /**
   * Calculate responsive font size based on screen width
   * @param baseSize - Base font size (e.g., 24)
   * @returns Scaled font size appropriate for current screen
   */
  private getResponsiveFontSize(baseSize: number): number {
    const screenWidth = this.app.screen.width;

    if (screenWidth < 480) {
      return Math.round(baseSize * 0.75); // Smaller on extreme mobile
    } else if (screenWidth < 768) {
      return Math.round(baseSize * 0.85); // Slightly smaller on mobile
    } else if (screenWidth > 2560) {
      return Math.round(baseSize * 1.15); // Larger on ultra-wide/4K
    }

    return baseSize; // Default size for tablet/desktop
  }

  /**
   * Clean up all existing buttons
   * Safe to call even if no buttons exist
   */
  private cleanupButtons(): void {
    this.buttons.forEach((button) => {
      // Remove and destroy sparkles
      button.sparkles.forEach((sparkle) => {
        button.sparkleContainer.removeChild(sparkle.graphics);
        sparkle.graphics.destroy();
      });
      button.sparkles = [];

      // Remove containers and sprites from button container
      if (button.sparkleContainer.parent) {
        this.buttonContainer!.removeChild(button.sparkleContainer);
      }
      button.sparkleContainer.destroy();

      if (button.graphics.parent) {
        this.buttonContainer!.removeChild(button.graphics);
      }
      button.graphics.destroy();

      if (button.textSprite.parent) {
        this.buttonContainer!.removeChild(button.textSprite);
      }
      button.textSprite.destroy();

      if (button.decoration) {
        if (button.decoration.parent) {
          this.buttonContainer!.removeChild(button.decoration);
        }
        button.decoration.destroy();
      }
    });

    this.buttons.clear();
  }

  /**
   * Create menu buttons
   * Safe to call multiple times - cleans up existing buttons first
   */
  private async createMenuButtons(): Promise<void> {
    // Clean up existing buttons if they exist
    this.cleanupButtons();

    // Define all 18 buildings organized into boroughs for better navigation
    const buildings = [
      // 🎯 ADVENTURE QUARTER - Where players start and progress (4 buildings)
      { id: 'journey', name: 'Journey', category: 'adventure', borough: 'adventure' },
      { id: 'transport-hub', name: 'Transport Hub', category: 'adventure', borough: 'adventure' },
      { id: 'aethervault', name: 'Aethervault', category: 'adventure', borough: 'adventure' },
      { id: 'research-lab', name: 'Research Lab', category: 'adventure', borough: 'adventure' },

      // 💰 ECONOMY DISTRICT - Resource management (4 buildings)
      { id: 'market', name: 'Market', category: 'economy', borough: 'economy' },
      { id: 'synth-foundry', name: 'Synth Foundry', category: 'economy', borough: 'economy' },
      { id: 'mining-guild', name: 'Mining Guild', category: 'economy', borough: 'economy' },
      { id: 'transmutation-lab', name: 'Transmutation Lab', category: 'economy', borough: 'economy' },

      // 🏰 CITY CENTER - Home base and upgrades (4 buildings)
      { id: 'lair', name: 'Lair', category: 'city', borough: 'city' },
      { id: 'great-barrier', name: 'Great Barrier', category: 'city', borough: 'city' },
      { id: 'ember-forge', name: 'Ember Forge', category: 'city', borough: 'city' },
      { id: 'steward-hall', name: 'Steward Hall', category: 'city', borough: 'city' },

      // 📚 KNOWLEDGE HUB - Information and tracking (4 buildings)
      { id: 'codex', name: 'Codex', category: 'knowledge', borough: 'knowledge' },
      { id: 'achievements', name: 'Achievements', category: 'knowledge', borough: 'knowledge' },
      { id: 'stats', name: 'Stats', category: 'knowledge', borough: 'knowledge' },
      { id: 'comet-observatory', name: 'Comet Observatory', category: 'knowledge', borough: 'knowledge' },

      // ⚙️ SYSTEM CORNER - Meta features (2 buildings)
      { id: 'rune-sanctum', name: 'Rune Sanctum', category: 'system', borough: 'system' },
      { id: 'settings', name: 'Settings', category: 'system', borough: 'system' },
    ];

    // Button dimensions
    const buttonWidth = 240;
    const buttonHeight = 100;

    // Calculate grid layout (will be positioned in updateButtonPositions)
    for (let i = 0; i < buildings.length; i++) {
      const building = buildings[i];
      // Create button at 0,0 - will be positioned correctly in updateButtonPositions
      const button = await this.createButton(
        building.id,
        building.name,
        0,
        0,
        buttonWidth,
        buttonHeight,
      );
      this.buttons.set(building.id, button);
    }

    console.log(`🏰 Draconia Menu: Created ${this.buttons.size} buttons organized into 5 boroughs:`);
    console.log('  🎯 Adventure Quarter: Journey, Transport Hub, Aethervault, Research Lab');
    console.log('  💰 Economy District: Market, Synth Foundry, Mining Guild, Transmutation Lab');
    console.log('  🏰 City Center: Lair, Great Barrier, Ember Forge, Steward Hall');
    console.log('  📚 Knowledge Hub: Codex, Achievements, Stats, Comet Observatory');
    console.log('  ⚙️ System Corner: Rune Sanctum, Settings');
    console.log('  📐 Layout: 2×2 clusters with 20px padding, 20px button gap, 50px borough gap');
  }

  /**
   * Create a menu button
   */
  private async createButton(
    id: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<MenuButton> {
    // Create button graphics with rounded corners
    const graphics = new Graphics();
    const cornerRadius = 12;
    graphics.roundRect(-width / 2, -height / 2, width, height, cornerRadius);
    graphics.fill(this.config.buttonColor!);
    graphics.stroke({ color: 0xffffff, width: 2 });

    // Add inner border (double border effect)
    const innerPadding = 6;
    graphics.roundRect(
      -width / 2 + innerPadding,
      -height / 2 + innerPadding,
      width - innerPadding * 2,
      height - innerPadding * 2,
      cornerRadius - 3,
    );
    graphics.stroke({ color: 0xffffff, width: 2 });

    // Create button text with Cinzel font and responsive sizing
    const responsiveFontSize = this.getResponsiveFontSize(this.config.fontSize!);
    const textSprite = new Text({
      text: text,
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: responsiveFontSize,
        fill: this.config.buttonTextColor!,
        align: 'center',
      },
    });
    textSprite.anchor.set(0.5);

    // Position button
    graphics.x = x;
    graphics.y = y;
    textSprite.x = x;
    textSprite.y = y;

    // Add to button container (for scrolling)
    setZIndex(graphics, Z_LAYERS.UI_BACKGROUND);
    setZIndex(textSprite, Z_LAYERS.UI_ELEMENTS);
    this.buttonContainer!.addChild(graphics);
    this.buttonContainer!.addChild(textSprite);

    // Add dragon silhouette decoration for Journey button
    let decoration: Sprite | undefined;
    if (id === 'journey') {
      try {
        const assetResult = await this.assetManager.loadAsset('draconia-silhouette');
        if (assetResult.success && assetResult.asset) {
          decoration = new Sprite(assetResult.asset);

          // Enable texture filtering for smooth scaling
          decoration.texture.source.scaleMode = 'linear'; // Smooth scaling
          decoration.texture.updateUvs();

          // Scale the dragon to be larger - about 80% of button width
          const dragonScale = Math.min(
            (width * 0.8) / decoration.texture.width,
            (height * 1.2) / decoration.texture.height,
          );
          decoration.scale.set(dragonScale);

          // Position dragon at top-right corner of button with feet just above the white border
          // Move to top-right corner of button
          decoration.x = x + width * 0.25; // More to the right (top-right corner)
          decoration.y = y - height * 0.15; // Reduced offset to prevent cutoff at screen edge
          decoration.anchor.set(0.2, 0.9); // Anchor at bottom-left of dragon so feet sit just above button border

          setZIndex(decoration, Z_LAYERS.UI_FOREGROUND); // Above button and text
          this.buttonContainer!.addChild(decoration);

          console.log('🏰 Draconia Menu: Dragon silhouette added to Journey button');
        }
      } catch {
        console.log('🏰 Draconia Menu: Dragon silhouette not found, skipping decoration');
      }
    }

    // Create sparkle container
    const sparkleContainer = new Container();
    sparkleContainer.x = x;
    sparkleContainer.y = y;
    setZIndex(sparkleContainer, Z_LAYERS.UI_FOREGROUND); // Above decoration
    this.buttonContainer!.addChild(sparkleContainer);

    return {
      id,
      text,
      x,
      y,
      width,
      height,
      graphics,
      textSprite,
      isHovered: false,
      isPressed: false,
      decoration,
      sparkles: [],
      sparkleContainer,
    };
  }

  /**
   * Update button positions for responsive layout with scrolling support
   * Organizes buttons into 2x2 borough clusters arranged in a grid
   */
  private updateButtonPositions(): void {
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    // Button and borough configuration
    const buttonWidth = 240;
    const buttonHeight = 100;
    const buttonGap = 20; // Gap between buttons within a borough cluster
    const boroughGap = 50; // Gap between borough clusters
    const padding = 20; // Reduced padding to maximize screen usage

    // Each borough is a 2x2 cluster (or smaller for System Corner which has 2 buildings)
    const boroughColumns = 2; // Fixed 2 columns per borough
    const boroughWidth = boroughColumns * buttonWidth + (boroughColumns - 1) * buttonGap;
    const boroughHeight = 2 * buttonHeight + buttonGap; // 2 rows high

    // Convert buttons map to array
    const buttonArray = Array.from(this.buttons.values());

    // Define borough order and cluster grid layout
    const boroughOrder = ['adventure', 'economy', 'city', 'knowledge', 'system'];

    // Calculate how many borough clusters fit horizontally
    const maxBoroughCols = Math.floor((screenWidth - padding * 2 + boroughGap) / (boroughWidth + boroughGap));
    const boroughCols = Math.max(1, Math.min(maxBoroughCols, 3)); // 1-3 clusters per row

    // Calculate total grid dimensions for borough clusters
    const boroughRows = Math.ceil(boroughOrder.length / boroughCols);
    const totalGridWidth = boroughCols * boroughWidth + (boroughCols - 1) * boroughGap;
    const totalGridHeight = boroughRows * boroughHeight + (boroughRows - 1) * boroughGap;

    // Determine if we need scrolling
    const availableHeight = screenHeight - padding * 2;
    this.isScrollable = totalGridHeight > availableHeight;

    if (this.isScrollable) {
      // Calculate max scroll
      this.maxScroll = totalGridHeight - availableHeight;
      this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.maxScroll));

      const startX = (screenWidth - totalGridWidth) / 2;
      const startY = padding - this.scrollOffset;

      this.positionBoroughClusters(boroughOrder, startX, startY, boroughCols, boroughWidth, boroughHeight, boroughGap, buttonWidth, buttonHeight, buttonGap);

      this.updateScrollbar();
    } else {
      // Reset scroll when not scrollable
      this.scrollOffset = 0;
      this.maxScroll = 0;

      const startX = (screenWidth - totalGridWidth) / 2;
      const startY = (screenHeight - totalGridHeight) / 2;

      this.positionBoroughClusters(boroughOrder, startX, startY, boroughCols, boroughWidth, boroughHeight, boroughGap, buttonWidth, buttonHeight, buttonGap);

      // Hide scrollbar when not needed
      this.hideScrollbar();
    }
  }

  /**
   * Position borough clusters in a grid formation
   */
  private positionBoroughClusters(
    boroughOrder: string[],
    startX: number,
    startY: number,
    boroughCols: number,
    boroughWidth: number,
    boroughHeight: number,
    boroughGap: number,
    buttonWidth: number,
    buttonHeight: number,
    buttonGap: number
  ): void {
    const buttonArray = Array.from(this.buttons.values());

    boroughOrder.forEach((boroughName, index) => {
      const boroughButtons = buttonArray.filter((b) => this.getBoroughForButton(b.id) === boroughName);
      if (boroughButtons.length === 0) return;

      // Calculate borough cluster position in grid
      const boroughCol = index % boroughCols;
      const boroughRow = Math.floor(index / boroughCols);

      const boroughX = startX + boroughCol * (boroughWidth + boroughGap);
      const boroughY = startY + boroughRow * (boroughHeight + boroughGap);

      // Position buttons within this 2x2 borough cluster
      boroughButtons.forEach((button, buttonIndex) => {
        const col = buttonIndex % 2; // 2 columns per borough
        const row = Math.floor(buttonIndex / 2); // 2 rows per borough

        const x = boroughX + col * (buttonWidth + buttonGap) + buttonWidth / 2;
        const y = boroughY + row * (buttonHeight + buttonGap) + buttonHeight / 2;

        this.positionButton(button, x, y);
      });
    });
  }

  /**
   * Helper method to get borough name for a button ID
   */
  private getBoroughForButton(buttonId: string): string {
    // Adventure Quarter
    if (['journey', 'transport-hub', 'aethervault', 'research-lab'].includes(buttonId)) {
      return 'adventure';
    }
    // Economy District
    if (['market', 'synth-foundry', 'mining-guild', 'transmutation-lab'].includes(buttonId)) {
      return 'economy';
    }
    // City Center
    if (['lair', 'great-barrier', 'ember-forge', 'steward-hall'].includes(buttonId)) {
      return 'city';
    }
    // Knowledge Hub
    if (['codex', 'achievements', 'stats', 'comet-observatory'].includes(buttonId)) {
      return 'knowledge';
    }
    // System Corner
    if (['rune-sanctum', 'settings'].includes(buttonId)) {
      return 'system';
    }
    return 'unknown';
  }

  /**
   * Helper method to position a button and all its elements
   */
  private positionButton(button: MenuButton, x: number, y: number): void {
    button.x = x;
    button.y = y;
    button.graphics.x = x;
    button.graphics.y = y;
    button.textSprite.x = x;
    button.textSprite.y = y;

    // Redraw button graphics to prevent stretching
    this.redrawButton(button);

    // Update sparkle container position
    button.sparkleContainer.x = x;
    button.sparkleContainer.y = y;

    // Update dragon decoration position (only for journey button)
    if (button.decoration) {
      button.decoration.x = x + button.width * 0.25;
      button.decoration.y = y - button.height * 0.15; // Reduced offset to prevent cutoff
    }
  }

  /**
   * Redraw button to prevent stretching on resize
   */
  private redrawButton(button: MenuButton): void {
    const cornerRadius = 12;
    const innerPadding = 6;

    button.graphics.clear();

    // Determine fill color based on state
    let fillColor = this.config.buttonColor!;
    if (button.isPressed) {
      fillColor = 0x1a4d2e;
    } else if (button.isHovered) {
      fillColor = this.config.buttonHoverColor!;
    }

    // Draw outer rounded rectangle
    button.graphics.roundRect(
      -button.width / 2,
      -button.height / 2,
      button.width,
      button.height,
      cornerRadius,
    );
    button.graphics.fill(fillColor);
    button.graphics.stroke({ color: 0xffffff, width: 2 });

    // Draw inner border
    button.graphics.roundRect(
      -button.width / 2 + innerPadding,
      -button.height / 2 + innerPadding,
      button.width - innerPadding * 2,
      button.height - innerPadding * 2,
      cornerRadius - 3,
    );
    button.graphics.stroke({ color: 0xffffff, width: 2 });
  }

  /**
   * Set up mouse handler for button interactions
   */
  private setupMouseHandler(): void {
    this.mouseHandler = (event: MouseEvent) => {
      if (!this.state.isVisible || this.state.isFadingOut) {
        return;
      }

      // Skip mouse processing during transitions
      if (this.menuState === MenuState.TRANSITIONING_TO_BUILDING ||
          this.menuState === MenuState.TRANSITIONING_TO_MENU) {
        return;
      }

      // Use ResponsiveManager for mouse coordinate conversion
      const { x: mouseX, y: mouseY } = this.responsiveManager.getMouseCoordinates(event);

      // Check button hover using accurate hit testing with button's stored position
      this.buttons.forEach((button) => {
        // Skip hidden buttons based on menu state
        if (this.menuState === MenuState.BUILDING_INTERIOR) {
          // In building interior: only process selected building and return button
          if (button.id !== this.selectedBuilding?.id && button.id !== 'return-to-draconia') {
            return; // Skip this button
          }
        } else if (this.menuState === MenuState.MENU) {
          // In menu: skip return button
          if (button.id === 'return-to-draconia') {
            return; // Skip return button
          }
        }

        // Skip buttons with alpha=0 (safety check for visibility)
        if (button.graphics.alpha === 0) {
          return; // Skip invisible buttons
        }

        // Convert mouse coordinates to buttonContainer's local space for accurate hit testing
        const localPoint = this.buttonContainer!.toLocal({ x: mouseX, y: mouseY });

        // Check if point is inside button bounds
        // Button graphics are drawn with center anchor (-width/2, -height/2)
        // so we need to check against button.x ± width/2 and button.y ± height/2
        const halfWidth = button.width / 2;
        const halfHeight = button.height / 2;
        const isHovered =
          localPoint.x >= button.x - halfWidth &&
          localPoint.x <= button.x + halfWidth &&
          localPoint.y >= button.y - halfHeight &&
          localPoint.y <= button.y + halfHeight;

        if (isHovered && !button.isHovered) {
          // Enter hover
          button.isHovered = true;
          button.graphics.clear();
          const cornerRadius = 12;
          button.graphics.roundRect(
            -button.width / 2,
            -button.height / 2,
            button.width,
            button.height,
            cornerRadius,
          );
          button.graphics.fill(this.config.buttonHoverColor!);
          button.graphics.stroke({ color: 0xffffff, width: 2 });
          // Add inner border
          const innerPadding = 6;
          button.graphics.roundRect(
            -button.width / 2 + innerPadding,
            -button.height / 2 + innerPadding,
            button.width - innerPadding * 2,
            button.height - innerPadding * 2,
            cornerRadius - 3,
          );
          button.graphics.stroke({ color: 0xffffff, width: 2 });
        } else if (!isHovered && button.isHovered) {
          // Exit hover
          button.isHovered = false;
          button.graphics.clear();
          const cornerRadius = 12;
          button.graphics.roundRect(
            -button.width / 2,
            -button.height / 2,
            button.width,
            button.height,
            cornerRadius,
          );
          button.graphics.fill(this.config.buttonColor!);
          button.graphics.stroke({ color: 0xffffff, width: 2 });
          // Add inner border
          const innerPadding = 6;
          button.graphics.roundRect(
            -button.width / 2 + innerPadding,
            -button.height / 2 + innerPadding,
            button.width - innerPadding * 2,
            button.height - innerPadding * 2,
            cornerRadius - 3,
          );
          button.graphics.stroke({ color: 0xffffff, width: 2 });
        }

        // Handle button press and click
        if (isHovered && event.type === 'mousedown') {
          button.isPressed = true;
          button.graphics.clear();
          const cornerRadius = 12;
          button.graphics.roundRect(
            -button.width / 2,
            -button.height / 2,
            button.width,
            button.height,
            cornerRadius,
          );
          button.graphics.fill(0x1a4d2e); // Darker green for pressed state
          button.graphics.stroke({ color: 0xffffff, width: 2 });
          // Add inner border
          const innerPadding = 6;
          button.graphics.roundRect(
            -button.width / 2 + innerPadding,
            -button.height / 2 + innerPadding,
            button.width - innerPadding * 2,
            button.height - innerPadding * 2,
            cornerRadius - 3,
          );
          button.graphics.stroke({ color: 0xffffff, width: 2 });
        } else if (button.isPressed && event.type === 'mouseup') {
          button.isPressed = false;
          const cornerRadius = 12;
          const innerPadding = 6;
          if (button.isHovered) {
            // Still hovering, show hover state
            button.graphics.clear();
            button.graphics.roundRect(
              -button.width / 2,
              -button.height / 2,
              button.width,
              button.height,
              cornerRadius,
            );
            button.graphics.fill(this.config.buttonHoverColor!);
            button.graphics.stroke({ color: 0xffffff, width: 2 });
            // Add inner border
            button.graphics.roundRect(
              -button.width / 2 + innerPadding,
              -button.height / 2 + innerPadding,
              button.width - innerPadding * 2,
              button.height - innerPadding * 2,
              cornerRadius - 3,
            );
            button.graphics.stroke({ color: 0xffffff, width: 2 });
            // Trigger click
            this.handleButtonClick(button.id);
          } else {
            // Not hovering, show normal state
            button.graphics.clear();
            button.graphics.roundRect(
              -button.width / 2,
              -button.height / 2,
              button.width,
              button.height,
              cornerRadius,
            );
            button.graphics.fill(this.config.buttonColor!);
            button.graphics.stroke({ color: 0xffffff, width: 2 });
            // Add inner border
            button.graphics.roundRect(
              -button.width / 2 + innerPadding,
              -button.height / 2 + innerPadding,
              button.width - innerPadding * 2,
              button.height - innerPadding * 2,
              cornerRadius - 3,
            );
            button.graphics.stroke({ color: 0xffffff, width: 2 });
          }
        }
      });
    };

    this.app.canvas.addEventListener('mousemove', this.mouseHandler);
    this.app.canvas.addEventListener('mousedown', this.mouseHandler);
    this.app.canvas.addEventListener('mouseup', this.mouseHandler);
  }

  /**
   * Handle button click
   */
  private handleButtonClick(buttonId: string): void {
    console.log(`🏰 Draconia Menu: Button clicked: ${buttonId}`);

    // Handle "Return to Draconia" button
    if (buttonId === 'return-to-draconia') {
      if (this.menuState === MenuState.BUILDING_INTERIOR) {
        this.transitionBackToMenu();
      }
      return;
    }

    // Ignore building clicks during transitions
    if (this.menuState === MenuState.TRANSITIONING_TO_BUILDING ||
        this.menuState === MenuState.TRANSITIONING_TO_MENU) {
      return;
    }

    // Ignore building clicks when in building interior (only Return button is active)
    if (this.menuState === MenuState.BUILDING_INTERIOR) {
      return;
    }

    // Handle building clicks in MENU state
    if (this.menuState === MenuState.MENU) {
      switch (buttonId) {
        case 'journey':
          // Journey button still hides menu and starts journey (no transition)
          this.hide();
          // Call the journey start callback if provided
          if (this.config.onJourneyStart) {
            this.config.onJourneyStart();
          }
          // Also emit journey start event for backward compatibility
          window.dispatchEvent(new CustomEvent('draconia-journey-start'));
          break;

        // All other buildings transition to interior view
        case 'aethervault':
        case 'research-lab':
        case 'market':
        case 'synth-foundry':
        case 'great-barrier':
        case 'lair':
        case 'transmutation-lab':
        case 'steward-hall':
        case 'transport-hub':
        case 'rune-sanctum':
        case 'mining-guild':
        case 'settings':
        case 'achievements':
        case 'stats':
        case 'codex':
        case 'ember-forge':
        case 'comet-observatory':
          // Transition to building interior view
          this.transitionToBuildingInterior(buttonId);
          break;

        default:
          console.log(`🏰 Draconia Menu: Unknown button: ${buttonId}`);
      }
    }
  }

  /**
   * Clean up mouse handler
   */
  private cleanupMouseHandler(): void {
    if (this.mouseHandler) {
      this.app.canvas.removeEventListener('mousemove', this.mouseHandler);
      this.app.canvas.removeEventListener('mousedown', this.mouseHandler);
      this.app.canvas.removeEventListener('mouseup', this.mouseHandler);
      this.mouseHandler = null;
    }
  }

  /**
   * Set up wheel handler for scrolling
   */
  private setupWheelHandler(): void {
    this.wheelHandler = (event: WheelEvent) => {
      if (!this.state.isVisible || this.state.isFadingOut || !this.isScrollable) {
        return;
      }

      // Prevent default page scrolling
      event.preventDefault();

      // Update scroll offset
      const scrollSpeed = 30; // pixels per wheel tick
      this.scrollOffset += event.deltaY > 0 ? scrollSpeed : -scrollSpeed;

      // Clamp to valid range
      this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.maxScroll));

      // Update button positions
      this.updateButtonPositions();
    };

    this.app.canvas.addEventListener('wheel', this.wheelHandler, { passive: false });
  }

  /**
   * Clean up wheel handler
   */
  private cleanupWheelHandler(): void {
    if (this.wheelHandler) {
      this.app.canvas.removeEventListener('wheel', this.wheelHandler);
      this.wheelHandler = null;
    }
  }

  /**
   * Update scrollbar appearance and position
   */
  private updateScrollbar(): void {
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;
    const padding = 40;

    // Scrollbar dimensions
    const scrollbarWidth = 12;
    const scrollbarX = screenWidth - padding - scrollbarWidth;
    const trackHeight = screenHeight - padding * 2;
    const trackY = padding;

    // Create or update scrollbar track
    if (!this.scrollbarTrack) {
      this.scrollbarTrack = new Graphics();
      setZIndex(this.scrollbarTrack, Z_LAYERS.UI_FOREGROUND);
      this.container.addChild(this.scrollbarTrack);
    }

    this.scrollbarTrack.clear();
    this.scrollbarTrack.roundRect(scrollbarX, trackY, scrollbarWidth, trackHeight, 6);
    this.scrollbarTrack.fill({ color: 0x1a4d2e, alpha: 0.3 }); // Dark green, semi-transparent

    // Calculate scrollbar handle size and position
    const contentHeight = trackHeight + this.maxScroll;
    const handleHeight = Math.max(30, (trackHeight / contentHeight) * trackHeight);
    const scrollPercent = this.scrollOffset / this.maxScroll;
    const handleY = trackY + scrollPercent * (trackHeight - handleHeight);

    // Create or update scrollbar handle
    if (!this.scrollbar) {
      this.scrollbar = new Graphics();
      setZIndex(this.scrollbar, Z_LAYERS.UI_FOREGROUND);
      this.container.addChild(this.scrollbar);
    }

    this.scrollbar.clear();
    this.scrollbar.roundRect(scrollbarX + 2, handleY, scrollbarWidth - 4, handleHeight, 5);
    this.scrollbar.fill({ color: 0x4a7c59, alpha: 0.8 }); // Lighter green
    this.scrollbar.stroke({ color: 0xffffff, width: 1, alpha: 0.5 }); // White border

    // Show scrollbar
    this.scrollbarTrack.visible = true;
    this.scrollbar.visible = true;
  }

  /**
   * Hide scrollbar when not needed
   */
  private hideScrollbar(): void {
    if (this.scrollbar) {
      this.scrollbar.visible = false;
    }
    if (this.scrollbarTrack) {
      this.scrollbarTrack.visible = false;
    }
  }

  /**
   * Create a sparkle particle
   */
  private createSparkle(button: MenuButton): void {
    // Random position centered on button - bias toward center/upper area
    const offsetX = (Math.random() - 0.5) * button.width * 0.7;
    const offsetY = (Math.random() - 0.5) * button.height * 0.5; // Reduced vertical range for more centered feel

    // Create star shape
    const graphics = new Graphics();
    const size = 3 + Math.random() * 4;

    // Draw 4-pointed star
    graphics.star(0, 0, 4, size, size * 0.5);
    graphics.fill({ color: 0xffd700, alpha: 0.9 }); // Gold color

    graphics.x = offsetX;
    graphics.y = offsetY;

    const sparkle: Sparkle = {
      graphics,
      x: offsetX,
      y: offsetY,
      velocityX: (Math.random() - 0.5) * 0.5,
      velocityY: -0.5 - Math.random() * 0.5, // Upward movement
      life: 0,
      maxLife: 800 + Math.random() * 400, // 800-1200ms lifetime
      scale: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    };

    button.sparkles.push(sparkle);
    button.sparkleContainer.addChild(graphics);
  }

  /**
   * Update sparkle animations
   */
  private updateSparkles(deltaTime: number): void {
    this.sparkleTimer += deltaTime;

    this.buttons.forEach((button) => {
      // Check if button should create sparkles based on menu state
      let shouldCreateSparkles = false;
      if (this.menuState === MenuState.MENU) {
        // In menu: all buttons except return button can have sparkles
        shouldCreateSparkles = button.id !== 'return-to-draconia';
      } else if (this.menuState === MenuState.BUILDING_INTERIOR) {
        // In building interior: only selected building and return button
        shouldCreateSparkles = button.id === this.selectedBuilding?.id || button.id === 'return-to-draconia';
      }

      // Spawn new sparkles when hovering (if allowed)
      if (button.isHovered && shouldCreateSparkles && this.sparkleTimer >= this.sparkleInterval) {
        this.createSparkle(button);
      }

      // Update existing sparkles
      const toRemove: number[] = [];

      button.sparkles.forEach((sparkle, index) => {
        sparkle.life += deltaTime;

        // Update position
        sparkle.x += sparkle.velocityX;
        sparkle.y += sparkle.velocityY;
        sparkle.graphics.x = sparkle.x;
        sparkle.graphics.y = sparkle.y;

        // Update rotation
        sparkle.rotation += sparkle.rotationSpeed;
        sparkle.graphics.rotation = sparkle.rotation;

        // Update scale and alpha based on life
        const lifePercent = sparkle.life / sparkle.maxLife;
        sparkle.scale = 1 - lifePercent * 0.5; // Shrink to 50%
        sparkle.graphics.scale.set(sparkle.scale);
        sparkle.graphics.alpha = Math.max(0, 1 - lifePercent);

        // Mark for removal if expired
        if (sparkle.life >= sparkle.maxLife) {
          toRemove.push(index);
        }
      });

      // Remove expired sparkles
      for (let i = toRemove.length - 1; i >= 0; i--) {
        const index = toRemove[i];
        const sparkle = button.sparkles[index];
        button.sparkleContainer.removeChild(sparkle.graphics);
        sparkle.graphics.destroy();
        button.sparkles.splice(index, 1);
      }
    });

    // Reset sparkle timer
    if (this.sparkleTimer >= this.sparkleInterval) {
      this.sparkleTimer = 0;
    }
  }

  /**
   * Create "Return to Draconia" button
   */
  private async createReturnButton(): Promise<void> {
    const padding = 40;
    const buildingButtonHeight = 100;
    const returnButtonWidth = 240;  // Same width as building buttons
    const returnButtonHeight = 50;  // Half height of building buttons (100px)
    const gap = 20; // Gap between building and return button

    // Calculate CENTER coordinates for the return button
    // Position it below the selected building with proper gap
    const returnButtonX = padding + returnButtonWidth / 2;  // Center X position
    const returnButtonY = padding + buildingButtonHeight + gap + returnButtonHeight / 2;  // Center Y position

    const button = await this.createButton(
      'return-to-draconia',
      'Return to Draconia',
      returnButtonX,
      returnButtonY,
      returnButtonWidth,
      returnButtonHeight
    );

    this.returnButton = button;
    this.returnButton.graphics.alpha = 0;
    this.returnButton.textSprite.alpha = 0;

    // IMPORTANT: Add return button to the buttons map so it's included in mouse handling
    this.buttons.set('return-to-draconia', button);

    console.log('🏰 Draconia Menu: Created Return to Draconia button (240x50)');
  }

  /**
   * Easing function for smooth animations (ease-out cubic)
   */
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Transition to building interior view
   */
  private async transitionToBuildingInterior(buildingId: string): Promise<void> {
    const building = this.buttons.get(buildingId);
    if (!building || this.menuState !== MenuState.MENU) {
      return;
    }

    console.log(`🏰 Draconia Menu: Transitioning to ${buildingId}...`);

    // Store selected building and original position
    this.selectedBuilding = building;
    this.selectedBuildingOriginalPosition = { x: building.x, y: building.y };

    // Change state to transitioning
    this.menuState = MenuState.TRANSITIONING_TO_BUILDING;

    // Calculate target position (top-left corner)
    const padding = 40;
    const targetX = padding + building.width / 2;
    const targetY = padding + building.height / 2;

    // Create return button if it doesn't exist
    if (!this.returnButton) {
      await this.createReturnButton();
    }

    // Set up transition state
    this.transitionState = {
      startTime: performance.now(),
      duration: this.transitionDuration,
      fromX: building.x,
      fromY: building.y,
      toX: targetX,
      toY: targetY,
      fromAlpha: 1,
      toAlpha: 0,
    };

    // Raise z-index of selected building to render on top
    setZIndex(building.graphics, Z_LAYERS.UI_FOREGROUND + 1);
    setZIndex(building.textSprite, Z_LAYERS.UI_FOREGROUND + 2);
    if (building.decoration) {
      setZIndex(building.decoration, Z_LAYERS.UI_FOREGROUND + 3);
    }

    // Start animation ticker
    this.startTransitionAnimation();
  }

  /**
   * Transition back to menu view
   */
  private transitionBackToMenu(): void {
    if (!this.selectedBuilding || !this.selectedBuildingOriginalPosition ||
        this.menuState !== MenuState.BUILDING_INTERIOR) {
      return;
    }

    console.log('🏰 Draconia Menu: Returning to Draconia menu...');

    // Clear building-specific content before transitioning
    this.clearBuildingContent();

    // Change state to transitioning
    this.menuState = MenuState.TRANSITIONING_TO_MENU;

    // Set up transition state (reverse animation)
    this.transitionState = {
      startTime: performance.now(),
      duration: this.transitionDuration,
      fromX: this.selectedBuilding.x,
      fromY: this.selectedBuilding.y,
      toX: this.selectedBuildingOriginalPosition.x,
      toY: this.selectedBuildingOriginalPosition.y,
      fromAlpha: 0,
      toAlpha: 1,
    };

    // Start animation ticker
    this.startTransitionAnimation();
  }

  /**
   * Start the transition animation ticker
   */
  private startTransitionAnimation(): void {
    if (this.isAnimating) {
      return; // Already animating
    }

    // Use app.ticker for smooth animation
    this.app.ticker.add(this.updateTransitionAnimation, this);
    this.isAnimating = true;
  }

  /**
   * Stop the transition animation ticker
   */
  private stopTransitionAnimation(): void {
    if (this.isAnimating) {
      this.app.ticker.remove(this.updateTransitionAnimation, this);
      this.isAnimating = false;
    }
  }

  /**
   * Update transition animation each frame
   */
  private updateTransitionAnimation = (): void => {
    if (!this.transitionState || !this.selectedBuilding) {
      this.stopTransitionAnimation();
      return;
    }

    const currentTime = performance.now();
    const elapsed = currentTime - this.transitionState.startTime;
    const progress = Math.min(elapsed / this.transitionState.duration, 1);
    const easedProgress = this.easeOutCubic(progress);

    if (this.menuState === MenuState.TRANSITIONING_TO_BUILDING) {
      // Slide selected building to top-left
      const newX = this.transitionState.fromX + (this.transitionState.toX - this.transitionState.fromX) * easedProgress;
      const newY = this.transitionState.fromY + (this.transitionState.toY - this.transitionState.fromY) * easedProgress;
      this.positionButton(this.selectedBuilding, newX, newY);

      // Fade out other buildings (faster fade: 300ms instead of 400ms)
      const fadeProgress = Math.min(elapsed / 300, 1);
      this.buttons.forEach((button) => {
        if (button.id !== this.selectedBuilding!.id) {
          button.graphics.alpha = 1 - fadeProgress;
          button.textSprite.alpha = 1 - fadeProgress;
          if (button.decoration) {
            button.decoration.alpha = 1 - fadeProgress;
          }

          // Disable interaction when fully faded out
          if (fadeProgress >= 1) {
            button.graphics.eventMode = 'none';
            button.textSprite.eventMode = 'none';
            if (button.decoration) {
              button.decoration.eventMode = 'none';
            }
          }
        }
      });

      // Fade in return button (starts at 200ms)
      if (this.returnButton && elapsed >= 200) {
        const returnFadeProgress = Math.min((elapsed - 200) / 200, 1);
        this.returnButton.graphics.alpha = returnFadeProgress;
        this.returnButton.textSprite.alpha = returnFadeProgress;

        // Enable interaction as soon as return button starts fading in
        if (returnFadeProgress > 0) {
          this.returnButton.graphics.eventMode = 'static';
          this.returnButton.textSprite.eventMode = 'static';
        }
      }

      // Animation complete
      if (progress >= 1) {
        this.menuState = MenuState.BUILDING_INTERIOR;
        this.stopTransitionAnimation();
        this.transitionState = null;

        // Hide scrollbar
        this.hideScrollbar();

        console.log(`🏰 Draconia Menu: Now in ${this.selectedBuilding.id} interior`);
      }
    } else if (this.menuState === MenuState.TRANSITIONING_TO_MENU) {
      // Slide selected building back to original position
      const newX = this.transitionState.fromX + (this.transitionState.toX - this.transitionState.fromX) * easedProgress;
      const newY = this.transitionState.fromY + (this.transitionState.toY - this.transitionState.fromY) * easedProgress;
      this.positionButton(this.selectedBuilding, newX, newY);

      // Fade in other buildings (starts at 100ms)
      if (elapsed >= 100) {
        const fadeProgress = Math.min((elapsed - 100) / 300, 1);
        this.buttons.forEach((button) => {
          if (button.id !== this.selectedBuilding!.id) {
            button.graphics.alpha = fadeProgress;
            button.textSprite.alpha = fadeProgress;
            if (button.decoration) {
              button.decoration.alpha = fadeProgress;
            }

            // Re-enable interaction as soon as fade-in starts
            if (fadeProgress > 0) {
              button.graphics.eventMode = 'static';
              button.textSprite.eventMode = 'static';
              if (button.decoration) {
                button.decoration.eventMode = 'static';
              }
            }
          }
        });
      }

      // Fade out return button (immediate)
      if (this.returnButton) {
        const returnFadeProgress = Math.min(elapsed / 200, 1);
        this.returnButton.graphics.alpha = 1 - returnFadeProgress;
        this.returnButton.textSprite.alpha = 1 - returnFadeProgress;

        // Disable interaction when fully faded out
        if (returnFadeProgress >= 1) {
          this.returnButton.graphics.eventMode = 'none';
          this.returnButton.textSprite.eventMode = 'none';
        }
      }

      // Animation complete
      if (progress >= 1) {
        // Reset z-index for selected building
        setZIndex(this.selectedBuilding.graphics, Z_LAYERS.UI_BACKGROUND);
        setZIndex(this.selectedBuilding.textSprite, Z_LAYERS.UI_ELEMENTS);
        if (this.selectedBuilding.decoration) {
          setZIndex(this.selectedBuilding.decoration, Z_LAYERS.UI_FOREGROUND);
        }

        // Reset all button alphas and ensure eventMode is enabled
        this.buttons.forEach((button) => {
          button.graphics.alpha = 1;
          button.textSprite.alpha = 1;
          button.graphics.eventMode = 'static';
          button.textSprite.eventMode = 'static';
          if (button.decoration) {
            button.decoration.alpha = 1;
            button.decoration.eventMode = 'static';
          }
        });

        // Hide return button and disable it
        if (this.returnButton) {
          this.returnButton.graphics.alpha = 0;
          this.returnButton.textSprite.alpha = 0;
          this.returnButton.graphics.eventMode = 'none';
          this.returnButton.textSprite.eventMode = 'none';
        }

        // Clear selected building
        this.selectedBuilding = null;
        this.selectedBuildingOriginalPosition = null;

        // Return to menu state
        this.menuState = MenuState.MENU;
        this.stopTransitionAnimation();
        this.transitionState = null;

        // Update scrollbar visibility if needed
        this.updateButtonPositions();

        console.log('🏰 Draconia Menu: Returned to menu');
      }
    }
  };

  /**
   * Set building-specific content container
   * This will be displayed in the main area when in building interior mode
   * @param buildingId - The building this content is for
   * @param contentContainer - The container with building-specific UI
   */
  setBuildingContent(buildingId: string, contentContainer: Container): void {
    if (this.menuState !== MenuState.BUILDING_INTERIOR) {
      console.warn(`Cannot set building content: not in building interior mode`);
      return;
    }

    if (this.selectedBuilding?.id !== buildingId) {
      console.warn(`Cannot set building content: selected building is ${this.selectedBuilding?.id}, not ${buildingId}`);
      return;
    }

    // Remove existing content if any
    if (this.buildingContentContainer) {
      this.container.removeChild(this.buildingContentContainer);
      this.buildingContentContainer = null;
    }

    // Add new content
    this.buildingContentContainer = contentContainer;
    this.container.addChild(contentContainer);

    // Position content below selected building and return button
    const padding = 40;
    const buildingHeight = 100;
    const gap = 20;
    const returnButtonHeight = 50;  // Return button is half height
    const contentGap = 20;
    const contentY = padding + buildingHeight + gap + returnButtonHeight + contentGap;

    contentContainer.x = 0;
    contentContainer.y = contentY;

    console.log(`🏰 Draconia Menu: Injected content for ${buildingId}`);
  }

  /**
   * Clear building-specific content
   */
  clearBuildingContent(): void {
    if (this.buildingContentContainer) {
      this.container.removeChild(this.buildingContentContainer);
      // Note: We don't destroy it - caller owns the container
      this.buildingContentContainer = null;
      console.log('🏰 Draconia Menu: Cleared building content');
    }
  }

  /**
   * Destroy the Draconia menu
   */
  destroy(): void {
    // Stop any running transition animation
    this.stopTransitionAnimation();

    // Clear building content
    this.clearBuildingContent();

    this.cleanupMouseHandler();
    this.cleanupWheelHandler();

    // Unsubscribe from responsive manager
    if (this.resizeCallback) {
      this.responsiveManager.offResize(this.resizeCallback);
      this.resizeCallback = null;
    }

    if (this.backgroundSprite) {
      this.backgroundSprite.destroy();
    }

    // Destroy scrollbar graphics
    if (this.scrollbar) {
      this.scrollbar.destroy();
      this.scrollbar = null;
    }
    if (this.scrollbarTrack) {
      this.scrollbarTrack.destroy();
      this.scrollbarTrack = null;
    }

    // Destroy return button if it exists
    if (this.returnButton) {
      this.returnButton.sparkles.forEach((sparkle) => {
        sparkle.graphics.destroy();
      });
      this.returnButton.sparkles = [];
      this.returnButton.sparkleContainer.destroy();
      this.returnButton.graphics.destroy();
      this.returnButton.textSprite.destroy();
      if (this.returnButton.decoration) {
        this.returnButton.decoration.destroy();
      }
      this.returnButton = null;
    }

    this.buttons.forEach((button) => {
      // Destroy sparkles
      button.sparkles.forEach((sparkle) => {
        sparkle.graphics.destroy();
      });
      button.sparkles = [];
      button.sparkleContainer.destroy();

      button.graphics.destroy();
      button.textSprite.destroy();
      if (button.decoration) {
        button.decoration.destroy();
      }
    });
    this.buttons.clear();

    if (this.buttonContainer) {
      this.buttonContainer.destroy();
      this.buttonContainer = null;
    }

    this.app.stage.removeChild(this.container);
    this.container.destroy();

    console.log('🏰 Draconia Menu: Destroyed');
  }
}
