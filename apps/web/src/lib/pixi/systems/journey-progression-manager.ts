/**
 * Journey Progression Manager
 *
 * Tracks the player's journey progression including:
 * - Distance traveled from Draconia (in meters)
 * - Current Ward/Land position
 * - Progress to next Ward
 * - Enemy difficulty scaling based on distance
 *
 * DISTANCE CONVERSION:
 * - 2.5 pixels = 1 meter
 * - Dragon speed: 100 pixels/second = 40 meters/second
 */

import type { MovementState } from './land-manager';

/**
 * Distance conversion constants
 */
export const PIXELS_PER_METER = 2.5;
export const METERS_PER_PIXEL = 0.4; // 1 / 2.5

/**
 * Ward milestone distances (in meters from Draconia)
 */
export interface WardMilestone {
  id: string;
  name: string;
  distanceFromStart: number; // meters
  landId: string;
}

/**
 * Journey progression state
 */
export interface JourneyProgressionState {
  distanceTraveledMeters: number; // Total distance from Draconia
  currentWardId: string;
  currentLandId: string;
  distanceToNextWard: number; // Meters until next ward
  isJourneyActive: boolean;
}

/**
 * Journey Progression Manager
 */
export class JourneyProgressionManager {
  private state: JourneyProgressionState;
  private wardMilestones: WardMilestone[];
  private currentWardIndex: number = 0;

  constructor() {
    // Initialize ward milestones
    // TODO: Load from game data/configuration
    this.wardMilestones = [
      {
        id: 'draconia',
        name: 'Draconia',
        distanceFromStart: 0,
        landId: 'land1_steppe',
      },
      {
        id: 'ward1',
        name: 'The Parting Stones',
        distanceFromStart: 1000, // 1km
        landId: 'land1_steppe',
      },
      {
        id: 'ward2',
        name: 'Windwhisper Plains',
        distanceFromStart: 2500, // 2.5km
        landId: 'land1_steppe',
      },
      {
        id: 'ward3',
        name: 'Sunstone Outlook',
        distanceFromStart: 5000, // 5km
        landId: 'land1_steppe',
      },
      {
        id: 'ward4',
        name: 'Embergrass Crossing',
        distanceFromStart: 10000, // 10km - TODO: Adjust based on game balance
        landId: 'land1_steppe',
      },
      {
        id: 'ward5',
        name: 'Stormwatch Frontier',
        distanceFromStart: 20000, // 20km - TODO: Adjust based on game balance
        landId: 'land1_steppe',
      },
    ];

    // Initialize state
    this.state = {
      distanceTraveledMeters: 0,
      currentWardId: 'draconia',
      currentLandId: 'land1_steppe',
      distanceToNextWard: this.wardMilestones[1].distanceFromStart,
      isJourneyActive: false,
    };

    console.log('🗺️ Journey Progression Manager: Initialized at Draconia (0m)');
  }

  /**
   * Start the journey (reset distance to 0)
   */
  startJourney(): void {
    this.state.distanceTraveledMeters = 0;
    this.state.currentWardId = 'draconia';
    this.state.currentLandId = 'land1_steppe';
    this.currentWardIndex = 0;
    this.state.distanceToNextWard = this.wardMilestones[1].distanceFromStart;
    this.state.isJourneyActive = true;

    console.log('🗺️ Journey Progression Manager: Journey started from Draconia');
  }

  /**
   * Update journey progression based on movement
   * @param deltaTime - Time elapsed since last frame (milliseconds)
   * @param dragonSpeed - Dragon movement speed in pixels per second
   * @param movementState - Current movement state (forward/backward/paused)
   */
  update(deltaTime: number, dragonSpeed: number, movementState: MovementState): void {
    if (!this.state.isJourneyActive) {
      return;
    }

    // Calculate distance moved this frame
    const deltaSeconds = deltaTime / 1000;
    const pixelsMoved = dragonSpeed * deltaSeconds;
    const metersMovedThisFrame = pixelsMoved * METERS_PER_PIXEL;

    // Apply movement based on state
    switch (movementState) {
      case 'forward':
        this.state.distanceTraveledMeters += metersMovedThisFrame;
        break;
      case 'backward':
        // Allow going negative? Or stop at 0?
        // For now, stop at 0 (can't go past Draconia)
        this.state.distanceTraveledMeters = Math.max(
          0,
          this.state.distanceTraveledMeters - metersMovedThisFrame,
        );
        break;
      case 'paused':
        // No change
        break;
    }

    // Check for ward transitions
    this.checkWardTransitions();

    // Update distance to next ward
    this.updateDistanceToNextWard();
  }

  /**
   * Check if we've crossed into a new ward
   */
  private checkWardTransitions(): void {
    const currentDistance = this.state.distanceTraveledMeters;

    // Check if we've moved forward into next ward
    if (
      this.currentWardIndex < this.wardMilestones.length - 1 &&
      currentDistance >= this.wardMilestones[this.currentWardIndex + 1].distanceFromStart
    ) {
      // Advanced to next ward
      this.currentWardIndex++;
      const newWard = this.wardMilestones[this.currentWardIndex];
      this.state.currentWardId = newWard.id;
      this.state.currentLandId = newWard.landId;

      console.log(
        `🗺️ Journey Progression: Entered ${newWard.name} at ${currentDistance.toFixed(0)}m`,
      );
    }
    // Check if we've moved backward into previous ward
    else if (
      this.currentWardIndex > 0 &&
      currentDistance < this.wardMilestones[this.currentWardIndex].distanceFromStart
    ) {
      // Retreated to previous ward
      this.currentWardIndex--;
      const newWard = this.wardMilestones[this.currentWardIndex];
      this.state.currentWardId = newWard.id;
      this.state.currentLandId = newWard.landId;

      console.log(
        `🗺️ Journey Progression: Returned to ${newWard.name} at ${currentDistance.toFixed(0)}m`,
      );
    }
  }

  /**
   * Update distance to next ward milestone
   */
  private updateDistanceToNextWard(): void {
    if (this.currentWardIndex < this.wardMilestones.length - 1) {
      const nextWard = this.wardMilestones[this.currentWardIndex + 1];
      this.state.distanceToNextWard =
        nextWard.distanceFromStart - this.state.distanceTraveledMeters;
    } else {
      // At final ward
      this.state.distanceToNextWard = 0;
    }
  }

  /**
   * Get current distance traveled (in meters)
   */
  getDistanceMeters(): number {
    return this.state.distanceTraveledMeters;
  }

  /**
   * Get current distance traveled (formatted string)
   */
  getDistanceFormatted(): string {
    const meters = this.state.distanceTraveledMeters;

    if (meters >= 1000) {
      // Show as kilometers with 1 decimal place
      return `${(meters / 1000).toFixed(1)}km`;
    } else {
      // Show as meters (whole number)
      return `${Math.floor(meters)}m`;
    }
  }

  /**
   * Get distance to next ward (in meters)
   */
  getDistanceToNextWard(): number {
    return this.state.distanceToNextWard;
  }

  /**
   * Get current ward info
   */
  getCurrentWard(): WardMilestone {
    return this.wardMilestones[this.currentWardIndex];
  }

  /**
   * Get next ward info (or null if at final ward)
   */
  getNextWard(): WardMilestone | null {
    if (this.currentWardIndex < this.wardMilestones.length - 1) {
      return this.wardMilestones[this.currentWardIndex + 1];
    }
    return null;
  }

  /**
   * Get current ward number (1-indexed, excludes Draconia)
   */
  getCurrentWardNumber(): number {
    // Draconia is index 0, Ward 1 is index 1, etc.
    return Math.max(1, this.currentWardIndex);
  }

  /**
   * Get next ward number (1-indexed, excludes Draconia)
   */
  getNextWardNumber(): number {
    return this.currentWardIndex + 1;
  }

  /**
   * Get land display name with number
   * @returns "Land 1: Horizon Steppe"
   */
  getLandDisplayName(): string {
    // TODO: Support multiple lands
    return 'Land 1: Horizon Steppe';
  }

  /**
   * Get current ward display name with number
   * @returns "Ward 1: The Parting Stones"
   */
  getWardDisplayName(): string {
    const ward = this.getCurrentWard();
    if (ward.id === 'draconia') {
      return 'Draconia';
    }
    return `Ward ${this.getCurrentWardNumber()}: ${ward.name}`;
  }

  /**
   * Get current ward progress percentage (0-100)
   * Progress through current ward only
   */
  getCurrentWardProgress(): number {
    const currentWard = this.wardMilestones[this.currentWardIndex];
    const nextWard = this.getNextWard();

    if (!nextWard) {
      // At final ward
      return 100;
    }

    const wardStart = currentWard.distanceFromStart;
    const wardEnd = nextWard.distanceFromStart;
    const wardLength = wardEnd - wardStart;
    const progressInWard = this.state.distanceTraveledMeters - wardStart;

    return Math.max(0, Math.min(100, (progressInWard / wardLength) * 100));
  }

  /**
   * Get enemy difficulty multiplier based on distance
   * Scales enemy stats as player progresses
   * @returns multiplier (1.0 at start, increases with distance)
   */
  getEnemyDifficultyMultiplier(): number {
    // Simple linear scaling: +10% difficulty per 1000m
    // At 0m: 1.0x
    // At 1000m: 1.1x
    // At 5000m: 1.5x
    const baseMultiplier = 1.0;
    const scalingFactor = 0.1; // 10% per 1000m
    const distanceKm = this.state.distanceTraveledMeters / 1000;

    return baseMultiplier + scalingFactor * distanceKm;
  }

  /**
   * Get current journey state
   */
  getState(): JourneyProgressionState {
    return { ...this.state };
  }

  /**
   * Set journey state (for loading saved game)
   */
  setState(state: Partial<JourneyProgressionState>): void {
    this.state = { ...this.state, ...state };

    // Update current ward index based on distance
    for (let i = this.wardMilestones.length - 1; i >= 0; i--) {
      if (this.state.distanceTraveledMeters >= this.wardMilestones[i].distanceFromStart) {
        this.currentWardIndex = i;
        break;
      }
    }

    this.updateDistanceToNextWard();

    console.log(
      `🗺️ Journey Progression: Loaded state - ${this.getDistanceFormatted()} from Draconia`,
    );
  }

  /**
   * Stop the journey
   */
  stopJourney(): void {
    this.state.isJourneyActive = false;
    console.log('🗺️ Journey Progression Manager: Journey stopped');
  }

  /**
   * Destroy the manager
   */
  destroy(): void {
    console.log('🗺️ Journey Progression Manager: Destroyed');
  }
}
