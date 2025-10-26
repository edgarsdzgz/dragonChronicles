/**
 * Splash Screen System
 *
 * Handles the initial game splash screen with "Press ENTER to start" overlay.
 * This system is completely separate from journey/combat systems to avoid interference.
 */

import { Container, Sprite, Text, Graphics, type Application, type Texture } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';
import { ResponsiveManager } from './responsive-manager';

export interface SplashScreenConfig {
  backgroundColor?: number;
  splashImagePath?: string;
  textColor?: number;
  fontSize?: number;
  fontFamily?: string;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

export interface SplashScreenState {
  isVisible: boolean;
  isFadingIn: boolean;
  isFadingOut: boolean;
  isComplete: boolean;
  fadeProgress: number;
}

/**
 * Splash Screen Manager
 */
export class SplashScreenManager {
  private app: Application;
  private assetManager: AssetManager;
  private container: Container;
  private config: SplashScreenConfig;
  private state: SplashScreenState;
  private responsiveManager: ResponsiveManager;

  // Visual elements
  private backgroundSprite: Sprite | null = null;
  private splashImage: Sprite | null = null;
  private logo: Sprite | null = null;
  private logoBackground: Graphics | null = null;
  private pressEnterText: Text | null = null;
  private overlayGraphics: Graphics | null = null;

  // Animation
  private fadeInStartTime: number = 0;
  private fadeOutStartTime: number = 0;

  // Event handling
  private keyHandler: ((event: KeyboardEvent) => void) | null = null;
  private clickHandler: ((event: PointerEvent) => void) | null = null;
  private resizeCallback: (() => void) | null = null;
  private isInitialized: boolean = false;

  constructor(
    app: Application,
    assetManager: AssetManager,
    responsiveManager: ResponsiveManager,
    config: SplashScreenConfig = {},
  ) {
    this.app = app;
    this.assetManager = assetManager;
    this.responsiveManager = responsiveManager;

    this.config = {
      backgroundColor: 0x0d4f3c, // Draconia green background
      splashImagePath: '/ui/buttons/menu/splash/draconia_splash_5.png',
      textColor: 0xffffff, // White text
      fontSize: 32,
      fontFamily: 'Cinzel, serif',
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

    // Create container that fills the entire canvas (not window)
    this.container = new Container();
    this.container.label = 'splash-screen-container';
    this.container.x = 0;
    this.container.y = 0;
    this.app.stage.addChildAt(this.container, 0); // Add at bottom layer

    // Subscribe to responsive manager resize events
    this.resizeCallback = () => this.handleResize();
    this.responsiveManager.onResize(this.resizeCallback);
  }

  /**
   * Initialize the splash screen
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      console.log('🎮 Splash Screen: Initializing...');

      // Create background
      await this.createBackground();

      // Try to load splash image, fallback to background if not found
      await this.createSplashImage();

      // Create Draconia logo in top left corner
      await this.createLogo();

      // Create "Press ENTER to start" text (after image is loaded for positioning)
      this.createPressEnterText();

      // Create overlay for fade effects
      this.createOverlay();

      // Set up keyboard and click handlers
      this.setupKeyboardHandler();
      this.setupClickHandler();

      this.isInitialized = true;
      console.log('✅ Splash Screen: Ready');
      return true;
    } catch (error) {
      console.error('❌ Splash Screen: Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Show the splash screen
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

    // Make container visible
    this.container.visible = true;
    this.container.alpha = 0;

    console.log(
      `🎮 Splash Screen: Showing - children: ${this.container.children.length}, text: ${!!this.pressEnterText}`,
    );
  }

  /**
   * Hide the splash screen with fade out
   */
  hide(): void {
    if (!this.state.isVisible) {
      return;
    }

    this.state.isFadingOut = true;
    this.state.isFadingIn = false;
    this.fadeOutStartTime = performance.now();

    console.log('🎮 Splash Screen: Hiding splash screen');
  }

  /**
   * Update splash screen animation
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
        console.log('🎮 Splash Screen: Fade in complete');
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
        console.log('🎮 Splash Screen: Fade out complete');
      }
    }
  }

  /**
   * Check if splash screen is complete (hidden)
   */
  isComplete(): boolean {
    return this.state.isComplete;
  }

  /**
   * Handle resize events from ResponsiveManager
   * ResponsiveManager has already handled app.resize() and app.render()
   */
  handleResize(): void {
    // Use canvas dimensions, not window dimensions
    const viewportWidth = this.app.screen.width;
    const viewportHeight = this.app.screen.height;

    // Container position stays at 0,0 (top-left of canvas)
    this.container.x = 0;
    this.container.y = 0;

    // Update background to fill canvas
    if (this.backgroundSprite) {
      this.backgroundSprite.width = viewportWidth;
      this.backgroundSprite.height = viewportHeight;
      this.backgroundSprite.x = 0;
      this.backgroundSprite.y = 0;
    }

    // Update splash image: WIDTH-FIRST SCALING RULE
    // Always fill edge-to-edge horizontally (no dead space on sides)
    // Allow top/bottom to be cut off to preserve image integrity
    if (this.splashImage) {
      this.splashImage.anchor.set(0.5, 0);

      // WIDTH IS ALWAYS MORE IMPORTANT - fill edge-to-edge horizontally
      const widthScale = viewportWidth / this.splashImage.texture.width;

      // Use width scale only (height will be cut off if needed)
      this.splashImage.scale.set(widthScale);

      // Position at top center
      this.splashImage.x = viewportWidth / 2;
      this.splashImage.y = 0;
    }

    // Update logo: underlay-first responsive scaling
    if (this.logo) {
      // Calculate underlay dimensions first
      const underlayDims = this.calculateUnderlayDimensions(viewportWidth);

      // Scale logo to fit underlay while maintaining aspect ratio
      const scale = this.calculateLogoScaleForUnderlay(underlayDims.width, underlayDims.height);
      this.logo.scale.set(scale, scale); // Uniform scaling to maintain aspect ratio

      const topPadding = 20;
      const leftPadding = 50;
      this.logo.x = leftPadding;
      this.logo.y = topPadding;

      // Update logo background with calculated dimensions
      if (this.logoBackground) {
        // Recreate background with new dimensions
        this.logoBackground.clear();
        const cornerRadius = Math.min(underlayDims.width, underlayDims.height) * 0.15;
        this.logoBackground.roundRect(0, 0, underlayDims.width, underlayDims.height, cornerRadius);
        this.logoBackground.fill({ color: 0x1a1a1a, alpha: 0.05 });

        // Position background at logo position
        this.logoBackground.x = this.logo.x;
        this.logoBackground.y = this.logo.y;
      }
    }

    // Update text positioning: Align with brown ground area at bottom of splash image
    if (this.pressEnterText && this.splashImage) {
      this.pressEnterText.x = viewportWidth / 2;

      // Calculate where the image bottom is after scaling
      const imageScaledHeight = this.splashImage.texture.height * this.splashImage.scale.y;
      const imageBottom = this.splashImage.y + imageScaledHeight;

      // Position text on the brown ground area
      // Use 80px up from image bottom as ideal position
      const idealTextY = imageBottom - 80;

      // Clamp to viewport to prevent off-screen positioning
      // Keep text at least 50px from viewport bottom
      const minTextY = viewportHeight - 50;
      this.pressEnterText.y = Math.min(idealTextY, minTextY);

      console.log(
        `🎮 Splash Screen: Text positioned at y=${this.pressEnterText.y.toFixed(0)} (ideal: ${idealTextY.toFixed(0)}, image bottom: ${imageBottom.toFixed(0)}, viewport height: ${viewportHeight})`,
      );
    }

    console.log(`🎮 Splash Screen: Resized to ${viewportWidth}x${viewportHeight} (zoom-aware)`);
  }

  /**
   * Check if splash screen is visible
   */
  isVisible(): boolean {
    return this.state.isVisible;
  }

  /**
   * Create background
   */
  private async createBackground(): Promise<void> {
    // Create a solid color background that fills the canvas
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
  }

  /**
   * Create splash image (with fallback)
   */
  private async createSplashImage(): Promise<void> {
    try {
      // Try to load the splash image using asset ID
      const assetResult = await this.assetManager.loadAsset('splash-screen');

      if (assetResult.success && assetResult.asset) {
        this.splashImage = new Sprite(assetResult.asset);
        this.splashImage.anchor.set(0.5, 0.5);

        // Scale to fit width while showing full image (contain, not cover)
        const canvasWidth = this.app.screen.width;
        const canvasHeight = this.app.screen.height;

        const widthScale = canvasWidth / this.splashImage.texture.width;
        const heightScale = canvasHeight / this.splashImage.texture.height;
        const scale = Math.min(widthScale, heightScale); // Contain (fit full image, no cropping)

        this.splashImage.scale.set(scale);

        // Position at top center (Clickpocalypse style)
        this.splashImage.x = canvasWidth / 2;
        this.splashImage.y = 0;

        setZIndex(this.splashImage, Z_LAYERS.UI - 1); // Above background, below text
        this.container.addChild(this.splashImage);

        console.log(`🎮 Splash Screen: Image loaded at scale ${scale.toFixed(2)}`);
      } else {
        console.log('🎮 Splash Screen: Using fallback background');
      }
    } catch (error) {
      console.log('🎮 Splash Screen: Using fallback background');
    }
  }

  /**
   * Create "Press ENTER to start" text
   */
  private createPressEnterText(): void {
    // Calculate responsive font size
    const scale = this.responsiveManager.getScale();
    const fontSize = Math.max(16, Math.min(this.config.fontSize! * scale, 48));

    this.pressEnterText = new Text({
      text: 'START',
      style: {
        fontFamily: this.config.fontFamily!,
        fontSize: fontSize,
        fill: this.config.textColor!,
        align: 'center',
        stroke: {
          color: 0x000000,
          width: 3,
        },
        dropShadow: {
          color: 0x000000,
          blur: 4,
          angle: Math.PI / 4,
          distance: 2,
        },
      },
    });

    this.pressEnterText.anchor.set(0.5);
    this.pressEnterText.x = this.app.screen.width / 2;
    // Always position near bottom of screen
    this.pressEnterText.y = this.app.screen.height - 100;

    setZIndex(this.pressEnterText, Z_LAYERS.UI);
    this.container.addChild(this.pressEnterText);

    console.log(
      `🎮 Splash Screen: Text created at (${this.pressEnterText.x}, ${this.pressEnterText.y}), visible: ${this.pressEnterText.visible}, alpha: ${this.pressEnterText.alpha}`,
    );
  }

  /**
   * Calculate responsive logo scale based on viewport width
   */
  private calculateLogoScale(viewportWidth: number): number {
    let baseWidth: number;

    if (viewportWidth >= 1920) {
      // 1080p and above - use 1.5x scaling (22.5%)
      baseWidth = viewportWidth * 0.225;
    } else if (viewportWidth >= 1366) {
      // 1366x768 - use 1.2x scaling (18%)
      baseWidth = viewportWidth * 0.18;
    } else if (viewportWidth >= 1024) {
      // 1024x768 - use standard scaling (15%)
      baseWidth = viewportWidth * 0.15;
    } else {
      // Mobile and smaller - use reduced scaling (12%)
      baseWidth = viewportWidth * 0.12;
    }

    // Min 150px, max 900px
    const targetWidth = Math.max(150, Math.min(baseWidth, 900));
    return targetWidth;
  }

  /**
   * Calculate desired underlay dimensions based on viewport width
   */
  private calculateUnderlayDimensions(viewportWidth: number): { width: number; height: number } {
    // Use ResponsiveManager's scale for consistent scaling
    const scale = this.responsiveManager.getScale();
    let baseWidth: number;

    if (viewportWidth >= 1920) {
      // 1080p and above - reduced width for better fit (25%)
      baseWidth = viewportWidth * 0.25;
    } else if (viewportWidth >= 1366) {
      // 1366x768 - reduced width for better fit (20%)
      baseWidth = viewportWidth * 0.2;
    } else if (viewportWidth >= 1024) {
      // 1024x768 - reduced width for better fit (16.5%)
      baseWidth = viewportWidth * 0.165;
    } else if (viewportWidth >= 768) {
      // Tablet - scale down more (15%)
      baseWidth = viewportWidth * 0.15;
    } else {
      // Mobile and smaller - scale down significantly (12%)
      baseWidth = viewportWidth * 0.12;
    }

    // Apply responsive scale and constrain
    const targetWidth = Math.max(100, Math.min(baseWidth * scale, 800));

    // Use logo's actual aspect ratio if available, otherwise use 4:3
    let aspectRatio = 4 / 3; // Default for logo content
    if (this.logo && this.logo.texture) {
      aspectRatio = this.logo.texture.width / this.logo.texture.height;
    }
    const targetHeight = targetWidth / aspectRatio;

    return { width: targetWidth, height: targetHeight };
  }

  /**
   * Calculate logo scale to fit underlay while maintaining aspect ratio
   */
  private calculateLogoScaleForUnderlay(underlayWidth: number, underlayHeight: number): number {
    if (!this.logo) return 1;

    // Calculate scale factors for both width and height
    const scaleX = underlayWidth / this.logo.texture.width;
    const scaleY = underlayHeight / this.logo.texture.height;

    // Use the smaller scale to ensure logo fits within underlay without stretching
    const scale = Math.min(scaleX, scaleY);

    return scale;
  }

  /**
   * Get logo bounds including wings for proper underlay sizing
   */
  private getLogoBounds(): { width: number; height: number; x: number; y: number } {
    if (!this.logo) return { width: 0, height: 0, x: 0, y: 0 };

    // Get the actual visual bounds of the logo including wings
    const bounds = this.logo.getBounds();
    return {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
    };
  }

  /**
   * Create Draconia logo in top left corner
   */
  private async createLogo(): Promise<void> {
    try {
      const assetResult = await this.assetManager.loadAsset('draconia-logo');

      if (assetResult.success && assetResult.asset) {
        this.logo = new Sprite(assetResult.asset);
        this.logo.anchor.set(0, 0); // Top-left anchor

        // Calculate underlay dimensions first
        const underlayDims = this.calculateUnderlayDimensions(this.app.screen.width);

        // Scale logo to fit underlay while maintaining aspect ratio
        const scale = this.calculateLogoScaleForUnderlay(underlayDims.width, underlayDims.height);
        this.logo.scale.set(scale, scale); // Uniform scaling to maintain aspect ratio

        // Position with padding from top, and reduced left padding to move logo left
        const topPadding = 20;
        const leftPadding = 50; // Reduced from 100 to 50 to move logo left (half the distance)
        this.logo.x = leftPadding;
        this.logo.y = topPadding;

        // Create background rectangle with rounded corners behind logo
        this.createLogoBackground();

        setZIndex(this.logo, Z_LAYERS.UI);
        this.container.addChild(this.logo);

        console.log(`🎮 Splash Screen: Logo loaded at scale ${scale.toFixed(2)}`);
      } else {
        console.log('🎮 Splash Screen: Logo not found, skipping');
      }
    } catch (error) {
      console.log('🎮 Splash Screen: Logo failed to load, skipping');
    }
  }

  /**
   * Create background rectangle behind logo
   */
  private createLogoBackground(): void {
    if (!this.logo) return;

    this.logoBackground = new Graphics();

    // Calculate desired underlay dimensions
    const underlayDims = this.calculateUnderlayDimensions(this.app.screen.width);
    const rectWidth = underlayDims.width;
    const rectHeight = underlayDims.height;

    // Create rounded rectangle with calculated dimensions
    const cornerRadius = Math.min(rectWidth, rectHeight) * 0.15;
    this.logoBackground.roundRect(0, 0, rectWidth, rectHeight, cornerRadius);
    this.logoBackground.fill({ color: 0x1a1a1a, alpha: 0.05 });

    // Position background at logo position
    this.logoBackground.x = this.logo.x;
    this.logoBackground.y = this.logo.y;

    setZIndex(this.logoBackground, Z_LAYERS.UI - 1); // Behind logo
    this.container.addChild(this.logoBackground);
  }

  /**
   * Create overlay for fade effects
   */
  private createOverlay(): void {
    this.overlayGraphics = new Graphics();
    this.overlayGraphics.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.overlayGraphics.fill(0x000000);
    this.overlayGraphics.alpha = 0;

    setZIndex(this.overlayGraphics, Z_LAYERS.UI);
    this.container.addChild(this.overlayGraphics);
  }

  /**
   * Set up keyboard handler (accepts any key)
   */
  private setupKeyboardHandler(): void {
    this.keyHandler = (event: KeyboardEvent) => {
      if (this.state.isVisible && !this.state.isFadingOut) {
        console.log('🎮 Splash Screen: Key pressed, starting game...');
        this.hide();
      }
    };

    window.addEventListener('keydown', this.keyHandler);
    // Keyboard handler set up silently
  }

  /**
   * Set up click/pointer handler
   */
  private setupClickHandler(): void {
    this.clickHandler = (event: PointerEvent) => {
      if (this.state.isVisible && !this.state.isFadingOut) {
        console.log('🎮 Splash Screen: Click detected, starting game...');
        this.hide();
      }
    };

    // Add click handler to the canvas
    this.app.canvas.addEventListener('pointerdown', this.clickHandler);
    // Click handler set up silently
  }

  /**
   * Clean up keyboard handler
   */
  private cleanupKeyboardHandler(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }

  /**
   * Clean up click handler
   */
  private cleanupClickHandler(): void {
    if (this.clickHandler) {
      this.app.canvas.removeEventListener('pointerdown', this.clickHandler);
      this.clickHandler = null;
    }
  }

  /**
   * Destroy the splash screen
   */
  destroy(): void {
    this.cleanupKeyboardHandler();
    this.cleanupClickHandler();

    // Unsubscribe from responsive manager
    if (this.resizeCallback) {
      this.responsiveManager.offResize(this.resizeCallback);
      this.resizeCallback = null;
    }

    if (this.backgroundSprite) {
      this.backgroundSprite.destroy();
    }
    if (this.splashImage) {
      this.splashImage.destroy();
    }
    if (this.logo) {
      this.logo.destroy();
    }
    if (this.logoBackground) {
      this.logoBackground.destroy();
    }
    if (this.pressEnterText) {
      this.pressEnterText.destroy();
    }
    if (this.overlayGraphics) {
      this.overlayGraphics.destroy();
    }

    this.app.stage.removeChild(this.container);
    this.container.destroy();

    console.log('🎮 Splash Screen: Destroyed');
  }
}
