/**
 * @file Database models and factories for the Draconia Chronicles
 * @description Provides user profile management and data persistence abstractions
 */

import type { Seed } from "@draconia/shared";

/**
 * User profile data structure
 * @property id - Unique identifier for the profile
 * @property name - Display name (user-provided)
 * @property createdAt - Profile creation timestamp (Unix milliseconds)
 * @property seed - Optional deterministic seed for gameplay RNG
 */
export type Profile = {
  readonly id: string;
  readonly name: string;
  readonly createdAt: number;
  readonly seed?: Seed;
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
    throw new Error("invalid-name: must be 2-24 characters, letters/numbers/spaces/apostrophes/hyphens only");
  }
  
  return {
    id: generateProfileId(),
    name,
    createdAt: Date.now()
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