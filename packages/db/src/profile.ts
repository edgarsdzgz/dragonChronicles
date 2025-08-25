/**
 * Profile utility functions
 * 
 * Provides profile creation and management functions for backward compatibility
 * with existing code that expects makeProfile functionality.
 */

import type { ProfileV1 } from './schema.v1.js';
import { validateProfileV1 } from './schema.v1.js';

/**
 * User profile data structure (legacy interface)
 * @property id - Unique identifier for the profile
 * @property name - Display name (user-provided)
 * @property createdAt - Profile creation timestamp (Unix milliseconds)
 * @property seed - Optional deterministic seed for gameplay RNG
 */
export type Profile = {
  readonly id: string;
  readonly name: string;
  readonly createdAt: number;
  readonly seed?: bigint;
};

/**
 * Creates a new user profile with generated ID and current timestamp
 * @param name - The display name for the profile
 * @returns A new Profile instance
 * @throws {Error} When name doesn't match validation rules
 *
 * @example
 * const profile = makeProfile("Aster");
 * console.log(profile.id); // "ak9x7m2p" (random)
 */
export function makeProfile(name: string): Profile {
  if (!isValidProfileName(name)) {
    throw new Error(
      'invalid-name: must be 2-24 characters, letters/numbers/spaces/apostrophes/hyphens only',
    );
  }

  return {
    id: generateProfileId(),
    name,
    createdAt: Date.now(),
  };
}

/**
 * Validates profile name according to business rules
 * @param name - The name to validate
 * @returns true if the name is valid
 */
function isValidProfileName(name: string): boolean {
  // Unicode-aware: letters, numbers, spaces, apostrophes, hyphens
  // Length: 2-24 characters
  return /^[\p{L}\p{N}\s'-]{2,24}$/u.test(name);
}

/**
 * Generates a random profile ID
 * @returns An 8-character alphanumeric string
 * @note Using Math.random() for Phase 0 simplicity; will upgrade to crypto.randomUUID() later
 */
function generateProfileId(): string {
  // Convert to base36 and take 8 chars (excluding "0.")
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Converts legacy Profile to ProfileV1 format
 * @param profile - Legacy profile
 * @returns ProfileV1 with W3 time accounting
 */
export function convertToProfileV1(profile: Profile): ProfileV1 {
  return {
    id: profile.id,
    name: profile.name,
    createdAt: profile.createdAt,
    lastActive: profile.createdAt,
    progress: {
      land: 0,
      ward: 0,
      distanceM: 0
    },
    currencies: {
      arcana: 0,
      gold: 0
    },
    enchants: {
      firepower: 0,
      scales: 0,
      tier: 0
    },
    stats: {
      playtimeS: 0,
      deaths: 0,
      totalDistanceM: 0
    },
    leaderboard: {
      highestWard: 0,
      fastestBossS: 0
    },
    sim: {
      lastSimWallClock: Date.now(),
      bgCoveredMs: 0
    }
  };
}

/**
 * Converts ProfileV1 to legacy Profile format
 * @param profileV1 - ProfileV1 profile
 * @returns Legacy Profile
 */
export function convertFromProfileV1(profileV1: ProfileV1): Profile {
  return {
    id: profileV1.id,
    name: profileV1.name,
    createdAt: profileV1.createdAt
  };
}
