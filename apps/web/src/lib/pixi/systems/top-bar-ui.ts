/**
 * Top Bar UI Manager
 *
 * Displays journey progression information at the top of the screen:
 * - Left side (1/4): Distance from Home and Speed (right-aligned)
 * - Right side (3/4): Land/Ward labels, progress bar with diamond, distance to next ward
 *
 * Layout (two lines, no borders):
 * Line 1: "1234m from Home" | "Land 1: Horizon Steppe  Ward 1: The Parting Stones    250m to Ward 2"
 * Line 2: "40.23 m/s"        | ════════◆══════════════════════════════════════
 */

import { Container, Graphics, Text } from 'pixi.js';
import type { Application } from 'pixi.js';
import type { JourneyProgressionManager } from './journey-progression-manager';
import type { ResponsiveManager } from './responsive-manager';

/**
 * Speed fluctuation configuration
 * Dragon speed: 100 pixels/second = 40 m/s = 144 km/h
 */
const SPEED_BASE = 144.0; // Base speed in km/h (40 m/s × 3.6)
const SPEED_FLUCTUATION_MIN_MS = 0.01 * 3.6; // Min change per tick in km/h (~0.036)
const SPEED_FLUCTUATION_MAX_MS = 0.05 * 3.6; // Max change per tick in km/h (~0.18)
const SPEED_FLUCTUATION_RANGE = 0.35 * 3.6; // Total range ±1.26 km/h
const SPEED_UPDATE_INTERVAL_MIN = 750; // Min ms between updates
const SPEED_UPDATE_INTERVAL_MAX = 1000; // Max ms between updates

/**
 * Progress bar configuration
 */
const BAR_THICKNESS = 2; // Bar height in pixels
const DIAMOND_SIZE = 6; // Diamond size in pixels (increased from 4px)
const BAR_RIGHT_MARGIN = 20; // Right margin in pixels

/**
 * Ward transition animation configuration
 */
const PAUSE_AT_END_DURATION = 300; // Pause at end before pulse (ms)
const PULSE_DURATION = 400; // Pulse duration in ms
const SWIPE_DURATION = 2000; // Swipe duration in ms (slower for visibility)
const PULSE_SCALE = 2.5; // How much to scale diamond during pulse

/**
 * Progress bar colors (3-color cycling pattern)
 */
const BAR_COLOR_BLACK = 0x000000; // Black
const BAR_COLOR_GOLD = 0xffd700; // Gold
const BAR_COLOR_PURPLE = 0x7c3aed; // Royal Purple (Violet-600) - brighter than deep purple

/**
 * Top Bar UI Manager
 */
export class TopBarUI {
  private app: Application;
  private journeyProgressionManager: JourneyProgressionManager | null = null;
  private responsiveManager: ResponsiveManager;

  // Container
  private container: Container;

  // Left side (1/4 width) - Journey stats
  private leftContainer: Container;
  private distanceText: Text;
  private speedText: Text;

  // Right side (3/4 width) - Progress bar
  private rightContainer: Container;
  private landWardText: Text;
  private distanceToWardText: Text;
  private progressBar: Graphics;
  private diamond: Graphics;

  // Speed fluctuation state
  private displayedSpeed: number = SPEED_BASE;
  private speedUpdateTimer: number = 0;
  private nextSpeedUpdateDelay: number = 0;
  private lastWardProgress: number = 0;
  private lastWardIndex: number = 0;

  // Ward transition animation state
  private isPausingAtEnd: boolean = false; // Pause at end before pulse
  private pauseTimer: number = 0;
  private isPulsing: boolean = false;
  private pulseTimer: number = 0;
  private isSwiping: boolean = false;
  private swipeTimer: number = 0;
  private swipeStartX: number = 0;
  private swipeEndX: number = 0;
  private transitionDirection: 'forward' | 'backward' = 'forward'; // Which direction is ward transition

  // Cutscene state
  private isInCutscene: boolean = false;
  private cutsceneSpeed: number = 0; // Speed to display during cutscene (km/h)

  constructor(
    app: Application,
    responsiveManager: ResponsiveManager,
    parentContainer: Container,
  ) {
    this.app = app;
    this.responsiveManager = responsiveManager;

    // Create main container and add to parent (UIManager's container, not app.stage)
    this.container = new Container();
    this.container.label = 'TopBarUI';
    parentContainer.addChild(this.container);

    // Create left container (1/4 width)
    this.leftContainer = new Container();
    this.leftContainer.label = 'TopBarUI-Left';
    this.container.addChild(this.leftContainer);

    // Create right container (3/4 width)
    this.rightContainer = new Container();
    this.rightContainer.label = 'TopBarUI-Right';
    this.container.addChild(this.rightContainer);

    // Initialize left side texts (dark color for visibility on sky)
    this.distanceText = new Text({
      text: '0.00 km from Home',
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: 18,
        fontWeight: 'bold', // Bold for better readability
        fill: 0x1a1a1a, // Dark gray/black
        align: 'left',
      },
    });
    this.leftContainer.addChild(this.distanceText);

    this.speedText = new Text({
      text: '144.00 km/h',
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: 14,
        fontWeight: 'bold', // Bold for consistency
        fill: 0x333333, // Slightly lighter dark gray
        align: 'left',
      },
    });
    this.leftContainer.addChild(this.speedText);

    // Initialize right side texts (dark color for visibility on sky)
    this.landWardText = new Text({
      text: 'Land 1: Horizon Steppe  Ward 1: The Parting Stones',
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: 20,
        fontWeight: 'bold', // Bold for consistency
        fill: 0x1a1a1a, // Dark gray/black
        align: 'left',
      },
    });
    this.rightContainer.addChild(this.landWardText);

    this.distanceToWardText = new Text({
      text: '5.00 km to Ward 2',
      style: {
        fontFamily: 'Cinzel, serif',
        fontSize: 14,
        fontWeight: 'bold', // Bold for consistency
        fill: 0x333333, // Slightly lighter dark gray
        align: 'right',
      },
    });
    this.rightContainer.addChild(this.distanceToWardText);

    // Initialize progress bar
    this.progressBar = new Graphics();
    this.rightContainer.addChild(this.progressBar);

    // Initialize diamond indicator
    this.diamond = new Graphics();
    this.rightContainer.addChild(this.diamond);

    // Initialize speed fluctuation timer
    this.nextSpeedUpdateDelay = this.getRandomSpeedUpdateDelay();

    // Initial layout
    this.updateLayout();

    console.log('📊 Top Bar UI: Initialized');
  }

  /**
   * Set the journey progression manager
   */
  setJourneyProgressionManager(manager: JourneyProgressionManager): void {
    this.journeyProgressionManager = manager;
  }

  /**
   * Update the top bar UI
   */
  update(deltaTime: number): void {
    if (!this.journeyProgressionManager) {
      return;
    }

    // Update speed fluctuation (skip if in cutscene mode)
    if (!this.isInCutscene) {
      this.updateSpeedFluctuation(deltaTime);
    }

    // Update distance display (km with 2 decimals)
    const distanceKm = this.journeyProgressionManager.getDistanceKm();
    this.distanceText.text = `${distanceKm.toFixed(2)} km from Home`;

    // Update speed display (km/h with 2 decimals)
    // Use cutscene speed if in cutscene mode, otherwise use fluctuating speed
    const speedToDisplay = this.isInCutscene ? this.cutsceneSpeed : this.displayedSpeed;
    this.speedText.text = `${speedToDisplay.toFixed(2)} km/h`;

    // Update Land/Ward display
    const landName = this.journeyProgressionManager.getLandDisplayName();
    const wardName = this.journeyProgressionManager.getWardDisplayName();
    this.landWardText.text = `${landName}  ${wardName}`;

    // Update distance to next ward (km with 2 decimals)
    const distanceToWardKm = this.journeyProgressionManager.getDistanceToNextWardKm();
    const nextWardNumber = this.journeyProgressionManager.getNextWardNumber();
    this.distanceToWardText.text = `${distanceToWardKm.toFixed(2)} km to Ward ${nextWardNumber}`;

    // Update progress bar and diamond
    const wardProgress = this.journeyProgressionManager.getCurrentWardProgress();
    this.updateProgressBar(wardProgress);

    // Check for ward transitions and update animation
    const currentWardIndex = this.journeyProgressionManager.getCurrentWardNumber() - 1; // Convert to 0-indexed
    this.checkWardTransition(wardProgress, currentWardIndex, deltaTime);

    // Update ward transition animations
    this.updateTransitionAnimations(deltaTime);

    // Update layout (in case of screen resize)
    this.updateLayout();
  }

  /**
   * Update speed fluctuation (random changes every 0.75-1.0s)
   */
  private updateSpeedFluctuation(deltaTime: number): void {
    this.speedUpdateTimer += deltaTime;

    if (this.speedUpdateTimer >= this.nextSpeedUpdateDelay) {
      // Apply random speed change
      const changeAmount =
        SPEED_FLUCTUATION_MIN_MS +
        Math.random() * (SPEED_FLUCTUATION_MAX_MS - SPEED_FLUCTUATION_MIN_MS);
      const changeDirection = Math.random() < 0.5 ? -1 : 1;
      this.displayedSpeed += changeAmount * changeDirection;

      // Clamp to allowed range (144 ± 1.26 km/h)
      this.displayedSpeed = Math.max(
        SPEED_BASE - SPEED_FLUCTUATION_RANGE,
        Math.min(SPEED_BASE + SPEED_FLUCTUATION_RANGE, this.displayedSpeed),
      );

      // Reset timer and set next delay
      this.speedUpdateTimer = 0;
      this.nextSpeedUpdateDelay = this.getRandomSpeedUpdateDelay();
    }
  }

  /**
   * Get random delay for next speed update (0.75-1.0s)
   */
  private getRandomSpeedUpdateDelay(): number {
    return (
      SPEED_UPDATE_INTERVAL_MIN +
      Math.random() * (SPEED_UPDATE_INTERVAL_MAX - SPEED_UPDATE_INTERVAL_MIN)
    );
  }

  /**
   * Check for ward transitions and trigger pulse + swipe animation
   */
  private checkWardTransition(
    currentProgress: number,
    currentWardIndex: number,
    _deltaTime: number,
  ): void {
    // Detect ward change by comparing ward indices
    if (currentWardIndex !== this.lastWardIndex) {
      // Ward changed - trigger transition animation
      this.triggerWardTransition(currentProgress);
      this.lastWardIndex = currentWardIndex;
    }

    this.lastWardProgress = currentProgress;
  }

  /**
   * Trigger ward transition animation (pause at end + pulse + swipe)
   */
  private triggerWardTransition(newProgressPercent: number): void {
    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const { width: screenWidth } = this.app.screen;
    const _leftSideWidth = screenWidth * 0.25;
    const rightSideWidth = screenWidth * 0.75;
    const barWidth = rightSideWidth - BAR_RIGHT_MARGIN * gameWorldScale;

    // Determine direction based on new progress (low % = forward, high % = backward)
    this.transitionDirection = newProgressPercent < 50 ? 'forward' : 'backward';

    // Force diamond to end position before animation
    if (this.transitionDirection === 'forward') {
      // Forward: Stop at 100% (right end)
      this.diamond.x = barWidth;
      this.swipeStartX = barWidth;
    } else {
      // Backward: Stop at 0% (left end)
      this.diamond.x = 0;
      this.swipeStartX = 0;
    }

    // Calculate swipe end position (where diamond will go after pulse)
    this.swipeEndX = (newProgressPercent / 100) * barWidth;

    // Start pause at end
    this.isPausingAtEnd = true;
    this.pauseTimer = 0;

    console.log(
      `✨ Top Bar UI: Ward transition ${this.transitionDirection} - pause at ${this.transitionDirection === 'forward' ? '100%' : '0%'} then pulse and swipe`,
    );
  }

  /**
   * Update ward transition animations (pause + pulse + swipe)
   */
  private updateTransitionAnimations(deltaTime: number): void {
    // Update pause at end
    if (this.isPausingAtEnd) {
      this.pauseTimer += deltaTime;
      if (this.pauseTimer >= PAUSE_AT_END_DURATION) {
        // Pause complete, start pulse
        this.isPausingAtEnd = false;
        this.isPulsing = true;
        this.pulseTimer = 0;
      }
    }

    // Update pulse animation
    if (this.isPulsing) {
      this.pulseTimer += deltaTime;
      if (this.pulseTimer >= PULSE_DURATION) {
        // Pulse complete, start swipe
        // Recalculate swipe target based on CURRENT progress (not when transition started)
        // This ensures the diamond slides to the actual position the player is at now
        if (this.journeyProgressionManager) {
          const gameWorldScale = this.responsiveManager.getGameWorldScale();
          const { width: screenWidth } = this.app.screen;
          const rightSideWidth = screenWidth * 0.75;
          const barWidth = rightSideWidth - BAR_RIGHT_MARGIN * gameWorldScale;
          const currentProgress = this.journeyProgressionManager.getCurrentWardProgress();
          this.swipeEndX = (currentProgress / 100) * barWidth;
          console.log(
            `✨ Top Bar UI: Swipe target recalculated - ${currentProgress.toFixed(1)}% (${this.swipeEndX.toFixed(1)}px)`,
          );
        }

        this.isPulsing = false;
        this.isSwiping = true;
        this.swipeTimer = 0;
      }
    }

    // Update swipe animation
    if (this.isSwiping) {
      this.swipeTimer += deltaTime;
      if (this.swipeTimer >= SWIPE_DURATION) {
        // Swipe complete
        this.isSwiping = false;
        this.swipeTimer = 0;
      }
    }
  }

  /**
   * Update progress bar and diamond position
   */
  private updateProgressBar(progressPercent: number): void {
    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const { width: screenWidth } = this.app.screen;

    // Calculate bar dimensions (right side is 3/4 of screen, with right margin)
    const _leftSideWidth = screenWidth * 0.25;
    const rightSideWidth = screenWidth * 0.75;
    const barWidth = rightSideWidth - BAR_RIGHT_MARGIN * gameWorldScale;
    const barHeight = BAR_THICKNESS * gameWorldScale;

    // Calculate bar fill based on ACTUAL distance traveled (progressPercent)
    // This represents real progress and doesn't change during animations
    const filledWidth = (progressPercent / 100) * barWidth;

    // Calculate diamond position separately (for animation)
    let diamondX = filledWidth; // Default: diamond at fill position

    // Override diamond position during transition animations
    if (this.isPausingAtEnd) {
      // Keep diamond at end position during pause
      diamondX = this.swipeStartX;
    } else if (this.isPulsing) {
      // Keep diamond at end position during pulse
      diamondX = this.swipeStartX;
    } else if (this.isSwiping) {
      // Animate diamond from end to new position
      const swipeProgress = this.swipeTimer / SWIPE_DURATION;
      // Ease-out cubic for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - swipeProgress, 3);
      diamondX = this.swipeStartX + (this.swipeEndX - this.swipeStartX) * easedProgress;
    }

    // Position diamond along bar
    this.diamond.x = diamondX;

    // Clear and redraw progress bar with cumulative 3-color cycling system
    this.progressBar.clear();

    // Determine color cycle based on ward number (1-indexed)
    // Ward 1, 4, 7, 10... → Gold
    // Ward 2, 5, 8, 11... → Purple
    // Ward 3, 6, 9, 12... → Black
    const currentWardNumber = this.journeyProgressionManager?.getCurrentWardNumber() || 1;

    const getWardColor = (wardNum: number): number => {
      const cycle = ((wardNum - 1) % 3) + 1; // 1, 2, 3, 1, 2, 3...
      if (cycle === 1) return BAR_COLOR_GOLD;
      if (cycle === 2) return BAR_COLOR_PURPLE;
      return BAR_COLOR_BLACK;
    };

    const currentColor = getWardColor(currentWardNumber);
    const previousColor = currentWardNumber > 1 ? getWardColor(currentWardNumber - 1) : BAR_COLOR_BLACK;

    // Draw bar in two sections:
    // Left: Current color filling (represents progress in current ward)
    // Right: Previous color (from last ward - stays filled)
    if (filledWidth > 0) {
      this.progressBar.rect(0, 0, filledWidth, barHeight);
      this.progressBar.fill(currentColor);
    }

    // Draw unfilled portion (previous ward's color)
    const unfilledWidth = barWidth - filledWidth;
    if (unfilledWidth > 0) {
      this.progressBar.rect(filledWidth, 0, unfilledWidth, barHeight);
      this.progressBar.fill(previousColor);
    }

    // Clear and redraw diamond (centered at origin in local space)
    this.diamond.clear();
    let diamondSize = DIAMOND_SIZE * gameWorldScale;

    // Apply pulse animation if active
    let rotationAngle = 0;
    if (this.isPulsing) {
      const pulseProgress = this.pulseTimer / PULSE_DURATION;
      // Pulse in and out using sine wave
      const pulseAmount = Math.sin(pulseProgress * Math.PI);
      diamondSize *= 1 + (PULSE_SCALE - 1) * pulseAmount;

      // Add 360-degree rotation during pulse (0 to 2π radians)
      // Synchronized with pulse: start spin -> grow -> continue spin -> shrink -> finish spin
      rotationAngle = pulseProgress * Math.PI * 2;
    }

    // Draw sparkle shape with rounded sides (4-pointed star)
    // Create rounded diamond by using quadratic curves at each point
    const curveAmount = diamondSize * 0.3; // How much to curve the sides

    // Top point
    this.diamond.moveTo(0, -diamondSize);
    // Curve to right point
    this.diamond.quadraticCurveTo(curveAmount, -curveAmount, diamondSize, 0);
    // Curve to bottom point
    this.diamond.quadraticCurveTo(curveAmount, curveAmount, 0, diamondSize);
    // Curve to left point
    this.diamond.quadraticCurveTo(-curveAmount, curveAmount, -diamondSize, 0);
    // Curve back to top point
    this.diamond.quadraticCurveTo(-curveAmount, -curveAmount, 0, -diamondSize);

    // Set diamond rotation and color
    this.diamond.rotation = rotationAngle; // Rotate during pulse, 0 otherwise
    this.diamond.fill(0xcc2200); // Red color matching dragon
  }

  /**
   * Update layout based on screen size
   */
  private updateLayout(): void {
    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const { width: screenWidth, height: screenHeight } = this.app.screen;

    const leftSideWidth = screenWidth * 0.25;
    const rightSideWidth = screenWidth * 0.75;

    // Position at top of SKY area (action band), not SPACE area
    // Action band starts at ~9.26% of screen (100px at 1080p)
    const skyTopY = screenHeight * 0.0926; // Top of action/sky area
    const topPadding = 10 * gameWorldScale; // Small padding from absolute top

    // Position left container at leftmost edge
    this.leftContainer.x = 10 * gameWorldScale; // Small left margin
    this.leftContainer.y = skyTopY + topPadding;

    // Position left side texts (LEFT-aligned, above dragon)
    this.distanceText.x = 0;
    this.distanceText.y = 0;
    this.distanceText.anchor.set(0, 0); // Left-aligned

    this.speedText.x = 0;
    this.speedText.y = this.distanceText.height + 5 * gameWorldScale;
    this.speedText.anchor.set(0, 0); // Left-aligned

    // Position right container (starts at 1/4 screen width)
    this.rightContainer.x = leftSideWidth;
    this.rightContainer.y = skyTopY + topPadding;

    // Position right side texts
    this.landWardText.x = 0;
    this.landWardText.y = 0;
    this.landWardText.anchor.set(0, 0); // Left-aligned (at bar start)

    const barWidth = rightSideWidth - BAR_RIGHT_MARGIN * gameWorldScale;
    this.distanceToWardText.x = barWidth; // Right-aligned to bar end
    this.distanceToWardText.y = 0;
    this.distanceToWardText.anchor.set(1, 0); // Right-aligned (at bar end)

    // Position progress bar (line 2)
    const barY = this.landWardText.height + 5 * gameWorldScale;
    this.progressBar.x = 0;
    this.progressBar.y = barY;

    // Position diamond on bar (Y is fixed, X is set in updateProgressBar)
    this.diamond.y = barY + (BAR_THICKNESS * gameWorldScale) / 2; // Center on bar vertically
  }

  /**
   * Handle window resize
   */
  handleResize(): void {
    this.updateLayout();
  }

  /**
   * Set cutscene speed (overrides normal speed fluctuation)
   * @param speed - Speed to display in km/h
   */
  setCutsceneSpeed(speed: number): void {
    this.isInCutscene = true;
    this.cutsceneSpeed = speed;
  }

  /**
   * Exit cutscene mode and return to normal speed fluctuation
   */
  exitCutsceneMode(): void {
    this.isInCutscene = false;
    this.cutsceneSpeed = 0;
  }

  /**
   * Destroy the top bar UI
   */
  destroy(): void {
    this.container.destroy({ children: true });
    console.log('📊 Top Bar UI: Destroyed');
  }
}
