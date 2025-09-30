/**
 * Threat assessment system for Draconia Chronicles targeting
 * Calculates threat levels and factors for enemy prioritization
 */

import type {
  Dragon,
  Enemy,
  ThreatFactor,
  ThreatAssessment,
  TargetingStrategy,
  ElementalType,
} from './types.js';

/**
 * Threat factor weights for different strategies
 */
interface ThreatWeights {
  proximity: number;
  health: number;
  damage: number;
  speed: number;
  armor: number;
  shield: number;
  elemental: number;
}

/**
 * Default threat assessment implementation
 * Calculates threat levels based on multiple factors
 */
export class DefaultThreatAssessment {
  private readonly weights: Map<TargetingStrategy, ThreatWeights> = new Map();
  private readonly elementalEffectiveness: Map<string, number> = new Map();

  constructor() {
    this.initializeWeights();
    this.initializeElementalEffectiveness();
  }

  /**
   * Initialize threat weights for different targeting strategies
   */
  private initializeWeights(): void {
    // Closest strategy - prioritize proximity
    this.weights.set('closest', {
      proximity: 1.0,
      health: 0.0,
      damage: 0.0,
      speed: 0.0,
      armor: 0.0,
      shield: 0.0,
      elemental: 0.0,
    });

    // Highest threat strategy - balance all factors
    this.weights.set('highest_threat', {
      proximity: 0.3,
      health: 0.2,
      damage: 0.3,
      speed: 0.1,
      armor: 0.05,
      shield: 0.05,
      elemental: 0.0,
    });

    // Lowest threat strategy - prioritize weak enemies
    this.weights.set('lowest_threat', {
      proximity: 0.2,
      health: -0.3, // Negative weight for low health
      damage: -0.2, // Negative weight for low damage
      speed: 0.1,
      armor: -0.1, // Negative weight for low armor
      shield: -0.1, // Negative weight for no shield
      elemental: 0.0,
    });

    // Health-based strategies
    this.weights.set('highest_hp', {
      proximity: 0.1,
      health: 1.0,
      damage: 0.0,
      speed: 0.0,
      armor: 0.0,
      shield: 0.0,
      elemental: 0.0,
    });

    this.weights.set('lowest_hp', {
      proximity: 0.1,
      health: -1.0, // Negative weight for low health
      damage: 0.0,
      speed: 0.0,
      armor: 0.0,
      shield: 0.0,
      elemental: 0.0,
    });

    // Damage-based strategies
    this.weights.set('highest_damage', {
      proximity: 0.1,
      health: 0.0,
      damage: 1.0,
      speed: 0.0,
      armor: 0.0,
      shield: 0.0,
      elemental: 0.0,
    });

    this.weights.set('lowest_damage', {
      proximity: 0.1,
      health: 0.0,
      damage: -1.0, // Negative weight for low damage
      speed: 0.0,
      armor: 0.0,
      shield: 0.0,
      elemental: 0.0,
    });

    // Speed-based strategies
    this.weights.set('fastest', {
      proximity: 0.1,
      health: 0.0,
      damage: 0.0,
      speed: 1.0,
      armor: 0.0,
      shield: 0.0,
      elemental: 0.0,
    });

    this.weights.set('slowest', {
      proximity: 0.1,
      health: 0.0,
      damage: 0.0,
      speed: -1.0, // Negative weight for slow speed
      armor: 0.0,
      shield: 0.0,
      elemental: 0.0,
    });

    // Armor-based strategies
    this.weights.set('highest_armor', {
      proximity: 0.1,
      health: 0.0,
      damage: 0.0,
      speed: 0.0,
      armor: 1.0,
      shield: 0.0,
      elemental: 0.0,
    });

    this.weights.set('lowest_armor', {
      proximity: 0.1,
      health: 0.0,
      damage: 0.0,
      speed: 0.0,
      armor: -1.0, // Negative weight for low armor
      shield: 0.0,
      elemental: 0.0,
    });

    // Shield-based strategies
    this.weights.set('shielded', {
      proximity: 0.1,
      health: 0.0,
      damage: 0.0,
      speed: 0.0,
      armor: 0.0,
      shield: 1.0,
      elemental: 0.0,
    });

    this.weights.set('unshielded', {
      proximity: 0.1,
      health: 0.0,
      damage: 0.0,
      speed: 0.0,
      armor: 0.0,
      shield: -1.0, // Negative weight for no shield
      elemental: 0.0,
    });

    // Elemental strategies
    this.weights.set('elemental_weak', {
      proximity: 0.1,
      health: 0.0,
      damage: 0.0,
      speed: 0.0,
      armor: 0.0,
      shield: 0.0,
      elemental: 1.0,
    });

    this.weights.set('elemental_strong', {
      proximity: 0.1,
      health: 0.0,
      damage: 0.0,
      speed: 0.0,
      armor: 0.0,
      shield: 0.0,
      elemental: -1.0, // Negative weight for strong against dragon
    });
  }

  /**
   * Initialize elemental effectiveness matrix
   */
  private initializeElementalEffectiveness(): void {
    // Heat triangle
    this.elementalEffectiveness.set('fire->ice', 1.5); // Fire strong against ice
    this.elementalEffectiveness.set('fire->frost', 1.5);
    this.elementalEffectiveness.set('fire->mist', 1.5);
    this.elementalEffectiveness.set('fire->fire', 1.0); // Neutral
    this.elementalEffectiveness.set('fire->lava', 1.0);
    this.elementalEffectiveness.set('fire->steam', 1.0);
    this.elementalEffectiveness.set('fire->lightning', 0.75); // Weak against lightning
    this.elementalEffectiveness.set('fire->plasma', 0.75);
    this.elementalEffectiveness.set('fire->void', 0.75);

    // Cold triangle
    this.elementalEffectiveness.set('ice->lightning', 1.5); // Ice strong against lightning
    this.elementalEffectiveness.set('ice->plasma', 1.5);
    this.elementalEffectiveness.set('ice->void', 1.5);
    this.elementalEffectiveness.set('ice->ice', 1.0); // Neutral
    this.elementalEffectiveness.set('ice->frost', 1.0);
    this.elementalEffectiveness.set('ice->mist', 1.0);
    this.elementalEffectiveness.set('ice->fire', 0.75); // Weak against fire
    this.elementalEffectiveness.set('ice->lava', 0.75);
    this.elementalEffectiveness.set('ice->steam', 0.75);

    // Energy triangle
    this.elementalEffectiveness.set('lightning->fire', 1.5); // Lightning strong against fire
    this.elementalEffectiveness.set('lightning->lava', 1.5);
    this.elementalEffectiveness.set('lightning->steam', 1.5);
    this.elementalEffectiveness.set('lightning->lightning', 1.0); // Neutral
    this.elementalEffectiveness.set('lightning->plasma', 1.0);
    this.elementalEffectiveness.set('lightning->void', 1.0);
    this.elementalEffectiveness.set('lightning->ice', 0.75); // Weak against ice
    this.elementalEffectiveness.set('lightning->frost', 0.75);
    this.elementalEffectiveness.set('lightning->mist', 0.75);

    // Add other elemental combinations...
    // (This would be expanded with all combinations)
  }

  /**
   * Calculate threat assessment for an enemy
   */
  calculateThreatAssessment(
    enemy: Enemy,
    dragon: Dragon,
    strategy: TargetingStrategy,
    distance: number,
  ): ThreatAssessment {
    const weights = this.weights.get(strategy) || this.weights.get('highest_threat')!;
    const factors: ThreatFactor[] = [];

    // Calculate proximity factor (closer = higher threat)
    const proximityFactor = this.calculateProximityFactor(distance, dragon.attackRange);
    factors.push({
      type: 'proximity',
      weight: weights.proximity,
      value: proximityFactor,
      normalizedValue: proximityFactor,
    });

    // Calculate health factor
    const healthFactor = this.calculateHealthFactor(enemy);
    factors.push({
      type: 'health',
      weight: weights.health,
      value: healthFactor,
      normalizedValue: healthFactor,
    });

    // Calculate damage factor
    const damageFactor = this.calculateDamageFactor(enemy);
    factors.push({
      type: 'damage',
      weight: weights.damage,
      value: damageFactor,
      normalizedValue: damageFactor,
    });

    // Calculate speed factor
    const speedFactor = this.calculateSpeedFactor(enemy);
    factors.push({
      type: 'speed',
      weight: weights.speed,
      value: speedFactor,
      normalizedValue: speedFactor,
    });

    // Calculate armor factor
    const armorFactor = this.calculateArmorFactor(enemy);
    factors.push({
      type: 'armor',
      weight: weights.armor,
      value: armorFactor,
      normalizedValue: armorFactor,
    });

    // Calculate shield factor
    const shieldFactor = this.calculateShieldFactor(enemy);
    factors.push({
      type: 'shield',
      weight: weights.shield,
      value: shieldFactor,
      normalizedValue: shieldFactor,
    });

    // Calculate elemental factor
    const elementalFactor = this.calculateElementalFactor(enemy, dragon);
    factors.push({
      type: 'elemental',
      weight: weights.elemental,
      value: elementalFactor,
      normalizedValue: elementalFactor,
    });

    // Calculate total threat
    const totalThreat = factors.reduce((sum, factor) => {
      return sum + factor.value * factor.weight;
    }, 0);

    return {
      enemy,
      totalThreat,
      factors,
      strategy,
    };
  }

  /**
   * Calculate proximity factor (0-1, closer = higher)
   */
  private calculateProximityFactor(distance: number, maxRange: number): number {
    if (distance >= maxRange) return 0;
    return 1 - distance / maxRange;
  }

  /**
   * Calculate health factor (0-1, based on health percentage)
   */
  private calculateHealthFactor(enemy: Enemy): number {
    if (enemy.health.max === 0) return 0;
    return enemy.health.current / enemy.health.max;
  }

  /**
   * Calculate damage factor (0-1, normalized damage)
   */
  private calculateDamageFactor(enemy: Enemy): number {
    // Normalize damage based on expected range (0-100 damage)
    const maxExpectedDamage = 100;
    return Math.min(enemy.damage / maxExpectedDamage, 1.0);
  }

  /**
   * Calculate speed factor (0-1, normalized speed)
   */
  private calculateSpeedFactor(enemy: Enemy): number {
    // Normalize speed based on expected range (0-200 speed)
    const maxExpectedSpeed = 200;
    return Math.min(enemy.speed / maxExpectedSpeed, 1.0);
  }

  /**
   * Calculate armor factor (0-1, normalized armor)
   */
  private calculateArmorFactor(enemy: Enemy): number {
    // Normalize armor based on expected range (0-50 armor)
    const maxExpectedArmor = 50;
    return Math.min(enemy.armor / maxExpectedArmor, 1.0);
  }

  /**
   * Calculate shield factor (0-1, shield presence)
   */
  private calculateShieldFactor(enemy: Enemy): number {
    return enemy.shield > 0 ? 1.0 : 0.0;
  }

  /**
   * Calculate elemental factor based on dragon's element vs enemy's resistance
   */
  private calculateElementalFactor(enemy: Enemy, dragon: Dragon): number {
    if (!enemy.elementalType || !dragon.elementalType) return 0.5; // Neutral

    const effectivenessKey = `${dragon.elementalType}->${enemy.elementalType}`;
    const effectiveness = this.elementalEffectiveness.get(effectivenessKey) || 1.0;

    // Consider enemy's elemental resistance
    const resistance = enemy.elementalResistance?.[dragon.elementalType] || 0;
    const resistanceMultiplier = 1 - resistance / 100; // Convert percentage to multiplier

    return effectiveness * resistanceMultiplier;
  }

  /**
   * Get threat weights for a specific strategy
   */
  getThreatWeights(strategy: TargetingStrategy): ThreatWeights {
    return this.weights.get(strategy) || this.weights.get('highest_threat')!;
  }

  /**
   * Update threat weights for a strategy
   */
  updateThreatWeights(strategy: TargetingStrategy, weights: Partial<ThreatWeights>): void {
    const currentWeights = this.weights.get(strategy) || this.weights.get('highest_threat')!;
    this.weights.set(strategy, { ...currentWeights, ...weights });
  }

  /**
   * Get elemental effectiveness between two elements
   */
  getElementalEffectiveness(
    attackerElement: ElementalType,
    defenderElement: ElementalType,
  ): number {
    const key = `${attackerElement}->${defenderElement}`;
    return this.elementalEffectiveness.get(key) || 1.0;
  }

  /**
   * Calculate threat level for an enemy (simplified version)
   */
  calculateThreatLevel(enemy: Enemy, dragon: Dragon, distance: number): number {
    const assessment = this.calculateThreatAssessment(enemy, dragon, 'highest_threat', distance);
    return assessment.totalThreat;
  }

  /**
   * Sort enemies by threat level
   */
  sortEnemiesByThreat(
    enemies: Enemy[],
    dragon: Dragon,
    strategy: TargetingStrategy,
    distances: Map<string, number>,
  ): Enemy[] {
    return enemies
      .map((enemy) => {
        const distance = distances.get(enemy.id) || 0;
        const assessment = this.calculateThreatAssessment(enemy, dragon, strategy, distance);
        return { enemy, threat: assessment.totalThreat };
      })
      .sort((a, b) => b.threat - a.threat) // Sort by threat descending
      .map((item) => item.enemy);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    strategyCount: number;
    elementalEffectivenessCount: number;
    averageCalculationTime: number;
  } {
    return {
      strategyCount: this.weights.size,
      elementalEffectivenessCount: this.elementalEffectiveness.size,
      averageCalculationTime: 0, // Would be calculated in real implementation
    };
  }
}

/**
 * Create a default threat assessment instance
 */
export function createThreatAssessment(): DefaultThreatAssessment {
  return new DefaultThreatAssessment();
}

/**
 * Utility functions for threat calculations
 */
export const ThreatUtils = {
  /**
   * Normalize a value to 0-1 range
   */
  normalize(value: number, min: number, max: number): number {
    if (max === min) return 0;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  },

  /**
   * Calculate weighted average
   */
  weightedAverage(values: number[], weights: number[]): number {
    if (values.length !== weights.length) {
      throw new Error('Values and weights arrays must have the same length');
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = values.reduce((sum, value, index) => {
      return sum + value * (weights[index] || 0);
    }, 0);

    return weightedSum / totalWeight;
  },

  /**
   * Calculate threat difference between two enemies
   */
  threatDifference(threat1: number, threat2: number): number {
    return Math.abs(threat1 - threat2);
  },

  /**
   * Check if threat difference is significant
   */
  isSignificantDifference(threat1: number, threat2: number, threshold = 0.1): boolean {
    return ThreatUtils.threatDifference(threat1, threat2) > threshold;
  },
};
