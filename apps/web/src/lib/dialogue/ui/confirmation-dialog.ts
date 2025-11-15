/**
 * Confirmation Dialog Component
 *
 * Reusable modal dialog for Yes/No confirmations.
 * Used for: skipping cutscenes, deleting saves, confirming actions.
 *
 * Features:
 * - Semi-transparent backdrop
 * - Customizable title and message
 * - Yes/No buttons with hover states
 * - Keyboard support (Y/N keys, ESC to cancel)
 * - Mouse/touch support
 * - Promise-based API
 *
 * @module dialogue/ui/confirmation-dialog
 */

import { Application, Container, Graphics, Text } from 'pixi.js';
import type { ResponsiveManager } from '$lib/pixi/systems/responsive-manager';
import { Z_LAYERS } from '$lib/pixi/systems/rendering/layer-manager';
import { tu, tc } from '$lib/i18n/helpers';

export interface ConfirmationDialogOptions {
  /** Title text or translation key (default: "ui:skipDialog.title") */
  title?: string;

  /** Message text or translation key (default: "ui:skipDialog.message") */
  message?: string;

  /** Additional message text */
  additionalMessage?: string;

  /** Yes button text (default: "Yes") */
  yesText?: string;

  /** No button text (default: "No") */
  noText?: string;

  /** Enable keyboard shortcuts (Y/N/ESC) (default: true) */
  enableKeyboard?: boolean;

  /** Backdrop alpha (default: 0.7) */
  backdropAlpha?: number;
}

/**
 * ConfirmationDialog
 *
 * Shows a modal confirmation dialog and returns user's choice.
 *
 * @example
 * ```typescript
 * const dialog = new ConfirmationDialog(app, responsiveManager);
 * const confirmed = await dialog.show({
 *   title: "Skip Cutscene?",
 *   message: "Are you sure you want to skip?"
 * });
 *
 * if (confirmed) {
 *   // User clicked Yes
 * } else {
 *   // User clicked No
 * }
 *
 * dialog.destroy();
 * ```
 */
export class ConfirmationDialog {
  private app: Application;
  private responsiveManager: ResponsiveManager;

  // Containers
  private container: Container | null = null;
  private backdrop: Graphics | null = null;
  private dialogBox: Graphics | null = null;

  // Text objects
  private titleText: Text | null = null;
  private messageText: Text | null = null;
  private additionalMessageText: Text | null = null;

  // Buttons
  private yesButton: Container | null = null;
  private noButton: Container | null = null;
  private yesButtonGraphics: Graphics | null = null;
  private noButtonGraphics: Graphics | null = null;
  private yesButtonText: Text | null = null;
  private noButtonText: Text | null = null;

  // State
  private resolveCallback: ((_value: boolean) => void) | null = null;
  private keyboardListener: ((_e: KeyboardEvent) => void) | null = null;

  constructor(app: Application, responsiveManager: ResponsiveManager) {
    this.app = app;
    this.responsiveManager = responsiveManager;
  }

  /**
   * Show confirmation dialog
   *
   * @param options - Dialog configuration options
   * @returns Promise<boolean> - true if Yes clicked, false if No clicked
   */
  async show(options: ConfirmationDialogOptions = {}): Promise<boolean> {
    // Clean up any existing dialog
    this.hide();

    const opts = {
      title: options.title ?? tu('skipDialog.title'),
      message: options.message ?? tu('skipDialog.message'),
      additionalMessage: options.additionalMessage ?? tu('skipDialog.canReplay'),
      yesText: options.yesText ?? tc('yes'),
      noText: options.noText ?? tc('no'),
      enableKeyboard: options.enableKeyboard ?? true,
      backdropAlpha: options.backdropAlpha ?? 0.7,
    };

    // Create dialog UI
    this.createDialog(opts);

    // Setup keyboard listener
    if (opts.enableKeyboard) {
      this.setupKeyboard();
    }

    // Return promise that resolves when user makes a choice
    return new Promise<boolean>((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  /**
   * Create dialog UI elements
   */
  private createDialog(opts: Required<ConfirmationDialogOptions>): void {
    const { width, height } = this.app.screen;
    const scale = this.responsiveManager.getScale();

    // Create container
    this.container = new Container();
    this.container.zIndex = Z_LAYERS.UI_OVERLAY + 1; // Above full-screen renderer
    this.app.stage.addChild(this.container);

    // Create backdrop
    this.backdrop = new Graphics();
    this.backdrop.rect(0, 0, width, height);
    this.backdrop.fill({ color: 0x000000, alpha: opts.backdropAlpha });
    this.backdrop.eventMode = 'static'; // Block clicks to elements behind
    this.container.addChild(this.backdrop);

    // Dialog box dimensions
    const dialogWidth = Math.min(500 * scale, width * 0.9);
    const dialogHeight = Math.min(300 * scale, height * 0.6);
    const dialogX = (width - dialogWidth) / 2;
    const dialogY = (height - dialogHeight) / 2;

    // Create dialog box with Draconia styling (golden double border)
    this.dialogBox = new Graphics();

    // Background - dark green matching nameplate style with reduced opacity
    this.dialogBox.roundRect(0, 0, dialogWidth, dialogHeight, 16 * scale);
    this.dialogBox.fill({ color: 0x1a3d2d, alpha: 0.75 }); // Draconia dark green, 75% opacity

    // Outer golden stroke (brighter gold)
    this.dialogBox.stroke({ color: 0xffd700, width: 3 * scale, alpha: 0.9 });

    // Inner golden stroke (slightly darker/muted) - offset inward for double border effect
    const innerBorderOffset = 4 * scale;
    this.dialogBox.roundRect(
      innerBorderOffset,
      innerBorderOffset,
      dialogWidth - innerBorderOffset * 2,
      dialogHeight - innerBorderOffset * 2,
      (16 - 4) * scale,
    );
    this.dialogBox.stroke({ color: 0xdaa520, width: 2 * scale, alpha: 0.7 }); // Goldenrod

    this.dialogBox.x = dialogX;
    this.dialogBox.y = dialogY;
    this.container.addChild(this.dialogBox);

    // Create title text
    this.titleText = new Text({
      text: opts.title,
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: Math.floor(28 * scale),
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.titleText.anchor.set(0.5, 0);
    this.titleText.x = dialogWidth / 2;
    this.titleText.y = 30 * scale;
    this.dialogBox.addChild(this.titleText);

    // Create message text
    this.messageText = new Text({
      text: opts.message,
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: Math.floor(18 * scale),
        fill: 0xcccccc,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: dialogWidth - 60 * scale,
      },
    });
    this.messageText.anchor.set(0.5, 0);
    this.messageText.x = dialogWidth / 2;
    this.messageText.y = 80 * scale;
    this.dialogBox.addChild(this.messageText);

    // Create additional message text (if provided)
    if (opts.additionalMessage) {
      this.additionalMessageText = new Text({
        text: opts.additionalMessage,
        style: {
          fontFamily: 'Cinzel, serif',
          fontSize: Math.floor(14 * scale),
          fill: 0x999999,
          align: 'center',
          wordWrap: true,
          wordWrapWidth: dialogWidth - 60 * scale,
        },
      });
      this.additionalMessageText.anchor.set(0.5, 0);
      this.additionalMessageText.x = dialogWidth / 2;
      this.additionalMessageText.y = 140 * scale;
      this.dialogBox.addChild(this.additionalMessageText);
    }

    // Create buttons
    const buttonWidth = 120 * scale;
    const buttonHeight = 40 * scale;
    const buttonY = dialogHeight - 60 * scale;
    const buttonSpacing = 20 * scale;

    // Yes button
    this.yesButton = this.createButton(
      opts.yesText,
      (dialogWidth - buttonWidth * 2 - buttonSpacing) / 2,
      buttonY,
      buttonWidth,
      buttonHeight,
      0x4caf50, // Green
      scale,
      () => this.onChoice(true),
    );
    this.dialogBox.addChild(this.yesButton);

    // No button
    this.noButton = this.createButton(
      opts.noText,
      (dialogWidth + buttonSpacing) / 2,
      buttonY,
      buttonWidth,
      buttonHeight,
      0xf44336, // Red
      scale,
      () => this.onChoice(false),
    );
    this.dialogBox.addChild(this.noButton);
  }

  /**
   * Create a button with text and hover states
   */
  private createButton(
    label: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
    scale: number,
    onClick: () => void,
  ): Container {
    const button = new Container();
    button.x = x;
    button.y = y;
    button.eventMode = 'static';
    button.cursor = 'pointer';

    // Button background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8 * scale);
    bg.fill({ color });
    button.addChild(bg);

    // Button text
    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: Math.floor(18 * scale),
        fill: 0xffffff,
        align: 'center',
      },
    });
    text.anchor.set(0.5, 0.5);
    text.x = width / 2;
    text.y = height / 2;
    button.addChild(text);

    // Hover effects
    button.on('pointerenter', () => {
      bg.tint = 0xcccccc; // Lighter on hover
    });

    button.on('pointerleave', () => {
      bg.tint = 0xffffff; // Reset tint
    });

    // Click handler
    button.on('pointerdown', onClick);

    // Store references for cleanup
    if (label === 'Yes' || label.includes('Yes')) {
      this.yesButtonGraphics = bg;
      this.yesButtonText = text;
    } else {
      this.noButtonGraphics = bg;
      this.noButtonText = text;
    }

    return button;
  }

  /**
   * Setup keyboard event listeners
   */
  private setupKeyboard(): void {
    this.keyboardListener = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'y':
          this.onChoice(true);
          break;
        case 'n':
        case 'escape':
          this.onChoice(false);
          break;
      }
    };

    window.addEventListener('keydown', this.keyboardListener);
  }

  /**
   * Handle user choice
   */
  private onChoice(value: boolean): void {
    if (this.resolveCallback) {
      this.resolveCallback(value);
      this.resolveCallback = null;
    }

    this.hide();
  }

  /**
   * Hide and clean up dialog
   */
  private hide(): void {
    // Remove keyboard listener
    if (this.keyboardListener) {
      window.removeEventListener('keydown', this.keyboardListener);
      this.keyboardListener = null;
    }

    // Destroy UI elements
    if (this.container) {
      this.container.destroy({ children: true });
      this.container = null;
    }

    // Clear references
    this.backdrop = null;
    this.dialogBox = null;
    this.titleText = null;
    this.messageText = null;
    this.additionalMessageText = null;
    this.yesButton = null;
    this.noButton = null;
    this.yesButtonGraphics = null;
    this.noButtonGraphics = null;
    this.yesButtonText = null;
    this.noButtonText = null;
  }

  /**
   * Destroy dialog (call when no longer needed)
   */
  destroy(): void {
    this.hide();
  }
}
