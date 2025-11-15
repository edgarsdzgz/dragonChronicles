/**
 * Typewriter Text Animator
 *
 * Animates text revelation character-by-character like a typewriter.
 * Commonly used in visual novels, RPGs, and narrative games.
 *
 * Features:
 * - Configurable speed (characters per second)
 * - Instant complete (skip to end)
 * - Pause/resume support
 * - Completion callbacks
 * - Works with any text display object
 *
 * @module dialogue/animators/typewriter-animator
 */

import { Text } from 'pixi.js';

export interface TypewriterAnimatorOptions {
  /** Characters revealed per second (default: 40) */
  charsPerSecond?: number;

  /** Callback when animation completes */
  onComplete?: (() => void) | undefined;

  /** Callback on each character reveal (for sound effects) */
  onCharacter?: ((_char: string, _index: number) => void) | undefined;

  /** Punctuation pause duration multiplier (default: 2.0) */
  punctuationPauseMultiplier?: number;
}

/**
 * TypewriterAnimator
 *
 * Handles character-by-character text reveal animation.
 *
 * @example
 * ```typescript
 * const animator = new TypewriterAnimator(textObject, {
 *   charsPerSecond: 40,
 *   onComplete: () => console.log('Animation complete!')
 * });
 *
 * animator.start("Hello, dragon!");
 *
 * // In your game loop:
 * animator.update(deltaTime);
 *
 * // To skip:
 * animator.complete();
 * ```
 */
export class TypewriterAnimator {
  private textObject: Text;
  private options: Required<Omit<TypewriterAnimatorOptions, 'onComplete' | 'onCharacter'>> &
    Pick<TypewriterAnimatorOptions, 'onComplete' | 'onCharacter'>;

  // Animation state
  private fullText: string = '';
  private currentCharIndex: number = 0;
  private timeSinceLastChar: number = 0;
  private isAnimating: boolean = false;
  private isPaused: boolean = false;

  // Cached values
  private charDelay: number; // Milliseconds per character

  constructor(textObject: Text, options: TypewriterAnimatorOptions = {}) {
    this.textObject = textObject;

    this.options = {
      charsPerSecond: options.charsPerSecond ?? 40,
      punctuationPauseMultiplier: options.punctuationPauseMultiplier ?? 2.0,
      onComplete: options.onComplete,
      onCharacter: options.onCharacter,
    };

    this.charDelay = 1000 / this.options.charsPerSecond;
  }

  /**
   * Start typewriter animation with new text
   *
   * @param text - Full text to animate
   */
  start(text: string): void {
    this.fullText = text;
    this.currentCharIndex = 0;
    this.timeSinceLastChar = 0;
    this.isAnimating = true;
    this.isPaused = false;

    // Start with empty text
    this.textObject.text = '';
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

    // Check if animation is complete
    if (this.currentCharIndex >= this.fullText.length) {
      this.finish();
      return;
    }

    // Accumulate time
    this.timeSinceLastChar += deltaTime;

    // Get current character delay (longer for punctuation)
    const currentChar = this.fullText[this.currentCharIndex] ?? '';
    const delay = this.getCharDelay(currentChar);

    // Reveal characters if enough time has passed
    while (this.timeSinceLastChar >= delay && this.currentCharIndex < this.fullText.length) {
      this.revealNextCharacter();
      this.timeSinceLastChar -= delay;
    }
  }

  /**
   * Reveal the next character
   */
  private revealNextCharacter(): void {
    if (this.currentCharIndex >= this.fullText.length) {
      return;
    }

    this.currentCharIndex++;
    this.textObject.text = this.fullText.substring(0, this.currentCharIndex);

    // Fire character callback
    const currentChar = this.fullText[this.currentCharIndex - 1] ?? '';
    if (this.options.onCharacter && currentChar) {
      this.options.onCharacter(currentChar, this.currentCharIndex - 1);
    }
  }

  /**
   * Get delay for current character (punctuation has longer pauses)
   *
   * @param char - Current character
   * @returns Delay in milliseconds
   */
  private getCharDelay(char: string): number {
    const isPunctuation = /[.!?;,:]/.test(char);
    return isPunctuation
      ? this.charDelay * this.options.punctuationPauseMultiplier
      : this.charDelay;
  }

  /**
   * Complete animation instantly (skip to end)
   */
  complete(): void {
    if (!this.isAnimating) {
      return;
    }

    this.currentCharIndex = this.fullText.length;
    this.textObject.text = this.fullText;
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
    return !this.isAnimating && this.currentCharIndex >= this.fullText.length;
  }

  /**
   * Get current progress (0-1)
   */
  getProgress(): number {
    if (this.fullText.length === 0) {
      return 0;
    }
    return this.currentCharIndex / this.fullText.length;
  }

  /**
   * Set animation speed
   *
   * @param charsPerSecond - New speed in characters per second
   */
  setSpeed(charsPerSecond: number): void {
    this.options.charsPerSecond = charsPerSecond;
    this.charDelay = 1000 / charsPerSecond;
  }

  /**
   * Get current animation speed
   */
  getSpeed(): number {
    return this.options.charsPerSecond;
  }

  /**
   * Reset animator state
   */
  reset(): void {
    this.fullText = '';
    this.currentCharIndex = 0;
    this.timeSinceLastChar = 0;
    this.isAnimating = false;
    this.isPaused = false;
    this.textObject.text = '';
  }

  /**
   * Destroy animator and clean up
   */
  destroy(): void {
    this.reset();
    // Note: We don't destroy the text object since it's owned by the caller
  }
}
