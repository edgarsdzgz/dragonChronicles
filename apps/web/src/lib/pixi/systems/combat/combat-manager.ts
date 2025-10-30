/**
 * Combat Manager
 *
 * Orchestrates all combat systems:
 * - Dragon auto-attack with smart targeting (percentage-based range)
 * - Enemy attacks
 * - Projectile lifecycle
 * - Collision detection
 * - Damage application
 * - Death processing
 *
 * Phase 1 Combat Implementation - Orchestration System
 */

import type { Application, Sprite } from 'pixi.js';
import type { Profile } from '@draconia/db';
import type { EnemyData } from '../enemy-manager';
import type { EnemyType } from '../../enemy-sprites';
import { CollisionSystem } from './collision-system';
import { ProjectileManager, type ProjectileData } from './projectile-manager';
import { DamageSystem, type DeathData } from './damage-system';

/**
 * Combat-specific enemy state (extends EnemyData)
 */
export interface EnemyCombatState {
  lastFireTime: number;
  fireRate: number; // ms between attacks
  attackRangePercent: number; // Percentage of screen (0.20-0.28)
  deathData?: DeathData;
  isDefeated: boolean;
}

/**
 * Dragon combat state
 */
export interface DragonCombatState {
  hp: number;
  maxHP: number;
  damage: number;
  fireRate: number; // ms
  attackRangePercent: number; // 0.30 (30% of screen)
  lastFireTime: number;
}

/**
 * Combat manager configuration
 */
export interface CombatManagerConfig {
  // Dragon stats
  dragonBaseHP: number;
  dragonBaseDamage: number;
  dragonFireRate: number; // ms
  dragonRangePercent: number; // 0.30 (30% of screen)

  // Enemy stats
  enemyFireRate: number; // ms

  // Screen metrics (for percentage calculations)
  screenWidth: number;
  dragonXPosition: number; // pixels from left

  // Stat scaling
  scalingInterval: number; // meters (100m)
  scalingGrowthRate: number; // 1.01 (1%)
}

/**
 * Default combat configuration
 */
export const DEFAULT_COMBAT_CONFIG: CombatManagerConfig = {
  // Dragon (from Phase 1 spec)
  dragonBaseHP: 5,
  dragonBaseDamage: 2.5,
  dragonFireRate: 500, // ms (2 attacks/s)
  dragonRangePercent: 0.3, // 30% of screen ahead

  // Enemy
  enemyFireRate: 2000, // ms (0.5 attacks/s)

  // Screen (1080p baseline)
  screenWidth: 1920,
  dragonXPosition: 115.2, // 6% of 1920

  // Scaling
  scalingInterval: 100, // meters
  scalingGrowthRate: 1.01, // 1% multiplicative
};

/**
 * Combat Manager
 *
 * Orchestrates all combat interactions between dragon and enemies
 */
export class CombatManager {
  private app: Application;
  private config: CombatManagerConfig;

  // Sub-systems
  private collisionSystem: CollisionSystem;
  private projectileManager: ProjectileManager;
  private damageSystem: DamageSystem;

  // State tracking
  private dragonState: DragonCombatState;
  private enemyCombatStates: Map<number, EnemyCombatState> = new Map();
  private dragonSprite: Sprite | null = null;
  private currentDistance = 0; // meters

  constructor(app: Application, config: CombatManagerConfig = DEFAULT_COMBAT_CONFIG) {
    this.app = app;
    this.config = config;

    // Initialize sub-systems
    this.collisionSystem = new CollisionSystem();
    this.projectileManager = new ProjectileManager(app, this.collisionSystem);
    this.damageSystem = new DamageSystem();

    // Initialize dragon state
    this.dragonState = {
      hp: config.dragonBaseHP,
      maxHP: config.dragonBaseHP,
      damage: config.dragonBaseDamage,
      fireRate: config.dragonFireRate,
      attackRangePercent: config.dragonRangePercent,
      lastFireTime: 0,
    };
  }

  /**
   * Initialize combat manager
   */
  async initialize(dragonSprite: Sprite, profile: Profile): Promise<void> {
    this.dragonSprite = dragonSprite;
    this.damageSystem.setProfile(profile);
    await this.projectileManager.initialize();
    console.log('⚔️ Combat Manager: Initialized');
  }

  /**
   * Register an enemy for combat
   */
  registerEnemy(enemy: EnemyData, attackRangePercent: number, currentDistance: number): void {
    const scaledStats = this.calculateScaledStats(currentDistance);

    const combatState: EnemyCombatState = {
      lastFireTime: 0,
      fireRate: this.config.enemyFireRate,
      attackRangePercent,
      isDefeated: false,
    };

    // Apply scaled stats to enemy
    enemy.health = scaledStats.hp;
    enemy.maxHealth = scaledStats.hp;
    enemy.damage = scaledStats.damage; // Fixed at spawn

    this.enemyCombatStates.set(enemy.id, combatState);
  }

  /**
   * Unregister an enemy from combat
   */
  unregisterEnemy(enemyId: number): void {
    this.enemyCombatStates.delete(enemyId);
  }

  /**
   * Update combat system
   */
  update(deltaTime: number, enemies: EnemyData[], currentDistance: number): void {
    if (!this.dragonSprite) return;

    this.currentDistance = currentDistance;
    const currentTime = performance.now();

    // Update projectiles
    this.projectileManager.update(deltaTime);

    // Update death animations
    this.updateDeathAnimations(enemies, currentTime);

    // Dragon auto-attack
    this.updateDragonAttack(enemies, currentTime);

    // Enemy attacks
    this.updateEnemyAttacks(enemies, currentTime);
  }

  /**
   * Update dragon auto-attack with smart targeting
   */
  private updateDragonAttack(enemies: EnemyData[], currentTime: number): void {
    if (!this.dragonSprite) return;

    // Check fire rate cooldown
    if (currentTime - this.dragonState.lastFireTime < this.dragonState.fireRate) {
      return; // Still on cooldown
    }

    // Find best target using smart targeting
    const target = this.findBestTarget(enemies);

    if (target) {
      // Fire projectile
      this.fireDragonProjectile(target);
      this.dragonState.lastFireTime = currentTime;
    }
  }

  /**
   * Find best target using smart targeting algorithm
   *
   * Prevents visual bugs by switching targets if killing blow predicted
   */
  private findBestTarget(enemies: EnemyData[]): EnemyData | null {
    if (!this.dragonSprite) return null;

    const dragonRangePixels = this.calculateRangePixels(this.dragonState.attackRangePercent);

    // 1. Find all enemies in range
    const enemiesInRange = enemies.filter((enemy) => {
      const combatState = this.enemyCombatStates.get(enemy.id);
      if (!combatState || combatState.isDefeated) return false;

      const distance = this.collisionSystem.getDistance(this.dragonSprite!, enemy.sprite);
      return distance <= dragonRangePixels;
    });

    if (enemiesInRange.length === 0) return null;

    // 2. Find closest enemy
    const closest = this.collisionSystem.findClosestSprite(
      this.dragonSprite,
      enemiesInRange.map((e) => e.sprite),
      dragonRangePixels,
    );

    if (!closest) return null;

    const closestEnemy = enemiesInRange.find((e) => e.sprite === closest);
    if (!closestEnemy) return null;

    // 3. Smart targeting: Check if killing blow predicted
    const activeProjectiles = this.projectileManager
      .getDragonProjectiles()
      .filter((p) => p.target === closestEnemy.sprite && !p.hasHit);

    const incomingDamage = activeProjectiles.length * this.dragonState.damage;

    if (closestEnemy.health <= incomingDamage) {
      // Killing blow predicted, find next target
      const remainingEnemies = enemiesInRange.filter((e) => e !== closestEnemy);

      if (remainingEnemies.length > 0) {
        const nextTarget = this.collisionSystem.findClosestSprite(
          this.dragonSprite,
          remainingEnemies.map((e) => e.sprite),
          dragonRangePixels,
        );

        if (nextTarget) {
          return remainingEnemies.find((e) => e.sprite === nextTarget) || closestEnemy;
        }
      }
    }

    return closestEnemy;
  }

  /**
   * Fire a dragon projectile at target
   */
  private async fireDragonProjectile(target: EnemyData): Promise<void> {
    if (!this.dragonSprite) return;

    // Create collision callback
    const collisionCallback = (projectileSprite: Sprite) => {
      // Check collision with target
      const isColliding = this.collisionSystem.checkCollision(projectileSprite, target.sprite);

      if (isColliding) {
        // Apply damage
        const result = this.damageSystem.applyEnemyDamage(
          target.health,
          this.dragonState.damage,
          target.maxHealth,
        );

        target.health = result.newHealth;

        // Handle death
        if (result.targetDied) {
          this.handleEnemyDeath(target);
        }

        return true; // Collision occurred
      }

      return false; // No collision
    };

    // Fire projectile
    await this.projectileManager.fireDragonProjectile(
      this.dragonSprite.x,
      this.dragonSprite.y,
      target.sprite,
      collisionCallback,
    );
  }

  /**
   * Update enemy attacks
   */
  private updateEnemyAttacks(enemies: EnemyData[], currentTime: number): void {
    if (!this.dragonSprite) return;

    for (const enemy of enemies) {
      const combatState = this.enemyCombatStates.get(enemy.id);
      if (!combatState || combatState.isDefeated) continue;

      // Check if enemy is in attack range
      const enemyRangePixels = this.calculateRangePixels(combatState.attackRangePercent);
      const distance = this.collisionSystem.getDistance(enemy.sprite, this.dragonSprite);

      if (distance <= enemyRangePixels) {
        // Enemy in range, check fire rate cooldown
        if (currentTime - combatState.lastFireTime >= combatState.fireRate) {
          this.fireEnemyProjectile(enemy, combatState);
          combatState.lastFireTime = currentTime;
        }
      }
    }
  }

  /**
   * Fire an enemy projectile at dragon
   */
  private async fireEnemyProjectile(
    enemy: EnemyData,
    combatState: EnemyCombatState,
  ): Promise<void> {
    if (!this.dragonSprite) return;

    // Create collision callback
    const collisionCallback = (projectileSprite: Sprite) => {
      if (!this.dragonSprite) return false;

      // Check collision with dragon
      const isColliding = this.collisionSystem.checkCollision(projectileSprite, this.dragonSprite);

      if (isColliding) {
        // Apply damage to dragon
        const result = this.damageSystem.applyDragonDamage(
          this.dragonState.hp,
          enemy.damage,
          this.dragonState.maxHP,
        );

        this.dragonState.hp = result.newHealth;

        // Handle dragon death
        if (result.targetDied) {
          this.handleDragonDeath();
        }

        return true; // Collision occurred
      }

      return false; // No collision
    };

    // Fire projectile
    await this.projectileManager.fireEnemyProjectile(
      enemy.sprite.x,
      enemy.sprite.y,
      this.dragonSprite.x,
      this.dragonSprite.y,
      enemy.type,
      collisionCallback,
    );
  }

  /**
   * Handle enemy death
   */
  private handleEnemyDeath(enemy: EnemyData): void {
    const combatState = this.enemyCombatStates.get(enemy.id);
    if (!combatState) return;

    combatState.isDefeated = true;
    combatState.deathData = this.damageSystem.createDeathData();

    console.log(`💀 Enemy ${enemy.type} defeated!`);
  }

  /**
   * Handle dragon death
   */
  private handleDragonDeath(): void {
    console.log('💀 Dragon defeated! Calculating pushback...');
    // TODO: Implement pushback system
    // This will be wired into journey pause/farming system
  }

  /**
   * Update death animations for all enemies
   */
  private updateDeathAnimations(enemies: EnemyData[], currentTime: number): void {
    for (const enemy of enemies) {
      const combatState = this.enemyCombatStates.get(enemy.id);
      if (!combatState || !combatState.isDefeated || !combatState.deathData) continue;

      // Update blink animation
      const isComplete = this.damageSystem.updateDeathAnimation(combatState.deathData, currentTime);

      // Update sprite visibility
      enemy.sprite.visible = combatState.deathData.isBlinking;

      // Remove enemy when animation complete
      if (isComplete) {
        // Mark for removal by EnemyManager
        enemy.sprite.visible = false;
        // EnemyManager will clean up in its update loop
      }
    }
  }

  /**
   * Calculate scaled enemy stats based on distance
   */
  private calculateScaledStats(distance: number): { hp: number; damage: number } {
    const scalingFactor = Math.pow(
      this.config.scalingGrowthRate,
      Math.floor(distance / this.config.scalingInterval),
    );

    // Base stats
    const baseHP = 10;
    const baseDamageMin = 1.5;
    const baseDamageMax = 2.5;

    // Scale and roll damage
    const scaledHP = Math.floor(baseHP * scalingFactor);
    const scaledDamageMin = baseDamageMin * scalingFactor;
    const scaledDamageMax = baseDamageMax * scalingFactor;

    // Roll damage (fixed per enemy at spawn)
    const damage = Math.random() * (scaledDamageMax - scaledDamageMin) + scaledDamageMin;

    return {
      hp: scaledHP,
      damage: parseFloat(damage.toFixed(2)),
    };
  }

  /**
   * Calculate range in pixels from percentage
   */
  private calculateRangePixels(rangePercent: number): number {
    const visibleWidth = this.config.screenWidth - this.config.dragonXPosition;
    return visibleWidth * rangePercent;
  }

  /**
   * Get dragon combat state
   */
  getDragonState(): DragonCombatState {
    return { ...this.dragonState };
  }

  /**
   * Get enemy combat state
   */
  getEnemyCombatState(enemyId: number): EnemyCombatState | undefined {
    const state = this.enemyCombatStates.get(enemyId);
    return state ? { ...state } : undefined;
  }

  /**
   * Update current distance (for scaling calculations)
   */
  setCurrentDistance(distance: number): void {
    this.currentDistance = distance;
  }

  /**
   * Clear all combat state
   */
  clearAll(): void {
    this.enemyCombatStates.clear();
    this.projectileManager.clearAllProjectiles();
    this.dragonState.hp = this.dragonState.maxHP;
    this.dragonState.lastFireTime = 0;
  }

  /**
   * Destroy combat manager
   */
  destroy(): void {
    this.clearAll();
    this.projectileManager.destroy();
  }
}
