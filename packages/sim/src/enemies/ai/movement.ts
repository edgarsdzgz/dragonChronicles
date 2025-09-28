/**
 * @file Movement and pathfinding system for enemies
 * @description P1-E2-S2: Movement system for enemy AI behavior
 */

import type { SpawnedEnemy, Vector2 } from '../types.js';

/**
 * Movement configuration
 */
export interface MovementConfig {
  /** Base movement speed */
  baseSpeed: number;
  /** Speed multiplier for different states */
  speedMultiplier: number;
  /** Maximum velocity magnitude */
  maxVelocity: number;
  /** Acceleration rate */
  acceleration: number;
  /** Deceleration rate */
  deceleration: number;
  /** Collision avoidance radius */
  avoidanceRadius: number;
  /** Pathfinding update frequency */
  updateFrequency: number;
}

/**
 * Movement state data
 */
export interface MovementState {
  /** Current velocity */
  velocity: Vector2;
  /** Target position */
  target: Vector2;
  /** Last update time */
  lastUpdateTime: number;
  /** Movement accumulator */
  updateAccumulator: number;
  /** Configuration */
  config: MovementConfig;
}

/**
 * Movement system for enemy AI
 */
export class EnemyMovement {
  private enemy: SpawnedEnemy;
  private movementState: MovementState;
  private obstacles: Vector2[] = [];

  constructor(enemy: SpawnedEnemy, target: Vector2, config?: Partial<MovementConfig>) {
    this.enemy = enemy;

    const defaultConfig: MovementConfig = {
      baseSpeed: enemy.spd,
      speedMultiplier: 1.0,
      maxVelocity: 200,
      acceleration: 500,
      deceleration: 300,
      avoidanceRadius: 30,
      updateFrequency: 60, // 60 FPS
    };

    this.movementState = {
      velocity: { x: 0, y: 0 },
      target,
      lastUpdateTime: Date.now(),
      updateAccumulator: 0,
      config: { ...defaultConfig, ...config },
    };
  }

  /**
   * Update movement system
   * @param deltaTime - Time elapsed since last update in milliseconds
   * @param target - Current target position
   * @param obstacles - Array of obstacle positions
   */
  update(deltaTime: number, target: Vector2, obstacles: Vector2[] = []): void {
    // Update target
    this.movementState.target = target;
    this.obstacles = obstacles;

    // Accumulate update time
    this.movementState.updateAccumulator += deltaTime;

    // Check if it's time to update based on frequency
    const updateInterval = 1000 / this.movementState.config.updateFrequency;
    if (this.movementState.updateAccumulator < updateInterval) {
      return;
    }

    // Reset accumulator
    this.movementState.updateAccumulator = 0;

    // Update movement
    this.updateMovement(deltaTime);

    // Apply movement to enemy
    this.applyMovement(deltaTime);
  }

  /**
   * Update movement calculations
   * @param deltaTime - Time elapsed since last update
   */
  private updateMovement(deltaTime: number): void {
    const distanceToTarget = this.getDistanceToTarget();

    // If very close to target, stop moving
    if (distanceToTarget < 5) {
      this.stopMovement();
      return;
    }

    // Calculate desired velocity toward target
    const desiredVelocity = this.calculateDesiredVelocity();

    // Apply collision avoidance
    const avoidanceVelocity = this.calculateAvoidanceVelocity();

    // Combine velocities
    const finalVelocity = this.combineVelocities(desiredVelocity, avoidanceVelocity);

    // Apply acceleration/deceleration
    this.applyAcceleration(finalVelocity, deltaTime);
  }

  /**
   * Calculate desired velocity toward target
   * @returns Desired velocity vector
   */
  private calculateDesiredVelocity(): Vector2 {
    const dx = this.movementState.target.x - this.enemy.position.x;
    const dy = this.movementState.target.y - this.enemy.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      return { x: 0, y: 0 };
    }

    // Normalize direction and apply speed
    const speed = this.movementState.config.baseSpeed * this.movementState.config.speedMultiplier;
    return {
      x: (dx / distance) * speed,
      y: (dy / distance) * speed,
    };
  }

  /**
   * Calculate collision avoidance velocity
   * @returns Avoidance velocity vector
   */
  private calculateAvoidanceVelocity(): Vector2 {
    let avoidanceX = 0;
    let avoidanceY = 0;

    for (const obstacle of this.obstacles) {
      const dx = this.enemy.position.x - obstacle.x;
      const dy = this.enemy.position.y - obstacle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If obstacle is within avoidance radius
      if (distance < this.movementState.config.avoidanceRadius && distance > 0) {
        // Calculate avoidance force (stronger when closer)
        const avoidanceForce =
          (this.movementState.config.avoidanceRadius - distance) /
          this.movementState.config.avoidanceRadius;
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;

        avoidanceX += normalizedDx * avoidanceForce;
        avoidanceY += normalizedDy * avoidanceForce;
      }
    }

    return { x: avoidanceX, y: avoidanceY };
  }

  /**
   * Combine desired velocity with avoidance velocity
   * @param desired - Desired velocity
   * @param avoidance - Avoidance velocity
   * @returns Combined velocity
   */
  private combineVelocities(desired: Vector2, avoidance: Vector2): Vector2 {
    // Weight the velocities (desired is primary, avoidance is secondary)
    const desiredWeight = 0.7;
    const avoidanceWeight = 0.3;

    return {
      x: desired.x * desiredWeight + avoidance.x * avoidanceWeight,
      y: desired.y * desiredWeight + avoidance.y * avoidanceWeight,
    };
  }

  /**
   * Apply acceleration/deceleration to velocity
   * @param targetVelocity - Target velocity
   * @param deltaTime - Time elapsed
   */
  private applyAcceleration(targetVelocity: Vector2, deltaTime: number): void {
    const currentVelocity = this.movementState.velocity;
    const deltaTimeSeconds = deltaTime / 1000;

    // Calculate acceleration needed
    const accelerationX =
      (targetVelocity.x - currentVelocity.x) * this.movementState.config.acceleration;
    const accelerationY =
      (targetVelocity.y - currentVelocity.y) * this.movementState.config.acceleration;

    // Apply acceleration
    const newVelocityX = currentVelocity.x + accelerationX * deltaTimeSeconds;
    const newVelocityY = currentVelocity.y + accelerationY * deltaTimeSeconds;

    // Limit maximum velocity
    const magnitude = Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY);
    if (magnitude > this.movementState.config.maxVelocity) {
      const scale = this.movementState.config.maxVelocity / magnitude;
      this.movementState.velocity.x = newVelocityX * scale;
      this.movementState.velocity.y = newVelocityY * scale;
    } else {
      this.movementState.velocity.x = newVelocityX;
      this.movementState.velocity.y = newVelocityY;
    }
  }

  /**
   * Apply movement to enemy
   * @param deltaTime - Time elapsed
   */
  private applyMovement(deltaTime: number): void {
    const deltaTimeSeconds = deltaTime / 1000;

    // Update enemy position
    this.enemy.position.x += this.movementState.velocity.x * deltaTimeSeconds;
    this.enemy.position.y += this.movementState.velocity.y * deltaTimeSeconds;

    // Update enemy velocity
    this.enemy.velocity.x = this.movementState.velocity.x;
    this.enemy.velocity.y = this.movementState.velocity.y;
  }

  /**
   * Stop movement immediately
   */
  private stopMovement(): void {
    this.movementState.velocity.x = 0;
    this.movementState.velocity.y = 0;
    this.enemy.velocity.x = 0;
    this.enemy.velocity.y = 0;
  }

  /**
   * Get distance to target
   * @returns Distance to target
   */
  private getDistanceToTarget(): number {
    const dx = this.movementState.target.x - this.enemy.position.x;
    const dy = this.movementState.target.y - this.enemy.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Set movement target
   * @param target - New target position
   */
  setTarget(target: Vector2): void {
    this.movementState.target = target;
  }

  /**
   * Set speed multiplier
   * @param multiplier - Speed multiplier
   */
  setSpeedMultiplier(multiplier: number): void {
    this.movementState.config.speedMultiplier = multiplier;
  }

  /**
   * Get current velocity
   * @returns Current velocity
   */
  getVelocity(): Vector2 {
    return { ...this.movementState.velocity };
  }

  /**
   * Get movement state
   * @returns Current movement state
   */
  getMovementState(): MovementState {
    return { ...this.movementState };
  }

  /**
   * Check if enemy is moving
   * @returns True if enemy is moving
   */
  isMoving(): boolean {
    const magnitude = Math.sqrt(
      this.movementState.velocity.x * this.movementState.velocity.x +
        this.movementState.velocity.y * this.movementState.velocity.y,
    );
    return magnitude > 0.1; // Small threshold to account for floating point precision
  }
}
