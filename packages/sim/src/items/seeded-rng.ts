/**
 * @file Seeded Random Number Generator
 * @description Deterministic RNG for anti-save-scumming
 *
 * Uses profile ID as seed to ensure drops are consistent
 * across saves/loads, preventing players from reloading
 * for better drops.
 */

/**
 * Simple seeded random number generator
 * Based on Linear Congruential Generator (LCG)
 */
export class SeededRNG {
  private seed: number;

  constructor(seedString: string) {
    this.seed = this.hashString(seedString);
  }

  /**
   * Hash string to number for seed
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate random number [0, 1)
   */
  random(): number {
    // LCG formula: (a * seed + c) % m
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Generate random integer [min, max] (inclusive)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Pick random element from array
   */
  randomElement<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick random element from empty array');
    }
    const index = this.randomInt(0, array.length - 1);
    return array[index]!;
  }
}
