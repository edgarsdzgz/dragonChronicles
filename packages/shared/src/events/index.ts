/**
 * Event system exports for Draconia Chronicles
 *
 * Provides centralized event bus and event type definitions
 */

// Core event bus
export { EventBus, getEventBus, type EventBusConfig } from './event-bus.js';

// Base types
export type { BaseGameEvent, EventSubscription, EventHandler } from './types.js';

// Combat events
export type {
  CombatEvent,
  EnemyDefeatedEvent,
  DeathAnimationStartedEvent,
  DeathAnimationCompleteEvent,
  ArcanaCalculatedEvent,
  ArcanaAwardedEvent,
  EnemyRemovedEvent,
  ProjectileFiredEvent,
  ProjectileHitEvent,
  EnemyDefeatedPayload,
  DeathAnimationStartedPayload,
  DeathAnimationCompletePayload,
  ArcanaCalculatedPayload,
  ArcanaAwardedPayload,
  EnemyRemovedPayload,
  ProjectileFiredPayload,
  ProjectileHitPayload,
} from './combat-events.js';

// UI events
export type {
  UIEvent,
  MovementButtonClickedEvent,
  SpeedChangeEvent,
  MovementStateChangeEvent,
  MovementButtonClickedPayload,
  SpeedChangePayload,
  MovementStateChangePayload,
} from './ui-events.js';

