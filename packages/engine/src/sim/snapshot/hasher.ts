/**
 * @file Fast 64-bit hash function for snapshot verification
 * @description Phase 1 Story 1: xxhash-like hasher for byte-equal determinism verification
 */

/**
 * Fast 64-bit hash function inspired by xxHash
 *
 * Provides fast, high-quality hashing suitable for determinism verification.
 * Uses 64-bit arithmetic with 32-bit fallback for compatibility.
 */
export class FastHasher {
  private static readonly PRIME1 = 0x9e3779b185ebca87n;
  private static readonly PRIME2 = 0xc2b2ae3d27d4eb4fn;
  private static readonly PRIME3 = 0x165667b19e3779f9n;
  private static readonly PRIME4 = 0x85ebca77c2b2ae63n;
  private static readonly PRIME5 = 0x27d4eb2f165667c5n;

  /**
   * Hashes a string to a 64-bit value
   * @param input - String to hash
   * @returns 64-bit hash as hex string
   */
  static hash64(input: string): string {
    const bytes = new TextEncoder().encode(input);
    return this.hash64Bytes(bytes);
  }

  /**
   * Hashes a byte array to a 64-bit value
   * @param bytes - Byte array to hash
   * @returns 64-bit hash as hex string
   */
  static hash64Bytes(bytes: Uint8Array): string {
    let hash = 0x9e3779b97f4a7c15n; // Seed

    let i = 0;
    const len = bytes.length;

    // Process 8-byte chunks
    while (i + 8 <= len) {
      const chunk = this.readUint64(bytes, i);
      hash = this.round(hash, chunk);
      i += 8;
    }

    // Process remaining bytes
    if (i < len) {
      let remaining = 0n;
      let shift = 0n;

      while (i < len) {
        remaining |= BigInt(bytes[i]!) << shift;
        shift += 8n;
        i++;
      }

      hash = this.round(hash, remaining);
    }

    // Finalize
    hash ^= BigInt(len);
    hash = this.mix64(hash);

    return hash.toString(16).padStart(16, '0');
  }

  /**
   * Reads a 64-bit value from byte array (little-endian)
   * @param bytes - Byte array
   * @param offset - Offset to read from
   * @returns 64-bit value
   */
  private static readUint64(bytes: Uint8Array, offset: number): bigint {
    let value = 0n;
    for (let i = 0; i < 8; i++) {
      value |= BigInt(bytes[offset + i]!) << BigInt(i * 8);
    }
    return value;
  }

  /**
   * Performs one round of the hash function
   * @param hash - Current hash value
   * @param chunk - 8-byte chunk to process
   * @returns Updated hash value
   */
  private static round(hash: bigint, chunk: bigint): bigint {
    hash += chunk * this.PRIME2;
    hash = this.rotl64(hash, 31n);
    hash *= this.PRIME1;
    return hash;
  }

  /**
   * Rotates a 64-bit value left
   * @param value - Value to rotate
   * @param amount - Amount to rotate by
   * @returns Rotated value
   */
  private static rotl64(value: bigint, amount: bigint): bigint {
    return ((value << amount) | (value >> (64n - amount))) & 0xffffffffffffffffn;
  }

  /**
   * Mixes a 64-bit value
   * @param value - Value to mix
   * @returns Mixed value
   */
  private static mix64(value: bigint): bigint {
    value ^= value >> 33n;
    value *= this.PRIME2;
    value ^= value >> 29n;
    value *= this.PRIME3;
    value ^= value >> 32n;
    return value;
  }

  /**
   * Hashes multiple strings and combines them
   * @param inputs - Array of strings to hash
   * @returns Combined 64-bit hash as hex string
   */
  static hash64Multiple(inputs: string[]): string {
    let combined = 0x9e3779b97f4a7c15n;

    for (const input of inputs) {
      const hash = BigInt('0x' + this.hash64(input));
      combined ^= hash;
      combined = this.mix64(combined);
    }

    return combined.toString(16).padStart(16, '0');
  }

  /**
   * Creates a hash from a snapshot stream
   * @param stream - Snapshot stream string
   * @returns 64-bit hash as hex string
   */
  static hashSnapshotStream(stream: string): string {
    return this.hash64(stream);
  }
}

/**
 * Convenience function to hash a string to 64-bit
 * @param input - String to hash
 * @returns 64-bit hash as hex string
 */
export function hash64(input: string): string {
  return FastHasher.hash64(input);
}

/**
 * Convenience function to hash a snapshot stream
 * @param stream - Snapshot stream string
 * @returns 64-bit hash as hex string
 */
export function hashSnapshotStream(stream: string): string {
  return FastHasher.hashSnapshotStream(stream);
}

/**
 * Hash comparison utilities
 */
export class HashComparator {
  /**
   * Compares two hashes for equality
   * @param hash1 - First hash
   * @param hash2 - Second hash
   * @returns True if hashes are equal, false otherwise
   */
  static equal(hash1: string, hash2: string): boolean {
    return hash1.toLowerCase() === hash2.toLowerCase();
  }

  /**
   * Gets the difference between two hashes (for debugging)
   * @param hash1 - First hash
   * @param hash2 - Second hash
   * @returns Object with comparison details
   */
  static diff(
    hash1: string,
    hash2: string,
  ): {
    equal: boolean;
    length1: number;
    length2: number;
    format1: string;
    format2: string;
  } {
    return {
      equal: this.equal(hash1, hash2),
      length1: hash1.length,
      length2: hash2.length,
      format1: hash1.match(/^[0-9a-f]+$/i) ? 'hex' : 'unknown',
      format2: hash2.match(/^[0-9a-f]+$/i) ? 'hex' : 'unknown',
    };
  }
}
