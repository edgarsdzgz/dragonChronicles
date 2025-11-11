/**
 * @file Profile Name Entry Manager
 * @description Text input screen for naming dragons
 *
 * Simple flow:
 * - Type dragon name (manual input only)
 * - Confirm name
 * - Create profile and start journey
 */

import { Application, Container, Graphics, Text } from 'pixi.js';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';
import { ResponsiveManager } from './responsive-manager';

export interface ProfileNameEntryConfig {
  backgroundColor?: number;
  textColor?: number;
  fontSize?: number;
  fontFamily?: string;
  inputBgColor?: number;
  inputBorderColor?: number;
  buttonColor?: number;
  buttonHoverColor?: number;
  fadeInDuration?: number;
  maxNameLength?: number;
  onNameConfirmed?: (_name: string, _slotNumber: number) => void;
  onCancel?: () => void;
}

// Gem color palette for profile-specific CTA buttons
const PROFILE_GEM_COLORS = {
  1: {
    primary: 0xFFD700, // Gold
    hover: 0xFFA500,  // Darker gold
    shadow: 0xB8860B, // Dark gold shadow
  },
  2: {
    primary: 0xE0115F, // Ruby
    hover: 0xC0114F,   // Darker ruby
    shadow: 0x8B0A3F, // Dark ruby shadow
  },
  3: {
    primary: 0x0F52BA, // Sapphire
    hover: 0x0D4A9A,   // Darker sapphire
    shadow: 0x0A3A7A, // Dark sapphire shadow
  },
} as const;

interface NameEntryState {
  isVisible: boolean;
  isFadingIn: boolean;
  fadeProgress: number;
  currentName: string;
  showingConfirmation: boolean;
  cursorVisible: boolean;
  cursorBlinkTimer: number;
}

interface ButtonVisual {
  id: 'confirm' | 'yes' | 'no' | 'cancel';
  graphics: Graphics;
  text: Text;
  x: number;
  y: number;
  width: number;
  height: number;
  isHovered: boolean;
}

/**
 * ProfileNameEntryManager - Name input and confirmation
 */
export class ProfileNameEntryManager {
  private app: Application;
  private config: ProfileNameEntryConfig;
  private responsiveManager: ResponsiveManager;
  private container: Container;
  private state: NameEntryState;

  // Visuals
  private backgroundGraphics: Graphics | null = null;
  private titleText: Text | null = null;
  private inputBox: Graphics | null = null;
  private inputText: Text | null = null;
  private cursorGraphics: Graphics | null = null;
  private loreText: Text | null = null;
  private helpText: Text | null = null;
  private confirmText: Text | null = null;
  private confirmNameText: Text | null = null;
  private buttons: ButtonVisual[] = [];

  // State
  private slotNumber: 1 | 2 | 3 = 1;
  private fadeInStartTime: number = 0;
  private cursorBlinkInterval: number = 500; // 500ms blink

  // Event handlers
  private keyHandler: ((_event: KeyboardEvent) => void) | null = null;
  private mouseHandler: ((_event: MouseEvent) => void) | null = null;
  private clickHandler: ((_event: MouseEvent) => void) | null = null;
  private resizeCallback: (() => void) | null = null;
  private isInitialized: boolean = false;

  constructor(
    app: Application,
    responsiveManager: ResponsiveManager,
    config: ProfileNameEntryConfig = {},
  ) {
    this.app = app;
    this.responsiveManager = responsiveManager;

    this.config = {
      backgroundColor: 0x0d4f3c, // Draconia dark green
      textColor: 0xffffff, // White
      fontSize: 24,
      fontFamily: 'Cinzel, serif',
      inputBgColor: 0x1a3d2d, // Darker green for input
      inputBorderColor: 0x7fb892, // Light green border
      buttonColor: 0x2d5a3d,
      buttonHoverColor: 0x4a7c59,
      fadeInDuration: 500, // Reduced from 1000ms to 500ms
      maxNameLength: 15, // Character limit for profile names
      ...config,
    };

    this.state = {
      isVisible: false,
      isFadingIn: false,
      fadeProgress: 0,
      currentName: '',
      showingConfirmation: false,
      cursorVisible: true,
      cursorBlinkTimer: 0,
    };

    // Create main container
    this.container = new Container();
    this.container.label = 'profile-name-entry';
    this.container.visible = false;
    setZIndex(this.container, Z_LAYERS.UI_ELEMENTS);
    this.app.stage.addChild(this.container);

  }

  /**
   * Show name entry screen
   */
  async show(slotNumber: 1 | 2 | 3): Promise<void> {
    if (this.state.isVisible) return;

    this.slotNumber = slotNumber;
    this.state.currentName = '';
    this.state.showingConfirmation = false;

    // Create visuals if not initialized
    if (!this.isInitialized) {
      await this.createVisuals();
      this.isInitialized = true;
    }

    // Reset to name entry view
    this.showNameEntryView();

    // Show container
    this.container.visible = true;
    this.container.alpha = 0;
    this.state.isVisible = true;
    this.state.isFadingIn = true;
    this.fadeInStartTime = Date.now();

    // Add event listeners
    this.addEventListeners();
  }

  /**
   * Hide name entry screen
   */
  hide(): void {
    if (!this.state.isVisible) return;

    this.container.visible = false;
    this.state.isVisible = false;
    this.state.isFadingIn = false;

    // Remove event listeners
    this.removeEventListeners();
  }

  /**
   * Update animation
   */
  update(deltaTime: number): void {
    if (!this.state.isVisible) return;

    // Handle fade-in
    if (this.state.isFadingIn) {
      const elapsed = Date.now() - this.fadeInStartTime;
      this.state.fadeProgress = Math.min(elapsed / this.config.fadeInDuration!, 1);
      this.container.alpha = this.state.fadeProgress;

      if (this.state.fadeProgress >= 1) {
        this.state.isFadingIn = false;
      }
    }

    // Cursor blink animation
    if (!this.state.showingConfirmation) {
      this.state.cursorBlinkTimer += deltaTime;
      if (this.state.cursorBlinkTimer >= this.cursorBlinkInterval) {
        this.state.cursorVisible = !this.state.cursorVisible;
        this.state.cursorBlinkTimer = 0;
        this.updateCursorVisibility();
      }
    }

    // Update button hover states
    this.updateButtonHighlights();
  }

  /**
   * Create all visuals
   */
  private async createVisuals(): Promise<void> {
    const gameWorldScale = this.responsiveManager.getGameWorldScale();

    // Background
    this.createBackground();

    // Title
    this.createTitle(gameWorldScale);

    // Input box
    this.createInputBox(gameWorldScale);

    // Input text and cursor
    this.createInputText(gameWorldScale);
    this.createCursor(gameWorldScale);

    // Lore text
    this.createLoreText(gameWorldScale);

    // Help text
    this.createHelpText(gameWorldScale);

    // Confirmation view elements (hidden initially)
    this.createConfirmationView(gameWorldScale);

    // Buttons
    this.createButtons(gameWorldScale);
  }

  /**
   * Create background
   */
  private createBackground(): void {
    this.backgroundGraphics = new Graphics();
    this.backgroundGraphics.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.backgroundGraphics.fill(this.config.backgroundColor!);
    this.container.addChild(this.backgroundGraphics);
  }

  /**
   * Create title
   */
  private createTitle(scale: number): void {
    this.titleText = new Text({
      text: 'WHAT IS YOUR NAME?',
      style: {
        fontFamily: this.config.fontFamily!,
        fontSize: 32 * scale,
        fill: this.config.textColor!,
        align: 'center',
      },
    });

    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = this.app.screen.width / 2;
    this.titleText.y = this.app.screen.height / 2 - 200 * scale; // Centered vertically

    this.container.addChild(this.titleText);
  }

  /**
   * Create input box
   */
  private createInputBox(scale: number): void {
    const boxWidth = 600 * scale;
    const boxHeight = 80 * scale;

    this.inputBox = new Graphics();
    this.inputBox.roundRect(0, 0, boxWidth, boxHeight, 8 * scale);
    this.inputBox.fill(this.config.inputBgColor!);
    this.inputBox.stroke({ color: this.config.inputBorderColor!, width: 3 * scale });

    this.inputBox.x = this.app.screen.width / 2 - boxWidth / 2;
    this.inputBox.y = this.app.screen.height / 2 - 80 * scale; // Centered vertically

    this.container.addChild(this.inputBox);
  }

  /**
   * Create input text
   */
  private createInputText(scale: number): void {
    this.inputText = new Text({
      text: '',
      style: {
        fontFamily: this.config.fontFamily!,
        fontSize: 28 * scale,
        fill: this.config.textColor!,
      },
    });

    this.inputText.x = this.app.screen.width / 2 - 280 * scale;
    this.inputText.y = this.app.screen.height / 2 - 60 * scale; // Centered vertically

    this.container.addChild(this.inputText);
  }

  /**
   * Create cursor
   */
  private createCursor(scale: number): void {
    this.cursorGraphics = new Graphics();
    this.cursorGraphics.rect(0, 0, 3 * scale, 40 * scale);
    this.cursorGraphics.fill(this.config.textColor!);

    this.cursorGraphics.x = this.app.screen.width / 2 - 280 * scale;
    this.cursorGraphics.y = this.app.screen.height / 2 - 60 * scale; // Centered vertically

    this.container.addChild(this.cursorGraphics);
  }

  /**
   * Create lore text
   */
  private createLoreText(scale: number): void {
    this.loreText = new Text({
      text: 'You have graduated with flying colors, Novice.\nDraconia and the World need you.',
      style: {
        fontFamily: this.config.fontFamily!,
        fontSize: 18 * scale,
        fill: 0xcccccc, // Light gray
        align: 'center',
        lineHeight: 30 * scale,
      },
    });

    this.loreText.anchor.set(0.5, 0);
    this.loreText.x = this.app.screen.width / 2;
    this.loreText.y = this.app.screen.height / 2 + 40 * scale; // Centered vertically

    this.container.addChild(this.loreText);
  }

  /**
   * Create help text
   */
  private createHelpText(scale: number): void {
    this.helpText = new Text({
      text: '[ENTER] Confirm  [ESC] Cancel',
      style: {
        fontFamily: this.config.fontFamily!,
        fontSize: 16 * scale,
        fill: 0xcccccc,
        align: 'center',
      },
    });

    this.helpText.anchor.set(0.5);
    this.helpText.x = this.app.screen.width / 2;
    this.helpText.y = this.app.screen.height - 50 * scale;

    this.container.addChild(this.helpText);
  }

  /**
   * Create confirmation view elements
   */
  private createConfirmationView(scale: number): void {
    // "CONFIRM NAME?" text
    this.confirmText = new Text({
      text: 'CONFIRM NAME?',
      style: {
        fontFamily: this.config.fontFamily!,
        fontSize: 28 * scale,
        fill: this.config.textColor!,
        align: 'center',
      },
    });

    this.confirmText.anchor.set(0.5, 0);
    this.confirmText.x = this.app.screen.width / 2;
    this.confirmText.y = 200 * scale;
    this.confirmText.visible = false;

    this.container.addChild(this.confirmText);

    // Display the entered name
    this.confirmNameText = new Text({
      text: '',
      style: {
        fontFamily: this.config.fontFamily!,
        fontSize: 36 * scale,
        fill: 0xffd700, // Gold
        align: 'center',
      },
    });

    this.confirmNameText.anchor.set(0.5, 0);
    this.confirmNameText.x = this.app.screen.width / 2;
    this.confirmNameText.y = 280 * scale;
    this.confirmNameText.visible = false;

    this.container.addChild(this.confirmNameText);
  }

  /**
   * Create buttons (Confirm, Yes/No, Cancel)
   */
  private createButtons(scale: number): void {
    const buttonWidth = 150 * scale;
    const buttonHeight = 50 * scale;
    const centerX = this.app.screen.width / 2;
    const buttonSpacing = 20 * scale;

    // Confirm and Cancel buttons in a row (for name entry)
    this.createButton(
      'confirm',
      'Confirm',
      centerX + buttonWidth / 2 + buttonSpacing / 2,
      this.app.screen.height / 2 + 120 * scale,
      buttonWidth,
      buttonHeight,
    );
    this.createButton(
      'cancel',
      'Cancel',
      centerX - buttonWidth / 2 - buttonSpacing / 2,
      this.app.screen.height / 2 + 120 * scale,
      buttonWidth,
      buttonHeight,
    );

    // Yes/No buttons (for confirmation) - positioned to match Confirm/Cancel layout
    this.createButton(
      'yes',
      'Yes',
      centerX + buttonWidth / 2 + buttonSpacing / 2, // RIGHT (matches Confirm position)
      this.app.screen.height / 2 + 120 * scale,
      buttonWidth,
      buttonHeight,
    );
    this.createButton(
      'no',
      'No',
      centerX - buttonWidth / 2 - buttonSpacing / 2, // LEFT (matches Cancel position)
      this.app.screen.height / 2 + 120 * scale,
      buttonWidth,
      buttonHeight,
    );
  }

  /**
   * Create a single button
   */
  private createButton(
    id: 'confirm' | 'yes' | 'no' | 'cancel',
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const graphics = new Graphics();
    graphics.roundRect(
      0,
      0,
      width,
      height,
      8 * this.responsiveManager.getGameWorldScale(),
    );
    
    // Apply gem color for confirm button based on profile slot
    if (id === 'confirm') {
      const gemColors = PROFILE_GEM_COLORS[this.slotNumber];
      graphics.fill(gemColors.primary);
    } else {
      graphics.fill(this.config.buttonColor!);
    }

    graphics.x = x - width / 2;
    graphics.y = y - height / 2;

    const buttonText = new Text({
      text,
      style: {
        fontFamily: this.config.fontFamily!,
        fontSize: 20 * this.responsiveManager.getGameWorldScale(),
        fill: this.config.textColor!,
      },
    });

    buttonText.anchor.set(0.5);
    buttonText.x = x;
    buttonText.y = y;

    this.container.addChild(graphics);
    this.container.addChild(buttonText);

    this.buttons.push({
      id,
      graphics,
      text: buttonText,
      x: graphics.x,
      y: graphics.y,
      width,
      height,
      isHovered: false,
    });

    // Hide Yes/No by default
    if (id === 'yes' || id === 'no') {
      graphics.visible = false;
      buttonText.visible = false;
    }
  }

  /**
   * Show name entry view
   */
  private showNameEntryView(): void {
    this.state.showingConfirmation = false;

    // Show name entry elements
    this.inputBox!.visible = true;
    this.inputText!.visible = true;
    this.cursorGraphics!.visible = true;
    this.loreText!.visible = true;
    this.getButton('confirm').graphics.visible = true;
    this.getButton('confirm').text.visible = true;

    // Hide confirmation elements
    this.confirmText!.visible = false;
    this.confirmNameText!.visible = false;
    this.getButton('yes').graphics.visible = false;
    this.getButton('yes').text.visible = false;
    this.getButton('no').graphics.visible = false;
    this.getButton('no').text.visible = false;
  }

  /**
   * Show confirmation view
   */
  private showConfirmationView(): void {
    this.state.showingConfirmation = true;

    // Hide name entry elements
    this.inputBox!.visible = false;
    this.inputText!.visible = false;
    this.cursorGraphics!.visible = false;
    this.loreText!.visible = false;
    this.getButton('confirm').graphics.visible = false;
    this.getButton('confirm').text.visible = false;

    // Show confirmation elements
    this.confirmText!.visible = true;
    this.confirmNameText!.text = this.state.currentName;
    this.confirmNameText!.visible = true;
    this.getButton('yes').graphics.visible = true;
    this.getButton('yes').text.visible = true;
    this.getButton('no').graphics.visible = true;
    this.getButton('no').text.visible = true;
  }

  /**
   * Get button by ID
   */
  private getButton(id: 'confirm' | 'yes' | 'no' | 'cancel'): ButtonVisual {
    return this.buttons.find((b) => b.id === id)!;
  }

  /**
   * Update cursor visibility
   */
  private updateCursorVisibility(): void {
    if (this.cursorGraphics) {
      this.cursorGraphics.visible = this.state.cursorVisible;
    }
  }

  /**
   * Update cursor position based on text length
   */
  private updateCursorPosition(): void {
    if (this.cursorGraphics && this.inputText) {
      const textWidth = this.inputText.width;
      const scale = this.responsiveManager.getGameWorldScale();
      this.cursorGraphics.x = this.app.screen.width / 2 - 280 * scale + textWidth + 5 * scale;
    }
  }

  /**
   * Update button highlights
   */
  private updateButtonHighlights(): void {
    for (const button of this.buttons) {
      if (button.isHovered) {
        if (button.id === 'confirm') {
          const gemColors = PROFILE_GEM_COLORS[this.slotNumber];
          button.graphics.tint = gemColors.hover;
        } else {
          button.graphics.tint = this.config.buttonHoverColor!;
        }
      } else {
        if (button.id === 'confirm') {
          const gemColors = PROFILE_GEM_COLORS[this.slotNumber];
          button.graphics.tint = gemColors.primary;
        } else {
          button.graphics.tint = this.config.buttonColor!;
        }
      }
    }
  }

  /**
   * Handle text input
   */
  private handleTextInput(key: string): void {
    if (this.state.showingConfirmation) return;

    if (key === 'Backspace') {
      this.state.currentName = this.state.currentName.slice(0, -1);
    } else if (key === 'Enter') {
      this.handleConfirm();
    } else if (key === 'Escape') {
      this.handleCancel();
    } else if (key.length === 1 && this.state.currentName.length < this.config.maxNameLength!) {
      // Only accept letters
      if (/^[A-Za-z]$/.test(key)) {
        // Capitalize first letter
        if (this.state.currentName.length === 0) {
          this.state.currentName += key.toUpperCase();
        } else {
          this.state.currentName += key.toLowerCase();
        }
      }
    }

    // Update text display
    if (this.inputText) {
      this.inputText.text = this.state.currentName;
    }

    // Update cursor position
    this.updateCursorPosition();
  }

  /**
   * Handle confirm button
   */
  private handleConfirm(): void {
    if (this.state.currentName.length < 3) {
      console.warn('⚠️ Name too short (minimum 3 characters)');
      return;
    }

    // Show confirmation view
    this.showConfirmationView();
  }

  /**
   * Handle yes button (confirm name)
   */
  private handleYes(): void {
    this.config.onNameConfirmed?.(this.state.currentName, this.slotNumber);
    this.hide();
  }

  /**
   * Handle no button (back to name entry)
   */
  private handleNo(): void {
    this.showNameEntryView();
  }

  /**
   * Handle cancel button
   */
  private handleCancel(): void {
    this.config.onCancel?.();
    this.hide();
  }

  /**
   * Add event listeners
   */
  private addEventListeners(): void {
    // Keyboard input
    this.keyHandler = (event: KeyboardEvent) => this.handleTextInput(event.key);
    window.addEventListener('keydown', this.keyHandler);

    // Mouse hover
    this.mouseHandler = (event: MouseEvent) => this.handleMouseMove(event);
    this.app.canvas.addEventListener('mousemove', this.mouseHandler);

    // Mouse click
    this.clickHandler = (event: MouseEvent) => this.handleMouseClick(event);
    this.app.canvas.addEventListener('click', this.clickHandler);

    // Resize
    this.resizeCallback = () => this.handleResize();
    this.responsiveManager.onResize(this.resizeCallback);
  }

  /**
   * Remove event listeners
   */
  private removeEventListeners(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }

    if (this.mouseHandler) {
      this.app.canvas.removeEventListener('mousemove', this.mouseHandler);
      this.mouseHandler = null;
    }

    if (this.clickHandler) {
      this.app.canvas.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }

    if (this.resizeCallback) {
      this.responsiveManager.offResize(this.resizeCallback);
      this.resizeCallback = null;
    }
  }

  /**
   * Handle mouse movement
   */
  private handleMouseMove(event: MouseEvent): void {
    const rect = this.app.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check button hover
    for (const button of this.buttons) {
      if (!button.graphics.visible) {
        button.isHovered = false;
        continue;
      }

      button.isHovered =
        mouseX >= button.x &&
        mouseX <= button.x + button.width &&
        mouseY >= button.y &&
        mouseY <= button.y + button.height;
    }
  }

  /**
   * Handle mouse click
   */
  private handleMouseClick(event: MouseEvent): void {
    const rect = this.app.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (const button of this.buttons) {
      if (!button.graphics.visible) continue;

      if (
        mouseX >= button.x &&
        mouseX <= button.x + button.width &&
        mouseY >= button.y &&
        mouseY <= button.y + button.height
      ) {
        switch (button.id) {
          case 'confirm':
            this.handleConfirm();
            break;
          case 'yes':
            this.handleYes();
            break;
          case 'no':
            this.handleNo();
            break;
          case 'cancel':
            this.handleCancel();
            break;
        }
        break;
      }
    }
  }

  /**
   * Handle resize
   */
  handleResize(): void {
    if (this.isInitialized) {
      this.container.removeChildren();
      this.buttons = [];
      this.createVisuals();

      if (this.state.showingConfirmation) {
        this.showConfirmationView();
      } else {
        this.showNameEntryView();
      }

      if (this.inputText) {
        this.inputText.text = this.state.currentName;
      }
    }
  }

  /**
   * Destroy manager
   */
  destroy(): void {
    this.removeEventListeners();
    this.container.destroy();
  }
}
