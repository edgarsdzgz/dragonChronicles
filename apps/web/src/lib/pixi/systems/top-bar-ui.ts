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
 */
const SPEED_BASE = 40.0; // Base speed in m/s
const SPEED_FLUCTUATION_MIN = 0.01; // Min change per tick
const SPEED_FLUCTUATION_MAX = 0.05; // Max change per tick
const SPEED_FLUCTUATION_RANGE = 0.35; // Total range ±0.35 m/s
const SPEED_UPDATE_INTERVAL_MIN = 750; // Min ms between updates
const SPEED_UPDATE_INTERVAL_MAX = 1000; // Max ms between updates

/**
 * Progress bar configuration
 */
const BAR_THICKNESS = 2; // Bar height in pixels
const DIAMOND_SIZE = 4; // Diamond size in pixels
const FLASH_DURATION = 200; // Flash duration in ms

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

  // Flash effect state
  private isFlashing: boolean = false;
  private flashTimer: number = 0;

  constructor(app: Application, responsiveManager: ResponsiveManager) {
    this.app = app;
    this.responsiveManager = responsiveManager;

    // Create main container
    this.container = new Container();
    this.container.label = 'TopBarUI';
    this.app.stage.addChild(this.container);

    // Create left container (1/4 width)
    this.leftContainer = new Container();
    this.leftContainer.label = 'TopBarUI-Left';
    this.container.addChild(this.leftContainer);

    // Create right container (3/4 width)
    this.rightContainer = new Container();
    this.rightContainer.label = 'TopBarUI-Right';
    this.container.addChild(this.rightContainer);

    // Initialize left side texts
    this.distanceText = new Text({
      text: '0m from Home',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xffffff,
        align: 'right',
      },
    });
    this.leftContainer.addChild(this.distanceText);

    this.speedText = new Text({
      text: '40.00 m/s',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xcccccc,
        align: 'right',
      },
    });
    this.leftContainer.addChild(this.speedText);

    // Initialize right side texts
    this.landWardText = new Text({
      text: 'Land 1: Horizon Steppe  Ward 1: The Parting Stones',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xffffff,
        align: 'left',
      },
    });
    this.rightContainer.addChild(this.landWardText);

    this.distanceToWardText = new Text({
      text: '1000m to Ward 2',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xcccccc,
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

    // Update speed fluctuation
    this.updateSpeedFluctuation(deltaTime);

    // Update distance display
    const distanceMeters = Math.floor(this.journeyProgressionManager.getDistanceMeters());
    this.distanceText.text = `${distanceMeters}m from Home`;

    // Update speed display
    this.speedText.text = `${this.displayedSpeed.toFixed(2)} m/s`;

    // Update Land/Ward display
    const landName = this.journeyProgressionManager.getLandDisplayName();
    const wardName = this.journeyProgressionManager.getWardDisplayName();
    this.landWardText.text = `${landName}  ${wardName}`;

    // Update distance to next ward
    const distanceToWard = Math.ceil(this.journeyProgressionManager.getDistanceToNextWard());
    const nextWardNumber = this.journeyProgressionManager.getNextWardNumber();
    this.distanceToWardText.text = `${distanceToWard}m to Ward ${nextWardNumber}`;

    // Update progress bar and diamond
    const wardProgress = this.journeyProgressionManager.getCurrentWardProgress();
    this.updateProgressBar(wardProgress);

    // Check for ward transitions (flash effect)
    this.checkWardTransition(wardProgress, deltaTime);

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
        SPEED_FLUCTUATION_MIN + Math.random() * (SPEED_FLUCTUATION_MAX - SPEED_FLUCTUATION_MIN);
      const changeDirection = Math.random() < 0.5 ? -1 : 1;
      this.displayedSpeed += changeAmount * changeDirection;

      // Clamp to allowed range (40 ± 0.35 m/s)
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
   * Check for ward transitions and trigger flash effect
   */
  private checkWardTransition(currentProgress: number, deltaTime: number): void {
    // Detect transition forward (0% → 100% → flash)
    if (currentProgress < 5 && this.lastWardProgress > 95) {
      this.triggerFlash();
    }
    // Detect transition backward (100% → 0% → flash)
    else if (currentProgress > 95 && this.lastWardProgress < 5) {
      this.triggerFlash();
    }

    this.lastWardProgress = currentProgress;

    // Update flash animation
    if (this.isFlashing) {
      this.flashTimer += deltaTime;
      if (this.flashTimer >= FLASH_DURATION) {
        this.isFlashing = false;
        this.flashTimer = 0;
      }
    }
  }

  /**
   * Trigger diamond flash effect (spin + sun glint)
   */
  private triggerFlash(): void {
    this.isFlashing = true;
    this.flashTimer = 0;
    console.log('✨ Top Bar UI: Ward transition flash');
  }

  /**
   * Update progress bar and diamond position
   */
  private updateProgressBar(progressPercent: number): void {
    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const { width: screenWidth } = this.app.screen;

    // Calculate bar dimensions
    const leftSideWidth = screenWidth * 0.25;
    const rightSideWidth = screenWidth * 0.75;
    const barWidth = rightSideWidth - 40 * gameWorldScale; // 20px padding on each side
    const barHeight = BAR_THICKNESS * gameWorldScale;

    // Clear and redraw progress bar
    this.progressBar.clear();
    this.progressBar.rect(0, 0, barWidth, barHeight);
    this.progressBar.fill(0xcccccc);

    // Calculate diamond position (0-100% along bar)
    const diamondX = (progressPercent / 100) * barWidth;

    // Clear and redraw diamond
    this.diamond.clear();
    const diamondSize = DIAMOND_SIZE * gameWorldScale;

    // Draw diamond shape (rotated square)
    this.diamond.moveTo(diamondX, -diamondSize);
    this.diamond.lineTo(diamondX + diamondSize, 0);
    this.diamond.lineTo(diamondX, diamondSize);
    this.diamond.lineTo(diamondX - diamondSize, 0);
    this.diamond.lineTo(diamondX, -diamondSize);

    // Apply flash effect (if active)
    if (this.isFlashing) {
      const flashProgress = this.flashTimer / FLASH_DURATION;
      const rotation = flashProgress * Math.PI * 2; // Full rotation
      this.diamond.rotation = rotation;

      // Add sun glint (bright white outline)
      this.diamond.stroke({ width: 2 * gameWorldScale, color: 0xffffff, alpha: 1 - flashProgress });
      this.diamond.fill(0xffd700); // Gold color during flash
    } else {
      this.diamond.rotation = Math.PI / 4; // 45-degree rotation (diamond shape)
      this.diamond.fill(0xffffff);
    }
  }

  /**
   * Update layout based on screen size
   */
  private updateLayout(): void {
    const gameWorldScale = this.responsiveManager.getGameWorldScale();
    const { width: screenWidth } = this.app.screen;

    const leftSideWidth = screenWidth * 0.25;
    const rightSideWidth = screenWidth * 0.75;
    const padding = 20 * gameWorldScale;

    // Position left container
    this.leftContainer.x = padding;
    this.leftContainer.y = padding;

    // Position left side texts (right-aligned)
    this.distanceText.x = leftSideWidth - padding * 2;
    this.distanceText.y = 0;
    this.distanceText.anchor.set(1, 0); // Right-aligned

    this.speedText.x = leftSideWidth - padding * 2;
    this.speedText.y = this.distanceText.height + 5 * gameWorldScale;
    this.speedText.anchor.set(1, 0); // Right-aligned

    // Position right container
    this.rightContainer.x = leftSideWidth + padding;
    this.rightContainer.y = padding;

    // Position right side texts
    this.landWardText.x = 0;
    this.landWardText.y = 0;
    this.landWardText.anchor.set(0, 0); // Left-aligned

    this.distanceToWardText.x = rightSideWidth - leftSideWidth - padding * 2;
    this.distanceToWardText.y = 0;
    this.distanceToWardText.anchor.set(1, 0); // Right-aligned

    // Position progress bar (line 2)
    const barY = this.landWardText.height + 5 * gameWorldScale;
    this.progressBar.x = 0;
    this.progressBar.y = barY;

    this.diamond.x = 0;
    this.diamond.y = barY + (BAR_THICKNESS * gameWorldScale) / 2; // Center on bar
  }

  /**
   * Handle window resize
   */
  handleResize(): void {
    this.updateLayout();
  }

  /**
   * Destroy the top bar UI
   */
  destroy(): void {
    this.container.destroy({ children: true });
    console.log('📊 Top Bar UI: Destroyed');
  }
}
