/**
 * Takeoff Cutscene Manager
 *
 * Orchestrates a cinematic takeoff sequence at journey start:
 * 1. Dragon starts near ground with 2x animation speed, 0 km/h display, 3x zoomed ground
 * 2. Dragon takes off (Y-axis up), speed ramps to 144 km/h, ground zooms out to 1x
 * 3. Dragon moves forward (X-axis), animation slows to 1x, ground speed normalizes
 * 4. Journey begins - distance tracking starts
 *
 * Inspired by Alucard's entrance in Castlevania: Symphony of the Night
 */

import type { Application } from 'pixi.js';
import type { ResponsiveManager } from './responsive-manager';
import type { DragonProtagonistManager } from './dragon-protagonist';
import type { LandManager } from './land-manager';
import type { TopBarUI } from './top-bar-ui';
import type { JourneyProgressionManager } from './journey-progression-manager';
import type { UIManager } from './ui-manager';
import type { EntityManager } from './entity-manager';

/**
 * CUTSCENE TIMING CONFIGURATION
 *
 * Toggle DEBUG_MODE to slow down cutscene for fine-tuning:
 * - DEBUG_MODE = true:  32 seconds total (16x slower, easy to see what's happening)
 * - DEBUG_MODE = false: 8 seconds total (production speed)
 *
 * Press ESC or click anywhere to skip cutscene during testing.
 */
const DEBUG_MODE = true; // Set to false for production timing
const TIME_SCALE = DEBUG_MODE ? 16 : 4; // 32s debug / 8s production (vs 2s base)

/**
 * Base cutscene phase durations (in milliseconds)
 * These are multiplied by TIME_SCALE for actual duration
 */
const BASE_PHASE_1_DURATION = 1200; // Takeoff phase (60% of cutscene)
const BASE_PHASE_2_DURATION = 800; // Forward flight phase (40% of cutscene)
const PHASE_1_DURATION = BASE_PHASE_1_DURATION * TIME_SCALE;
const PHASE_2_DURATION = BASE_PHASE_2_DURATION * TIME_SCALE;
const TOTAL_DURATION = PHASE_1_DURATION + PHASE_2_DURATION;

/**
 * Initial state values (ground/pre-takeoff)
 */
const INITIAL_GROUND_SCALE = 3.0; // 3x zoomed in
const INITIAL_GROUND_SPEED_MULTIPLIER = 3.0; // 3x protag speed
const INITIAL_ANIMATION_SPEED = 2.0; // 2x animation speed
const INITIAL_DRAGON_Y_OFFSET = 0.15; // 15% lower than normal (closer to ground)
const INITIAL_BACKGROUND_Y_OFFSET = -500; // Move background up 500px to frame horizon at bottom

/**
 * Normal state values (journey)
 */
const NORMAL_GROUND_SCALE = 1.0;
const NORMAL_GROUND_SPEED_MULTIPLIER = 1.0;
const NORMAL_ANIMATION_SPEED = 1.0;
const NORMAL_SPEED_KMH = 144.0; // Normal journey speed

/**
 * Easing functions
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Takeoff Cutscene Manager
 */
export class TakeoffCutsceneManager {
  private app: Application;
  private responsiveManager: ResponsiveManager;

  // System references
  private dragon: DragonProtagonistManager | null = null;
  private landManager: LandManager | null = null;
  private topBarUI: TopBarUI | null = null;
  private journeyProgression: JourneyProgressionManager | null = null;
  private uiManager: UIManager | null = null;
  private entityManager: EntityManager | null = null;

  // Cutscene state
  private isActive: boolean = false;
  private isComplete: boolean = false;
  private timer: number = 0;

  // Initial positions (saved for interpolation)
  private initialDragonY: number = 0;
  private targetDragonY: number = 0;
  private initialDragonX: number = 0;
  private targetDragonX: number = 0;

  // Skip handlers
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
  private clickHandler: (() => void) | null = null;

  constructor(app: Application, responsiveManager: ResponsiveManager) {
    this.app = app;
    this.responsiveManager = responsiveManager;

    const mode = DEBUG_MODE ? '32 seconds (DEBUG)' : '8 seconds (PRODUCTION)';
    console.log(`🎬 Takeoff Cutscene: Manager created - Duration: ${mode}`);
  }

  /**
   * Set system references
   */
  setDragon(dragon: DragonProtagonistManager): void {
    this.dragon = dragon;
  }

  setLandManager(landManager: LandManager): void {
    this.landManager = landManager;
  }

  setTopBarUI(topBarUI: TopBarUI): void {
    this.topBarUI = topBarUI;
  }

  setJourneyProgression(journeyProgression: JourneyProgressionManager): void {
    this.journeyProgression = journeyProgression;
  }

  setUIManager(uiManager: UIManager): void {
    this.uiManager = uiManager;
  }

  setEntityManager(entityManager: EntityManager): void {
    this.entityManager = entityManager;
  }

  /**
   * Start the takeoff cutscene
   */
  start(): void {
    if (!this.dragon || !this.landManager) {
      console.error('❌ Takeoff Cutscene: Missing required systems');
      return;
    }

    const mode = DEBUG_MODE ? '32s DEBUG MODE' : '8s PRODUCTION MODE';
    console.log(`🎬 Takeoff Cutscene: Starting... [${mode}] - Press ESC or click to skip`);

    this.isActive = true;
    this.isComplete = false;
    this.timer = 0;

    // Set up skip handlers
    this.setupSkipHandlers();

    // Save initial dragon position
    const dragonContainer = this.dragon.getContainer();
    this.initialDragonX = dragonContainer.x;
    this.initialDragonY = dragonContainer.y;

    // Calculate target positions
    const screenHeight = this.app.screen.height;
    const dragonYOffset = screenHeight * INITIAL_DRAGON_Y_OFFSET;

    // Target Y is normal position, initial Y is lower
    this.targetDragonY = this.initialDragonY;
    this.initialDragonY = this.targetDragonY + dragonYOffset;

    // Target X is slightly forward
    this.targetDragonX = this.initialDragonX;

    // Hide UI and HP bar during cutscene
    if (this.uiManager) {
      this.uiManager.hideForCutscene();
    }

    if (this.entityManager) {
      this.entityManager.hideDragonHealthBarForCutscene();
    }

    // Set initial state
    dragonContainer.y = this.initialDragonY;
    this.dragon.setAnimationSpeed(INITIAL_ANIMATION_SPEED);
    this.landManager.setCutsceneState(
      INITIAL_GROUND_SCALE,
      INITIAL_GROUND_SPEED_MULTIPLIER,
      INITIAL_BACKGROUND_Y_OFFSET,
    );

    if (this.topBarUI) {
      this.topBarUI.setCutsceneSpeed(0); // Start at 0 km/h
    }

    if (this.journeyProgression) {
      this.journeyProgression.pauseForCutscene(); // Pause distance tracking
    }
  }

  /**
   * Update the cutscene animation
   */
  update(deltaTime: number): void {
    if (!this.isActive || this.isComplete) {
      return;
    }

    if (!this.dragon || !this.landManager) {
      return;
    }

    // DEBUG: FREEZE ON FIRST FRAME - DO NOT PROGRESS ANIMATION
    // Comment out the timer increment to stay frozen at initial state
    // this.timer += deltaTime;
    console.log('🎬 Cutscene FROZEN at initial state (3x zoom) for debugging');
    return; // Stop here, don't animate

    const dragonContainer = this.dragon.getContainer();

    // Phase 1: Takeoff (0-1200ms)
    if (this.timer <= PHASE_1_DURATION) {
      const progress = this.timer / PHASE_1_DURATION;
      const easedProgress = easeOutCubic(progress);

      // Dragon rises (Y-axis up)
      dragonContainer.y =
        this.initialDragonY + (this.targetDragonY - this.initialDragonY) * easedProgress;

      // Speed ramps 0 → 144 km/h
      const currentSpeed = NORMAL_SPEED_KMH * easedProgress;
      if (this.topBarUI) {
        this.topBarUI.setCutsceneSpeed(currentSpeed);
      }

      // Ground zooms out 3x → 1x
      const groundScale =
        INITIAL_GROUND_SCALE - (INITIAL_GROUND_SCALE - NORMAL_GROUND_SCALE) * easedProgress;
      this.landManager.setCutsceneState(groundScale, INITIAL_GROUND_SPEED_MULTIPLIER);

      // Animation speed stays at 2x during takeoff
      this.dragon.setAnimationSpeed(INITIAL_ANIMATION_SPEED);
    }
    // Phase 2: Forward flight (1200-2000ms)
    else if (this.timer <= TOTAL_DURATION) {
      const phase2Timer = this.timer - PHASE_1_DURATION;
      const progress = phase2Timer / PHASE_2_DURATION;
      const easedProgress = easeInOutCubic(progress);

      // Dragon is at target Y (already reached in phase 1)
      dragonContainer.y = this.targetDragonY;

      // Dragon moves forward (X-axis) - subtle forward movement
      const forwardDistance = 50 * this.responsiveManager.getGameWorldScale();
      dragonContainer.x = this.initialDragonX + forwardDistance * easedProgress;

      // Animation speed slows 2x → 1x
      const animSpeed =
        INITIAL_ANIMATION_SPEED -
        (INITIAL_ANIMATION_SPEED - NORMAL_ANIMATION_SPEED) * easedProgress;
      this.dragon.setAnimationSpeed(animSpeed);

      // Ground speed normalizes 3x → 1x
      const groundSpeedMult =
        INITIAL_GROUND_SPEED_MULTIPLIER -
        (INITIAL_GROUND_SPEED_MULTIPLIER - NORMAL_GROUND_SPEED_MULTIPLIER) * easedProgress;
      this.landManager.setCutsceneState(NORMAL_GROUND_SCALE, groundSpeedMult);

      // Speed is already at 144 km/h (stay there)
      if (this.topBarUI) {
        this.topBarUI.setCutsceneSpeed(NORMAL_SPEED_KMH);
      }
    }
    // Phase 3: Cutscene complete
    else {
      this.completeCutscene();
    }
  }

  /**
   * Set up skip handlers (ESC key and click)
   */
  private setupSkipHandlers(): void {
    // ESC key handler (immediate)
    this.keyboardHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.skip();
      }
    };
    window.addEventListener('keydown', this.keyboardHandler);

    // Click handler (delayed to avoid catching the "Start Journey" button click)
    setTimeout(() => {
      if (!this.isActive) return; // Cutscene already ended

      this.clickHandler = () => {
        this.skip();
      };
      this.app.canvas.addEventListener('click', this.clickHandler);

      console.log('🎬 Takeoff Cutscene: Click-to-skip enabled');
    }, 500); // 500ms delay

    console.log('🎬 Takeoff Cutscene: Skip handlers enabled (ESC now, click in 0.5s)');
  }

  /**
   * Remove skip handlers
   */
  private removeSkipHandlers(): void {
    if (this.keyboardHandler) {
      window.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }

    if (this.clickHandler) {
      this.app.canvas.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }
  }

  /**
   * Complete the cutscene and transition to normal journey
   */
  private completeCutscene(): void {
    console.log('🎬 Takeoff Cutscene: Complete');

    this.isActive = false;
    this.isComplete = true;

    // Remove skip handlers
    this.removeSkipHandlers();

    // Ensure everything is at normal state
    if (this.dragon) {
      const dragonContainer = this.dragon.getContainer();
      dragonContainer.x = this.targetDragonX;
      dragonContainer.y = this.targetDragonY;
      this.dragon.setAnimationSpeed(NORMAL_ANIMATION_SPEED);
    }

    if (this.landManager) {
      this.landManager.setCutsceneState(NORMAL_GROUND_SCALE, NORMAL_GROUND_SPEED_MULTIPLIER, 0);
      this.landManager.exitCutsceneMode(); // Return to normal scrolling
    }

    if (this.topBarUI) {
      this.topBarUI.exitCutsceneMode(); // Return to normal speed display
    }

    if (this.journeyProgression) {
      this.journeyProgression.resumeFromCutscene(); // Start distance tracking
    }

    // Show UI and HP bar after cutscene
    if (this.uiManager) {
      this.uiManager.showAfterCutscene();
    }

    if (this.entityManager) {
      this.entityManager.showDragonHealthBarAfterCutscene();
    }
  }

  /**
   * Check if cutscene is active
   */
  isPlaying(): boolean {
    return this.isActive && !this.isComplete;
  }

  /**
   * Check if cutscene has completed
   */
  hasCompleted(): boolean {
    return this.isComplete;
  }

  /**
   * Skip the cutscene (for testing or user input)
   */
  skip(): void {
    if (this.isActive && !this.isComplete) {
      console.log('🎬 Takeoff Cutscene: Skipped by user');
      this.timer = TOTAL_DURATION + 1; // Force completion
      this.completeCutscene();
    }
  }
}
