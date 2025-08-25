/**
 * @file Core shared utilities and constants for the Draconia Chronicles monorepo
 * @description Provides version information, mathematical utilities, and foundational types
 */

/** Current version of the Draconia Chronicles system */
export const DRACONIA_VERSION = '0.0.0-phase0';

/**
 * Clamps a numeric value within the specified bounds [lo, hi]
 * @param v - The value to clamp
 * @param lo - The lower bound (inclusive)
 * @param hi - The upper bound (inclusive)
 * @returns The clamped value
 * @throws {Error} When lo > hi (invalid bounds)
 * @example
 * clamp(5, 0, 10)   // returns 5
 * clamp(-1, 0, 10)  // returns 0
 * clamp(15, 0, 10)  // returns 10
 */
export function clamp(value: number, lo: number, hi: number): number {
  if (lo > hi) {
    throw new Error(`Invalid bounds: lo (${lo}) > hi (${hi})`);
  }
  return Math.min(hi, Math.max(lo, value));
}

/**
 * Seed type for deterministic random number generation
 * Uses a 64-bit representation split into high and low 32-bit components
 */
export type Seed = {
  /** High 32 bits of the seed */
  readonly hi: number;
  /** Low 32 bits of the seed */
  readonly lo: number;
};

// Export protocol v1 for worker-UI communication
export * from './protocol.js';

// Export deterministic RNG
export * from './rng.js';
