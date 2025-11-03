/**
 * Arcana Reward Calculator
 *
 * Pure utility functions for calculating scaled arcana rewards.
 * No state management - receives all data via parameters.
 */

import type { ArcanaDropConfig } from '@draconia/sim';
import type { EnemyData } from '../enemy-manager';

/**
 * Arcana reward calculation result
 */
export interface ArcanaRewardCalculation {
  baseArcana: number;
  scaledArcana: number;
  distance: number;
  ward: number;
  distanceFactor: number;
  wardFactor: number;
  totalFactor: number;
}

/**
 * Calculate scaled arcana reward based on base arcana and scaling factors
 * @param baseArcana - Base arcana value from enemy configuration
 * @param distance - Current distance in meters
 * @param ward - Current ward number
 * @param scalingConfig - Arcana scaling configuration from arcana manager
 * @returns Calculated reward with all scaling factors
 */
export function calculateScaledArcana(
  baseArcana: number,
  distance: number,
  ward: number,
  scalingConfig: ArcanaDropConfig,
): ArcanaRewardCalculation {
  // Convert distance to kilometers for scaling
  const distanceKm = distance / 1000;

  // Calculate distance scaling factor
  // Formula: distanceScalingFactor ^ distanceKm
  const distanceFactor = Math.pow(scalingConfig.distanceScalingFactor, distanceKm);

  // Calculate ward scaling factor
  // Formula: wardScalingFactor ^ ward
  const wardFactor = Math.pow(scalingConfig.wardScalingFactor, ward);

  // Total scaling factor
  const totalFactor = distanceFactor * wardFactor;

  // Calculate scaled arcana reward
  const scaledArcana = baseArcana * totalFactor;

  // Round to 2 decimal places for currency precision
  const roundedArcana = Math.floor(scaledArcana * 100) / 100;

  return {
    baseArcana,
    scaledArcana: roundedArcana,
    distance,
    ward,
    distanceFactor,
    wardFactor,
    totalFactor,
  };
}

/**
 * Set up event listeners for arcana reward calculation
 * Listens for death_animation_complete events and calculates rewards
 * @param eventBus - Event bus instance
 * @param arcanaManager - Arcana drop manager instance
 * @param getDistance - Function to get current distance
 * @param getWard - Function to get current ward
 */
export function setupArcanaRewardListeners(
  eventBus: ReturnType<typeof import('@draconia/shared').getEventBus>,
  arcanaManager: { config: ArcanaDropConfig; dropArcana: (_amount: number, _source: unknown) => void },
  getDistance: () => number,
  getWard: () => number,
): void {
  // Listen for death animation complete events
  eventBus.on('combat', 'death_animation_complete', (event) => {
    const payload = event.payload as { enemyId: string | number; enemy: EnemyData };

    // Get baseArcana from enemy (default to 0 if missing)
    const baseArcana = payload.enemy.baseArcana || 0;

    // Skip if no base arcana (shouldn't happen, but defensive)
    if (baseArcana <= 0) {
      console.warn(`⚠️ Enemy ${payload.enemyId} has no baseArcana, skipping reward`);
      return;
    }

    // Get current distance and ward
    const distance = getDistance();
    const ward = getWard();

    // Calculate scaled arcana reward
    const calculation = calculateScaledArcana(
      baseArcana,
      distance,
      ward,
      arcanaManager.config,
    );

    // Emit arcana_calculated event
    eventBus.emit({
      category: 'combat',
      type: 'arcana_calculated',
      timestamp: Date.now(),
      source: 'arcana-reward-calculator',
      payload: {
        enemyId: payload.enemyId,
        baseArcana: calculation.baseArcana,
        scaledArcana: calculation.scaledArcana,
        distance: calculation.distance,
        ward: calculation.ward,
        distanceFactor: calculation.distanceFactor,
        wardFactor: calculation.wardFactor,
      },
    });
  });
}

