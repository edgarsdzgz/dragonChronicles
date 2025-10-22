import { Application, Container, Graphics, Text, Sprite } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';

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
}

interface DraconiaMenuState {
  isVisible: boolean;
  isFadingIn: boolean;
  isFadingOut: boolean;
  isComplete: boolean;
  fadeProgress: number;
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

  // Animation
  private fadeInStartTime: number = 0;
  private fadeOutStartTime: number = 0;

  // Event handling
  private mouseHandler: ((_event: MouseEvent) => void) | null = null;
  private resizeHandler: (() => void) | null = null;

  constructor(app: Application, assetManager: AssetManager, config: DraconiaMenuConfig = {}) {
    this.app = app;
    this.assetManager = assetManager;
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
      this.createMenuButtons();

      // Set up event handlers
      this.setupMouseHandler();
      this.setupResizeHandler();

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
  update(_deltaTime: number): void {
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
   * Handle window resize for responsive behavior
   */
  handleResize(): void {
    // Force app to resize
    this.app.resize();

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
  private createMenuButtons(): void {
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    // Journey button
    const journeyButton = this.createButton('journey', 'Journey', centerX, centerY, 200, 60);
    this.buttons.set('journey', journeyButton);

    // Future buttons can be added here
    // const researchButton = this.createButton('research', 'Research', centerX, centerY + 100, 200, 60);
    // this.buttons.set('research', researchButton);
  }

  /**
   * Create a menu button
   */
  private createButton(
    id: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): MenuButton {
    // Create button graphics
    const graphics = new Graphics();
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill(this.config.buttonColor!);
    graphics.stroke({ color: 0xffffff, width: 2 });

    // Create button text
    const textSprite = new Text({
      text: text,
      style: {
        fontFamily: this.config.fontFamily!,
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
      }
    });
  }

  /**
   * Set up mouse handler for button interactions
   */
  private setupMouseHandler(): void {
    this.mouseHandler = (event: MouseEvent) => {
      if (!this.state.isVisible || this.state.isFadingOut) {
        return;
      }

      const rect = this.app.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

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
          button.graphics.rect(-button.width / 2, -button.height / 2, button.width, button.height);
          button.graphics.fill(this.config.buttonHoverColor!);
          button.graphics.stroke({ color: 0xffffff, width: 2 });
        } else if (!isHovered && button.isHovered) {
          // Exit hover
          button.isHovered = false;
          button.graphics.clear();
          button.graphics.rect(-button.width / 2, -button.height / 2, button.width, button.height);
          button.graphics.fill(this.config.buttonColor!);
          button.graphics.stroke({ color: 0xffffff, width: 2 });
        }

        // Check click
        if (isHovered && event.type === 'click') {
          this.handleButtonClick(button.id);
        }
      });
    };

    this.app.canvas.addEventListener('mousemove', this.mouseHandler);
    this.app.canvas.addEventListener('click', this.mouseHandler);
  }

  /**
   * Handle button click
   */
  private handleButtonClick(buttonId: string): void {
    console.log(`🏰 Draconia Menu: Button clicked: ${buttonId}`);

    switch (buttonId) {
      case 'journey':
        this.hide();
        // Emit journey start event
        window.dispatchEvent(new CustomEvent('draconia-journey-start'));
        break;
      default:
        console.log(`🏰 Draconia Menu: Unknown button: ${buttonId}`);
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
  }

  /**
   * Clean up mouse handler
   */
  private cleanupMouseHandler(): void {
    if (this.mouseHandler) {
      this.app.canvas.removeEventListener('mousemove', this.mouseHandler);
      this.app.canvas.removeEventListener('click', this.mouseHandler);
      this.mouseHandler = null;
    }
  }

  /**
   * Clean up resize handler
   */
  private cleanupResizeHandler(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  /**
   * Destroy the Draconia menu
   */
  destroy(): void {
    this.cleanupMouseHandler();
    this.cleanupResizeHandler();

    if (this.backgroundSprite) {
      this.backgroundSprite.destroy();
    }

    this.buttons.forEach((button) => {
      button.graphics.destroy();
      button.textSprite.destroy();
    });
    this.buttons.clear();

    this.app.stage.removeChild(this.container);
    this.container.destroy();

    console.log('🏰 Draconia Menu: Destroyed');
  }
}
