/**
 * @file Enemy family definitions and behaviors
 * @description P1-E2-S2: Different enemy families with unique AI behaviors
 */

import type { Family, SpawnedEnemy, Vector2 } from '../types.js';
import { EnemyAI } from '../ai/state-machine.js';
import { EnemyMovement } from '../ai/movement.js';
import { EnemyCombat } from '../ai/combat.js';
import type { AIBehaviorConfig } from '../ai/state-machine.js';
import type { MovementConfig } from '../ai/movement.js';
import type { CombatConfig } from '../ai/combat.js';

/**
 * Enemy family behavior configuration
 */
export interface EnemyFamilyConfig {
  /** Family identifier */
  family: Family;
  /** Family name */
  name: string;
  /** AI behavior configuration */
  aiConfig: AIBehaviorConfig;
  /** Movement configuration */
  movementConfig: MovementConfig;
  /** Combat configuration */
  combatConfig: CombatConfig;
  /** Visual properties */
  visual: {
    color: string;
    size: number;
    animationSpeed: number;
  };
}

/**
 * Enemy family manager
 */
export class EnemyFamilyManager {
  private familyConfigs: Map<Family, EnemyFamilyConfig>;
  private activeEnemies: Map<number, EnemyAI> = new Map();

  constructor() {
    this.familyConfigs = this.createFamilyConfigs();
  }

  /**
   * Create AI system for enemy
   * @param enemy - Enemy to create AI for
   * @param target - Initial target position
   * @returns AI system for the enemy
   */
  createAI(enemy: SpawnedEnemy, target: Vector2): EnemyAI {
    const familyConfig = this.familyConfigs.get(enemy.family);
    if (!familyConfig) {
      throw new Error(`Unknown enemy family: ${enemy.family}`);
    }

    // Create AI with family-specific configuration
    const ai = new EnemyAI(enemy, target);
    this.activeEnemies.set(enemy.id, ai);

    return ai;
  }

  /**
   * Create movement system for enemy
   * @param enemy - Enemy to create movement for
   * @param target - Initial target position
   * @returns Movement system for the enemy
   */
  createMovement(enemy: SpawnedEnemy, target: Vector2): EnemyMovement {
    const familyConfig = this.familyConfigs.get(enemy.family);
    if (!familyConfig) {
      throw new Error(`Unknown enemy family: ${enemy.family}`);
    }

    return new EnemyMovement(enemy, target, familyConfig.movementConfig);
  }

  /**
   * Create combat system for enemy
   * @param enemy - Enemy to create combat for
   * @param target - Initial target position
   * @returns Combat system for the enemy
   */
  createCombat(enemy: SpawnedEnemy, target: Vector2): EnemyCombat {
    const familyConfig = this.familyConfigs.get(enemy.family);
    if (!familyConfig) {
      throw new Error(`Unknown enemy family: ${enemy.family}`);
    }

    return new EnemyCombat(enemy, target, familyConfig.combatConfig);
  }

  /**
   * Get family configuration
   * @param family - Family identifier
   * @returns Family configuration
   */
  getFamilyConfig(family: Family): EnemyFamilyConfig | undefined {
    return this.familyConfigs.get(family);
  }

  /**
   * Get all family configurations
   * @returns Map of all family configurations
   */
  getAllFamilyConfigs(): Map<Family, EnemyFamilyConfig> {
    return new Map(this.familyConfigs);
  }

  /**
   * Remove AI system for enemy
   * @param enemyId - Enemy identifier
   */
  removeAI(enemyId: number): void {
    this.activeEnemies.delete(enemyId);
  }

  /**
   * Get active AI systems
   * @returns Map of active AI systems
   */
  getActiveAI(): Map<number, EnemyAI> {
    return new Map(this.activeEnemies);
  }

  /**
   * Create family-specific configurations
   * @returns Map of family configurations
   */
  private createFamilyConfigs(): Map<Family, EnemyFamilyConfig> {
    const configs = new Map<Family, EnemyFamilyConfig>();

    // Melee family (1) - Close combat specialists
    configs.set(1, {
      family: 1,
      name: 'Melee',
      aiConfig: {
        speedMultiplier: 1.0,
        attackRange: 50,
        attackDamage: 25,
        attackCooldown: 2000,
        stopDistance: 45,
        updateFrequency: 30,
      },
      movementConfig: {
        baseSpeed: 100,
        speedMultiplier: 1.0,
        maxVelocity: 150,
        acceleration: 600,
        deceleration: 400,
        avoidanceRadius: 25,
        updateFrequency: 30,
      },
      combatConfig: {
        attackRange: 50,
        attackDamage: 25,
        attackCooldown: 2000,
        attackDuration: 800,
        criticalChance: 0.15,
        criticalMultiplier: 2.5,
        animationDuration: 600,
      },
      visual: {
        color: '#ff4444',
        size: 20,
        animationSpeed: 1.0,
      },
    });

    // Ranged family (2) - Long-range specialists
    configs.set(2, {
      family: 2,
      name: 'Ranged',
      aiConfig: {
        speedMultiplier: 0.8,
        attackRange: 150,
        attackDamage: 15,
        attackCooldown: 1000,
        stopDistance: 140,
        updateFrequency: 60,
      },
      movementConfig: {
        baseSpeed: 80,
        speedMultiplier: 0.8,
        maxVelocity: 120,
        acceleration: 400,
        deceleration: 300,
        avoidanceRadius: 35,
        updateFrequency: 60,
      },
      combatConfig: {
        attackRange: 150,
        attackDamage: 15,
        attackCooldown: 1000,
        attackDuration: 400,
        criticalChance: 0.1,
        criticalMultiplier: 2.0,
        animationDuration: 300,
      },
      visual: {
        color: '#4444ff',
        size: 15,
        animationSpeed: 1.2,
      },
    });

    return configs;
  }
}

/**
 * Global enemy family manager instance
 */
export const enemyFamilyManager = new EnemyFamilyManager();
