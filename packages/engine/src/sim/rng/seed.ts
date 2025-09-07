/**
 * @file Seed management and mixing utilities
 * @description Phase 1 Story 1: Canonical seed processing and stream derivation
 */

/**
 * Converts a value to uint32, ensuring it's in the valid range
 * @param value - Value to convert
 * @returns uint32 value
 */
export function toUint32(value: number): number {
  return Math.floor(value) >>> 0;
}

/**
 * Mixes a 64-bit value using SplitMix64-like algorithm
 * @param value - 64-bit value to mix
 * @returns Mixed 64-bit value
 */
export function mix64(value: bigint): bigint {
  let z = value;
  z = (z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n;
  z = (z ^ (z >> 27n)) * 0x94d049bb133111ebn;
  return z ^ (z >> 31n);
}

/**
 * Mixes a 32-bit value for stream derivation
 * @param value - 32-bit value to mix
 * @returns Mixed 32-bit value
 */
export function mix32(value: number): number {
  let z = toUint32(value);
  z = ((z ^ (z >> 16)) * 0x85ebca6b) >>> 0;
  z = ((z ^ (z >> 13)) * 0xc2b2ae35) >>> 0;
  return (z ^ (z >> 16)) >>> 0;
}

/**
 * Hashes a string to a 32-bit value
 * @param str - String to hash
 * @returns 32-bit hash value
 */
export function hashStr32(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) & 0xffffffff;
  }
  return hash >>> 0;
}

/**
 * Clamps a seed value to the valid uint32 range
 * @param seed - Seed value to clamp
 * @returns Clamped seed value
 */
export function clampSeed(seed: number): number {
  if (!Number.isFinite(seed)) {
    throw new Error('Seed must be a finite number');
  }
  
  const clamped = toUint32(seed);
  if (clamped === 0) {
    return 1; // Ensure non-zero seed
  }
  return clamped;
}

/**
 * Derives a sub-seed from a master seed and stream name
 * @param masterSeed - Master seed value
 * @param streamName - Name of the stream
 * @returns Derived sub-seed
 */
export function deriveSubSeed(masterSeed: number, streamName: string): number {
  const clampedMaster = clampSeed(masterSeed);
  const nameHash = hashStr32(streamName);
  return mix32(clampedMaster ^ nameHash);
}

/**
 * Validates that a seed is in the valid range
 * @param seed - Seed to validate
 * @returns True if valid, false otherwise
 */
export function isValidSeed(seed: number): boolean {
  return Number.isFinite(seed) && seed >= 0 && seed <= 0xffffffff;
}

/**
 * Generates a random seed using crypto.getRandomValues if available
 * @returns Random seed value
 */
export function generateRandomSeed(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] || 1; // Ensure non-zero
  }
  
  // Fallback to Math.random (less secure but deterministic for testing)
  return Math.floor(Math.random() * 0xffffffff) || 1;
}

/**
 * Creates a seed from current timestamp
 * @returns Timestamp-based seed
 */
export function createTimestampSeed(): number {
  return toUint32(Date.now());
}

/**
 * Combines multiple seed values into a single seed
 * @param seeds - Array of seed values to combine
 * @returns Combined seed value
 */
export function combineSeeds(...seeds: number[]): number {
  let combined = 0;
  for (const seed of seeds) {
    combined = mix32(combined ^ clampSeed(seed));
  }
  return combined || 1; // Ensure non-zero
}
