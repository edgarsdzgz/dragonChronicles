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
  decoration?: Sprite; // Optional decoration sprite
  sparkles: Sparkle[];
  sparkleContainer: Container;
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
  private resizeCallback: (() => void) | null = null;

  // Sparkle animation
  private sparkleTimer: number = 0;
  private sparkleInterval: number = 100; // Spawn sparkle every 100ms

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
    this.app.stage.addChildAt(this.container, 0); // Add at bottom layer

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
   */
  handleResize(): void {
    // Update container size to fill entire screen
    this.container.width = this.app.screen.width;
    this.container.height = this.app.screen.height;
    this.container.x = 0;
    this.container.y = 0;

    // Update background to fill entire screen
    if (this.backgroundSprite) {
      this.backgroundSprite.width = this.app.screen.width;
      this.backgroundSprite.height = this.app.screen.height;
      this.backgroundSprite.x = 0;
      this.backgroundSprite.y = 0;
    }

    // Update button positions
    this.updateButtonPositions();

    console.log(`🏰 Draconia Menu: Resized to ${this.app.screen.width}x${this.app.screen.height}`);
  }

  /**
   * Create background
   */
  private async createBackground(): Promise<void> {
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
   * Create menu buttons
   */
  private async createMenuButtons(): Promise<void> {
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    // Journey button
    const journeyButton = await this.createButton('journey', 'Journey', centerX, centerY, 200, 60);
    this.buttons.set('journey', journeyButton);

    // Future buttons can be added here
    // const researchButton = this.createButton('research', 'Research', centerX, centerY + 100, 200, 60);
    // this.buttons.set('research', researchButton);
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

    // Create button text with Cinzel font
    const textSprite = new Text({
      text: text,
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: this.config.fontSize!,
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

    // Add to container
    setZIndex(graphics, Z_LAYERS.UI - 1);
    setZIndex(textSprite, Z_LAYERS.UI);
    this.container.addChild(graphics);
    this.container.addChild(textSprite);

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
          decoration.y = y - height * 0.25; // Lowered slightly, still above white border
          decoration.anchor.set(0.2, 0.9); // Anchor at bottom-left of dragon so feet sit just above button border

          setZIndex(decoration, Z_LAYERS.UI + 1); // Above button and text
          this.container.addChild(decoration);

          console.log('🏰 Draconia Menu: Dragon silhouette added to Journey button');
        }
      } catch (error) {
        console.log('🏰 Draconia Menu: Dragon silhouette not found, skipping decoration');
      }
    }

    // Create sparkle container
    const sparkleContainer = new Container();
    sparkleContainer.x = x;
    sparkleContainer.y = y;
    setZIndex(sparkleContainer, Z_LAYERS.UI + 2); // Above decoration
    this.container.addChild(sparkleContainer);

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
   * Update button positions for responsive layout
   */
  private updateButtonPositions(): void {
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    this.buttons.forEach((button, id) => {
      if (id === 'journey') {
        button.x = centerX;
        button.y = centerY;
        button.graphics.x = centerX;
        button.graphics.y = centerY;
        button.textSprite.x = centerX;
        button.textSprite.y = centerY;

        // Redraw button graphics to prevent stretching
        this.redrawButton(button);

        // Update sparkle container position
        button.sparkleContainer.x = centerX;
        button.sparkleContainer.y = centerY;

        // Update dragon decoration position
        if (button.decoration) {
          button.decoration.x = centerX + button.width * 0.25; // Top-right corner of button
          button.decoration.y = centerY - button.height * 0.25; // Lowered slightly, still above white border
        }
      }
    });
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

      // Use ResponsiveManager for mouse coordinate conversion
      const { x: mouseX, y: mouseY } = this.responsiveManager.getMouseCoordinates(event);

      // Check button hover
      this.buttons.forEach((button) => {
        const buttonLeft = button.x - button.width / 2;
        const buttonRight = button.x + button.width / 2;
        const buttonTop = button.y - button.height / 2;
        const buttonBottom = button.y + button.height / 2;

        const isHovered =
          mouseX >= buttonLeft &&
          mouseX <= buttonRight &&
          mouseY >= buttonTop &&
          mouseY <= buttonBottom;

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

    switch (buttonId) {
      case 'journey':
        this.hide();
        // Call the journey start callback if provided
        if (this.config.onJourneyStart) {
          this.config.onJourneyStart();
        }
        // Also emit journey start event for backward compatibility
        window.dispatchEvent(new CustomEvent('draconia-journey-start'));
        break;
      default:
        console.log(`🏰 Draconia Menu: Unknown button: ${buttonId}`);
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
   * Create a sparkle particle
   */
  private createSparkle(button: MenuButton): void {
    // Random position within button bounds
    const offsetX = (Math.random() - 0.5) * button.width * 0.8;
    const offsetY = (Math.random() - 0.5) * button.height * 0.8;

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
      // Spawn new sparkles when hovering
      if (button.isHovered && this.sparkleTimer >= this.sparkleInterval) {
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
   * Destroy the Draconia menu
   */
  destroy(): void {
    this.cleanupMouseHandler();

    // Unsubscribe from responsive manager
    if (this.resizeCallback) {
      this.responsiveManager.offResize(this.resizeCallback);
      this.resizeCallback = null;
    }

    if (this.backgroundSprite) {
      this.backgroundSprite.destroy();
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

    this.app.stage.removeChild(this.container);
    this.container.destroy();

    console.log('🏰 Draconia Menu: Destroyed');
  }
}
