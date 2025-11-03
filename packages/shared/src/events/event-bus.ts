/**
 * EventBus - Centralized event system for Draconia Chronicles
 *
 * Provides type-safe event emission and listening for all game systems.
 * Supports multiple domains (combat, cutscene, shop, dialog, ui, etc.)
 * with async handlers and error isolation.
 */

import type { BaseGameEvent, EventHandler, EventSubscription } from './types.js';

/**
 * EventBus configuration options
 */
export interface EventBusConfig {
  /** Enable event history for debugging/replay (default: false) */
  enableHistory?: boolean;
  /** Maximum number of events to keep in history (default: 1000) */
  maxHistorySize?: number;
  /** Enable error logging for listener errors (default: true) */
  enableErrorLogging?: boolean;
}

/**
 * Event listener entry with metadata
 */
interface ListenerEntry {
  handler: EventHandler;
  category: string;
  type: string;
}

/**
 * Centralized Event Bus for game-wide event communication
 */
export class EventBus {
  private static instance: EventBus | null = null;

  private listeners: Map<string, Set<ListenerEntry>> = new Map();
  private history: BaseGameEvent[] = [];
  private config: Required<EventBusConfig>;

  private constructor(config: EventBusConfig = {}) {
    this.config = {
      enableHistory: config.enableHistory ?? false,
      maxHistorySize: config.maxHistorySize ?? 1000,
      enableErrorLogging: config.enableErrorLogging ?? true,
    };
  }

  /**
   * Get singleton EventBus instance
   */
  static getInstance(config?: EventBusConfig): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus(config);
    }
    return EventBus.instance;
  }

  /**
   * Emit an event to all registered listeners
   * @param event - Event to emit
   */
  emit<T extends BaseGameEvent>(event: T): void {
    // Add to history if enabled
    if (this.config.enableHistory) {
      this.history.push(event);
      // Limit history size
      if (this.history.length > this.config.maxHistorySize) {
        this.history.shift();
      }
    }

    // Get listener key: "category:type" or "category:*" for category listeners
    const specificKey = `${event.category}:${event.type}`;
    const categoryKey = `${event.category}:*`;

    // Get listeners for specific type
    const specificListeners = this.listeners.get(specificKey);
    if (specificListeners) {
      for (const listener of specificListeners) {
        this.invokeHandler(listener.handler, event);
      }
    }

    // Get listeners for entire category
    const categoryListeners = this.listeners.get(categoryKey);
    if (categoryListeners) {
      for (const listener of categoryListeners) {
        this.invokeHandler(listener.handler, event);
      }
    }
  }

  /**
   * Subscribe to a specific event type
   * @param category - Event category (domain)
   * @param type - Event type within category
   * @param handler - Handler function
   * @returns Subscription handle for cleanup
   */
  on<T extends BaseGameEvent>(
    category: T['category'],
    type: T['type'],
    handler: EventHandler<T>,
  ): EventSubscription {
    const key = `${category}:${type}`;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    const listener: ListenerEntry = {
      handler: handler as EventHandler,
      category,
      type,
    };

    this.listeners.get(key)!.add(listener);

    // Return subscription handle
    return {
      unsubscribe: () => {
        this.off(category, type, handler);
      },
    };
  }

  /**
   * Subscribe to all events in a category
   * @param category - Event category (domain)
   * @param handler - Handler function
   * @returns Subscription handle for cleanup
   */
  onCategory<T extends BaseGameEvent>(
    category: T['category'],
    handler: EventHandler<T>,
  ): EventSubscription {
    const key = `${category}:*`;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    const listener: ListenerEntry = {
      handler: handler as EventHandler,
      category,
      type: '*',
    };

    this.listeners.get(key)!.add(listener);

    // Return subscription handle
    return {
      unsubscribe: () => {
        this.offCategory(category, handler);
      },
    };
  }

  /**
   * Unsubscribe from a specific event type
   * @param category - Event category
   * @param type - Event type
   * @param handler - Handler function to remove
   */
  off(category: string, type: string, handler: Function): void {
    const key = `${category}:${type}`;
    const listeners = this.listeners.get(key);

    if (listeners) {
      for (const listener of listeners) {
        if (listener.handler === handler) {
          listeners.delete(listener);
        }
      }

      // Clean up empty listener sets
      if (listeners.size === 0) {
        this.listeners.delete(key);
      }
    }
  }

  /**
   * Unsubscribe from category events
   * @param category - Event category
   * @param handler - Handler function to remove
   */
  offCategory(category: string, handler: Function): void {
    const key = `${category}:*`;
    const listeners = this.listeners.get(key);

    if (listeners) {
      for (const listener of listeners) {
        if (listener.handler === handler) {
          listeners.delete(listener);
        }
      }

      // Clean up empty listener sets
      if (listeners.size === 0) {
        this.listeners.delete(key);
      }
    }
  }

  /**
   * Clear all listeners (for cleanup/testing)
   */
  clear(): void {
    this.listeners.clear();
    this.history = [];
  }

  /**
   * Get event history (if enabled)
   * @returns Array of recent events
   */
  getHistory(): readonly BaseGameEvent[] {
    return [...this.history];
  }

  /**
   * Get listener count for debugging
   * @returns Map of event keys to listener counts
   */
  getListenerCounts(): Map<string, number> {
    const counts = new Map<string, number>();
    for (const [key, listeners] of this.listeners.entries()) {
      counts.set(key, listeners.size);
    }
    return counts;
  }

  /**
   * Invoke a handler with error isolation
   * @param handler - Handler function to invoke
   * @param event - Event to pass to handler
   */
  private invokeHandler(handler: EventHandler, event: BaseGameEvent): void {
    try {
      const result = handler(event);
      // Handle async handlers (fire and forget)
      if (result instanceof Promise) {
        result.catch((error) => {
          if (this.config.enableErrorLogging) {
            console.error(`Error in async event handler for ${event.category}:${event.type}:`, error);
          }
        });
      }
    } catch (error) {
      // Error isolation: one handler failure doesn't break others
      if (this.config.enableErrorLogging) {
        console.error(`Error in event handler for ${event.category}:${event.type}:`, error);
      }
    }
  }
}

/**
 * Get the singleton EventBus instance
 * @param config - Optional configuration (only applied on first call)
 * @returns EventBus instance
 */
export function getEventBus(config?: EventBusConfig): EventBus {
  return EventBus.getInstance(config);
}

