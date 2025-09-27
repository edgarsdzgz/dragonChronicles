/**
 * Enhanced AI Integration - Connects proven AI logic with existing spawn system
 * This bridges the gap between our new AI system and the existing enemy spawning
 */

import { EnhancedAIManager } from './enhanced-ai-manager.js';
import type { SpawnedEnemy } from '../types.js';
import type { AIBehaviorConfig } from './state-machine.js';
// import { createEnemyFamilyConfig } from './enemy-families.js';

export interface EnhancedAIIntegration {
  aiManager: EnhancedAIManager;
  isActive: boolean;
  targets: Array<{ x: number; y: number }>;
}

/**
 * Create enhanced AI integration
 */
export function createEnhancedAIIntegration(): EnhancedAIIntegration {
  const aiManager = new EnhancedAIManager();
  
  return {
    aiManager,
    isActive: false,
    targets: [],
  };
}

/**
 * Add enemy to enhanced AI system
 */
export function addEnemyToEnhancedAI(
  integration: EnhancedAIIntegration,
  enemy: SpawnedEnemy,
  enemyType: 'mantair-corsair' | 'swarm' = 'mantair-corsair'
): void {
  // Create AI behavior config based on enemy type
  const aiConfig: AIBehaviorConfig = {
    speedMultiplier: enemyType === 'swarm' ? 1.5 : 1.0,
    attackRange: enemyType === 'swarm' ? 200 : 300,
    attackDamage: enemyType === 'swarm' ? 2 : 5,
    attackCooldown: enemyType === 'swarm' ? 1500 : 2000,
    stopDistance: 50,
    updateFrequency: 10,
  };

  // Add to AI manager
  integration.aiManager.addEnemy(enemy, aiConfig);
  
  console.log(`Added ${enemyType} to enhanced AI system`);
}

/**
 * Remove enemy from enhanced AI system
 */
export function removeEnemyFromEnhancedAI(
  integration: EnhancedAIIntegration,
  poolIndex: number
): void {
  integration.aiManager.removeEnemy(poolIndex);
  console.log(`Removed enemy ${poolIndex} from enhanced AI system`);
}

/**
 * Set targets for AI to pursue
 */
export function setAITargets(
  integration: EnhancedAIIntegration,
  targets: Array<{ x: number; y: number }>
): void {
  integration.targets = targets;
  integration.aiManager.setTargets(targets);
  console.log(`Set ${targets.length} targets for AI system`);
}

/**
 * Update enhanced AI system
 */
export function updateEnhancedAI(integration: EnhancedAIIntegration): void {
  if (!integration.isActive) return;
  
  integration.aiManager.update();
}

/**
 * Start enhanced AI system
 */
export function startEnhancedAI(integration: EnhancedAIIntegration): void {
  integration.isActive = true;
  console.log('Enhanced AI system started');
}

/**
 * Stop enhanced AI system
 */
export function stopEnhancedAI(integration: EnhancedAIIntegration): void {
  integration.isActive = false;
  console.log('Enhanced AI system stopped');
}

/**
 * Get AI statistics for debugging
 */
export function getAIStatistics(integration: EnhancedAIIntegration): {
  activeEnemies: number;
  targets: number;
  isActive: boolean;
} {
  const aiStates = integration.aiManager.getAIStates();
  
  return {
    activeEnemies: aiStates.size,
    targets: integration.targets.length,
    isActive: integration.isActive,
  };
}

/**
 * Get AI state for specific enemy
 */
export function getEnemyAIState(
  integration: EnhancedAIIntegration,
  poolIndex: number
) {
  return integration.aiManager.getAIState(poolIndex);
}

/**
 * Clean up enhanced AI integration
 */
export function destroyEnhancedAI(integration: EnhancedAIIntegration): void {
  integration.aiManager.destroy();
  integration.isActive = false;
  integration.targets = [];
  console.log('Enhanced AI integration destroyed');
}
