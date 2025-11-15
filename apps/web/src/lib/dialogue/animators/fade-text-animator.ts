/**
 * Fade Text Animator
 *
 * Animates text revelation via fade-in effect (entire text appears at once).
 * Used for dramatic cutscenes with cinematic feel.
 *
 * Features:
 * - Configurable fade duration (milliseconds)
 * - Instant complete (skip to end)
 * - Pause/resume support
 * - Completion callbacks
 * - Same interface as TypewriterAnimator for drop-in replacement
 *
 * @module dialogue/animators/fade-text-animator
 */

import { Text } from 'pixi.js';

export interface FadeTextAnimatorOptions {
  /** Fade duration in milliseconds (default: 1000) */
  fadeDuration?: number;

  /** Callback when animation completes */
  onComplete?: (() => void) | undefined;
}

/**
 * FadeTextAnimator
 *
 * Handles fade-in text reveal animation for cinematic dialogue.
 *
 * @example
 * ```typescript
 * const animator = new FadeTextAnimator(textObject, {
 *   fadeDuration: 1000,
 *   onComplete: () => console.log('Fade complete!')
 * });
 *
 * animator.start("In ancient times, dragons ruled the skies...");
 *
 * // In your game loop:
 * animator.update(deltaTime);
 *
 * // To skip:
 * animator.complete();
 * ```
 */
export class FadeTextAnimator {
  private textObject: Text;
  private options: Required<Omit<FadeTextAnimatorOptions, 'onComplete'>> &
    Pick<FadeTextAnimatorOptions, 'onComplete'>;

  // Animation state
  private fullText: string = '';
  private currentAlpha: number = 0;
  private targetAlpha: number = 1;
  private fadeSpeed: number; // alpha per millisecond
  private isAnimating: boolean = false;
  private isPaused: boolean = false;
  private elapsedTime: number = 0;

  constructor(textObject: Text, options: FadeTextAnimatorOptions = {}) {
    this.textObject = textObject;

    this.options = {
      fadeDuration: options.fadeDuration ?? 1000,
      onComplete: options.onComplete,
    };

    this.fadeSpeed = 1 / this.options.fadeDuration; // alpha per ms
  }

  /**
   * Start fade animation with new text
   *
   * @param text - Full text to fade in
   */
  start(text: string): void {
    this.fullText = text;
    this.currentAlpha = 0;
    this.targetAlpha = 1;
    this.elapsedTime = 0;
    this.isAnimating = true;
    this.isPaused = false;

    // Set text immediately (entire text visible, but transparent)
    this.textObject.text = text;
    this.textObject.alpha = 0;
  }

  /**
   * Update animation state (call every frame)
   *
   * @param deltaTime - Time elapsed since last frame (milliseconds)
   */
  update(deltaTime: number): void {
    if (!this.isAnimating || this.isPaused) {
      return;
    }

    // Accumulate time
    this.elapsedTime += deltaTime;

    // Calculate current alpha
    this.currentAlpha = Math.min(this.elapsedTime * this.fadeSpeed, this.targetAlpha);
    this.textObject.alpha = this.currentAlpha;

    // Check if animation is complete
    if (this.currentAlpha >= this.targetAlpha) {
      this.finish();
    }
  }

  /**
   * Complete animation instantly (skip to end)
   */
  complete(): void {
    if (!this.isAnimating) {
      return;
    }

    this.currentAlpha = this.targetAlpha;
    this.textObject.alpha = this.targetAlpha;
    this.finish();
  }

  /**
   * Finish animation and fire completion callback
   */
  private finish(): void {
    this.isAnimating = false;
    this.isPaused = false;

    if (this.options.onComplete) {
      this.options.onComplete();
    }
  }

  /**
   * Pause animation
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume animation
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * Check if animation is currently running
   */
  isActive(): boolean {
    return this.isAnimating;
  }

  /**
   * Check if animation is paused
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Check if animation is complete
   */
  isCompleted(): boolean {
    return !this.isAnimating && this.currentAlpha >= this.targetAlpha;
  }

  /**
   * Get current progress (0-1)
   */
  getProgress(): number {
    return this.currentAlpha / this.targetAlpha;
  }

  /**
   * Set animation duration
   *
   * @param fadeDuration - New duration in milliseconds
   */
  setDuration(fadeDuration: number): void {
    this.options.fadeDuration = fadeDuration;
    this.fadeSpeed = 1 / fadeDuration;
  }

  /**
   * Get current animation duration
   */
  getDuration(): number {
    return this.options.fadeDuration;
  }

  /**
   * Reset animator state
   */
  reset(): void {
    this.fullText = '';
    this.currentAlpha = 0;
    this.elapsedTime = 0;
    this.isAnimating = false;
    this.isPaused = false;
    this.textObject.text = '';
    this.textObject.alpha = 1;
  }

  /**
   * Destroy animator and clean up
   */
  destroy(): void {
    this.reset();
    // Note: We don't destroy the text object since it's owned by the caller
  }
}
