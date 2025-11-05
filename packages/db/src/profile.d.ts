/**
 * Profile utility functions
 *
 * Provides profile creation and management functions for backward compatibility
 * with existing code that expects makeProfile functionality.
 */
import type { ProfileV1 } from './schema.v1.js';
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
export declare function makeProfile(name: string): Profile;
/**
 * Converts legacy Profile to ProfileV1 format
 * @param profile - Legacy profile
 * @returns ProfileV1 with W3 time accounting
 */
export declare function convertToProfileV1(profile: Profile): ProfileV1;
/**
 * Converts ProfileV1 to legacy Profile format
 * @param profileV1 - ProfileV1 profile
 * @returns Legacy Profile
 */
export declare function convertFromProfileV1(profileV1: ProfileV1): Profile;
//# sourceMappingURL=profile.d.ts.map