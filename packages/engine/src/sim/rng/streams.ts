/**
 * @file Named RNG streams for deterministic simulation
 * @description Phase 1 Story 1: Manages multiple deterministic RNG streams for different systems
 */

import type { Rng } from '../../shared/types.js';
import { PCG32 } from './pcg32.js';
import { deriveSubSeed, clampSeed } from './seed.js';
import { RNG_STREAM_NAMES } from '../../shared/constants.js';

/**
 * Registry for named RNG streams
 *
 * Each system gets its own deterministic stream derived from a master seed.
 * This ensures that different systems don't interfere with each other's
 * randomness while maintaining full determinism.
 */
export class RngStreams {
  private streams = new Map<string, Rng>();
  private masterSeed: number;

  /**
   * Creates a new RNG streams registry
   * @param masterSeed - Master seed for deriving all streams
   */
  constructor(masterSeed: number) {
    this.masterSeed = clampSeed(masterSeed);
  }

  /**
   * Gets or creates a named RNG stream
   * @param name - Name of the stream
   * @returns RNG instance for the stream
   */
  get(name: string): Rng {
    let stream = this.streams.get(name);

    if (!stream) {
      const subSeed = deriveSubSeed(this.masterSeed, name);
      stream = new PCG32(subSeed);
      this.streams.set(name, stream);
    }

    return stream;
  }

  /**
   * Gets a stream by name, throwing if it doesn't exist
   * @param name - Name of the stream
   * @returns RNG instance for the stream
   * @throws Error if stream doesn't exist
   */
  getRequired(name: string): Rng {
    const stream = this.streams.get(name);
    if (!stream) {
      throw new Error(
        `RNG stream '${name}' not found. Available streams: ${Array.from(this.streams.keys()).join(', ')}`,
      );
    }
    return stream;
  }

  /**
   * Creates a new stream with a specific seed
   * @param name - Name of the stream
   * @param seed - Specific seed for this stream
   * @returns RNG instance for the stream
   */
  createStream(name: string, seed: number): Rng {
    const clampedSeed = clampSeed(seed);
    const stream = new PCG32(clampedSeed);
    this.streams.set(name, stream);
    return stream;
  }

  /**
   * Removes a stream from the registry
   * @param name - Name of the stream to remove
   * @returns True if stream was removed, false if it didn't exist
   */
  removeStream(name: string): boolean {
    return this.streams.delete(name);
  }

  /**
   * Gets all available stream names
   * @returns Array of stream names
   */
  getStreamNames(): string[] {
    return Array.from(this.streams.keys());
  }

  /**
   * Gets the master seed
   * @returns Master seed value
   */
  getMasterSeed(): number {
    return this.masterSeed;
  }

  /**
   * Resets all streams to their initial state
   */
  reset(): void {
    this.streams.clear();
  }

  /**
   * Creates a copy of the streams registry
   * @returns New RngStreams instance with copied streams
   */
  clone(): RngStreams {
    const cloned = new RngStreams(this.masterSeed);

    for (const [name, stream] of this.streams) {
      if (stream instanceof PCG32) {
        cloned.streams.set(name, stream.clone());
      }
    }

    return cloned;
  }

  /**
   * Gets statistics about the streams
   * @returns Stream statistics
   */
  getStats(): {
    streamCount: number;
    streamNames: string[];
    masterSeed: number;
  } {
    return {
      streamCount: this.streams.size,
      streamNames: this.getStreamNames(),
      masterSeed: this.masterSeed,
    };
  }
}

/**
 * Creates a new RNG streams registry with standard streams
 * @param masterSeed - Master seed for deriving all streams
 * @returns RngStreams instance with standard streams initialized
 */
export function createStandardStreams(masterSeed: number): RngStreams {
  const streams = new RngStreams(masterSeed);

  // Initialize standard streams
  for (const streamName of RNG_STREAM_NAMES) {
    streams.get(streamName);
  }

  return streams;
}

/**
 * Validates that a stream name is valid
 * @param name - Stream name to validate
 * @returns True if valid, false otherwise
 */
export function isValidStreamName(name: string): boolean {
  return typeof name === 'string' && name.length > 0 && name.length <= 64;
}

/**
 * Gets the standard stream names
 * @returns Array of standard stream names
 */
export function getStandardStreamNames(): readonly string[] {
  return RNG_STREAM_NAMES;
}
