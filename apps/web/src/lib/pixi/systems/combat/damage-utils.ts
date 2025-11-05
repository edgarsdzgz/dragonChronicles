/**
 * Damage Utilities
 *
 * Pure utility functions for damage calculations and death processing.
 * - Enemy damage and death
 * - Dragon damage and death
 * - Death animations (330ms blink)
 * - Reward drops (arcana, soul power)
 * - Dragon pushback calculation
 *
 * Phase 1 Combat Implementation - Utility Functions
 */

import type { Profile } from '@draconia/db';

export interface DamageResult {
  targetDied: boolean;
  damageDealt: number;
  newHealth: number;
  rewards?: RewardDrop;
}

export interface RewardDrop {
  arcana: number;
  soulPower: number;
  itemDrop?: string;
}

export interface DeathData {
  timestamp: number;
  blinkCount: number;
  blinkInterval: number;
  isBlinking: boolean;
}

export interface DragonDeathResult {
  died: boolean;
  pushbackDistance: number;
  newDistance: number;
}

/**
 * Default reward values (from Phase 1 spec)
 */
export const DEFAULT_REWARDS = {
  arcanaPerKill: 0.03,
  soulPowerPerKill: 0.003,
  itemDropChance: 0.02, // 2%
};

/**
 * Default death animation values
 */
export const DEFAULT_DEATH_ANIMATION = {
  blinkDuration: 330, // ms
  blinkCount: 3,
  blinkInterval: 100, // ms
};

/**
 * Default dragon death values
 */
export const DEFAULT_DRAGON_DEATH = {
  pushbackPercent: 0.05, // 5%
  minDistance: 0, // Never go negative
};

/**
 * Apply damage to an enemy
 * @param currentHealth - Enemy's current HP
 * @param damage - Damage to apply
 * @param maxHealth - Enemy's max HP
 * @param profile - Optional profile for reward processing
 * @param config - Optional reward configuration
 * @returns DamageResult with death status and rewards
 */
export function applyEnemyDamage(
  currentHealth: number,
  damage: number,
  maxHealth: number,
  profile?: Profile,
  config = DEFAULT_REWARDS,
): DamageResult {
  const newHealth = Math.max(0, currentHealth - damage);
  const targetDied = newHealth <= 0;

  let rewards: RewardDrop | undefined;
  if (targetDied) {
    rewards = calculateRewards(config);
    if (profile) {
      awardRewards(profile, rewards);
    }
  }

  return {
    targetDied,
    damageDealt: damage,
    newHealth,
    rewards,
  };
}

/**
 * Apply damage to dragon
 * @param currentHealth - Dragon's current HP
 * @param damage - Damage to apply
 * @param maxHealth - Dragon's max HP
 * @returns DamageResult with death status
 */
export function applyDragonDamage(
  currentHealth: number,
  damage: number,
  _maxHealth: number,
): DamageResult {
  const newHealth = Math.max(0, currentHealth - damage);
  const targetDied = newHealth <= 0;

  return {
    targetDied,
    damageDealt: damage,
    newHealth,
  };
}

/**
 * Calculate reward drop for enemy death
 * @param config - Reward configuration
 * @returns RewardDrop with arcana, soul power, and optional item
 */
export function calculateRewards(config = DEFAULT_REWARDS): RewardDrop {
  const rewards: RewardDrop = {
    arcana: config.arcanaPerKill,
    soulPower: config.soulPowerPerKill,
  };

  // Item drop (2% chance)
  if (Math.random() < config.itemDropChance) {
    rewards.itemDrop = rollItemDrop();
  }

  return rewards;
}

/**
 * Award rewards to profile
 * @param profile - Profile to award rewards to
 * @param rewards - Rewards to award
 */
export function awardRewards(profile: Profile, rewards: RewardDrop): void {
  // Update profile currencies
  profile.currencies.arcana += rewards.arcana;
  profile.currencies.soulPower = (profile.currencies.soulPower || 0) + rewards.soulPower;

  // TODO: Handle item drops when inventory system exists
  if (rewards.itemDrop) {
    console.log(`🎁 Item dropped: ${rewards.itemDrop} (inventory system not yet implemented)`);
  }
}

/**
 * Roll for item drop (placeholder)
 * @returns Item ID
 */
export function rollItemDrop(): string {
  // TODO: Implement proper item drop table
  return 'placeholder_item';
}

/**
 * Create death data for enemy
 * @param config - Death animation configuration
 * @returns DeathData for death animation
 */
export function createDeathData(config = DEFAULT_DEATH_ANIMATION): DeathData {
  return {
    timestamp: performance.now(),
    blinkCount: 0,
    blinkInterval: config.blinkInterval,
    isBlinking: false,
  };
}

/**
 * Update death animation state
 * @param deathData - Current death data
 * @param currentTime - Current timestamp
 * @param config - Death animation configuration
 * @returns true if death animation is complete
 */
export function updateDeathAnimation(
  deathData: DeathData,
  currentTime: number,
  config = DEFAULT_DEATH_ANIMATION,
): boolean {
  const timeSinceDeath = currentTime - deathData.timestamp;

  if (timeSinceDeath >= config.blinkDuration) {
    return true; // Animation complete, remove entity
  }

  // Calculate blink state (on/off every 100ms)
  const blinkCycle = Math.floor(timeSinceDeath / config.blinkInterval);
  deathData.blinkCount = blinkCycle;
  deathData.isBlinking = blinkCycle % 2 === 0; // Even = visible, odd = hidden

  return false; // Animation still playing
}

/**
 * Calculate dragon pushback distance after death
 * @param currentDistance - Current distance in meters
 * @param wardStartDistance - Ward start distance in meters
 * @param wardEndDistance - Ward end distance in meters
 * @param config - Dragon death configuration
 * @returns DragonDeathResult with pushback info
 */
export function calculateDragonPushback(
  currentDistance: number,
  wardStartDistance: number,
  wardEndDistance: number,
  config = DEFAULT_DRAGON_DEATH,
): DragonDeathResult {
  const distanceIntoWard = currentDistance - wardStartDistance;

  // Calculate 5% pushback
  const pushbackDistance = distanceIntoWard * config.pushbackPercent;

  // Never go below ward start (or 0)
  const newDistance = Math.max(
    Math.max(config.minDistance, wardStartDistance),
    currentDistance - pushbackDistance,
  );

  return {
    died: true,
    pushbackDistance,
    newDistance,
  };
}

/**
 * Calculate background scroll speed for pushback animation
 *
 * This ensures visual consistency - if dragon reaches distance X from
 * background point A and is pushed back, they will return to point A
 * when reaching distance X again.
 *
 * @param pushbackDistance - Distance to push back (meters)
 * @param pushbackDuration - Duration of pushback animation (ms)
 * @param normalFlightSpeed - Dragon's normal flight speed (m/s)
 * @returns Speed multiplier for background scroll
 */
export function calculateBackgroundPushbackSpeed(
  pushbackDistance: number,
  pushbackDuration: number,
  normalFlightSpeed: number,
): number {
  // Convert duration to seconds
  const durationSeconds = pushbackDuration / 1000;

  // Calculate required speed (m/s)
  const pushbackSpeed = pushbackDistance / durationSeconds;

  // Calculate multiplier relative to normal speed
  const speedMultiplier = pushbackSpeed / normalFlightSpeed;

  return speedMultiplier;
}
