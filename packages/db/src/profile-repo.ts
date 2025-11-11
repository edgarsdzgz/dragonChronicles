/**
 * @file Profile Repository
 * @description CRUD operations for player profiles (save slots)
 *
 * Zelda OoT-style: 3 save slots with full data display
 */

import { db } from './db.js';
import type { ProfileV1, SaveV1, ItemCategory, ItemRarity } from './schema.v1.js';
import { getWardName, getLandName } from '@draconia/shared';

/**
 * Profile slot display data
 */
export interface ProfileSlotData {
  slotNumber: 1 | 2 | 3;
  isEmpty: boolean;

  // Only if not empty:
  profileId?: string;
  dragonName?: string;
  wardNumber?: number;
  wardName?: string; // Ward display name (e.g., "The Parting Stones")
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
export class ProfileRepository {
  /**
   * Load all 3 profile slots
   */
  async loadAllSlots(): Promise<ProfileSlotData[]> {
    try {
      const saves = await db.saves.toArray();

      const slots: ProfileSlotData[] = [];

      for (let i = 0; i < 3; i++) {
        const save = saves.find((s) => s.profileId.includes(`-slot${i + 1}`));
        const profile = save?.data.profiles[0];

        if (save && profile) {
          const wardNumber = profile.progress.ward;
          const landNumber = profile.progress.land;
          const wardName = getWardName(wardNumber, landNumber);
          const landName = getLandName(landNumber);

          console.log('🔍 Profile Repo Debug:', {
            wardNumber,
            landNumber,
            wardName,
            landName,
            profileName: profile.name
          });

          slots.push({
            slotNumber: (i + 1) as 1 | 2 | 3,
            isEmpty: false,
            profileId: profile.id,
            dragonName: profile.name,
            wardNumber,
            wardName,
            landNumber,
            landName,
            playtimeFormatted: this.formatPlaytime(profile.stats.playtimeS),
            lastPlayedRelative: this.formatRelativeTime(profile.lastActive),
            lastActiveTimestamp: profile.lastActive,
          });
        } else {
          slots.push({
            slotNumber: (i + 1) as 1 | 2 | 3,
            isEmpty: true,
          });
        }
      }

      return slots;
    } catch (error) {
      console.error('Failed to load profile slots:', error);
      // Return empty slots on error
      return [
        { slotNumber: 1, isEmpty: true },
        { slotNumber: 2, isEmpty: true },
        { slotNumber: 3, isEmpty: true },
      ];
    }
  }

  /**
   * Load specific profile by slot number
   */
  async loadProfileBySlot(slotNumber: 1 | 2 | 3): Promise<ProfileV1 | null> {
    try {
      const saves = await db.saves.toArray();
      const save = saves.find((s) => s.profileId.includes(`-slot${slotNumber}`));
      const profile = save?.data.profiles[0];

      if (save && profile) {
        return profile;
      }

      return null;
    } catch (error) {
      console.error(`Failed to load profile from slot ${slotNumber}:`, error);
      return null;
    }
  }

  /**
   * Create new profile in slot
   */
  async createProfile(slotNumber: 1 | 2 | 3, dragonName: string): Promise<string> {
    const profileId = `profile-${Date.now()}-slot${slotNumber}`;

    const newProfile: ProfileV1 = {
      id: profileId,
      name: dragonName,
      createdAt: Date.now(),
      lastActive: Date.now(),
      progress: {
        land: 1,
        ward: 1,
        distanceM: 0,
      },
      currencies: {
        arcana: 0,
        gold: 0,
      },
      enchants: {
        firepower: 0,
        scales: 0,
        tier: 0,
      },
      stats: {
        playtimeS: 0,
        deaths: 0,
        totalDistanceM: 0,
      },
      leaderboard: {
        highestWard: 1,
        fastestBossS: 0,
      },
      sim: {
        lastSimWallClock: Date.now(),
        bgCoveredMs: 0,
      },
      inventory: {
        items: {},
        maxSlots: 100,
        autoSellSettings: {
          enabled: false,
          sellCommon: false,
          sellUncommon: false,
          categories: [] as ItemCategory[],
          minValue: 0,
          maxInventorySlots: 100,
        },
        lastDropTime: 0,
      },
      itemStats: {
        totalItemsFound: 0,
        totalItemsSold: 0,
        totalGoldEarned: 0,
        itemsByCategory: {} as Record<ItemCategory, number>,
        itemsByRarity: {} as Record<ItemRarity, number>,
      },
    };

    const saveData: SaveV1 = {
      version: 1,
      profiles: [newProfile],
      settings: {
        a11yReducedMotion: false,
      },
    };

    await db.saves.add({
      profileId,
      version: 1,
      data: saveData,
      createdAt: Date.now(),
      checksum: this.calculateChecksum(newProfile),
    });

    console.log(`✅ Created new profile: ${dragonName} in slot ${slotNumber}`);

    return profileId;
  }

  /**
   * Copy profile from source to destination slot
   */
  async copyProfile(sourceSlot: 1 | 2 | 3, destSlot: 1 | 2 | 3): Promise<void> {
    if (sourceSlot === destSlot) {
      throw new Error('Cannot copy to the same slot');
    }

    const sourceProfile = await this.loadProfileBySlot(sourceSlot);
    if (!sourceProfile) {
      throw new Error(`Source slot ${sourceSlot} is empty`);
    }

    // Delete existing profile in destination (if any)
    await this.eraseProfile(destSlot);

    // Create copy with new ID
    const copiedProfile: ProfileV1 = {
      ...sourceProfile,
      id: `profile-${Date.now()}-slot${destSlot}`,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    const saveData: SaveV1 = {
      version: 1,
      profiles: [copiedProfile],
      settings: {
        a11yReducedMotion: false,
      },
    };

    await db.saves.add({
      profileId: copiedProfile.id,
      version: 1,
      data: saveData,
      createdAt: Date.now(),
      checksum: this.calculateChecksum(copiedProfile),
    });

    console.log(`✅ Copied slot ${sourceSlot} to slot ${destSlot}`);
  }

  /**
   * Erase profile from slot
   */
  async eraseProfile(slotNumber: 1 | 2 | 3): Promise<void> {
    try {
      const saves = await db.saves.toArray();
      const save = saves.find((s) => s.profileId.includes(`-slot${slotNumber}`));

      if (save && save.id) {
        await db.saves.delete(save.id);
        console.log(`✅ Erased profile from slot ${slotNumber}`);
      }
    } catch (error) {
      console.error(`Failed to erase profile from slot ${slotNumber}:`, error);
      throw error;
    }
  }

  /**
   * Update profile (for auto-save)
   */
  async updateProfile(profileId: string, profile: ProfileV1): Promise<void> {
    try {
      const saves = await db.saves.toArray();
      const save = saves.find((s) => s.profileId === profileId);

      if (save && save.id) {
        save.data.profiles[0] = profile;
        save.checksum = this.calculateChecksum(profile);

        await db.saves.put(save);
      } else {
        console.warn(`Profile ${profileId} not found for update`);
      }
    } catch (error) {
      console.error(`Failed to update profile ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Format playtime in seconds to readable string
   */
  private formatPlaytime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }

    if (mins > 0) {
      return `${mins}m`;
    }

    return `${seconds}s`;
  }

  /**
   * Format timestamp to relative time
   */
  private formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    }

    if (hours > 0) {
      return `${hours}h ago`;
    }

    if (minutes > 0) {
      return `${minutes}m ago`;
    }

    return 'Just now';
  }

  /**
   * Calculate checksum for profile data
   */
  private calculateChecksum(profile: ProfileV1): string {
    // Simple checksum - hash profile data
    const data = JSON.stringify(profile);
    let hash = 0;

    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  }
}

/**
 * Global profile repository instance
 */
export const profileRepo = new ProfileRepository();
