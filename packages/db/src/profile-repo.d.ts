/**
 * @file Profile Repository
 * @description CRUD operations for player profiles (save slots)
 *
 * Zelda OoT-style: 3 save slots with full data display
 */
import type { ProfileV1 } from './schema.v1.js';
/**
 * Profile slot display data
 */
export interface ProfileSlotData {
    slotNumber: 1 | 2 | 3;
    isEmpty: boolean;
    profileId?: string;
    dragonName?: string;
    wardNumber?: number;
    landNumber?: number;
    landName?: string;
    playtimeFormatted?: string;
    lastPlayedRelative?: string;
    lastActiveTimestamp?: number;
}
/**
 * Profile Repository
 * Handles all database operations for profiles
 */
export declare class ProfileRepository {
    /**
     * Load all 3 profile slots
     */
    loadAllSlots(): Promise<ProfileSlotData[]>;
    /**
     * Load specific profile by slot number
     */
    loadProfileBySlot(slotNumber: 1 | 2 | 3): Promise<ProfileV1 | null>;
    /**
     * Create new profile in slot
     */
    createProfile(slotNumber: 1 | 2 | 3, dragonName: string): Promise<string>;
    /**
     * Copy profile from source to destination slot
     */
    copyProfile(sourceSlot: 1 | 2 | 3, destSlot: 1 | 2 | 3): Promise<void>;
    /**
     * Erase profile from slot
     */
    eraseProfile(slotNumber: 1 | 2 | 3): Promise<void>;
    /**
     * Update profile (for auto-save)
     */
    updateProfile(profileId: string, profile: ProfileV1): Promise<void>;
    /**
     * Get land name by ID
     */
    private getLandName;
    /**
     * Format playtime in seconds to readable string
     */
    private formatPlaytime;
    /**
     * Format timestamp to relative time
     */
    private formatRelativeTime;
    /**
     * Calculate checksum for profile data
     */
    private calculateChecksum;
}
/**
 * Global profile repository instance
 */
export declare const profileRepo: ProfileRepository;
//# sourceMappingURL=profile-repo.d.ts.map