/**
 * @file Combat system for enemy AI
 * @description P1-E2-S2: Attack system and range detection for enemy AI
 */

import type { SpawnedEnemy, Vector2 } from '../types.js';

/**
 * Combat configuration
 */
export interface CombatConfig {
  /** Attack range in units */
  attackRange: number;
  /** Attack damage */
  attackDamage: number;
  /** Attack cooldown in milliseconds */
  attackCooldown: number;
  /** Attack duration in milliseconds */
  attackDuration: number;
  /** Critical hit chance (0-1) */
  criticalChance: number;
  /** Critical hit damage multiplier */
  criticalMultiplier: number;
  /** Attack animation duration */
  animationDuration: number;
}

/**
 * Combat state data
 */
export interface CombatState {
  /** Last attack time */
  lastAttackTime: number;
  /** Current attack target */
  target: Vector2;
  /** Attack cooldown remaining */
  cooldownRemaining: number;
  /** Is currently attacking */
  isAttacking: boolean;
  /** Attack start time */
  attackStartTime: number;
  /** Configuration */
  config: CombatConfig;
}

/**
 * Attack result data
 */
export interface AttackResult {
  /** Whether attack was successful */
  success: boolean;
  /** Damage dealt */
  damage: number;
  /** Whether it was a critical hit */
  critical: boolean;
  /** Attack timestamp */
  timestamp: number;
}

/**
 * Combat system for enemy AI
 */
export class EnemyCombat {
  private enemy: SpawnedEnemy;
  private combatState: CombatState;
  private attackHistory: AttackResult[] = [];

  constructor(enemy: SpawnedEnemy, target: Vector2, config?: Partial<CombatConfig>) {
    this.enemy = enemy;

    const defaultConfig: CombatConfig = {
      attackRange: 100,
      attackDamage: 20,
      attackCooldown: 1500,
      attackDuration: 500,
      criticalChance: 0.1,
      criticalMultiplier: 2.0,
      animationDuration: 300,
    };

    this.combatState = {
      lastAttackTime: 0,
      target,
      cooldownRemaining: 0,
      isAttacking: false,
      attackStartTime: 0,
      config: { ...defaultConfig, ...config },
    };
  }

  /**
   * Update combat system
   * @param deltaTime - Time elapsed since last update in milliseconds
   * @param target - Current target position
   * @returns Attack result if attack was performed, null otherwise
   */
  update(deltaTime: number, target: Vector2): AttackResult | null {
    // Update target
    this.combatState.target = target;

    // Update cooldown
    if (this.combatState.cooldownRemaining > 0) {
      this.combatState.cooldownRemaining -= deltaTime;
      if (this.combatState.cooldownRemaining < 0) {
        this.combatState.cooldownRemaining = 0;
      }
    }

    // Update attack state
    if (this.combatState.isAttacking) {
      return this.updateAttackState(deltaTime);
    }

    return null;
  }

  /**
   * Update attack state
   * @param deltaTime - Time elapsed
   * @returns Attack result if attack completed, null otherwise
   */
  private updateAttackState(_deltaTime: number): AttackResult | null {
    const currentTime = Date.now();
    const attackElapsed = currentTime - this.combatState.attackStartTime;

    // Check if attack duration is complete
    if (attackElapsed >= this.combatState.config.attackDuration) {
      // Complete the attack
      this.combatState.isAttacking = false;
      this.combatState.cooldownRemaining = this.combatState.config.attackCooldown;
      this.combatState.lastAttackTime = currentTime;

      // Calculate attack result
      return this.calculateAttackResult();
    }

    return null;
  }

  /**
   * Attempt to attack target
   * @returns Attack result if attack was initiated, null otherwise
   */
  attemptAttack(): AttackResult | null {
    // Check if attack is on cooldown
    if (this.combatState.cooldownRemaining > 0) {
      return null;
    }

    // Check if target is in range
    if (!this.isTargetInRange()) {
      return null;
    }

    // Check if already attacking
    if (this.combatState.isAttacking) {
      return null;
    }

    // Start attack
    this.combatState.isAttacking = true;
    this.combatState.attackStartTime = Date.now();

    // Return immediate attack result (for instant attacks)
    return this.calculateAttackResult();
  }

  /**
   * Check if target is in attack range
   * @returns True if target is in range
   */
  isTargetInRange(): boolean {
    const distance = this.getDistanceToTarget();
    return distance <= this.combatState.config.attackRange;
  }

  /**
   * Get distance to target
   * @returns Distance to target
   */
  private getDistanceToTarget(): number {
    const dx = this.combatState.target.x - this.enemy.position.x;
    const dy = this.combatState.target.y - this.enemy.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate attack result
   * @returns Attack result
   */
  private calculateAttackResult(): AttackResult {
    const currentTime = Date.now();

    // Calculate base damage
    let damage = this.combatState.config.attackDamage;

    // Apply enemy damage bonus
    damage += this.enemy.contactDmg;

    // Check for critical hit
    const isCritical = Math.random() < this.combatState.config.criticalChance;
    if (isCritical) {
      damage *= this.combatState.config.criticalMultiplier;
    }

    const result: AttackResult = {
      success: true,
      damage: Math.floor(damage),
      critical: isCritical,
      timestamp: currentTime,
    };

    // Store attack in history
    this.attackHistory.push(result);

    // Limit attack history size
    if (this.attackHistory.length > 100) {
      this.attackHistory = this.attackHistory.slice(-50);
    }

    return result;
  }

  /**
   * Set combat target
   * @param target - New target position
   */
  setTarget(target: Vector2): void {
    this.combatState.target = target;
  }

  /**
   * Set attack range
   * @param range - New attack range
   */
  setAttackRange(range: number): void {
    this.combatState.config.attackRange = range;
  }

  /**
   * Set attack damage
   * @param damage - New attack damage
   */
  setAttackDamage(damage: number): void {
    this.combatState.config.attackDamage = damage;
  }

  /**
   * Set attack cooldown
   * @param cooldown - New attack cooldown in milliseconds
   */
  setAttackCooldown(cooldown: number): void {
    this.combatState.config.attackCooldown = cooldown;
  }

  /**
   * Get current combat state
   * @returns Current combat state
   */
  getCombatState(): CombatState {
    return { ...this.combatState };
  }

  /**
   * Get attack history
   * @returns Array of recent attacks
   */
  getAttackHistory(): readonly AttackResult[] {
    return [...this.attackHistory];
  }

  /**
   * Get cooldown remaining
   * @returns Cooldown remaining in milliseconds
   */
  getCooldownRemaining(): number {
    return this.combatState.cooldownRemaining;
  }

  /**
   * Check if attack is ready
   * @returns True if attack is ready
   */
  isAttackReady(): boolean {
    return this.combatState.cooldownRemaining <= 0 && !this.combatState.isAttacking;
  }

  /**
   * Check if currently attacking
   * @returns True if currently attacking
   */
  isAttacking(): boolean {
    return this.combatState.isAttacking;
  }

  /**
   * Force stop attack
   */
  stopAttack(): void {
    this.combatState.isAttacking = false;
  }

  /**
   * Reset combat state
   */
  reset(): void {
    this.combatState.lastAttackTime = 0;
    this.combatState.cooldownRemaining = 0;
    this.combatState.isAttacking = false;
    this.combatState.attackStartTime = 0;
    this.attackHistory = [];
  }
}
