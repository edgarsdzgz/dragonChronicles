/**
 * @file Logging infrastructure for the Draconia Chronicles
 * @description Provides structured logging with memory buffering and level-based filtering
 */

import { DRACONIA_VERSION } from '@draconia/shared';

/** Supported log levels in ascending order of severity */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Structured log event with metadata
 * @property t - Timestamp (Unix milliseconds)
 * @property lvl - Log level
 * @property src - Source component/module name
 * @property msg - Human-readable message
 * @property data - Optional structured data payload
 */
export type LogEvent = {
  readonly t: number;
  readonly lvl: LogLevel;
  readonly src: string;
  readonly msg: string;
  readonly data?: Record<string, unknown>;
};

/**
 * Logger interface supporting structured event logging
 */
export interface Logger {
  /** Write a log event to the logger */
  // eslint-disable-next-line no-unused-vars
  log(event: LogEvent): void;
  /** Drain all buffered events and clear the buffer */
  drain(): LogEvent[];
}

/**
 * Creates an in-memory logger with circular buffer behavior
 * @param capacity - Maximum number of events to buffer (default: 1000)
 * @returns A Logger instance that stores events in memory
 *
 * @example
 * const logger = createMemoryLogger(100);
 * logger.log({ t: Date.now(), lvl: "info", src: "app", msg: "Started" });
 * const events = logger.drain(); // Get all events and clear buffer
 */
export function createMemoryLogger(capacity = 1000): Logger {
  const buffer: LogEvent[] = [];

  return {
    log(event: LogEvent): void {
      buffer.push(event);
      // Maintain capacity with FIFO eviction
      if (buffer.length > capacity) {
        buffer.shift();
      }
    },

    drain(): LogEvent[] {
      const snapshot = buffer.slice();
      buffer.length = 0; // Clear the buffer
      return snapshot;
    },
  };
}

/**
 * Health check function that verifies logger package integration
 * @returns A status string including the current system version
 */
export function helloLog(): string {
  return `logger-ok@${DRACONIA_VERSION}`;
}
