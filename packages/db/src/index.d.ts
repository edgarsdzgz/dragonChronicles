/**
 * @file Database models and factories for the Draconia Chronicles
 * @description Provides user profile management and data persistence abstractions
 */
import type { Seed } from '@draconia/shared';
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
export declare function makeProfile(name: string): Profile;
