/**
 * @file PCG32 Deterministic Random Number Generator
 * @description Phase 1 Story 1: High-quality deterministic RNG for reproducible simulation
 */

import type { Rng } from '../../shared/types.js';

/**
 * PCG32 RNG implementation
 * 
 * Uses the PCG-XSH-RR variant with 64-bit state and 32-bit output.
 * Provides excellent statistical quality and fast generation.
 * 
 * Based on the PCG family of random number generators by Melissa O'Neill.
 * Reference: https://www.pcg-random.org/
 */
export class PCG32 implements Rng {
  private state: bigint;
  private inc: bigint;

  /**
   * Creates a new PCG32 instance
   * @param seed - Initial seed value (will be converted to uint32)
   * @param seq - Sequence number (default: 0)
   */
  constructor(seed: number, seq: number = 0) {
    // Convert to uint32 and ensure non-zero
    const seedU32 = (seed >>> 0) || 1;
    const seqU32 = (seq >>> 0) || 1;

    this.state = 0n;
    this.inc = (BigInt(seqU32) << 1n) | 1n;
    this.nextU32();
    this.state += BigInt(seedU32);
    this.nextU32();
  }

  /**
   * Generates the next 32-bit random number
   * @returns 32-bit unsigned integer
   */
  nextU32(): number {
    const oldstate = this.state;
    this.state = oldstate * 6364136223846793005n + this.inc;
    const xorshifted = Number(((oldstate >> 18n) ^ oldstate) >> 27n);
    const rot = Number(oldstate >> 59n);
    return ((xorshifted >> rot) | (xorshifted << (-rot & 31))) >>> 0;
  }

  /**
   * Generates a random float in the range [0, 1)
   * @returns Random float between 0 and 1
   */
  nextFloat01(): number {
    return this.nextU32() / 0x1_0000_0000;
  }

  /**
   * Generates a random integer in the range [min, max] (inclusive)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   * @returns Random integer in the specified range
   */
  int(min: number, max: number): number {
    const range = max - min + 1;
    const maxValue = 0x1_0000_0000;
    const threshold = maxValue - (maxValue % range);

    let value: number;
    do {
      value = this.nextU32();
    } while (value >= threshold);

    return min + (value % range);
  }

  /**
   * Generates a random float in the range [min, max)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random float in the specified range
   */
  float(min: number, max: number): number {
    return min + this.nextFloat01() * (max - min);
  }

  /**
   * Creates a copy of this RNG with the same state
   * @returns New PCG32 instance with identical state
   */
  clone(): PCG32 {
    const cloned = new PCG32(0, 0);
    cloned.state = this.state;
    cloned.inc = this.inc;
    return cloned;
  }

  /**
   * Gets the current state for debugging/testing
   * @returns Current state value
   */
  getState(): bigint {
    return this.state;
  }

  /**
   * Gets the current increment for debugging/testing
   * @returns Current increment value
   */
  getInc(): bigint {
    return this.inc;
  }

  /**
   * Advances the RNG by the specified number of steps
   * @param steps - Number of steps to advance
   */
  advance(steps: number): void {
    for (let i = 0; i < steps; i++) {
      this.nextU32();
    }
  }
}

/**
 * Creates a new PCG32 instance with the given seed
 * @param seed - Seed value for the RNG
 * @returns New PCG32 instance
 */
export function makeRng(seed: number): PCG32 {
  return new PCG32(seed);
}

/**
 * Creates a PCG32 instance from a string seed
 * @param seed - String seed to hash
 * @returns New PCG32 instance
 */
export function makeRngFromString(seed: string): PCG32 {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash + char) & 0xffffffff;
  }
  return new PCG32(hash);
}
