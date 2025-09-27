/**
 * @file AI Integration with existing spawn system
 * @description P1-E2-S2: Integration layer between AI system and spawn system
 */

import type { SpawnedEnemy, Vector2 } from './types.js';
import { AIManager } from './ai/ai-manager.js';
import type { AIManagerConfig } from './ai/ai-manager.js';

/**
 * AI integration configuration
 */
export interface AIIntegrationConfig extends AIManagerConfig {
  /** Enable AI for spawned enemies */
  enableAI: boolean;
  /** Auto-create AI for new enemies */
  autoCreateAI: boolean;
  /** AI update frequency multiplier */
  updateFrequencyMultiplier: number;
}

/**
 * Default AI integration configuration
 */
export const DEFAULT_AI_INTEGRATION_CONFIG: AIIntegrationConfig = {
  ...{
    maxUpdatesPerFrame: 200,
    updateFrequency: 60,
    enablePerformanceMonitoring: true,
    enableDebugLogging: false,
  },
  enableAI: true,
  autoCreateAI: true,
  updateFrequencyMultiplier: 1.0,
};

/**
 * AI Integration system for connecting AI with spawn system
 */
export class AIIntegration {
  private aiManager: AIManager;
  private config: AIIntegrationConfig;
  private playerPosition: Vector2 = { x: 0, y: 0 };
  private obstacles: Vector2[] = [];

  constructor(config: AIIntegrationConfig = DEFAULT_AI_INTEGRATION_CONFIG) {
    this.config = config;
    this.aiManager = new AIManager(config);
  }

  /**
   * Update AI integration
   * @param deltaTime - Time elapsed since last update in milliseconds
   * @param playerPosition - Current player position
   * @param obstacles - Array of obstacle positions
   */
  update(deltaTime: number, playerPosition: Vector2, obstacles: Vector2[] = []): void {
    if (!this.config.enableAI) {
      return;
    }

    this.playerPosition = playerPosition;
    this.obstacles = obstacles;

    // Update AI manager
    this.aiManager.update(deltaTime, playerPosition, obstacles);
  }

  /**
   * Create AI for newly spawned enemy
   * @param enemy - Newly spawned enemy
   * @param target - Initial target position (usually player)
   * @returns Created AI system
   */
  createAIForEnemy(enemy: SpawnedEnemy, target?: Vector2): void {
    if (!this.config.enableAI || !this.config.autoCreateAI) {
      return;
    }

    const targetPosition = target || this.playerPosition;
    this.aiManager.createAISystem(enemy, targetPosition);

    if (this.config.enableDebugLogging) {
      console.log(`[AIIntegration] Created AI for enemy ${enemy.id} (family ${enemy.family})`);
    }
  }

  /**
   * Remove AI for destroyed enemy
   * @param enemyId - Enemy identifier
   */
  removeAIForEnemy(enemyId: number): void {
    if (!this.config.enableAI) {
      return;
    }

    this.aiManager.removeAISystem(enemyId);

    if (this.config.enableDebugLogging) {
      console.log(`[AIIntegration] Removed AI for enemy ${enemyId}`);
    }
  }

  /**
   * Get AI system for enemy
   * @param enemyId - Enemy identifier
   * @returns AI system or undefined
   */
  getAIForEnemy(enemyId: number) {
    return this.aiManager.getAISystem(enemyId);
  }

  /**
   * Get all AI systems
   * @returns Map of all AI systems
   */
  getAllAI(): Map<number, any> {
    return this.aiManager.getAllAISystems();
  }

  /**
   * Get AI performance statistics
   * @returns AI performance statistics
   */
  getPerformanceStats() {
    return this.aiManager.getPerformanceStats();
  }

  /**
   * Set player position
   * @param position - Player position
   */
  setPlayerPosition(position: Vector2): void {
    this.playerPosition = position;
  }

  /**
   * Set obstacles
   * @param obstacles - Array of obstacle positions
   */
  setObstacles(obstacles: Vector2[]): void {
    this.obstacles = obstacles;
  }

  /**
   * Update AI integration configuration
   * @param newConfig - New configuration (partial)
   */
  updateConfig(newConfig: Partial<AIIntegrationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.aiManager.updateConfig(newConfig);
  }

  /**
   * Enable or disable AI
   * @param enabled - Whether to enable AI
   */
  setAIEnabled(enabled: boolean): void {
    this.config.enableAI = enabled;
  }

  /**
   * Check if AI is enabled
   * @returns True if AI is enabled
   */
  isAIEnabled(): boolean {
    return this.config.enableAI;
  }

  /**
   * Reset AI integration
   */
  reset(): void {
    this.aiManager.reset();
    this.playerPosition = { x: 0, y: 0 };
    this.obstacles = [];
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.aiManager.destroy();
  }
}
