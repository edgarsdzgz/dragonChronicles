/**
 * Damage System
 *
 * Handles all damage application, death detection, and reward processing:
 * - Enemy damage and death
 * - Dragon damage and death
 * - Death animations (330ms blink)
 * - Reward drops (arcana, soul power)
 * - Dragon pushback calculation
 *
 * Phase 1 Combat Implementation - Core System
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
 * Configuration for damage system
 */
export interface DamageSystemConfig {
  // Enemy rewards
  arcanaPerKill: number;
  soulPowerPerKill: number;
  itemDropChance: number;

  // Death animation
  deathBlinkDuration: number; // 330ms
  deathBlinkCount: number; // 3 blinks
  deathBlinkInterval: number; // 100ms per blink

  // Dragon death
  pushbackPercent: number; // 5% = 0.05
  minDistance: number; // 0m (never negative)
}

/**
 * Default damage system configuration
 */
export const DEFAULT_DAMAGE_CONFIG: DamageSystemConfig = {
  // Rewards (from Phase 1 spec)
  arcanaPerKill: 0.03,
  soulPowerPerKill: 0.003,
  itemDropChance: 0.02, // 2%

  // Death animation
  deathBlinkDuration: 330, // ms
  deathBlinkCount: 3,
  deathBlinkInterval: 100, // ms

  // Dragon death
  pushbackPercent: 0.05, // 5%
  minDistance: 0, // Never go negative
};

/**
 * Damage System
 *
 * Pure utility class for damage calculations and death processing.
 */
export class DamageSystem {
  private config: DamageSystemConfig;
  private profile: Profile | null = null;

  constructor(config: DamageSystemConfig = DEFAULT_DAMAGE_CONFIG) {
    this.config = config;
  }

  /**
   * Set the current profile for reward processing
   */
  setProfile(profile: Profile): void {
    this.profile = profile;
  }

  /**
   * Apply damage to an enemy
   * @param currentHealth - Enemy's current HP
   * @param damage - Damage to apply
   * @param maxHealth - Enemy's max HP
   * @returns DamageResult with death status and rewards
   */
  applyEnemyDamage(currentHealth: number, damage: number, maxHealth: number): DamageResult {
    const newHealth = Math.max(0, currentHealth - damage);
    const targetDied = newHealth <= 0;

    let rewards: RewardDrop | undefined;
    if (targetDied) {
      rewards = this.calculateRewards();
      this.awardRewards(rewards);
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
  applyDragonDamage(currentHealth: number, damage: number, maxHealth: number): DamageResult {
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
   * @returns RewardDrop with arcana, soul power, and optional item
   */
  private calculateRewards(): RewardDrop {
    const rewards: RewardDrop = {
      arcana: this.config.arcanaPerKill,
      soulPower: this.config.soulPowerPerKill,
    };

    // Item drop (2% chance)
    if (Math.random() < this.config.itemDropChance) {
      rewards.itemDrop = this.rollItemDrop();
    }

    return rewards;
  }

  /**
   * Award rewards to profile
   * @param rewards - Rewards to award
   */
  private awardRewards(rewards: RewardDrop): void {
    if (!this.profile) {
      console.warn('⚠️ No profile set, rewards not awarded');
      return;
    }

    // Update profile currencies
    this.profile.currencies.arcana += rewards.arcana;
    this.profile.currencies.soulPower =
      (this.profile.currencies.soulPower || 0) + rewards.soulPower;

    // TODO: Handle item drops when inventory system exists
    if (rewards.itemDrop) {
      console.log(`🎁 Item dropped: ${rewards.itemDrop} (inventory system not yet implemented)`);
    }
  }

  /**
   * Roll for item drop (placeholder)
   * @returns Item ID
   */
  private rollItemDrop(): string {
    // TODO: Implement proper item drop table
    return 'placeholder_item';
  }

  /**
   * Create death data for enemy
   * @returns DeathData for death animation
   */
  createDeathData(): DeathData {
    return {
      timestamp: performance.now(),
      blinkCount: 0,
      blinkInterval: this.config.deathBlinkInterval,
      isBlinking: false,
    };
  }

  /**
   * Update death animation state
   * @param deathData - Current death data
   * @param currentTime - Current timestamp
   * @returns true if death animation is complete
   */
  updateDeathAnimation(deathData: DeathData, currentTime: number): boolean {
    const timeSinceDeath = currentTime - deathData.timestamp;

    if (timeSinceDeath >= this.config.deathBlinkDuration) {
      return true; // Animation complete, remove entity
    }

    // Calculate blink state (on/off every 100ms)
    const blinkCycle = Math.floor(timeSinceDeath / this.config.deathBlinkInterval);
    deathData.blinkCount = blinkCycle;
    deathData.isBlinking = blinkCycle % 2 === 0; // Even = visible, odd = hidden

    return false; // Animation still playing
  }

  /**
   * Calculate dragon pushback distance after death
   * @param currentDistance - Current distance in meters
   * @param wardStartDistance - Ward start distance in meters
   * @param wardEndDistance - Ward end distance in meters
   * @returns DragonDeathResult with pushback info
   */
  calculateDragonPushback(
    currentDistance: number,
    wardStartDistance: number,
    wardEndDistance: number,
  ): DragonDeathResult {
    const distanceIntoWard = currentDistance - wardStartDistance;

    // Calculate 5% pushback
    const pushbackDistance = distanceIntoWard * this.config.pushbackPercent;

    // Never go below ward start (or 0)
    const newDistance = Math.max(
      Math.max(this.config.minDistance, wardStartDistance),
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
  calculateBackgroundPushbackSpeed(
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

  /**
   * Get current configuration
   */
  getConfig(): DamageSystemConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DamageSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
