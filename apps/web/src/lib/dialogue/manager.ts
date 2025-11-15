/**
 * Universal Dialogue Manager
 *
 * Orchestrates dialogue display, animation, and user interaction.
 * Supports both linear dialogues (cutscenes) and branching dialogues (NPC conversations).
 *
 * Features:
 * - Load and display dialogues from JSON
 * - Integrate with i18next for translations
 * - Typewriter text animation
 * - Full-screen and text-box rendering modes
 * - Input handling (keyboard, mouse, touch)
 * - Skip confirmation dialog
 * - Screen transitions with fade effects
 * - Completion callbacks
 *
 * @module dialogue/manager
 */

import { Application } from 'pixi.js';
import type { ResponsiveManager } from '$lib/pixi/systems/responsive-manager';
import { DialogueLoader } from './loader';
import { TypewriterAnimator } from './animators/typewriter-animator';
import { FadeTextAnimator } from './animators/fade-text-animator';
import { FullScreenRenderer } from './renderers/full-screen-renderer';
import { ConfirmationDialog } from './ui/confirmation-dialog';
import {
  type Dialogue,
  type LinearDialogue,
  type BranchingDialogue,
  type DialogueScreen,
  type DialogueNode,
  type DialogueState,
  isLinearDialogue,
  isBranchingDialogue,
  isTextNode,
  isChoiceNode,
} from './schemas';

export interface DialogueManagerOptions {
  /** Animation type for text reveal (default: 'typewriter') */
  animationType?: 'typewriter' | 'fade';

  /** Variables for text interpolation (e.g., {dragonName: 'Flameheart'}) */
  variables?: Record<string, string | number>;

  /** Allow ESC key to skip (default: true) */
  allowSkip?: boolean;

  /** Show confirmation before skipping (default: true) */
  skipConfirmation?: boolean;

  /** Typewriter animation speed in characters/second (default: 40) */
  typewriterSpeed?: number;

  /** Fade transition duration in ms (default: 1000) */
  fadeDuration?: number;

  /** Auto-advance after text completes (default: false) */
  autoAdvance?: boolean;

  /** Duration to wait before auto-advance in ms (default: 3000) */
  autoAdvanceDuration?: number;

  /** Callback when dialogue completes */
  onComplete?: (() => void) | undefined;

  /** Callback when choice is selected (branching dialogues) */
  onChoiceSelected?: ((_choiceId: string) => void) | undefined;

  /** Callback when screen/node changes */
  onScreenChange?: ((_screenIndex: number) => void) | undefined;
}

/**
 * DialogueManager
 *
 * Main controller for dialogue system.
 *
 * @example
 * ```typescript
 * const manager = new DialogueManager(app, responsiveManager, loader);
 *
 * await manager.show('opening-cutscene', {
 *   variables: { dragonName: profile.name },
 *   allowSkip: true,
 *   onComplete: () => console.log('Cutscene finished!')
 * });
 * ```
 */
export class DialogueManager {
  private app: Application;
  private responsiveManager: ResponsiveManager;
  private loader: DialogueLoader;

  // Components
  private renderer: FullScreenRenderer;
  private animator: TypewriterAnimator | FadeTextAnimator | null = null;
  private confirmationDialog: ConfirmationDialog;

  // State
  private currentDialogue: Dialogue | null = null;
  private state: DialogueState = {
    currentScreenIndex: 0,
    currentNodeId: undefined,
    visitedNodes: new Set(),
    isAnimating: false,
    isPaused: false,
    isComplete: false,
    variables: {},
  };

  // Options
  private options: Required<
    Omit<DialogueManagerOptions, 'onComplete' | 'onChoiceSelected' | 'onScreenChange'>
  > &
    Pick<DialogueManagerOptions, 'onComplete' | 'onChoiceSelected' | 'onScreenChange'>;

  // Input handling
  private inputListener: ((_e: KeyboardEvent | PointerEvent) => void) | null = null;
  private isWaitingForInput: boolean = false;

  // Transition state
  private isTransitioning: boolean = false;

  constructor(app: Application, responsiveManager: ResponsiveManager, loader: DialogueLoader) {
    this.app = app;
    this.responsiveManager = responsiveManager;
    this.loader = loader;

    // Default options
    this.options = {
      animationType: 'typewriter',
      variables: {},
      allowSkip: true,
      skipConfirmation: true,
      typewriterSpeed: 40,
      fadeDuration: 1000,
      autoAdvance: false,
      autoAdvanceDuration: 3000,
      onComplete: undefined,
      onChoiceSelected: undefined,
      onScreenChange: undefined,
    };

    // Create components
    this.renderer = new FullScreenRenderer(app, responsiveManager, {
      fadeDuration: this.options.fadeDuration,
    });

    this.confirmationDialog = new ConfirmationDialog(app, responsiveManager);
  }

  /**
   * Show a dialogue
   *
   * @param dialogueId - ID of the dialogue to load and display
   * @param options - Display options and callbacks
   * @returns Promise that resolves when dialogue completes
   */
  async show(dialogueId: string, options: DialogueManagerOptions = {}): Promise<void> {
    // Merge options
    this.options = { ...this.options, ...options };

    // Load dialogue
    console.log(`[DialogueManager] Loading dialogue: ${dialogueId}`);
    this.currentDialogue = await this.loader.load(dialogueId);

    // Initialize state
    this.resetState();
    this.state.variables = this.options.variables || {};

    // Setup input handlers
    this.setupInput();

    // Fade in renderer
    await this.renderer.fadeIn();

    // Start dialogue based on type
    if (isLinearDialogue(this.currentDialogue)) {
      await this.playLinearDialogue(this.currentDialogue);
    } else if (isBranchingDialogue(this.currentDialogue)) {
      await this.playBranchingDialogue(this.currentDialogue);
    }

    // Fade out renderer
    await this.renderer.fadeOut();

    // Cleanup
    this.cleanup();

    // Fire completion callback
    if (this.options.onComplete) {
      this.options.onComplete();
    }

    console.log(`[DialogueManager] Dialogue complete: ${dialogueId}`);
  }

  /**
   * Play a linear dialogue sequence
   */
  private async playLinearDialogue(dialogue: LinearDialogue): Promise<void> {
    const { screens } = dialogue;

    for (let i = 0; i < screens.length; i++) {
      if (this.state.isComplete) {
        break; // User skipped
      }

      this.state.currentScreenIndex = i;

      // Fire screen change callback
      if (this.options.onScreenChange) {
        this.options.onScreenChange(i);
      }

      // Display screen
      const screen = screens[i];
      if (!screen) {
        console.error(`[DialogueManager] Screen ${i} not found`);
        break;
      }
      await this.displayScreen(screen);

      // Transition to next screen (except for last screen)
      if (i < screens.length - 1 && !this.state.isComplete) {
        await this.transitionToNextScreen();
      }
    }

    this.state.isComplete = true;
  }

  /**
   * Play a branching dialogue tree
   */
  private async playBranchingDialogue(dialogue: BranchingDialogue): Promise<void> {
    let currentNodeId = dialogue.startNode;

    while (currentNodeId && !this.state.isComplete) {
      const node = dialogue.nodes[currentNodeId];

      if (!node) {
        console.error(`[DialogueManager] Node not found: ${currentNodeId}`);
        break;
      }

      // Mark as visited
      this.state.visitedNodes?.add(currentNodeId);
      this.state.currentNodeId = currentNodeId;

      if (isTextNode(node)) {
        // Display text
        await this.displayNode(node);
        currentNodeId = node.next;
      } else if (isChoiceNode(node)) {
        // Show choices and wait for selection
        currentNodeId = await this.displayChoices(node);
      }

      // Transition between nodes
      if (currentNodeId && !this.state.isComplete) {
        await this.transitionToNextScreen();
      }
    }

    this.state.isComplete = true;
  }

  /**
   * Display a linear dialogue screen
   */
  private async displayScreen(screen: DialogueScreen): Promise<void> {
    // Get translated text
    const text = this.loader.getTranslatedText(screen.textKey, this.state.variables);

    // Clear previous text
    this.renderer.clear();
    this.renderer.showHint(false);

    // Create animator based on configuration
    this.animator = this.createAnimator();

    // Start animation
    this.state.isAnimating = true;
    this.animator.start(text);

    // Wait for user input
    await this.waitForInput();
  }

  /**
   * Display a branching dialogue node
   */
  private async displayNode(node: DialogueNode): Promise<void> {
    if (!isTextNode(node)) return;

    // Get translated text
    const text = this.loader.getTranslatedText(node.textKey, this.state.variables);

    // Clear previous text
    this.renderer.clear();
    this.renderer.showHint(false);

    // Create animator based on configuration
    this.animator = this.createAnimator();

    // Start animation
    this.state.isAnimating = true;
    this.animator.start(text);

    // Wait for input
    await this.waitForInput();
  }

  /**
   * Display choices and wait for selection
   */
  private async displayChoices(node: DialogueNode): Promise<string | null> {
    if (!isChoiceNode(node)) return null;

    // TODO: Implement choice display UI
    // For now, just select first choice
    console.warn('[DialogueManager] Choice display not yet implemented, selecting first choice');

    const firstChoice = node.choices[0];
    if (!firstChoice) {
      console.error('[DialogueManager] No choices available');
      return null;
    }

    if (this.options.onChoiceSelected && firstChoice.id) {
      this.options.onChoiceSelected(firstChoice.id);
    }

    return firstChoice.next;
  }

  /**
   * Callback when typewriter animation completes
   */
  private onTextComplete(): void {
    this.state.isAnimating = false;

    // Show hint to press key
    this.renderer.showHint(true);

    // Auto-advance if enabled
    if (this.options.autoAdvance) {
      setTimeout(() => {
        if (this.isWaitingForInput) {
          this.onAdvanceInput();
        }
      }, this.options.autoAdvanceDuration);
    }
  }

  /**
   * Wait for user input to advance
   */
  private async waitForInput(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.isWaitingForInput = true;

      const checkAdvance = () => {
        if (!this.isWaitingForInput) {
          resolve();
        } else {
          requestAnimationFrame(checkAdvance);
        }
      };

      checkAdvance();
    });
  }

  /**
   * Handle input to advance dialogue
   */
  private onAdvanceInput(): void {
    if (this.isTransitioning) {
      return; // Don't allow advance during transitions
    }

    // If text is still animating, complete it instantly
    if (this.state.isAnimating && this.animator) {
      this.animator.complete();
      return;
    }

    // Advance to next screen/node
    this.isWaitingForInput = false;
  }

  /**
   * Handle skip request
   */
  private async onSkipRequest(): Promise<void> {
    if (!this.options.allowSkip) {
      return;
    }

    // Show confirmation if enabled
    if (this.options.skipConfirmation) {
      const confirmed = await this.confirmationDialog.show();

      if (confirmed) {
        this.skipDialogue();
      }
    } else {
      this.skipDialogue();
    }
  }

  /**
   * Skip to end of dialogue
   */
  private skipDialogue(): void {
    console.log('[DialogueManager] Skipping dialogue');

    // Stop animation
    if (this.animator) {
      this.animator.complete();
    }

    // Mark as complete
    this.state.isComplete = true;
    this.isWaitingForInput = false;
  }

  /**
   * Transition to next screen with fade effect
   */
  private async transitionToNextScreen(): Promise<void> {
    this.isTransitioning = true;

    // Fade out current text
    // TODO: Add fade animation for text
    await new Promise((resolve) => setTimeout(resolve, 300));

    this.isTransitioning = false;
  }

  /**
   * Setup input handlers
   */
  private setupInput(): void {
    // Keyboard handler
    const keyboardHandler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          this.onSkipRequest();
          break;
        case ' ':
        case 'Enter':
          this.onAdvanceInput();
          break;
      }
    };

    // Pointer handler (mouse/touch)
    const pointerHandler = () => {
      this.onAdvanceInput();
    };

    // Combined listener
    this.inputListener = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        keyboardHandler(e);
      } else if (e instanceof PointerEvent) {
        pointerHandler();
      }
    };

    window.addEventListener('keydown', this.inputListener as EventListener);
    this.renderer.getTextObject().parent?.on?.('pointerdown', pointerHandler);
  }

  /**
   * Remove input handlers
   */
  private removeInput(): void {
    if (this.inputListener) {
      window.removeEventListener('keydown', this.inputListener as EventListener);
      this.inputListener = null;
    }
  }

  /**
   * Update manager state (call every frame)
   */
  update(deltaTime: number): void {
    // Update renderer fade
    this.renderer.update(deltaTime);

    // Update animator
    if (this.animator) {
      this.animator.update(deltaTime);
    }
  }

  /**
   * Reset state for new dialogue
   */
  private resetState(): void {
    this.state = {
      currentScreenIndex: 0,
      currentNodeId: undefined,
      visitedNodes: new Set(),
      isAnimating: false,
      isPaused: false,
      isComplete: false,
      variables: {},
    };

    this.isWaitingForInput = false;
    this.isTransitioning = false;
  }

  /**
   * Cleanup after dialogue ends
   */
  private cleanup(): void {
    this.removeInput();

    if (this.animator) {
      this.animator.destroy();
      this.animator = null;
    }

    this.renderer.clear();
    this.currentDialogue = null;
  }

  /**
   * Create animator based on configuration
   */
  private createAnimator(): TypewriterAnimator | FadeTextAnimator {
    const textObject = this.renderer.getTextObject();

    if (this.options.animationType === 'fade') {
      return new FadeTextAnimator(textObject, {
        fadeDuration: this.options.fadeDuration,
        onComplete: () => this.onTextComplete(),
      });
    } else {
      return new TypewriterAnimator(textObject, {
        charsPerSecond: this.options.typewriterSpeed,
        onComplete: () => this.onTextComplete(),
      });
    }
  }

  /**
   * Destroy manager and clean up resources
   */
  destroy(): void {
    this.cleanup();
    this.renderer.destroy();
    this.confirmationDialog.destroy();
  }
}
