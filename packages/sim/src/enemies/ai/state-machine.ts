/**
 * @file AI State Machine for enemy behavior
 * @description P1-E2-S2: Core AI state management for enemy behavior
 */

import type { SpawnedEnemy, Vector2, Family, EnemyState } from '../types.js';

/**
 * AI state machine states
 */
/* eslint-disable no-unused-vars */
export enum AIState {
  APPROACH = 'approach',
  STOP = 'stop', 
  ATTACK = 'attack',
  DEATH = 'death',
}
/* eslint-enable no-unused-vars */

/**
 * AI behavior configuration for different enemy families
 */
export interface AIBehaviorConfig {
  /** Movement speed multiplier */
  speedMultiplier: number;
  /** Attack range in units */
  attackRange: number;
  /** Attack damage */
  attackDamage: number;
  /** Attack cooldown in milliseconds */
  attackCooldown: number;
  /** Stop distance from target */
  stopDistance: number;
  /** Update frequency (higher = more frequent updates) */
  updateFrequency: number;
}

/**
 * AI state data for tracking behavior
 */
export interface AIStateData {
  /** Current AI state */
  state: AIState;
  /** Target position (usually player) */
  target: Vector2;
  /** Last attack time */
  lastAttackTime: number;
  /** State entry time */
  stateEntryTime: number;
  /** AI update accumulator */
  updateAccumulator: number;
  /** Behavior configuration */
  config: AIBehaviorConfig;
}

/**
 * AI state machine for enemy behavior
 */
export class EnemyAI {
  private enemy: SpawnedEnemy;
  private stateData: AIStateData;
  private familyConfigs: Map<Family, AIBehaviorConfig>;

  constructor(enemy: SpawnedEnemy, target: Vector2) {
    this.enemy = enemy;
    this.familyConfigs = this.createFamilyConfigs();
    
    const config = this.familyConfigs.get(enemy.family) || this.getDefaultConfig();
    
    this.stateData = {
      state: AIState.APPROACH,
      target,
      lastAttackTime: 0,
      stateEntryTime: Date.now(),
      updateAccumulator: 0,
      config,
    };
  }

  /**
   * Update AI behavior
   * @param deltaTime - Time elapsed since last update in milliseconds
   * @param currentTarget - Current target position (usually player)
   */
  update(deltaTime: number, currentTarget: Vector2): void {
    // Update target position
    this.stateData.target = currentTarget;
    
    // Accumulate update time
    this.stateData.updateAccumulator += deltaTime;
    
    // Check if it's time to update based on frequency
    const updateInterval = 1000 / this.stateData.config.updateFrequency;
    if (this.stateData.updateAccumulator < updateInterval) {
      return;
    }
    
    // Reset accumulator
    this.stateData.updateAccumulator = 0;
    
    // Update based on current state
    this.updateState(deltaTime);
  }

  /**
   * Update current AI state
   * @param deltaTime - Time elapsed since last update
   */
  private updateState(_deltaTime: number): void {
    const distanceToTarget = this.getDistanceToTarget();
    const currentTime = Date.now();
    
    switch (this.stateData.state) {
      case AIState.APPROACH:
        this.updateApproachState(distanceToTarget);
        break;
        
      case AIState.STOP:
        this.updateStopState(distanceToTarget);
        break;
        
      case AIState.ATTACK:
        this.updateAttackState(distanceToTarget, currentTime);
        break;
        
      case AIState.DEATH:
        // Death state - no updates needed
        break;
    }
  }

  /**
   * Update approach state
   * @param distanceToTarget - Distance to target
   */
  private updateApproachState(distanceToTarget: number): void {
    // If close enough to attack, transition to stop state
    if (distanceToTarget <= this.stateData.config.attackRange) {
      this.transitionToState(AIState.STOP);
      return;
    }
    
    // Move toward target
    this.moveTowardTarget();
  }

  /**
   * Update stop state
   * @param distanceToTarget - Distance to target
   */
  private updateStopState(distanceToTarget: number): void {
    // If too far from target, go back to approach
    if (distanceToTarget > this.stateData.config.attackRange * 1.2) {
      this.transitionToState(AIState.APPROACH);
      return;
    }
    
    // If close enough and attack is ready, start attacking
    if (distanceToTarget <= this.stateData.config.attackRange && this.canAttack()) {
      this.transitionToState(AIState.ATTACK);
      return;
    }
    
    // Stop moving (velocity = 0)
    this.enemy.velocity.x = 0;
    this.enemy.velocity.y = 0;
  }

  /**
   * Update attack state
   * @param distanceToTarget - Distance to target
   * @param currentTime - Current time
   */
  private updateAttackState(distanceToTarget: number, currentTime: number): void {
    // If too far from target, go back to approach
    if (distanceToTarget > this.stateData.config.attackRange * 1.2) {
      this.transitionToState(AIState.APPROACH);
      return;
    }
    
    // Perform attack if cooldown is ready
    if (this.canAttack()) {
      this.performAttack();
      this.stateData.lastAttackTime = currentTime;
    }
    
    // Stop moving while attacking
    this.enemy.velocity.x = 0;
    this.enemy.velocity.y = 0;
  }

  /**
   * Move enemy toward target
   */
  private moveTowardTarget(): void {
    const dx = this.stateData.target.x - this.enemy.position.x;
    const dy = this.stateData.target.y - this.enemy.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      // Normalize direction and apply speed
      const speed = this.enemy.spd * this.stateData.config.speedMultiplier;
      this.enemy.velocity.x = (dx / distance) * speed;
      this.enemy.velocity.y = (dy / distance) * speed;
      
      // Update position based on velocity (assuming 60 FPS)
      const deltaTime = 16.67; // ~16.67ms for 60 FPS
      if (this.enemy.velocity.x !== 0 || this.enemy.velocity.y !== 0) {
        this.enemy.position.x += this.enemy.velocity.x * (deltaTime / 1000);
        this.enemy.position.y += this.enemy.velocity.y * (deltaTime / 1000);
      }
    }
  }

  /**
   * Check if enemy can attack
   * @returns True if attack is ready
   */
  private canAttack(): boolean {
    const currentTime = Date.now();
    const timeSinceLastAttack = currentTime - this.stateData.lastAttackTime;
    return timeSinceLastAttack >= this.stateData.config.attackCooldown;
  }

  /**
   * Perform attack action
   */
  private performAttack(): void {
    // For now, this is a placeholder for attack logic
    // In a full implementation, this would trigger attack animations,
    // damage calculations, etc.
    console.log(`Enemy ${this.enemy.id} attacks for ${this.stateData.config.attackDamage} damage`);
  }

  /**
   * Transition to a new state
   * @param newState - New state to transition to
   */
  private transitionToState(newState: AIState): void {
    if (this.stateData.state === newState) {
      return;
    }
    
    this.stateData.state = newState;
    this.stateData.stateEntryTime = Date.now();
    
    // Update enemy state
    this.enemy.state = newState as EnemyState;
  }

  /**
   * Get distance to target
   * @returns Distance to target
   */
  private getDistanceToTarget(): number {
    const dx = this.stateData.target.x - this.enemy.position.x;
    const dy = this.stateData.target.y - this.enemy.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Create family-specific AI configurations
   * @returns Map of family configurations
   */
  private createFamilyConfigs(): Map<Family, AIBehaviorConfig> {
    const configs = new Map<Family, AIBehaviorConfig>();
    
    // Melee family (1) - Close combat, high damage, slow attack
    configs.set(1, {
      speedMultiplier: 1.0,
      attackRange: 50,
      attackDamage: 25,
      attackCooldown: 2000, // 2 seconds
      stopDistance: 45,
      updateFrequency: 30, // 30 FPS
    });
    
    // Ranged family (2) - Long range, lower damage, fast attack
    configs.set(2, {
      speedMultiplier: 0.8,
      attackRange: 150,
      attackDamage: 15,
      attackCooldown: 1000, // 1 second
      stopDistance: 140,
      updateFrequency: 60, // 60 FPS
    });
    
    return configs;
  }

  /**
   * Get default AI configuration
   * @returns Default configuration
   */
  private getDefaultConfig(): AIBehaviorConfig {
    return {
      speedMultiplier: 1.0,
      attackRange: 100,
      attackDamage: 20,
      attackCooldown: 1500,
      stopDistance: 90,
      updateFrequency: 30,
    };
  }

  /**
   * Get current AI state
   * @returns Current state
   */
  getState(): AIState {
    return this.stateData.state;
  }

  /**
   * Get AI state data
   * @returns Current state data
   */
  getStateData(): AIStateData {
    return { ...this.stateData };
  }

  /**
   * Set target position
   * @param target - New target position
   */
  setTarget(target: Vector2): void {
    this.stateData.target = target;
  }

  /**
   * Force transition to death state
   */
  die(): void {
    this.transitionToState(AIState.DEATH);
  }
}
