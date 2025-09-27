/**
 * Enhanced AI Manager - Integrates proven AI logic from dragon animation test page
 * This combines the working test page AI with our simulation package structure
 */

import type { SpawnedEnemy, Vector2 } from '../types.js';
import { EnemyAI } from './state-machine.js';
import type { AIBehaviorConfig } from './state-machine.js';

export interface EnhancedAIState {
  enemy: SpawnedEnemy;
  target: Vector2;
  isMoving: boolean;
  lastFireTime: number;
  fireRate: number;
  health: number;
  maxHealth: number;
  currentSpeedMultiplier: number;
  lastFrameChangeTime: number;
}

export class EnhancedAIManager {
  private aiInstances: Map<number, EnemyAI> = new Map();
  private aiStates: Map<number, EnhancedAIState> = new Map();
  private targets: Vector2[] = [];
  private lastUpdateTime = 0;

  constructor() {
    this.lastUpdateTime = performance.now();
  }

  /**
   * Add an enemy to AI management
   */
  addEnemy(enemy: SpawnedEnemy, config: AIBehaviorConfig): void {
    // Create initial target (will be updated later)
    const initialTarget: Vector2 = { x: 0, y: 0 };
    const ai = new EnemyAI(enemy, initialTarget);
    this.aiInstances.set(enemy.poolIndex, ai);

    // Enhanced state tracking (from test page logic)
    const aiState: EnhancedAIState = {
      enemy,
      target: { x: 0, y: 0 },
      isMoving: true,
      lastFireTime: 0,
      fireRate: 2000 + Math.random() * 500, // 2-2.5 second variation
      health: 10, // Default health
      maxHealth: 10,
      currentSpeedMultiplier: 1.0,
      lastFrameChangeTime: performance.now(),
    };

    this.aiStates.set(enemy.poolIndex, aiState);
  }

  /**
   * Remove an enemy from AI management
   */
  removeEnemy(poolIndex: number): void {
    this.aiInstances.delete(poolIndex);
    this.aiStates.delete(poolIndex);
  }

  /**
   * Set targets for AI to pursue
   */
  setTargets(targets: Vector2[]): void {
    this.targets = targets;
  }

  /**
   * Update all AI instances (integrated from test page logic)
   */
  update(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    // Update each AI instance
    for (const [poolIndex, ai] of this.aiInstances) {
      const aiState = this.aiStates.get(poolIndex);
      if (!aiState) continue;

      // Find closest target
      const closestTarget = this.findClosestTarget(aiState.enemy.position);
      if (!closestTarget) continue;

      // Update target
      aiState.target = closestTarget;

      // Calculate distance to target
      const dx = closestTarget.x - aiState.enemy.position.x;
      const dy = closestTarget.y - aiState.enemy.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Movement logic (from test page)
      if (aiState.isMoving && distance > 300) { // Attack range
        // Move toward target
        const moveDistance = 50 * aiState.currentSpeedMultiplier * (deltaTime / 1000);
        
        if (distance > 0) {
          const moveX = (dx / distance) * moveDistance;
          const moveY = (dy / distance) * moveDistance;

          aiState.enemy.position.x += moveX;
          aiState.enemy.position.y += moveY;
        }
      } else if (distance <= 300) {
        // Stop moving when in range
        aiState.isMoving = false;

        // Auto-fire if enough time has passed
        if (currentTime - aiState.lastFireTime >= aiState.fireRate) {
          this.fireProjectile(aiState);
          aiState.lastFireTime = currentTime;
        }
      } else if (distance > 300 * 1.2) {
        // Resume moving if target moves away
        aiState.isMoving = true;
      }

      // Update the AI state machine
      ai.update(deltaTime, closestTarget);
    }
  }

  /**
   * Find closest target to enemy position
   */
  private findClosestTarget(enemyPos: Vector2): Vector2 | null {
    if (this.targets.length === 0) return null;

    let closest = this.targets[0];
    let closestDistance = Infinity;

    for (const target of this.targets) {
      const dx = target.x - enemyPos.x;
      const dy = target.y - enemyPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = target;
      }
    }

    return closest || null;
  }

  /**
   * Fire projectile (placeholder - would integrate with projectile system)
   */
  private fireProjectile(aiState: EnhancedAIState): void {
    // This would integrate with the projectile system
    console.log(`Enemy ${aiState.enemy.poolIndex} fires projectile at target`);
  }

  /**
   * Get all AI states for debugging/display
   */
  getAIStates(): Map<number, EnhancedAIState> {
    return this.aiStates;
  }

  /**
   * Get AI state for specific enemy
   */
  getAIState(poolIndex: number): EnhancedAIState | undefined {
    return this.aiStates.get(poolIndex);
  }

  /**
   * Clean up all AI instances
   */
  destroy(): void {
    this.aiInstances.clear();
    this.aiStates.clear();
    this.targets = [];
  }
}
