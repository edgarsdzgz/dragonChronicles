/**
 * Takeoff Cutscene Manager
 *
 * Orchestrates a cinematic takeoff sequence at journey start:
 * Phase 1: Dragon enters from left (ground speeds up 0→3x, dragon moves right)
 * Phase 2: Dragon gains altitude (falls back, then rises up-right)
 * Phase 3: Zoom out transition (5s: 3x→1x scale, return to normal position)
 * Phase 4: UI fade in and journey start (3s delay, then distance counter)
 *
 * Inspired by Alucard's entrance in Castlevania: Symphony of the Night
 */

import type { Application, Container } from 'pixi.js';
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
 * - DEBUG_MODE = true:  47 seconds total (4x slower, easy to see what's happening)
 * - DEBUG_MODE = false: 11.7 seconds total (production speed)
 */
const DEBUG_MODE = true; // Set to false for production timing
const TIME_SCALE = DEBUG_MODE ? 4 : 1; // 4x slower in debug mode

/**
 * Cutscene phase durations (in milliseconds, multiplied by TIME_SCALE)
 */
const BASE_PHASE_1_DURATION = 1000; // Dragon enters from left
const BASE_PHASE_2_DURATION = 1730; // Dragon gains altitude (fallback 3x longer, rise 2.25x longer)
const BASE_PHASE_3_DURATION = 6000; // Zoom out transition (1s glide + 5s animate at 1x)

const PHASE_1_DURATION = BASE_PHASE_1_DURATION * TIME_SCALE;
const PHASE_2_DURATION = BASE_PHASE_2_DURATION * TIME_SCALE;
const PHASE_3_DURATION = BASE_PHASE_3_DURATION * TIME_SCALE;

const PHASE_1_END = PHASE_1_DURATION;
const PHASE_2_END = PHASE_1_END + PHASE_2_DURATION;
const PHASE_3_END = PHASE_2_END + PHASE_3_DURATION;
const TOTAL_DURATION = PHASE_3_END; // End after Phase 3, UI fades in automatically

/**
 * Cutscene state values
 */
const CUTSCENE_GROUND_SCALE = 3.0; // 3x zoomed in during cutscene
const CUTSCENE_GROUND_SPEED_MULTIPLIER = 3.0; // 3x protag speed at peak
const CUTSCENE_ANIMATION_SPEED = 2.0; // 2x animation speed
const CUTSCENE_BACKGROUND_Y_OFFSET = -750; // Move background up to frame horizon

/**
 * Normal state values (journey)
 */
const NORMAL_GROUND_SCALE = 1.0;
const NORMAL_GROUND_SPEED_MULTIPLIER = 1.0;
const NORMAL_ANIMATION_SPEED = 0.75; // 75% speed to reduce twitchiness

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
  private topbarContainer: Container | null = null; // Topbar for zoom/pan control

  // Cutscene state
  private isActive: boolean = false;
  private isComplete: boolean = false;
  private timer: number = 0;
  private currentPhase: number = 0; // Track current phase for resize handling

  // Dragon position storage (stored once at cutscene start, recalculated on resize)
  private normalDragonX: number = 0; // Normal journey position X
  private normalDragonY: number = 0; // Normal journey position Y

  // Position cache (recalculated when gameWorldScale or screenWidth changes)
  private cachedPositions = {
    phase1StartX: 0,
    phase1EndX: 0,
    phase2FallbackX: 0,
    cutsceneGroundY: 0,
    phase2RiseY: 0,
    lastGameWorldScale: 0,
    lastScreenWidth: 0,
  };

  // Animation control flags
  private hasRestartedFallbackAnimation = false;
  private hasPausedFallbackAnimation = false;
  private hasStoppedPhase3Animation = false;
  private hasRestartedPhase3Animation = false;

  // Resize callback
  private resizeCallback: (() => void) | null = null;

  constructor(app: Application, responsiveManager: ResponsiveManager) {
    this.app = app;
    this.responsiveManager = responsiveManager;

    const mode = DEBUG_MODE ? '47 seconds (DEBUG)' : '11.7 seconds (PRODUCTION)';
    console.log(`🎬 Takeoff Cutscene: Manager created - Duration: ${mode}`);

    // Subscribe to responsive manager resize events
    this.resizeCallback = () => this.handleResize();
    this.responsiveManager.onResize(this.resizeCallback);
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

  setTopbarContainer(topbarContainer: Container): void {
    this.topbarContainer = topbarContainer;
  }

  /**
   * Recalculate cutscene positions based on current scale and screen size
   * Called at start and whenever responsive values change
   */
  private recalculatePositions(): void {
    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const screenWidth = this.app.screen.width;

    // Only recalculate if values have changed
    if (
      gameWorldScale === this.cachedPositions.lastGameWorldScale &&
      screenWidth === this.cachedPositions.lastScreenWidth
    ) {
      return;
    }

    // Calculate cutscene ground Y position (feet at ground level)
    const groundY = -25; // Ground Y in game world coords
    const dragonHeightScaled = 128 * CUTSCENE_GROUND_SCALE; // 384px at 3x scale
    const dragonCenterToFeet = dragonHeightScaled / 2; // 192px
    this.cachedPositions.cutsceneGroundY = (groundY - dragonCenterToFeet) * gameWorldScale;

    // Phase 1 positions: Dragon enters from left
    this.cachedPositions.phase1StartX = -screenWidth * 0.3; // Start 30% offscreen left
    this.cachedPositions.phase1EndX = screenWidth * 0.3; // End at 30% from left edge

    // Phase 2 positions: Dragon gains altitude
    this.cachedPositions.phase2FallbackX =
      this.cachedPositions.phase1EndX - 80 * gameWorldScale; // Backward movement
    this.cachedPositions.phase2RiseY = this.cachedPositions.cutsceneGroundY - 600 * gameWorldScale; // Rise height

    // Update cache markers
    this.cachedPositions.lastGameWorldScale = gameWorldScale;
    this.cachedPositions.lastScreenWidth = screenWidth;
  }

  /**
   * Start the takeoff cutscene
   */
  start(): void {
    if (!this.dragon || !this.landManager) {
      console.error('❌ Takeoff Cutscene: Missing required systems');
      return;
    }

    const mode = DEBUG_MODE ? '47s DEBUG MODE' : '11.7s PRODUCTION MODE';
    console.log(`🎬 Takeoff Cutscene: Starting... [${mode}]`);

    this.isActive = true;
    this.isComplete = false;
    this.timer = 0;

    // Reset all animation control flags
    this.hasRestartedFallbackAnimation = false;
    this.hasPausedFallbackAnimation = false;
    this.hasStoppedPhase3Animation = false;
    this.hasRestartedPhase3Animation = false;

    // Hide UI immediately
    if (this.uiManager) {
      this.uiManager.hideForCutscene();
      console.log('🎬 UI hidden for cutscene');
    }
    // Don't set speed to 0 km/h - let top bar maintain current state
    if (this.journeyProgression) {
      this.journeyProgression.pauseForCutscene();
    }
    // Pause enemy spawning during cutscene
    if (this.entityManager) {
      const enemyManager = this.entityManager.getEnemyManager();
      if (enemyManager) {
        enemyManager.stop();
        console.log('🎬 Enemy spawning paused for cutscene');
      }
    }
    // Disable dragon animation auto-restart so cutscene can control it
    this.dragon.disableAnimationAutoRestart();

    // Explicitly start animation for Phase 1 entrance
    const animator = this.dragon.getDragonAnimator();
    if (animator && !animator.isAnimating()) {
      animator.start();
      console.log('🎬 Cutscene: Animation started for Phase 1 entrance');
    }

    // Get references
    const dragonContainer = this.dragon.getContainer();

    // Store normal dragon position (for Phase 3 return)
    this.normalDragonX = dragonContainer.x;
    this.normalDragonY = dragonContainer.y;

    // Calculate all cutscene positions based on current responsive values
    this.recalculatePositions();

    // Initialize dragon at Phase 1 start position
    dragonContainer.x = this.cachedPositions.phase1StartX;
    dragonContainer.y = this.cachedPositions.cutsceneGroundY;
    dragonContainer.scale.set(CUTSCENE_GROUND_SCALE); // 3x scale
    dragonContainer.visible = true;
    dragonContainer.alpha = 1.0;

    // Set dragon animation speed
    this.dragon.setAnimationSpeed(CUTSCENE_ANIMATION_SPEED); // 2x speed

    // Set initial ground state (3x zoom, 0 speed - will ramp up in Phase 1)
    this.landManager.setCutsceneState(CUTSCENE_GROUND_SCALE, 0, CUTSCENE_BACKGROUND_Y_OFFSET);

    // Set initial cloud X-offset (1.0 = 50% offset to push clouds offscreen)
    this.landManager.setCutsceneCloudXOffsetProgress(1.0);

    console.log(
      `🎬 Phase 1 Start: Dragon at X=${this.cachedPositions.phase1StartX.toFixed(0)}, Y=${this.cachedPositions.cutsceneGroundY.toFixed(0)}`,
    );
    console.log(
      `🎬 Normal position: X=${this.normalDragonX.toFixed(0)}, Y=${this.normalDragonY.toFixed(0)}`,
    );
    console.log(`🎬 Cutscene phases: ${PHASE_1_DURATION}ms, ${PHASE_2_DURATION}ms, ${PHASE_3_DURATION}ms (Total: ${TOTAL_DURATION}ms)`);
  }

  /**
   * Update topbar position to match cutscene zoom/pan
   * Topbar should zoom and pan with background
   */
  private updateTopbarCutsceneState(scale: number, yOffset: number): void {
    if (!this.topbarContainer) return;

    const gameWorldScale = this.responsiveManager.getGameWorldScale();

    // Apply cutscene scale on top of responsive scale
    this.topbarContainer.scale.set(gameWorldScale * scale);

    // Apply Y offset (same as background)
    this.topbarContainer.y = yOffset * gameWorldScale;

    // Debug log only on significant changes
    if (Math.abs(scale - 1.0) > 0.01 || Math.abs(yOffset) > 1) {
      console.log(`🎬 Topbar: scale=${scale.toFixed(2)}x, yOffset=${yOffset.toFixed(0)}px`);
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

    // Recalculate positions in case window was resized
    this.recalculatePositions();

    // Increment timer
    this.timer += deltaTime;

    const dragonContainer = this.dragon.getContainer();

    // PHASE 1: Dragon enters from left (ground speeds up)
    if (this.timer <= PHASE_1_END) {
      this.currentPhase = 1;
      const progress = this.timer / PHASE_1_DURATION;
      const easedProgress = easeOutCubic(progress);

      // Dragon moves right (offscreen → fully visible)
      const phase1StartX = this.cachedPositions.phase1StartX;
      const phase1EndX = this.cachedPositions.phase1EndX;
      dragonContainer.x = phase1StartX + (phase1EndX - phase1StartX) * easedProgress;

      // Dragon moves up dramatically (400px) as it enters
      const gameWorldScale = this.responsiveManager.getGameWorldScale();
      const upwardMovement = 400 * gameWorldScale;
      dragonContainer.y = this.cachedPositions.cutsceneGroundY - upwardMovement * easedProgress;

      // Ground speed ramps 0 → 3x
      const groundSpeed = CUTSCENE_GROUND_SPEED_MULTIPLIER * easedProgress;
      this.landManager.setCutsceneState(CUTSCENE_GROUND_SCALE, groundSpeed, CUTSCENE_BACKGROUND_Y_OFFSET);

      // Update topbar to match background (3x scale, -750 Y offset)
      this.updateTopbarCutsceneState(CUTSCENE_GROUND_SCALE, CUTSCENE_BACKGROUND_Y_OFFSET);

      // No speed display during Phase 1
      console.log(
        `🎬 Phase 1: t=${this.timer.toFixed(0)}ms, dragon X=${dragonContainer.x.toFixed(0)}, Y=${dragonContainer.y.toFixed(0)}, ground speed=${groundSpeed.toFixed(2)}x`,
      );
    }
    // PHASE 2: Dragon gains altitude (falls back, then rises)
    else if (this.timer <= PHASE_2_END) {
      this.currentPhase = 2;
      const phase2Timer = this.timer - PHASE_1_END;
      const progress = phase2Timer / PHASE_2_DURATION;
      const easedProgress = easeInOutCubic(progress);

      // Debug: Check animator state at the start of Phase 2
      const animator = this.dragon.getDragonAnimator();
      const isAnimating = animator?.isAnimating() ?? false;
      const currentFPS = animator?.getFPS() ?? 0;

      // Log once when entering Phase 2
      if (phase2Timer < 16) {
        console.log(`🎬 ====== ENTERING Phase 2 ======`);
        console.log(`🎬 isAnimating=${isAnimating}, FPS=${currentFPS}, timer=${phase2Timer.toFixed(0)}ms`);
      }

      // Split Phase 2 into two parts: fallback (0-0.0975), then rise (0.0975-1.0) - fallback 3x longer
      if (progress < 0.0975) {
        // Fallback: Dragon moves backward and drops down 300px
        const fallbackProgress = progress / 0.0975;
        const gameWorldScale = this.responsiveManager.getGameWorldScale();
        const phase1EndY = this.cachedPositions.cutsceneGroundY - 400 * gameWorldScale; // Where Phase 1 ended (400px up)
        const fallbackDropY = this.cachedPositions.cutsceneGroundY - 100 * gameWorldScale; // Drop to 100px (300px drop from 400px)

        const phase1EndX = this.cachedPositions.phase1EndX;
        const phase2FallbackX = this.cachedPositions.phase2FallbackX;
        dragonContainer.x = phase1EndX + (phase2FallbackX - phase1EndX) * fallbackProgress;
        dragonContainer.y = phase1EndY + (fallbackDropY - phase1EndY) * fallbackProgress; // Drop 300px during fallback

        // Check EVERY frame for fly_2 - don't gate on isAnimating since we might miss it
        if (!this.hasPausedFallbackAnimation && animator) {
          const currentFrame = animator.getCurrentFrame();
          console.log(`🎬 [FALLBACK CHECK] Frame: ${currentFrame}, isAnimating: ${isAnimating}`);

          if (currentFrame === 'fly_2') {
            animator.pause();
            this.hasPausedFallbackAnimation = true;
            console.log('🎬 [FALLBACK] ✅✅✅ Animation paused on fly_2 frame');
          }
        }

        // Debug: Log animator state during fallback
        if (phase2Timer % 50 < 16) { // Log every 50ms
          console.log(`🎬 [FALLBACK] t=${phase2Timer.toFixed(0)}ms, progress=${fallbackProgress.toFixed(3)}, isAnimating=${isAnimating}, FPS=${currentFPS}`);
        }

        // Log transition from fallback to rise
        if (progress >= 0.093 && progress < 0.0975) {
          console.log(`🎬 >>> ABOUT TO TRANSITION FROM FALLBACK TO RISE <<<`);
          console.log(`🎬 progress=${progress.toFixed(4)}, isAnimating=${isAnimating}, FPS=${currentFPS}`);
        }
      } else {
        // Rise: Dragon gains altitude and moves forward-right (2.25x longer than original)
        const riseProgress = (progress - 0.0975) / 0.9025;
        const riseEased = easeOutCubic(riseProgress);

        // Log once when entering rise phase
        if (riseProgress < 0.01) {
          console.log(`🎬 ====== ENTERING RISE PHASE ======`);
          console.log(`🎬 riseProgress=${riseProgress.toFixed(4)}, isAnimating=${isAnimating}, FPS=${currentFPS}`);
        }

        // Resume animation at the beginning of rise phase (was paused during fallback)
        if (!this.hasRestartedFallbackAnimation && riseProgress < 0.05) {
          console.log(`🎬 [RISE] Resuming animation after fallback pause...`);
          console.log(`🎬 BEFORE resume: isAnimating=${isAnimating}, FPS=${currentFPS}`);
          if (animator) {
            if (!isAnimating) {
              animator.resume();
            }
            const afterAnimating = animator.isAnimating();
            const afterFPS = animator.getFPS();
            console.log(`🎬 AFTER resume: isAnimating=${afterAnimating}, FPS=${afterFPS}`);
          }
          this.hasRestartedFallbackAnimation = true;
        }

        // Debug: Check animation state MORE FREQUENTLY during rise
        if (phase2Timer % 50 < 16) { // Log every 50ms
          console.log(`🎬 [RISE] t=${phase2Timer.toFixed(0)}ms, progress=${riseProgress.toFixed(3)}, isAnimating=${isAnimating}, FPS=${currentFPS}`);
          if (!isAnimating) {
            console.warn('⚠️⚠️⚠️ ANIMATION STOPPED DURING RISE! Attempting restart...');
            animator?.start();
            console.log(`🎬 After restart attempt: isAnimating=${animator?.isAnimating()}, FPS=${animator?.getFPS()}`);
          }
        }

        // Move from fallback position forward significantly (100px beyond phase1End)
        const gameWorldScale = this.responsiveManager.getGameWorldScale();
        const phase1EndX = this.cachedPositions.phase1EndX;
        const phase2FallbackX = this.cachedPositions.phase2FallbackX;
        const targetX = phase1EndX + 100 * gameWorldScale;
        dragonContainer.x = phase2FallbackX + (targetX - phase2FallbackX) * riseEased;

        // Rise up from fallback drop height (100px) to final rise height (600px total - a 500px climb!)
        const fallbackDropY = this.cachedPositions.cutsceneGroundY - 100 * gameWorldScale; // Where fallback ended (100px up)
        const phase2RiseY = this.cachedPositions.phase2RiseY;
        dragonContainer.y = fallbackDropY + (phase2RiseY - fallbackDropY) * riseEased;

        // Debug: Log when Phase 2 is about to end
        if (progress > 0.95) {
          console.log(`🎬 ====== PHASE 2 ENDING ======`);
          console.log(`🎬 progress=${progress.toFixed(3)}, riseProgress=${riseProgress.toFixed(3)}, isAnimating=${isAnimating}, FPS=${currentFPS}`);
        }
      }

      // Ground speed stays at 3x, increase slightly to 3.2x
      const groundSpeed = CUTSCENE_GROUND_SPEED_MULTIPLIER + 0.2 * easedProgress;
      this.landManager.setCutsceneState(CUTSCENE_GROUND_SCALE, groundSpeed, CUTSCENE_BACKGROUND_Y_OFFSET);

      // Update topbar to match background (keep at 3x scale, -750 Y offset)
      this.updateTopbarCutsceneState(CUTSCENE_GROUND_SCALE, CUTSCENE_BACKGROUND_Y_OFFSET);

      // Log less frequently in Phase 2 summary
      if (phase2Timer % 200 < 16) {
        console.log(
          `🎬 [PHASE 2 SUMMARY] t=${phase2Timer.toFixed(0)}ms, dragon X=${dragonContainer.x.toFixed(0)}, Y=${dragonContainer.y.toFixed(0)}, ground speed=${groundSpeed.toFixed(2)}x`,
        );
      }
    }
    // PHASE 3: Zoom out transition (5s: 3x→1x scale, return to normal position)
    else if (this.timer <= PHASE_3_END) {
      const phase3Timer = this.timer - PHASE_2_END;
      const progress = phase3Timer / PHASE_3_DURATION;
      const easedProgress = easeOutCubic(progress); // Start fast (falling/drifting), slow at end

      // Debug: Check animator state at Phase 2→3 transition
      const animator = this.dragon.getDragonAnimator();
      const isAnimating = animator?.isAnimating() ?? false;

      // Phase 3 has two parts: 1s glide on fly_2, then resume animation at 1x
      const BASE_GLIDE_DURATION = 1000; // 1 second of gliding
      const glideEndTime = BASE_GLIDE_DURATION * TIME_SCALE;

      // Part 1: Glide on fly_2 for first 1 second
      if (phase3Timer < glideEndTime) {
        // Check EVERY frame for fly_2 during glide period
        if (!this.hasStoppedPhase3Animation && animator) {
          const currentFrame = animator.getCurrentFrame();
          if (phase3Timer % 200 < 16) { // Log every 200ms
            console.log(`🎬 [PHASE 3 GLIDE] t=${phase3Timer.toFixed(0)}ms, Frame: ${currentFrame}, isAnimating: ${isAnimating}`);
          }

          if (currentFrame === 'fly_2') {
            animator.stop();
            this.hasStoppedPhase3Animation = true;
            console.log('🎬 Phase 3: ✅✅✅ Animation stopped on fly_2 for gliding effect');
          }
        }
      }
      // Part 2: After 1s glide, restart animation at 1x speed
      else if (!this.hasRestartedPhase3Animation && animator) {
        animator.start();
        this.dragon.setAnimationSpeed(1.0); // Set to 1x speed
        this.hasRestartedPhase3Animation = true;
        console.log('🎬 Phase 3: Animation restarted at 1x speed after 1s glide');
      }

      // Get current position (end of Phase 2)
      const phase2EndX = dragonContainer.x;
      const phase2EndY = this.cachedPositions.phase2RiseY;

      // Dragon drifts back to normal position throughout entire Phase 3
      dragonContainer.x = phase2EndX + (this.normalDragonX - phase2EndX) * easedProgress;
      dragonContainer.y = phase2EndY + (this.normalDragonY - phase2EndY) * easedProgress;

      // Dragon scale 3x → 1x
      const dragonScale =
        CUTSCENE_GROUND_SCALE - (CUTSCENE_GROUND_SCALE - NORMAL_GROUND_SCALE) * easedProgress;
      dragonContainer.scale.set(dragonScale);

      // Ground scale 3x → 1x
      const groundScale =
        CUTSCENE_GROUND_SCALE - (CUTSCENE_GROUND_SCALE - NORMAL_GROUND_SCALE) * easedProgress;

      // Ground speed 3.2x → 1x
      const groundSpeed =
        CUTSCENE_GROUND_SPEED_MULTIPLIER +
        0.2 -
        (CUTSCENE_GROUND_SPEED_MULTIPLIER + 0.2 - NORMAL_GROUND_SPEED_MULTIPLIER) * easedProgress;

      // Background Y offset -750 → 0
      const bgYOffset = CUTSCENE_BACKGROUND_Y_OFFSET * (1 - easedProgress);

      this.landManager.setCutsceneState(groundScale, groundSpeed, bgYOffset);

      // Update topbar to zoom/pan with background (3x → 1x, -750 → 0)
      this.updateTopbarCutsceneState(groundScale, bgYOffset);

      // Cloud X-offset: Smoothly transition 1.0 → 0.0 to prevent sudden skip
      const cloudXOffsetProgress = 1.0 - easedProgress;
      this.landManager.setCutsceneCloudXOffsetProgress(cloudXOffsetProgress);

      // NOTE: Cloud scale multiplier disabled - caused "snap" when exiting cutscene
      // Using 75% X-offset instead to hide clipped clouds
      //
      // // Cloud scale: Zoom normally for first 1.5s, then slow down to prevent clipping
      // const BASE_CLOUD_NORMAL_ZOOM_DURATION = 1500; // 1.5 seconds of normal zoom
      // const cloudNormalZoomEnd = BASE_CLOUD_NORMAL_ZOOM_DURATION * TIME_SCALE;
      // if (phase3Timer < cloudNormalZoomEnd) {
      //   // First 1.5 seconds: clouds zoom at normal rate (1.0)
      //   this.landManager.setCutsceneCloudScaleMultiplier(1.0);
      // } else {
      //   // After 1.5 seconds: slow cloud zoom to 0.5x (half speed) to keep clipped cloud offscreen
      //   const slowZoomProgress = (phase3Timer - cloudNormalZoomEnd) / (PHASE_3_DURATION - cloudNormalZoomEnd);
      //   const cloudScaleMultiplier = 1.0 - slowZoomProgress * 0.5; // 1.0 → 0.5
      //   this.landManager.setCutsceneCloudScaleMultiplier(cloudScaleMultiplier);
      // }

      // Animation speed: Only adjust during glide period, then keep at 1x
      if (phase3Timer < glideEndTime && !this.hasStoppedPhase3Animation) {
        // During glide period, gradually decrease from 2x toward 1x (in case we haven't stopped yet)
        const animSpeed =
          CUTSCENE_ANIMATION_SPEED - (CUTSCENE_ANIMATION_SPEED - NORMAL_ANIMATION_SPEED) * easedProgress;
        this.dragon.setAnimationSpeed(animSpeed);
      }
      // After restart, animation speed is locked at 1x (set when we restart at line 417)

      console.log(
        `🎬 Phase 3: t=${phase3Timer.toFixed(0)}ms, scale=${dragonScale.toFixed(2)}, ground speed=${groundSpeed.toFixed(2)}x`,
      );
    }
    // Cutscene complete - Phase 4 removed, UI fades in automatically in completeCutscene()
    else {
      this.completeCutscene();
    }
  }

  /**
   * Complete the cutscene and transition to normal journey
   */
  private completeCutscene(): void {
    console.log('🎬 Takeoff Cutscene: Complete');

    this.isActive = false;
    this.isComplete = true;

    // Ensure everything is at normal state
    if (this.dragon) {
      const dragonContainer = this.dragon.getContainer();
      dragonContainer.x = this.normalDragonX;
      dragonContainer.y = this.normalDragonY;
      dragonContainer.scale.set(NORMAL_GROUND_SCALE);
      this.dragon.setAnimationSpeed(NORMAL_ANIMATION_SPEED);
      // Re-enable dragon animation auto-restart (restore normal behavior)
      this.dragon.enableAnimationAutoRestart();
    }

    if (this.landManager) {
      this.landManager.setCutsceneState(NORMAL_GROUND_SCALE, NORMAL_GROUND_SPEED_MULTIPLIER, 0);
      this.landManager.exitCutsceneMode();
    }

    // Reset topbar to normal state (1x scale, 0 Y offset)
    if (this.topbarContainer) {
      const gameWorldScale = this.responsiveManager.getGameWorldScale();
      this.topbarContainer.scale.set(gameWorldScale);
      this.topbarContainer.y = 0;
      console.log('🎬 Topbar: Reset to normal (1x scale, 0 Y offset)');
    }

    if (this.topBarUI) {
      this.topBarUI.exitCutsceneMode();
    }

    if (this.journeyProgression) {
      this.journeyProgression.resumeFromCutscene();
    }

    // Resume enemy spawning after cutscene
    if (this.entityManager) {
      const enemyManager = this.entityManager.getEnemyManager();
      if (enemyManager) {
        enemyManager.start();
        console.log('🎬 Enemy spawning resumed after cutscene');
      }
    }

    if (this.uiManager) {
      this.uiManager.showAfterCutscene();
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

  /**
   * Handle resize events during cutscene
   * Recalculates positions and updates dragon immediately to prevent displacement
   */
  private handleResize(): void {
    if (!this.isActive || !this.dragon) return;

    console.log('🎬 Takeoff Cutscene: Handling resize event');

    const gameWorldScale = this.responsiveManager.getGameWorldScale();

    // Recalculate all positions based on new screen dimensions
    this.recalculatePositions();

    // Update normal dragon position for Phase 3 return
    const dragonX = 115.2; // 6% of 1920
    const dragonY = 302.4; // 28% of 1080
    this.normalDragonX = dragonX * gameWorldScale;
    this.normalDragonY = dragonY * gameWorldScale;

    // Re-apply current phase state to dragon to prevent displacement
    // This ensures dragon stays in correct position relative to new screen size
    if (this.currentPhase === 1 || this.currentPhase === 2) {
      // During Phase 1 & 2, positions are calculated each frame, no manual update needed
      console.log('🎬 Resize: Phase 1/2 - positions will recalc on next frame');
    } else if (this.currentPhase === 3) {
      // During Phase 3, dragon is transitioning to normal position
      // Let the animation continue naturally with recalculated positions
      console.log('🎬 Resize: Phase 3 - transition continues with new positions');
    }

    // Update topbar scaling immediately
    if (this.topbarContainer) {
      // Reapply current cutscene state to topbar
      if (this.currentPhase === 1 || this.currentPhase === 2) {
        this.updateTopbarCutsceneState(CUTSCENE_GROUND_SCALE, CUTSCENE_BACKGROUND_Y_OFFSET);
      } else if (this.currentPhase === 3) {
        // Phase 3 zoom/pan state will be reapplied on next frame
      } else {
        // Normal state
        this.topbarContainer.scale.set(gameWorldScale);
        this.topbarContainer.y = 0;
      }
    }

    console.log(
      `🎬 Cutscene resize: scale ${gameWorldScale.toFixed(3)}x, phase ${this.currentPhase}`,
    );
  }
}
