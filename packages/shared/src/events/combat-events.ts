/**
 * Combat event definitions for Draconia Chronicles
 *
 * Defines all combat-related events and their payload types.
 * These events are used for enemy defeat, death animations, and reward processing.
 */

import type { BaseGameEvent } from './types.js';

/**
 * Enemy defeat payload
 */
export interface EnemyDefeatedPayload {
  enemyId: string | number;
  enemyType: string;
  baseArcana: number;
  defeatMethod: 'projectile' | 'wave' | 'area_effect' | 'chain' | 'ability';
  position: { x: number; y: number };
  enemy: unknown; // Full enemy data for reference
}

/**
 * Death animation started payload
 */
export interface DeathAnimationStartedPayload {
  enemyId: string | number;
  animationStartTime: number;
  animationDuration: number;
}

/**
 * Death animation complete payload
 */
export interface DeathAnimationCompletePayload {
  enemyId: string | number;
  enemy: unknown; // Full enemy data for reward calculation
}

/**
 * Arcana calculated payload
 */
export interface ArcanaCalculatedPayload {
  enemyId: string | number;
  baseArcana: number;
  scaledArcana: number;
  distance: number;
  ward: number;
  distanceFactor: number;
  wardFactor: number;
}

/**
 * Arcana awarded payload
 */
export interface ArcanaAwardedPayload {
  enemyId: string | number;
  amount: number;
  totalBalance: number;
}

/**
 * Enemy removed payload
 */
export interface EnemyRemovedPayload {
  enemyId: string | number;
}

/**
 * Projectile fired payload
 */
export interface ProjectileFiredPayload {
  projectileId: string | number;
  sourceType: 'dragon' | 'enemy';
  targetId?: string | number;
  position: { x: number; y: number };
  targetPosition?: { x: number; y: number };
}

/**
 * Projectile hit payload
 */
export interface ProjectileHitPayload {
  projectileId: string | number;
  targetId: string | number;
  damage: number;
  position: { x: number; y: number };
}

/**
 * Enemy defeated event
 */
export interface EnemyDefeatedEvent extends BaseGameEvent {
  category: 'combat';
  type: 'enemy_defeated';
  payload: EnemyDefeatedPayload;
}

/**
 * Death animation started event
 */
export interface DeathAnimationStartedEvent extends BaseGameEvent {
  category: 'combat';
  type: 'death_animation_started';
  payload: DeathAnimationStartedPayload;
}

/**
 * Death animation complete event
 */
export interface DeathAnimationCompleteEvent extends BaseGameEvent {
  category: 'combat';
  type: 'death_animation_complete';
  payload: DeathAnimationCompletePayload;
}

/**
 * Arcana calculated event
 */
export interface ArcanaCalculatedEvent extends BaseGameEvent {
  category: 'combat';
  type: 'arcana_calculated';
  payload: ArcanaCalculatedPayload;
}

/**
 * Arcana awarded event
 */
export interface ArcanaAwardedEvent extends BaseGameEvent {
  category: 'combat';
  type: 'arcana_awarded';
  payload: ArcanaAwardedPayload;
}

/**
 * Enemy removed event
 */
export interface EnemyRemovedEvent extends BaseGameEvent {
  category: 'combat';
  type: 'enemy_removed';
  payload: EnemyRemovedPayload;
}

/**
 * Projectile fired event
 */
export interface ProjectileFiredEvent extends BaseGameEvent {
  category: 'combat';
  type: 'projectile_fired';
  payload: ProjectileFiredPayload;
}

/**
 * Projectile hit event
 */
export interface ProjectileHitEvent extends BaseGameEvent {
  category: 'combat';
  type: 'projectile_hit';
  payload: ProjectileHitPayload;
}

/**
 * Union type for all combat events
 */
export type CombatEvent =
  | EnemyDefeatedEvent
  | DeathAnimationStartedEvent
  | DeathAnimationCompleteEvent
  | ArcanaCalculatedEvent
  | ArcanaAwardedEvent
  | EnemyRemovedEvent
  | ProjectileFiredEvent
  | ProjectileHitEvent;
