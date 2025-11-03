/**
 * Event system type definitions for Draconia Chronicles
 *
 * Provides base event structures and type-safe event definitions
 * that support multiple domains (combat, cutscene, shop, dialog, ui, etc.)
 */

/**
 * Base event structure that all events must extend
 */
export interface BaseGameEvent {
  /** Unique event type identifier within category */
  type: string;
  /** Domain namespace (combat, cutscene, shop, dialog, ui, etc.) */
  category: string;
  /** Timestamp when event occurred (milliseconds since epoch) */
  timestamp: number;
  /** Source system/manager that emitted the event (optional) */
  source?: string;
  /** Additional context/metadata (optional) */
  metadata?: Record<string, unknown>;
  /** Event payload (type-specific) */
  payload: unknown;
}

/**
 * Event subscription handle for cleanup
 */
export interface EventSubscription {
  /** Unsubscribe from the event */
  unsubscribe(): void;
}

/**
 * Generic event handler function type
 */
export type EventHandler<T extends BaseGameEvent = BaseGameEvent> = (
  _event: T,
) => void | Promise<void>;

