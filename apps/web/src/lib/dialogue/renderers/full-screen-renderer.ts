/**
 * Full-Screen Dialogue Renderer
 *
 * Renders dialogue in full-screen mode with centered text on a black background.
 * Used for: opening cutscene, dramatic story moments, narrative sequences.
 *
 * Features:
 * - Full-screen black background with optional vignette
 * - Centered, responsive text layout
 * - "Press any key" hint at bottom
 * - Fade in/out transitions
 * - Text glow effect for dramatic feel
 *
 * @module dialogue/renderers/full-screen-renderer
 */

import { Application, Container, Graphics, Text } from 'pixi.js';
import type { ResponsiveManager } from '$lib/pixi/systems/responsive-manager';
import { Z_LAYERS } from '$lib/pixi/systems/rendering/layer-manager';
import { tc } from '$lib/i18n/helpers';

export interface FullScreenRendererOptions {
  /** Enable text glow effect (default: true) */
  enableGlow?: boolean;

  /** Background color (default: 0x000000 black) */
  backgroundColor?: number;

  /** Background alpha (default: 1.0) */
  backgroundAlpha?: number;

  /** Enable vignette effect (default: true) */
  enableVignette?: boolean;

  /** Max text width as percentage of screen (default: 0.8) */
  maxTextWidthPercent?: number;

  /** Show "press any key" hint (default: true) */
  showPressKeyHint?: boolean;

  /** Fade duration in ms (default: 1000) */
  fadeDuration?: number;
}

/**
 * FullScreenRenderer
 *
 * Renders dialogue text in full-screen mode for dramatic cutscenes.
 *
 * @example
 * ```typescript
 * const renderer = new FullScreenRenderer(app, responsiveManager);
 * await renderer.fadeIn();
 * renderer.setText("Dragons gather from all over...");
 * renderer.showHint(true);
 * await renderer.fadeOut();
 * renderer.destroy();
 * ```
 */
export class FullScreenRenderer {
  private app: Application;
  private responsiveManager: ResponsiveManager;
  private options: Required<FullScreenRendererOptions>;

  // Containers
  private container: Container;
  private backgroundGraphics: Graphics;
  private textContainer: Container;
  private hintContainer: Container;

  // Text objects
  private mainText: Text;
  private hintText: Text;

  // Resize callback reference for proper cleanup
  private resizeCallback: () => void;

  // Animation state
  private fadeAlpha: number = 0;
  private fadeTarget: number = 0;
  private fadeSpeed: number = 0;
  private isFading: boolean = false;

  constructor(
    app: Application,
    responsiveManager: ResponsiveManager,
    options: FullScreenRendererOptions = {},
  ) {
    this.app = app;
    this.responsiveManager = responsiveManager;

    this.options = {
      enableGlow: options.enableGlow ?? true,
      backgroundColor: options.backgroundColor ?? 0x000000,
      backgroundAlpha: options.backgroundAlpha ?? 1.0,
      enableVignette: options.enableVignette ?? true,
      maxTextWidthPercent: options.maxTextWidthPercent ?? 0.8,
      showPressKeyHint: options.showPressKeyHint ?? true,
      fadeDuration: options.fadeDuration ?? 1000,
    };

    // Create container hierarchy
    this.container = new Container();
    this.container.zIndex = Z_LAYERS.UI_OVERLAY; // Above everything
    this.container.visible = false;
    this.container.alpha = 0;

    this.backgroundGraphics = new Graphics();
    this.container.addChild(this.backgroundGraphics);

    this.textContainer = new Container();
    this.container.addChild(this.textContainer);

    this.hintContainer = new Container();
    this.hintContainer.visible = false;
    this.container.addChild(this.hintContainer);

    // Create text objects
    this.mainText = this.createMainText();
    this.textContainer.addChild(this.mainText);

    this.hintText = this.createHintText();
    this.hintContainer.addChild(this.hintText);

    // Add to stage
    this.app.stage.addChild(this.container);

    // Initial layout
    this.updateLayout();

    // Store bound callback for proper cleanup
    this.resizeCallback = this.updateLayout.bind(this);

    // Listen for resize events
    this.responsiveManager.onResize(this.resizeCallback);
  }

  /**
   * Create main text object with styling
   */
  private createMainText(): Text {
    const scale = this.responsiveManager.getScale();
    const text = new Text({
      text: '',
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: Math.floor(28 * scale),
        fill: 0xffffff,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: this.app.screen.width * this.options.maxTextWidthPercent,
        lineHeight: Math.floor(42 * scale),
      },
    });

    text.anchor.set(0, 0.5);

    // Add glow effect
    if (this.options.enableGlow) {
      // TODO: Add PixiJS filter for text glow when needed
      // For now, we'll use a simple drop shadow approach
    }

    return text;
  }

  /**
   * Create hint text object
   */
  private createHintText(): Text {
    const scale = this.responsiveManager.getScale();
    const hintText = tc('pressAnyKey'); // "Press any key to continue"

    const text = new Text({
      text: hintText,
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: Math.floor(18 * scale),
        fill: 0xffffff,
        align: 'center',
        alpha: 0.6, // Subtle
      },
    });

    text.anchor.set(0.5, 1.0); // Bottom-center anchor

    return text;
  }

  /**
   * Update layout for current screen size
   */
  private updateLayout(): void {
    const { width, height } = this.app.screen;
    const scale = this.responsiveManager.getScale();

    // Update background
    this.drawBackground(width, height);

    // Update text styling
    this.mainText.style.fontSize = Math.floor(28 * scale);
    this.mainText.style.wordWrapWidth = width * this.options.maxTextWidthPercent;
    this.mainText.style.lineHeight = Math.floor(42 * scale);

    // Position main text (left-aligned with padding, vertically centered)
    const leftPadding = width * (1 - this.options.maxTextWidthPercent) / 2;
    this.mainText.x = leftPadding;
    this.mainText.y = height / 2;

    // Update hint text
    this.hintText.style.fontSize = Math.floor(18 * scale);
    this.hintText.x = width / 2;
    this.hintText.y = height - 40 * scale; // 40px from bottom
  }

  /**
   * Draw background with optional vignette
   */
  private drawBackground(width: number, height: number): void {
    this.backgroundGraphics.clear();

    // Solid black background
    this.backgroundGraphics.rect(0, 0, width, height);
    this.backgroundGraphics.fill({
      color: this.options.backgroundColor,
      alpha: this.options.backgroundAlpha,
    });

    // Vignette effect (darker edges)
    if (this.options.enableVignette) {
      const _vignetteRadius = Math.max(width, height) * 0.7;

      this.backgroundGraphics.rect(0, 0, width, height);
      this.backgroundGraphics.fill({
        color: 0x000000,
        alpha: 0,
        // TODO: Add radial gradient for vignette when PixiJS v8 supports it better
        // For now, vignette is disabled but structure is ready
      });
    }
  }

  /**
   * Set text content
   *
   * @param text - Text to display
   */
  setText(text: string): void {
    this.mainText.text = text;
  }

  /**
   * Get the text object for external animation (e.g., typewriter)
   */
  getTextObject(): Text {
    return this.mainText;
  }

  /**
   * Show or hide the "press any key" hint
   *
   * @param visible - Whether to show hint
   */
  showHint(visible: boolean): void {
    if (this.options.showPressKeyHint) {
      this.hintContainer.visible = visible;
    }
  }

  /**
   * Fade in the renderer
   *
   * @returns Promise that resolves when fade is complete
   */
  async fadeIn(): Promise<void> {
    this.container.visible = true;
    this.fadeAlpha = 0;
    this.fadeTarget = 1;
    this.fadeSpeed = 1000 / this.options.fadeDuration; // alpha per second
    this.isFading = true;

    return new Promise<void>((resolve) => {
      const checkFade = () => {
        if (!this.isFading || this.fadeAlpha >= this.fadeTarget) {
          this.isFading = false;
          this.container.alpha = 1;
          resolve();
        } else {
          requestAnimationFrame(checkFade);
        }
      };
      checkFade();
    });
  }

  /**
   * Fade out the renderer
   *
   * @returns Promise that resolves when fade is complete
   */
  async fadeOut(): Promise<void> {
    this.fadeAlpha = 1;
    this.fadeTarget = 0;
    this.fadeSpeed = 1000 / this.options.fadeDuration; // alpha per second
    this.isFading = true;

    return new Promise<void>((resolve) => {
      const checkFade = () => {
        if (!this.isFading || this.fadeAlpha <= this.fadeTarget) {
          this.isFading = false;
          this.container.alpha = 0;
          this.container.visible = false;
          resolve();
        } else {
          requestAnimationFrame(checkFade);
        }
      };
      checkFade();
    });
  }

  /**
   * Update fade animation (call every frame)
   *
   * @param deltaTime - Time elapsed since last frame (milliseconds)
   */
  update(deltaTime: number): void {
    if (!this.isFading) {
      return;
    }

    const deltaAlpha = (this.fadeSpeed * deltaTime) / 1000;

    if (this.fadeTarget > this.fadeAlpha) {
      // Fading in
      this.fadeAlpha = Math.min(this.fadeAlpha + deltaAlpha, this.fadeTarget);
    } else {
      // Fading out
      this.fadeAlpha = Math.max(this.fadeAlpha - deltaAlpha, this.fadeTarget);
    }

    this.container.alpha = this.fadeAlpha;
  }

  /**
   * Show renderer immediately (no fade)
   */
  show(): void {
    this.container.visible = true;
    this.container.alpha = 1;
    this.fadeAlpha = 1;
    this.isFading = false;
  }

  /**
   * Hide renderer immediately (no fade)
   */
  hide(): void {
    this.container.visible = false;
    this.container.alpha = 0;
    this.fadeAlpha = 0;
    this.isFading = false;
  }

  /**
   * Check if renderer is visible
   */
  isVisible(): boolean {
    return this.container.visible && this.container.alpha > 0;
  }

  /**
   * Check if currently fading
   */
  isFadingState(): boolean {
    return this.isFading;
  }

  /**
   * Clear all text
   */
  clear(): void {
    this.mainText.text = '';
    this.showHint(false);
  }

  /**
   * Destroy renderer and clean up resources
   */
  destroy(): void {
    // Remove resize listener
    this.responsiveManager.offResize(this.resizeCallback);

    // Destroy text objects
    this.mainText.destroy();
    this.hintText.destroy();

    // Destroy containers
    this.textContainer.destroy({ children: true });
    this.hintContainer.destroy({ children: true });
    this.backgroundGraphics.destroy();
    this.container.destroy({ children: true });
  }
}
