/**
 * @file Game simulation engine for the Draconia Chronicles
 * @description Core game loop and simulation mechanics with optional logging integration
 */

import { clamp } from "@draconia/shared";

/**
 * Simple logging interface for simulation events
 * Allows simulation to report progress without tight coupling to specific loggers
 */
export interface SimLogger {
  /** Log a simulation message */
  log(message: string): void;
}

/**
 * Simulates a single game tick with bounds checking
 * @param currentValue - The current simulation state value
 * @param logger - Optional logger for debugging simulation steps
 * @returns The next simulation state value (currentValue + 1, clamped to safe bounds)
 * 
 * @example
 * // Basic usage
 * const next = simulateTick(41); // returns 42
 * 
 * // With logging
 * const logger = { log: console.log };
 * const next = simulateTick(41, logger); // logs "simulateTick: 41 -> 42"
 */
export function simulateTick(currentValue: number, logger?: SimLogger): number {
  // Increment with overflow protection
  const nextValue = clamp(currentValue + 1, 0, Number.MAX_SAFE_INTEGER);
  
  // Optional progress logging
  if (logger) {
    logger.log(`simulateTick: ${currentValue} -> ${nextValue}`);
  }
  
  return nextValue;
}