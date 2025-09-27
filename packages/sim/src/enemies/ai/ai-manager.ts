/**
 * @file AI Manager for coordinating enemy AI systems
 * @description P1-E2-S2: Central AI management system for all enemy AI
 */

import type { SpawnedEnemy, Vector2, Family } from '../types.js';
import { EnemyAI } from './state-machine.js';
import { EnemyMovement } from './movement.js';
import { EnemyCombat } from './combat.js';
import { enemyFamilyManager } from '../families/enemy-families.js';

/**
 * AI system for a single enemy
 */
export interface EnemyAISystem {
  /** AI state machine */
  ai: EnemyAI;
  /** Movement system */
  movement: EnemyMovement;
  /** Combat system */
  combat: EnemyCombat;
  /** Enemy reference */
  enemy: SpawnedEnemy;
}

/**
 * AI manager configuration
 */
export interface AIManagerConfig {
  /** Maximum AI updates per frame */
  maxUpdatesPerFrame: number;
  /** AI update frequency (FPS) */
  updateFrequency: number;
  /** Enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  /** Enable debug logging */
  enableDebugLogging: boolean;
}

/**
 * AI performance statistics
 */
export interface AIPerformanceStats {
  /** Total AI systems */
  totalSystems: number;
  /** Active AI systems */
  activeSystems: number;
  /** Average update time per system (ms) */
  averageUpdateTime: number;
  /** Total update time (ms) */
  totalUpdateTime: number;
  /** Systems by family */
  systemsByFamily: Record<Family, number>;
  /** Performance warnings */
  warnings: string[];
}

/**
 * Default AI manager configuration
 */
export const DEFAULT_AI_MANAGER_CONFIG: AIManagerConfig = {
  maxUpdatesPerFrame: 200,
  updateFrequency: 60,
  enablePerformanceMonitoring: true,
  enableDebugLogging: false,
};

/**
 * AI Manager for coordinating all enemy AI systems
 */
export class AIManager {
  private aiSystems: Map<number, EnemyAISystem> = new Map();
  private config: AIManagerConfig;
  private performanceStats: AIPerformanceStats;
  private updateAccumulator: number = 0;

  constructor(config: AIManagerConfig = DEFAULT_AI_MANAGER_CONFIG) {
    this.config = config;
    this.performanceStats = {
      totalSystems: 0,
      activeSystems: 0,
      averageUpdateTime: 0,
      totalUpdateTime: 0,
      systemsByFamily: { 1: 0, 2: 0 },
      warnings: [],
    };
  }

  /**
   * Create AI system for enemy
   * @param enemy - Enemy to create AI for
   * @param target - Initial target position
   * @returns Created AI system
   */
  createAISystem(enemy: SpawnedEnemy, target: Vector2): EnemyAISystem {
    // Create AI components
    const ai = enemyFamilyManager.createAI(enemy, target);
    const movement = enemyFamilyManager.createMovement(enemy, target);
    const combat = enemyFamilyManager.createCombat(enemy, target);

    const aiSystem: EnemyAISystem = {
      ai,
      movement,
      combat,
      enemy,
    };

    this.aiSystems.set(enemy.id, aiSystem);
    this.performanceStats.totalSystems++;
    this.performanceStats.systemsByFamily[enemy.family]++;

    if (this.config.enableDebugLogging) {
      console.log(`[AIManager] Created AI system for enemy ${enemy.id} (family ${enemy.family})`);
    }

    return aiSystem;
  }

  /**
   * Update all AI systems
   * @param deltaTime - Time elapsed since last update in milliseconds
   * @param playerPosition - Current player position
   * @param obstacles - Array of obstacle positions
   */
  update(deltaTime: number, playerPosition: Vector2, obstacles: Vector2[] = []): void {
    const startTime = performance.now();
    this.updateAccumulator += deltaTime;

    // Check if it's time to update based on frequency
    const updateInterval = 1000 / this.config.updateFrequency;
    if (this.updateAccumulator < updateInterval) {
      return;
    }

    // Reset accumulator
    this.updateAccumulator = 0;

    // Update all AI systems
    let systemsUpdated = 0;
    for (const [enemyId, aiSystem] of this.aiSystems) {
      if (systemsUpdated >= this.config.maxUpdatesPerFrame) {
        break;
      }

      try {
        this.updateAISystem(aiSystem, deltaTime, playerPosition, obstacles);
        systemsUpdated++;
      } catch (error) {
        console.error(`[AIManager] Error updating AI system for enemy ${enemyId}:`, error);
      }
    }

    // Update performance statistics
    const updateTime = performance.now() - startTime;
    this.updatePerformanceStats(updateTime, systemsUpdated);
  }

  /**
   * Update individual AI system
   * @param aiSystem - AI system to update
   * @param deltaTime - Time elapsed
   * @param playerPosition - Player position
   * @param obstacles - Obstacle positions
   */
  private updateAISystem(
    aiSystem: EnemyAISystem,
    deltaTime: number,
    playerPosition: Vector2,
    obstacles: Vector2[],
  ): void {
    const { ai, movement, combat, enemy } = aiSystem;

    // Skip if enemy is dead
    if (enemy.hp <= 0) {
      ai.die();
      return;
    }

    // Update AI state machine
    ai.update(deltaTime, playerPosition);

    // Update movement based on AI state
    if (ai.getState() === 'approach' || ai.getState() === 'stop') {
      movement.update(deltaTime, playerPosition, obstacles);
    }

    // Update combat system
    const attackResult = combat.update(deltaTime, playerPosition);
    if (attackResult && this.config.enableDebugLogging) {
      console.log(`[AIManager] Enemy ${enemy.id} attacked for ${attackResult.damage} damage`);
    }

    // Handle AI state transitions
    this.handleAIStateTransitions(aiSystem, playerPosition);
  }

  /**
   * Handle AI state transitions
   * @param aiSystem - AI system to handle transitions for
   * @param playerPosition - Player position
   */
  private handleAIStateTransitions(aiSystem: EnemyAISystem, playerPosition: Vector2): void {
    const { ai, combat, enemy } = aiSystem;
    const currentState = ai.getState();

    // Handle approach -> stop transition
    if (currentState === 'approach' && combat.isTargetInRange()) {
      ai.update(0, playerPosition); // Force state update
    }

    // Handle stop -> attack transition
    if (currentState === 'stop' && combat.isTargetInRange() && combat.isAttackReady()) {
      combat.attemptAttack();
      ai.update(0, playerPosition); // Force state update
    }
  }

  /**
   * Remove AI system for enemy
   * @param enemyId - Enemy identifier
   */
  removeAISystem(enemyId: number): void {
    const aiSystem = this.aiSystems.get(enemyId);
    if (aiSystem) {
      this.aiSystems.delete(enemyId);
      this.performanceStats.totalSystems--;
      this.performanceStats.systemsByFamily[aiSystem.enemy.family]--;

      if (this.config.enableDebugLogging) {
        console.log(`[AIManager] Removed AI system for enemy ${enemyId}`);
      }
    }
  }

  /**
   * Get AI system for enemy
   * @param enemyId - Enemy identifier
   * @returns AI system or undefined
   */
  getAISystem(enemyId: number): EnemyAISystem | undefined {
    return this.aiSystems.get(enemyId);
  }

  /**
   * Get all AI systems
   * @returns Map of all AI systems
   */
  getAllAISystems(): Map<number, EnemyAISystem> {
    return new Map(this.aiSystems);
  }

  /**
   * Get AI systems by family
   * @param family - Family identifier
   * @returns Array of AI systems for the family
   */
  getAISystemsByFamily(family: Family): EnemyAISystem[] {
    const systems: EnemyAISystem[] = [];
    for (const aiSystem of this.aiSystems.values()) {
      if (aiSystem.enemy.family === family) {
        systems.push(aiSystem);
      }
    }
    return systems;
  }

  /**
   * Update performance statistics
   * @param updateTime - Time taken for update
   * @param systemsUpdated - Number of systems updated
   */
  private updatePerformanceStats(updateTime: number, systemsUpdated: number): void {
    this.performanceStats.activeSystems = this.aiSystems.size;
    this.performanceStats.totalUpdateTime = updateTime;
    this.performanceStats.averageUpdateTime = systemsUpdated > 0 ? updateTime / systemsUpdated : 0;

    // Check for performance warnings
    this.performanceStats.warnings = [];
    if (this.performanceStats.averageUpdateTime > 0.5) {
      this.performanceStats.warnings.push('High AI update time detected');
    }
    if (this.performanceStats.activeSystems > 200) {
      this.performanceStats.warnings.push('High number of active AI systems');
    }
  }

  /**
   * Get performance statistics
   * @returns Current performance statistics
   */
  getPerformanceStats(): AIPerformanceStats {
    return { ...this.performanceStats };
  }

  /**
   * Update AI manager configuration
   * @param newConfig - New configuration (partial)
   */
  updateConfig(newConfig: Partial<AIManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset AI manager
   */
  reset(): void {
    this.aiSystems.clear();
    this.performanceStats = {
      totalSystems: 0,
      activeSystems: 0,
      averageUpdateTime: 0,
      totalUpdateTime: 0,
      systemsByFamily: { 1: 0, 2: 0 },
      warnings: [],
    };
    this.updateAccumulator = 0;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.reset();
  }
}
