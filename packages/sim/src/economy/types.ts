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
 * Economic event for tracking
 */
export interface EconomicEvent {
  /** Event type */
  type: 'arcana_drop' | 'arcana_spend' | 'arcana_reset';
  /** Event data */
  data: ArcanaDrop | { amount: number; reason: string } | { journeyId: string };
  /** Event timestamp */
  timestamp: number;
}

/**
 * Economic system state
 */
export interface EconomicState {
  /** Current Arcana balance */
  arcanaBalance: ArcanaBalance;
  /** Economic configuration */
  config: ArcanaDropConfig;
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
