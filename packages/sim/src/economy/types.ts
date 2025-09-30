/**
 * Economic system type definitions for the Arcana economy
 *
 * This module defines all types related to the Arcana economic system,
 * including drop sources, balance tracking, and economic events.
 */

/**
 * Source of Arcana drops
 */
export interface ArcanaSource {
  /** Type of Arcana source */
  type: 'enemy_kill' | 'boss_reward' | 'distance_bonus';
  /** ID of the enemy that dropped Arcana (if applicable) */
  enemyId?: string;
  /** ID of the boss that dropped Arcana (if applicable) */
  bossId?: string;
  /** Distance at which the drop occurred (if applicable) */
  distance?: number;
  /** Ward level at which the drop occurred (if applicable) */
  ward?: number;
}

/**
 * Source of Soul Power drops
 */
export interface SoulPowerSource {
  /** Type of Soul Power source */
  type: 'enemy_kill' | 'boss_reward' | 'research_completion' | 'achievement';
  /** ID of the enemy that dropped Soul Power (if applicable) */
  enemyId?: string;
  /** ID of the boss that dropped Soul Power (if applicable) */
  bossId?: string;
  /** Research ID that provided Soul Power (if applicable) */
  researchId?: string;
  /** Achievement ID that provided Soul Power (if applicable) */
  achievementId?: string;
  /** Distance at which the drop occurred (if applicable) */
  distance?: number;
  /** Ward level at which the drop occurred (if applicable) */
  ward?: number;
}

/**
 * Individual Arcana drop event
 */
export interface ArcanaDrop {
  /** Amount of Arcana dropped */
  amount: number;
  /** Source of the Arcana drop */
  source: ArcanaSource;
  /** Timestamp when the drop occurred */
  timestamp: number;
  /** Scaling factor applied to the drop */
  scalingFactor: number;
  /** Base amount before scaling */
  baseAmount: number;
}

/**
 * Individual Soul Power drop event
 */
export interface SoulPowerDrop {
  /** Amount of Soul Power dropped */
  amount: number;
  /** Source of the Soul Power drop */
  source: SoulPowerSource;
  /** Timestamp when the drop occurred */
  timestamp: number;
  /** Scaling factor applied to the drop */
  scalingFactor: number;
  /** Base amount before scaling */
  baseAmount: number;
  /** Chance that triggered this drop */
  dropChance: number;
}

/**
 * Current Arcana balance and statistics
 */
export interface ArcanaBalance {
  /** Current Arcana balance */
  current: number;
  /** Total Arcana earned this journey */
  totalEarned: number;
  /** Total Arcana spent this journey */
  totalSpent: number;
  /** List of all drops this journey */
  drops: ArcanaDrop[];
  /** Journey start timestamp */
  journeyStartTime: number;
}

/**
 * Current Soul Power balance and statistics
 */
export interface SoulPowerBalance {
  /** Current Soul Power balance (permanent, never lost) */
  current: number;
  /** Total Soul Power earned lifetime */
  totalEarned: number;
  /** Total Soul Power spent lifetime */
  totalSpent: number;
  /** List of all drops lifetime */
  drops: SoulPowerDrop[];
  /** Account creation timestamp */
  accountStartTime: number;
}

/**
 * Enemy type for Arcana drop calculations
 */
export type EnemyType = 'basic' | 'elite' | 'boss' | 'mini_boss';

/**
 * Boss type for special reward calculations
 */
export type BossType = 'ward_boss' | 'mini_boss' | 'elite_boss';

/**
 * Arcana drop configuration
 */
export interface ArcanaDropConfig {
  /** Base drop amount for basic enemies */
  baseDropAmount: number;
  /** Scaling factor per distance unit */
  distanceScalingFactor: number;
  /** Scaling factor per ward level */
  wardScalingFactor: number;
  /** Boss reward multiplier */
  bossRewardMultiplier: number;
  /** Elite enemy multiplier */
  eliteMultiplier: number;
  /** Mini-boss multiplier */
  miniBossMultiplier: number;
}

/**
 * Soul Power drop configuration
 */
export interface SoulPowerDropConfig {
  /** Base drop chance for basic enemies (0.03 = 3%) */
  baseDropChance: number;
  /** Base drop amount as percentage of Arcana (0.02 = 2%) */
  baseDropPercentage: number;
  /** Minimum drop amount */
  minDropAmount: number;
  /** Maximum drop amount */
  maxDropAmount: number;
  /** Scaling factor per distance unit (slower than Arcana) */
  distanceScalingFactor: number;
  /** Scaling factor per ward level (slower than Arcana) */
  wardScalingFactor: number;
  /** Boss reward chance multiplier */
  bossChanceMultiplier: number;
  /** Boss reward amount multiplier */
  bossAmountMultiplier: number;
  /** Elite enemy chance multiplier */
  eliteChanceMultiplier: number;
  /** Elite enemy amount multiplier */
  eliteAmountMultiplier: number;
  /** Mini-boss chance multiplier */
  miniBossChanceMultiplier: number;
  /** Mini-boss amount multiplier */
  miniBossAmountMultiplier: number;
}

/**
 * Arcana scaling calculation result
 */
export interface ArcanaScalingResult {
  /** Base drop amount */
  baseAmount: number;
  /** Distance scaling factor */
  distanceFactor: number;
  /** Ward scaling factor */
  wardFactor: number;
  /** Final scaling factor */
  totalFactor: number;
  /** Final drop amount */
  finalAmount: number;
}

/**
 * Soul Power scaling calculation result
 */
export interface SoulPowerScalingResult {
  /** Base drop chance */
  baseChance: number;
  /** Base drop amount */
  baseAmount: number;
  /** Distance scaling factor */
  distanceFactor: number;
  /** Ward scaling factor */
  wardFactor: number;
  /** Final scaling factor */
  totalFactor: number;
  /** Final drop chance */
  finalChance: number;
  /** Final drop amount */
  finalAmount: number;
  /** Whether the drop chance was triggered */
  triggered: boolean;
}

/**
 * Economic event for tracking
 */
export interface EconomicEvent {
  /** Event type */
  type: 'arcana_drop' | 'arcana_spend' | 'arcana_reset' | 'soul_power_drop' | 'soul_power_spend';
  /** Event data */
  data: ArcanaDrop | SoulPowerDrop | { amount: number; reason: string } | { journeyId: string };
  /** Event timestamp */
  timestamp: number;
}

/**
 * Economic system state
 */
export interface EconomicState {
  /** Current Arcana balance */
  arcanaBalance: ArcanaBalance;
  /** Current Soul Power balance */
  soulPowerBalance: SoulPowerBalance;
  /** Arcana configuration */
  arcanaConfig: ArcanaDropConfig;
  /** Soul Power configuration */
  soulPowerConfig: SoulPowerDropConfig;
  /** Current journey ID */
  journeyId: string;
  /** Journey start time */
  journeyStartTime: number;
}

/**
 * Arcana drop manager interface
 */
export interface ArcanaDropManager {
  /** Current Arcana balance */
  readonly balance: ArcanaBalance;
  /** Drop configuration */
  readonly config: ArcanaDropConfig;

  /** Drop Arcana from a source */
  dropArcana(amount: number, source: ArcanaSource): void;

  /** Calculate drop amount for an enemy */
  calculateDropAmount(enemyType: EnemyType, distance: number, ward: number): number;

  /** Collect Arcana (add to balance) */
  collectArcana(amount: number): void;

  /** Get current balance */
  getCurrentBalance(): number;

  /** Reset for new journey */
  resetForNewJourney(): void;

  /** Get drop history */
  getDropHistory(): ArcanaDrop[];
}

/**
 * Arcana scaling calculator interface
 */
export interface ArcanaScaling {
  /** Calculate scaling factor for distance and ward */
  calculateScalingFactor(distance: number, ward: number): number;

  /** Get base drop amount for enemy type */
  getBaseDropAmount(enemyType: EnemyType): number;

  /** Get boss reward multiplier */
  getBossRewardMultiplier(bossType: BossType): number;

  /** Calculate final drop amount */
  calculateDropAmount(enemyType: EnemyType, distance: number, ward: number): ArcanaScalingResult;
}

/**
 * Soul Power drop manager interface
 */
export interface SoulPowerDropManager {
  /** Current Soul Power balance */
  readonly balance: SoulPowerBalance;
  /** Drop configuration */
  readonly config: SoulPowerDropConfig;

  /** Drop Soul Power from a source */
  dropSoulPower(
    amount: number,
    source: SoulPowerSource,
    dropChance: number,
    scalingFactor?: number,
  ): void;

  /** Calculate drop chance and amount for an enemy */
  calculateSoulPowerDrop(
    enemyType: EnemyType,
    distance: number,
    ward: number,
    arcanaAmount: number,
  ): SoulPowerScalingResult;

  /** Collect Soul Power (add to balance) */
  collectSoulPower(amount: number): void;

  /** Get current balance */
  getCurrentBalance(): number;

  /** Spend Soul Power (permanent) */
  spendSoulPower(amount: number, reason: string): boolean;

  /** Get drop history */
  getDropHistory(): SoulPowerDrop[];

  /** Get lifetime statistics */
  getLifetimeStats(): {
    totalEarned: number;
    totalSpent: number;
    netGain: number;
    dropCount: number;
    accountAge: number;
  };
}

/**
 * Soul Power scaling calculator interface
 */
export interface SoulPowerScaling {
  /** Calculate drop chance for enemy type */
  calculateDropChance(enemyType: EnemyType, distance: number, ward: number): number;

  /** Calculate drop amount based on Arcana amount */
  calculateDropAmount(
    arcanaAmount: number,
    enemyType: EnemyType,
    distance: number,
    ward: number,
  ): number;

  /** Calculate final drop chance and amount */
  calculateSoulPowerDrop(
    enemyType: EnemyType,
    distance: number,
    ward: number,
    arcanaAmount: number,
  ): SoulPowerScalingResult;
}

// Re-export enchant types for convenience
export type {
  EnchantType,
  EnchantCategory,
  LocationType,
  EnchantSystem,
  EnchantConfig,
  EnchantManager,
  EnchantTransaction,
  SoulForgingTransaction,
  EnchantAnalytics,
} from './enchant-types.js';
