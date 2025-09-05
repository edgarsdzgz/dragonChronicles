/**
 * PCG32 Deterministic Random Number Generator
 *
 * Implements the Permuted Congruential Generator (PCG) algorithm for
 * deterministic random number generation. Provides seed-based reproducibility
 * and high-quality random numbers suitable for simulation.
 */

/**
 * PCG32 RNG implementation
 *
 * Uses the PCG-XSH-RR variant with 64-bit state and 32-bit output.
 * Provides excellent statistical quality and fast generation.
 */
export class PCG32 {
  private state: bigint;
  private inc: bigint;

  /**
   * Creates a new PCG32 instance
   * @param seed - Initial seed value
   * @param seq - Sequence number (default: 0)
   */
  constructor(seed: bigint, seq: bigint = 0n) {
    this.state = 0n;
    this.inc = (seq << 1n) | 1n;
    this.next();
    this.state += seed;
    this.next();
  }

  /**
   * Generates the next 32-bit random number
   * @returns 32-bit unsigned integer
   */
  next(): number {
    const oldstate = this.state;
    this.state = oldstate * 6364136223846793005n + this.inc;
    const xorshifted = Number(((oldstate >> 18n) ^ oldstate) >> 27n);
    const rot = Number(oldstate >> 59n);
    return ((xorshifted >> rot) | (xorshifted << (-rot & 31))) >>> 0;
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
      value = this.next();
    } while (value >= threshold);

    return min + (value % range);
  }

  /**
   * Generates a random float in the range [0, 1)
   * @returns Random float between 0 and 1
   */
  float(): number {
    return this.next() / 0x1_0000_0000;
  }

  /**
   * Creates a copy of this RNG with the same state
   * @returns New PCG32 instance with identical state
   */
  clone(): PCG32 {
    const cloned = new PCG32(0n, 0n);
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
}

/**
 * Creates a new PCG32 instance with the given seed
 * @param seed - Seed value for the RNG
 * @returns New PCG32 instance
 */
export function createPCG32(seed: bigint): PCG32 {
  return new PCG32(seed);
}

/**
 * Creates a PCG32 instance from a string seed
 * @param seed - String seed to hash
 * @returns New PCG32 instance
 */
export function createPCG32FromString(seed: string): PCG32 {
  let hash = 0n;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5n) - hash + BigInt(char)) & 0xffffffffffffffffn;
  }
  return new PCG32(hash);
}
