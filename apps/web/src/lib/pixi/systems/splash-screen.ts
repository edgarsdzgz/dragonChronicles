/**
 * Splash Screen System
 *
 * Handles the initial game splash screen with "Press ENTER to start" overlay.
 * This system is completely separate from journey/combat systems to avoid interference.
 */

import { Container, Sprite, Text, Graphics, type Application, type Texture } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';

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
  private resizeHandler: (() => void) | null = null;
  private isInitialized: boolean = false;

  constructor(app: Application, assetManager: AssetManager, config: SplashScreenConfig = {}) {
    this.app = app;
    this.assetManager = assetManager;
    this.config = {
      backgroundColor: 0x7e2453, // Mauve/purple background
      splashImagePath: '/ui/buttons/menu/splash/draconia_splash_4.png', // Updated to splash_4
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

    // Create container that fills the entire viewport (zoom-aware)
    this.container = new Container();
    this.container.label = 'splash-screen-container';
    this.container.x = 0;
    this.container.y = 0;
    this.container.width = window.innerWidth;
    this.container.height = window.innerHeight;
    this.app.stage.addChildAt(this.container, 0); // Add at bottom layer
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

      // Set up keyboard handler
      this.setupKeyboardHandler();

      // Set up resize handler for responsiveness
      this.setupResizeHandler();

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

    console.log('🎮 Splash Screen: Showing splash screen');
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
   * Handle window resize for responsive behavior
   */
  handleResize(): void {
    // Force app to resize
    this.app.resize();

    // Get actual viewport dimensions (accounting for zoom)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Update container size to fill entire viewport
    this.container.width = viewportWidth;
    this.container.height = viewportHeight;
    this.container.x = 0;
    this.container.y = 0;

    // Update background to fill entire viewport
    if (this.backgroundSprite) {
      this.backgroundSprite.width = viewportWidth;
      this.backgroundSprite.height = viewportHeight;
      this.backgroundSprite.x = 0;
      this.backgroundSprite.y = 0;
    }

    // Update splash image positioning and scaling to fit width (allow top/bottom cropping)
    if (this.splashImage) {
      this.splashImage.anchor.set(0.5, 0.5); // Center anchor
      this.splashImage.x = viewportWidth / 2;

      // Scale to fit width while maintaining aspect ratio
      const scale = viewportWidth / this.splashImage.texture.width;
      this.splashImage.scale.set(scale);

      const scaledHeight = this.splashImage.texture.height * scale;

      if (scaledHeight > viewportHeight) {
        // Image is taller than viewport, crop top and bottom equally
        const totalCutoff = scaledHeight - viewportHeight;
        const topCrop = Math.ceil(totalCutoff / 2); // Odd pixel goes to top
        const bottomCrop = Math.floor(totalCutoff / 2);

        // Position the image so it's cropped equally from top and bottom
        this.splashImage.y = scaledHeight / 2 - topCrop;
      } else {
        // Image is shorter than or equal to viewport height, center it vertically
        this.splashImage.y = viewportHeight / 2;
      }
    }

    // Update logo positioning (top with padding, left with reduced padding)
    if (this.logo) {
      const topPadding = 20;
      const leftPadding = 50; // Reduced from 100 to 50 to move logo left (half the distance)
      this.logo.x = leftPadding;
      this.logo.y = topPadding;

      // Update logo background position
      if (this.logoBackground) {
        const horizontalPadding = 4;
        const verticalPadding = 4;

        // Calculate text area dimensions (same as in createLogoBackground)
        const logoWidth = this.logo.texture.width * this.logo.scale.x;
        const logoHeight = this.logo.texture.height * this.logo.scale.y;
        const textWidth = logoWidth * 0.65; // Keep width the same
        const textHeight = logoHeight * 0.8; // Increased from 0.75 to 0.8 to reach top of wing

        // Position background to center on the logo (moved more to the left)
        const textOffsetX = (logoWidth - textWidth) / 2 - 8; // Move 8px more to the left
        // Move box up a few more pixels
        const textOffsetY = logoHeight * 0.08; // Moved up from 0.1 to 0.08
        this.logoBackground.x = this.logo.x + textOffsetX - horizontalPadding;
        this.logoBackground.y = this.logo.y + textOffsetY - verticalPadding;
      }
    }

    // Update text positioning at bottom of image
    if (this.pressEnterText) {
      this.pressEnterText.x = viewportWidth / 2;

      if (this.splashImage) {
        const imageHeight = this.splashImage.texture.height * this.splashImage.scale.y;
        const imageBottom = this.splashImage.y + imageHeight / 2;
        this.pressEnterText.y = imageBottom - 60; // 60px from bottom of image
      } else {
        this.pressEnterText.y = viewportHeight - 100;
      }
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
    // Create a solid color background that fills the entire viewport
    const graphics = new Graphics();
    graphics.rect(0, 0, window.innerWidth, window.innerHeight);
    graphics.fill(this.config.backgroundColor!);

    // Convert graphics to texture using the correct PixiJS v8 method
    const texture = this.app.renderer.generateTexture(graphics);
    this.backgroundSprite = new Sprite(texture);
    this.backgroundSprite.width = window.innerWidth;
    this.backgroundSprite.height = window.innerHeight;
    this.backgroundSprite.x = 0;
    this.backgroundSprite.y = 0;

    setZIndex(this.backgroundSprite, Z_LAYERS.BACKGROUND);
    this.container.addChild(this.backgroundSprite);

    // Background created silently
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
        this.splashImage.anchor.set(0.5, 0.5); // Center anchor for proper positioning

        // Scale to fit viewport while maintaining aspect ratio (zoom-aware)
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const imageAspectRatio = this.splashImage.texture.width / this.splashImage.texture.height;
        const viewportAspectRatio = viewportWidth / viewportHeight;

        let scale: number;
        if (imageAspectRatio > viewportAspectRatio) {
          // Image is wider than viewport - scale to fit width
          scale = viewportWidth / this.splashImage.texture.width;
        } else {
          // Image is taller than viewport - scale to fit height
          scale = viewportHeight / this.splashImage.texture.height;
        }

        this.splashImage.scale.set(scale);

        // Center image on screen
        this.splashImage.x = viewportWidth / 2;
        this.splashImage.y = viewportHeight / 2;

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
    this.pressEnterText = new Text({
      text: 'Press ENTER to start',
      style: {
        fontFamily: this.config.fontFamily!,
        fontSize: this.config.fontSize!,
        fill: this.config.textColor!,
        align: 'center',
        stroke: {
          color: 0x000000,
          width: 3, // Thicker stroke for better readability
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

    // Position text at bottom of the image
    if (this.splashImage) {
      // Position at bottom of the image (image is now centered)
      const imageHeight = this.splashImage.texture.height * this.splashImage.scale.y;
      const imageBottom = this.splashImage.y + imageHeight / 2;
      this.pressEnterText.y = imageBottom - 60; // 60px from bottom of image
    } else {
      // Position at bottom of screen if no image
      this.pressEnterText.y = this.app.screen.height - 100;
    }

    setZIndex(this.pressEnterText, Z_LAYERS.UI); // On top of everything
    this.container.addChild(this.pressEnterText);

    // Text created silently
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

        // Scale logo to reasonable size (max 600px width - midpoint size)
        const maxWidth = 600;
        const scale = Math.min(maxWidth / this.logo.texture.width, 1.0);
        this.logo.scale.set(scale);

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

    // Calculate logo dimensions
    const logoWidth = this.logo.texture.width * this.logo.scale.x;
    const logoHeight = this.logo.texture.height * this.logo.scale.y;

    // Estimate text width (slightly less wide)
    const textWidth = logoWidth * 0.65; // Keep width the same
    const textHeight = logoHeight * 0.8; // Increased from 0.75 to 0.8 to reach top of wing

    // Minimal padding for the rectangle's size
    const horizontalPadding = 4;
    const verticalPadding = 4;
    const rectWidth = textWidth + horizontalPadding * 2;
    const rectHeight = textHeight + verticalPadding * 2;

    // Create rounded rectangle with very rounded corners (but not pill-shaped)
    const cornerRadius = Math.min(rectWidth, rectHeight) * 0.15; // 15% of smaller dimension

    // Create almost imperceptible background (very low opacity)
    this.logoBackground.roundRect(0, 0, rectWidth, rectHeight, cornerRadius);
    this.logoBackground.fill({ color: 0x1a1a1a, alpha: 0.05 }); // Reduced from 0.1 to 0.05

    // Position background to center on the logo (moved more to the left)
    const textOffsetX = (logoWidth - textWidth) / 2 - 8; // Move 8px more to the left
    // Move box up a few more pixels
    const textOffsetY = logoHeight * 0.08; // Moved up from 0.1 to 0.08
    this.logoBackground.x = this.logo.x + textOffsetX - horizontalPadding;
    this.logoBackground.y = this.logo.y + textOffsetY - verticalPadding;

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
   * Set up keyboard handler
   */
  private setupKeyboardHandler(): void {
    this.keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && this.state.isVisible && !this.state.isFadingOut) {
        console.log('🎮 Splash Screen: ENTER pressed, starting game...');
        this.hide();
      }
    };

    window.addEventListener('keydown', this.keyHandler);
    // Keyboard handler set up silently
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
   * Destroy the splash screen
   */
  destroy(): void {
    this.cleanupKeyboardHandler();
    this.cleanupResizeHandler();

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
