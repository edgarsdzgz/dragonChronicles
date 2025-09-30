/**
 * Targeting strategy implementations for Draconia Chronicles
 * Provides 15+ different targeting strategies for player customization
 */

import type {
  Dragon,
  Enemy,
  TargetingStrategy,
  TargetingStrategyHandler,
  ElementalType,
} from './types.js';
import { createRangeDetection } from './range-detection.js';
import { createThreatAssessment } from './threat-assessment.js';

/**
 * Base strategy handler implementation
 */
abstract class BaseStrategyHandler implements TargetingStrategyHandler {
  constructor(
    public _strategy: TargetingStrategy,
    public _isUnlocked: boolean = true,
  ) {}

  abstract calculate(_enemies: Enemy[], _dragon: Dragon): Enemy | null;
  abstract getDescription(): string;

  isUnlocked(): boolean {
    return this.isUnlocked;
  }

  /**
   * Filter enemies that are alive and in range
   */
  protected filterValidEnemies(enemies: Enemy[], dragon: Dragon): Enemy[] {
    const rangeDetection = createRangeDetection(dragon.attackRange);
    return enemies.filter((enemy) => enemy.isAlive && rangeDetection.isWithinRange(dragon, enemy));
  }

  /**
   * Calculate distance between dragon and enemy
   */
  protected calculateDistance(dragon: Dragon, enemy: Enemy): number {
    const dx = dragon.position.x - enemy.position.x;
    const dy = dragon.position.y - enemy.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

/**
 * Closest enemy strategy
 */
export class ClosestStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('closest', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    let closestEnemy: Enemy | null = null;
    let closestDistance = Infinity;

    for (const enemy of validEnemies) {
      const distance = this.calculateDistance(dragon, enemy);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }

    return closestEnemy;
  }

  getDescription(): string {
    return 'Target the nearest enemy in range';
  }
}

/**
 * Highest threat strategy
 */
export class HighestThreatStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('highest_threat', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    const threatAssessment = createThreatAssessment();
    let highestThreatEnemy: Enemy | null = null;
    let highestThreat = -Infinity;

    for (const enemy of validEnemies) {
      const distance = this.calculateDistance(dragon, enemy);
      const threat = threatAssessment.calculateThreatLevel(enemy, dragon, distance);

      if (threat > highestThreat) {
        highestThreat = threat;
        highestThreatEnemy = enemy;
      }
    }

    return highestThreatEnemy;
  }

  getDescription(): string {
    return 'Target the most dangerous enemy';
  }
}

/**
 * Lowest threat strategy
 */
export class LowestThreatStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('lowest_threat', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    const threatAssessment = createThreatAssessment();
    let lowestThreatEnemy: Enemy | null = null;
    let lowestThreat = Infinity;

    for (const enemy of validEnemies) {
      const distance = this.calculateDistance(dragon, enemy);
      const threat = threatAssessment.calculateThreatLevel(enemy, dragon, distance);

      if (threat < lowestThreat) {
        lowestThreat = threat;
        lowestThreatEnemy = enemy;
      }
    }

    return lowestThreatEnemy;
  }

  getDescription(): string {
    return 'Target the easiest enemy to kill';
  }
}

/**
 * Highest HP strategy
 */
export class HighestHpStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('highest_hp', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    let highestHpEnemy: Enemy | null = null;
    let highestHp = -1;

    for (const enemy of validEnemies) {
      if (enemy.health.current > highestHp) {
        highestHp = enemy.health.current;
        highestHpEnemy = enemy;
      }
    }

    return highestHpEnemy;
  }

  getDescription(): string {
    return 'Target the enemy with the most health';
  }
}

/**
 * Lowest HP strategy
 */
export class LowestHpStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('lowest_hp', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    let lowestHpEnemy: Enemy | null = null;
    let lowestHp = Infinity;

    for (const enemy of validEnemies) {
      if (enemy.health.current < lowestHp) {
        lowestHp = enemy.health.current;
        lowestHpEnemy = enemy;
      }
    }

    return lowestHpEnemy;
  }

  getDescription(): string {
    return 'Target the enemy with the least health';
  }
}

/**
 * Highest damage strategy
 */
export class HighestDamageStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('highest_damage', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    let highestDamageEnemy: Enemy | null = null;
    let highestDamage = -1;

    for (const enemy of validEnemies) {
      if (enemy.damage > highestDamage) {
        highestDamage = enemy.damage;
        highestDamageEnemy = enemy;
      }
    }

    return highestDamageEnemy;
  }

  getDescription(): string {
    return 'Target the enemy dealing the most damage';
  }
}

/**
 * Lowest damage strategy
 */
export class LowestDamageStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('lowest_damage', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    let lowestDamageEnemy: Enemy | null = null;
    let lowestDamage = Infinity;

    for (const enemy of validEnemies) {
      if (enemy.damage < lowestDamage) {
        lowestDamage = enemy.damage;
        lowestDamageEnemy = enemy;
      }
    }

    return lowestDamageEnemy;
  }

  getDescription(): string {
    return 'Target the enemy dealing the least damage';
  }
}

/**
 * Fastest enemy strategy
 */
export class FastestStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('fastest', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    let fastestEnemy: Enemy | null = null;
    let highestSpeed = -1;

    for (const enemy of validEnemies) {
      if (enemy.speed > highestSpeed) {
        highestSpeed = enemy.speed;
        fastestEnemy = enemy;
      }
    }

    return fastestEnemy;
  }

  getDescription(): string {
    return 'Target the fastest moving enemy';
  }
}

/**
 * Slowest enemy strategy
 */
export class SlowestStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('slowest', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    let slowestEnemy: Enemy | null = null;
    let lowestSpeed = Infinity;

    for (const enemy of validEnemies) {
      if (enemy.speed < lowestSpeed) {
        lowestSpeed = enemy.speed;
        slowestEnemy = enemy;
      }
    }

    return slowestEnemy;
  }

  getDescription(): string {
    return 'Target the slowest moving enemy';
  }
}

/**
 * Highest armor strategy
 */
export class HighestArmorStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('highest_armor', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    let highestArmorEnemy: Enemy | null = null;
    let highestArmor = -1;

    for (const enemy of validEnemies) {
      if (enemy.armor > highestArmor) {
        highestArmor = enemy.armor;
        highestArmorEnemy = enemy;
      }
    }

    return highestArmorEnemy;
  }

  getDescription(): string {
    return 'Target the enemy with the most armor';
  }
}

/**
 * Lowest armor strategy
 */
export class LowestArmorStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('lowest_armor', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    let lowestArmorEnemy: Enemy | null = null;
    let lowestArmor = Infinity;

    for (const enemy of validEnemies) {
      if (enemy.armor < lowestArmor) {
        lowestArmor = enemy.armor;
        lowestArmorEnemy = enemy;
      }
    }

    return lowestArmorEnemy;
  }

  getDescription(): string {
    return 'Target the enemy with the least armor';
  }
}

/**
 * Shielded enemies strategy
 */
export class ShieldedStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('shielded', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    // First, try to find shielded enemies
    const shieldedEnemies = validEnemies.filter((enemy) => enemy.shield > 0);

    if (shieldedEnemies.length > 0) {
      // Return closest shielded enemy
      let closestShielded: Enemy | null = null;
      let closestDistance = Infinity;

      for (const enemy of shieldedEnemies) {
        const distance = this.calculateDistance(dragon, enemy);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestShielded = enemy;
        }
      }

      return closestShielded;
    }

    // If no shielded enemies, fall back to closest enemy
    return new ClosestStrategyHandler().calculate(enemies, dragon);
  }

  getDescription(): string {
    return 'Target shielded enemies first';
  }
}

/**
 * Unshielded enemies strategy
 */
export class UnshieldedStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('unshielded', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    // First, try to find unshielded enemies
    const unshieldedEnemies = validEnemies.filter((enemy) => enemy.shield === 0);

    if (unshieldedEnemies.length > 0) {
      // Return closest unshielded enemy
      let closestUnshielded: Enemy | null = null;
      let closestDistance = Infinity;

      for (const enemy of unshieldedEnemies) {
        const distance = this.calculateDistance(dragon, enemy);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestUnshielded = enemy;
        }
      }

      return closestUnshielded;
    }

    // If no unshielded enemies, fall back to closest enemy
    return new ClosestStrategyHandler().calculate(enemies, dragon);
  }

  getDescription(): string {
    return 'Target unshielded enemies first';
  }
}

/**
 * Elemental weak strategy
 */
export class ElementalWeakStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('elemental_weak', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    const _threatAssessment = createThreatAssessment();
    let bestWeakEnemy: Enemy | null = null;
    let bestWeakness = -1;

    for (const enemy of validEnemies) {
      if (!enemy.elementalType) continue;

      const _distance = this.calculateDistance(dragon, enemy);
      const elementalFactor = this.calculateElementalWeakness(
        dragon.elementalType,
        enemy.elementalType,
      );

      if (elementalFactor > bestWeakness) {
        bestWeakness = elementalFactor;
        bestWeakEnemy = enemy;
      }
    }

    // If no elemental enemies, fall back to closest
    return bestWeakEnemy || new ClosestStrategyHandler().calculate(enemies, dragon);
  }

  private calculateElementalWeakness(
    dragonElement: ElementalType,
    enemyElement: ElementalType,
  ): number {
    // Heat triangle
    if (
      dragonElement === 'fire' &&
      (enemyElement === 'ice' || enemyElement === 'frost' || enemyElement === 'mist')
    ) {
      return 1.5; // Strong against cold
    }
    if (
      dragonElement === 'lava' &&
      (enemyElement === 'ice' || enemyElement === 'frost' || enemyElement === 'mist')
    ) {
      return 1.5;
    }
    if (
      dragonElement === 'steam' &&
      (enemyElement === 'ice' || enemyElement === 'frost' || enemyElement === 'mist')
    ) {
      return 1.5;
    }

    // Cold triangle
    if (
      dragonElement === 'ice' &&
      (enemyElement === 'lightning' || enemyElement === 'plasma' || enemyElement === 'void')
    ) {
      return 1.5; // Strong against energy
    }
    if (
      dragonElement === 'frost' &&
      (enemyElement === 'lightning' || enemyElement === 'plasma' || enemyElement === 'void')
    ) {
      return 1.5;
    }
    if (
      dragonElement === 'mist' &&
      (enemyElement === 'lightning' || enemyElement === 'plasma' || enemyElement === 'void')
    ) {
      return 1.5;
    }

    // Energy triangle
    if (
      dragonElement === 'lightning' &&
      (enemyElement === 'fire' || enemyElement === 'lava' || enemyElement === 'steam')
    ) {
      return 1.5; // Strong against heat
    }
    if (
      dragonElement === 'plasma' &&
      (enemyElement === 'fire' || enemyElement === 'lava' || enemyElement === 'steam')
    ) {
      return 1.5;
    }
    if (
      dragonElement === 'void' &&
      (enemyElement === 'fire' || enemyElement === 'lava' || enemyElement === 'steam')
    ) {
      return 1.5;
    }

    return 1.0; // Neutral
  }

  getDescription(): string {
    return 'Target enemies weak to your element';
  }
}

/**
 * Elemental strong strategy
 */
export class ElementalStrongStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('elemental_strong', true);
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    const validEnemies = this.filterValidEnemies(enemies, dragon);
    if (validEnemies.length === 0) return null;

    let bestStrongEnemy: Enemy | null = null;
    let bestStrength = -1;

    for (const enemy of validEnemies) {
      if (!enemy.elementalType) continue;

      const elementalFactor = this.calculateElementalStrength(
        dragon.elementalType,
        enemy.elementalType,
      );

      if (elementalFactor > bestStrength) {
        bestStrength = elementalFactor;
        bestStrongEnemy = enemy;
      }
    }

    // If no elemental enemies, fall back to closest
    return bestStrongEnemy || new ClosestStrategyHandler().calculate(enemies, dragon);
  }

  private calculateElementalStrength(
    dragonElement: ElementalType,
    enemyElement: ElementalType,
  ): number {
    // Heat triangle
    if (
      dragonElement === 'fire' &&
      (enemyElement === 'lightning' || enemyElement === 'plasma' || enemyElement === 'void')
    ) {
      return 0.75; // Weak against energy
    }
    if (
      dragonElement === 'lava' &&
      (enemyElement === 'lightning' || enemyElement === 'plasma' || enemyElement === 'void')
    ) {
      return 0.75;
    }
    if (
      dragonElement === 'steam' &&
      (enemyElement === 'lightning' || enemyElement === 'plasma' || enemyElement === 'void')
    ) {
      return 0.75;
    }

    // Cold triangle
    if (
      dragonElement === 'ice' &&
      (enemyElement === 'fire' || enemyElement === 'lava' || enemyElement === 'steam')
    ) {
      return 0.75; // Weak against heat
    }
    if (
      dragonElement === 'frost' &&
      (enemyElement === 'fire' || enemyElement === 'lava' || enemyElement === 'steam')
    ) {
      return 0.75;
    }
    if (
      dragonElement === 'mist' &&
      (enemyElement === 'fire' || enemyElement === 'lava' || enemyElement === 'steam')
    ) {
      return 0.75;
    }

    // Energy triangle
    if (
      dragonElement === 'lightning' &&
      (enemyElement === 'ice' || enemyElement === 'frost' || enemyElement === 'mist')
    ) {
      return 0.75; // Weak against cold
    }
    if (
      dragonElement === 'plasma' &&
      (enemyElement === 'ice' || enemyElement === 'frost' || enemyElement === 'mist')
    ) {
      return 0.75;
    }
    if (
      dragonElement === 'void' &&
      (enemyElement === 'ice' || enemyElement === 'frost' || enemyElement === 'mist')
    ) {
      return 0.75;
    }

    return 1.0; // Neutral
  }

  getDescription(): string {
    return 'Target enemies strong against your element';
  }
}

/**
 * Custom strategy handler (placeholder for future expansion)
 */
export class CustomStrategyHandler extends BaseStrategyHandler {
  constructor() {
    super('custom', false); // Not unlocked by default
  }

  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null {
    // Placeholder for custom strategy logic
    // Would be implemented based on player-defined rules
    return new ClosestStrategyHandler().calculate(enemies, dragon);
  }

  getDescription(): string {
    return 'Custom targeting strategy (unlocked later)';
  }
}

/**
 * Strategy registry for managing all targeting strategies
 */
export class TargetingStrategyRegistry {
  private strategies: Map<TargetingStrategy, TargetingStrategyHandler> = new Map();

  constructor() {
    this.registerDefaultStrategies();
  }

  /**
   * Register all default strategies
   */
  private registerDefaultStrategies(): void {
    this.strategies.set('closest', new ClosestStrategyHandler());
    this.strategies.set('highest_threat', new HighestThreatStrategyHandler());
    this.strategies.set('lowest_threat', new LowestThreatStrategyHandler());
    this.strategies.set('highest_hp', new HighestHpStrategyHandler());
    this.strategies.set('lowest_hp', new LowestHpStrategyHandler());
    this.strategies.set('highest_damage', new HighestDamageStrategyHandler());
    this.strategies.set('lowest_damage', new LowestDamageStrategyHandler());
    this.strategies.set('fastest', new FastestStrategyHandler());
    this.strategies.set('slowest', new SlowestStrategyHandler());
    this.strategies.set('highest_armor', new HighestArmorStrategyHandler());
    this.strategies.set('lowest_armor', new LowestArmorStrategyHandler());
    this.strategies.set('shielded', new ShieldedStrategyHandler());
    this.strategies.set('unshielded', new UnshieldedStrategyHandler());
    this.strategies.set('elemental_weak', new ElementalWeakStrategyHandler());
    this.strategies.set('elemental_strong', new ElementalStrongStrategyHandler());
    this.strategies.set('custom', new CustomStrategyHandler());
  }

  /**
   * Get strategy handler by name
   */
  getStrategy(strategy: TargetingStrategy): TargetingStrategyHandler | undefined {
    return this.strategies.get(strategy);
  }

  /**
   * Get all available strategies
   */
  getAllStrategies(): TargetingStrategyHandler[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get unlocked strategies only
   */
  getUnlockedStrategies(): TargetingStrategyHandler[] {
    return this.getAllStrategies().filter((strategy) => strategy.isUnlocked());
  }

  /**
   * Register a custom strategy
   */
  registerStrategy(strategy: TargetingStrategy, handler: TargetingStrategyHandler): void {
    this.strategies.set(strategy, handler);
  }

  /**
   * Unregister a strategy
   */
  unregisterStrategy(strategy: TargetingStrategy): boolean {
    return this.strategies.delete(strategy);
  }

  /**
   * Get strategy descriptions
   */
  getStrategyDescriptions(): Map<TargetingStrategy, string> {
    const descriptions = new Map<TargetingStrategy, string>();
    for (const [strategy, handler] of this.strategies) {
      descriptions.set(strategy, handler.getDescription());
    }
    return descriptions;
  }
}

/**
 * Create a strategy registry instance
 */
export function createStrategyRegistry(): TargetingStrategyRegistry {
  return new TargetingStrategyRegistry();
}

/**
 * Utility functions for strategy management
 */
export const StrategyUtils = {
  /**
   * Get strategy by name
   */
  getStrategyByName(name: string): TargetingStrategy | null {
    const validStrategies: TargetingStrategy[] = [
      'closest',
      'highest_threat',
      'lowest_threat',
      'highest_hp',
      'lowest_hp',
      'highest_damage',
      'lowest_damage',
      'fastest',
      'slowest',
      'highest_armor',
      'lowest_armor',
      'shielded',
      'unshielded',
      'elemental_weak',
      'elemental_strong',
      'custom',
    ];

    return validStrategies.includes(name as TargetingStrategy) ? (name as TargetingStrategy) : null;
  },

  /**
   * Check if strategy is valid
   */
  isValidStrategy(strategy: string): strategy is TargetingStrategy {
    return StrategyUtils.getStrategyByName(strategy) !== null;
  },

  /**
   * Get strategy category
   */
  getStrategyCategory(strategy: TargetingStrategy): string {
    if (['closest', 'highest_threat', 'lowest_threat'].includes(strategy)) {
      return 'Basic';
    }
    if (['highest_hp', 'lowest_hp'].includes(strategy)) {
      return 'Health';
    }
    if (['highest_damage', 'lowest_damage'].includes(strategy)) {
      return 'Damage';
    }
    if (['fastest', 'slowest'].includes(strategy)) {
      return 'Speed';
    }
    if (['highest_armor', 'lowest_armor', 'shielded', 'unshielded'].includes(strategy)) {
      return 'Defense';
    }
    if (['elemental_weak', 'elemental_strong'].includes(strategy)) {
      return 'Elemental';
    }
    if (strategy === 'custom') {
      return 'Advanced';
    }
    return 'Unknown';
  },
};
