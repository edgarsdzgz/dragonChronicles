/**
 * Repository API and atomic write operations
 * 
 * Provides high-level CRUD operations for save data with atomic writes,
 * double-buffer strategy, and kill-tab recovery consistency.
 */

import { db } from './db.js';
import type { SaveV1, SaveRowV1, ProfileV1, MetaRow } from './schema.v1.js';
import { validateSaveV1, validateSaveRowV1, validateMetaRow } from './schema.v1.js';
import { generateChecksum } from './codec.js';

// ============================================================================
// Metadata Keys
// ============================================================================

const META_KEYS = {
  ACTIVE_SAVE: 'active_save',
  PROFILE_POINTERS: 'profile_pointers'
} as const;

// ============================================================================
// Repository API
// ============================================================================

/**
 * Gets the active save data for a profile
 * 
 * @param profileId - Profile ID to get save data for
 * @returns Save data or null if not found
 */
export async function getActiveSave(profileId: string): Promise<SaveV1 | null> {
  try {
    // Get the active save pointer for this profile
    const pointer = await db.meta.get(META_KEYS.PROFILE_POINTERS);
    if (!pointer) return null;
    
    const pointers = JSON.parse(pointer.value) as Record<string, number>;
    const saveId = pointers[profileId];
    if (!saveId) return null;
    
    // Get the actual save data
    const saveRow = await db.saves.get(saveId);
    if (!saveRow) return null;
    
    // Validate and return
    const validatedRow = validateSaveRowV1(saveRow);
    return validatedRow.data;
  } catch (error) {
    console.error('Failed to get active save:', error);
    return null;
  }
}

/**
 * Stores save data atomically with double-buffer strategy
 * 
 * @param profileId - Profile ID to save data for
 * @param saveData - Save data to store
 * @param keepBackups - Number of backups to keep (default: 3)
 * @returns ID of the created save row
 */
export async function putSaveAtomic(
  profileId: string, 
  saveData: SaveV1, 
  keepBackups: number = 3
): Promise<number> {
  return await db.transaction('rw', [db.saves, db.meta], async () => {
    try {
      // Validate save data
      const validatedData = validateSaveV1(saveData);
      
      // Generate checksum
      const jsonString = JSON.stringify(validatedData, null, 0);
      const checksum = await generateChecksum(jsonString);
      
      // Create new save row
      const newSaveRow: Omit<SaveRowV1, 'id'> = {
        profileId,
        version: 1,
        data: validatedData,
        createdAt: Date.now(),
        checksum
      };
      
      // Insert new save row
      const saveId = await db.saves.add(newSaveRow);
      
      // Update profile pointer atomically
      await updateProfilePointer(profileId, saveId);
      
      // Prune old backups
      await pruneBackups(profileId, keepBackups);
      
      return saveId;
    } catch (error) {
      throw new Error(`Atomic save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}

/**
 * Gets all save data for a profile (including backups)
 * 
 * @param profileId - Profile ID to get saves for
 * @returns Array of save rows, sorted by creation time (newest first)
 */
export async function getAllSaves(profileId: string): Promise<SaveRowV1[]> {
  try {
    const saves = await db.saves
      .where('profileId')
      .equals(profileId)
      .reverse()
      .sortBy('createdAt');
    
    return saves.map(save => validateSaveRowV1(save));
  } catch (error) {
    console.error('Failed to get all saves:', error);
    return [];
  }
}

/**
 * Deletes a specific save row
 * 
 * @param saveId - ID of the save row to delete
 * @returns true if deleted, false if not found
 */
export async function deleteSave(saveId: number): Promise<boolean> {
  try {
    await db.saves.delete(saveId);
    return true; // Dexie delete doesn't return count, assume success
  } catch (error) {
    console.error('Failed to delete save:', error);
    return false;
  }
}

/**
 * Gets all profile IDs that have save data
 * 
 * @returns Array of profile IDs
 */
export async function getAllProfileIds(): Promise<string[]> {
  try {
    const profileIds = await db.saves
      .orderBy('profileId')
      .uniqueKeys();
    
    return profileIds as string[];
  } catch (error) {
    console.error('Failed to get profile IDs:', error);
    return [];
  }
}

// ============================================================================
// Metadata Operations
// ============================================================================

/**
 * Updates the active save pointer for a profile
 * 
 * @param profileId - Profile ID
 * @param saveId - Save row ID to point to
 */
async function updateProfilePointer(profileId: string, saveId: number): Promise<void> {
  try {
    // Get current pointers
    const pointer = await db.meta.get(META_KEYS.PROFILE_POINTERS);
    const pointers: Record<string, number> = pointer ? JSON.parse(pointer.value) : {};
    
    // Update pointer for this profile
    pointers[profileId] = saveId;
    
    // Store updated pointers
    const metaRow: MetaRow = {
      key: META_KEYS.PROFILE_POINTERS,
      value: JSON.stringify(pointers),
      updatedAt: Date.now()
    };
    
    await db.meta.put(metaRow);
  } catch (error) {
    throw new Error(`Failed to update profile pointer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets the active save ID for a profile
 * 
 * @param profileId - Profile ID
 * @returns Save ID or null if not found
 */
export async function getActiveSaveId(profileId: string): Promise<number | null> {
  try {
    const pointer = await db.meta.get(META_KEYS.PROFILE_POINTERS);
    if (!pointer) return null;
    
    const pointers = JSON.parse(pointer.value) as Record<string, number>;
    return pointers[profileId] || null;
  } catch (error) {
    console.error('Failed to get active save ID:', error);
    return null;
  }
}

// ============================================================================
// Backup Management
// ============================================================================

/**
 * Prunes old backups for a profile, keeping only the specified number
 * 
 * @param profileId - Profile ID to prune backups for
 * @param keepCount - Number of backups to keep
 */
async function pruneBackups(profileId: string, keepCount: number): Promise<void> {
  try {
    // Get all saves for this profile, sorted by creation time (newest first)
    const saves = await db.saves
      .where('profileId')
      .equals(profileId)
      .reverse()
      .sortBy('createdAt');
    
    // Keep the most recent saves
    const savesToKeep = saves.slice(0, keepCount);
    const savesToDelete = saves.slice(keepCount);
    
    // Delete old saves
    for (const save of savesToDelete) {
      await db.saves.delete(save.id!);
    }
    
    if (savesToDelete.length > 0) {
      console.log(`Pruned ${savesToDelete.length} old backups for profile ${profileId}`);
    }
  } catch (error) {
    console.error('Failed to prune backups:', error);
    // Don't throw - pruning failure shouldn't break the save operation
  }
}

// ============================================================================
// Database Maintenance
// ============================================================================

/**
 * Clears all data for a specific profile
 * 
 * @param profileId - Profile ID to clear data for
 * @returns true if cleared, false if error
 */
export async function clearProfileData(profileId: string): Promise<boolean> {
  try {
    await db.transaction('rw', [db.saves, db.meta], async () => {
      // Delete all saves for this profile
      await db.saves.where('profileId').equals(profileId).delete();
      
      // Remove profile pointer
      const pointer = await db.meta.get(META_KEYS.PROFILE_POINTERS);
      if (pointer) {
        const pointers = JSON.parse(pointer.value) as Record<string, number>;
        delete pointers[profileId];
        
        const metaRow: MetaRow = {
          key: META_KEYS.PROFILE_POINTERS,
          value: JSON.stringify(pointers),
          updatedAt: Date.now()
        };
        
        await db.meta.put(metaRow);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to clear profile data:', error);
    return false;
  }
}

/**
 * Gets database statistics
 * 
 * @returns Object with database statistics
 */
export async function getDatabaseStats(): Promise<{
  totalSaves: number;
  totalProfiles: number;
  totalMeta: number;
  totalLogs: number;
}> {
  try {
    const [totalSaves, totalMeta, totalLogs] = await Promise.all([
      db.saves.count(),
      db.meta.count(),
      db.logs.count()
    ]);
    
    const profileIds = await getAllProfileIds();
    const totalProfiles = profileIds.length;
    
    return {
      totalSaves,
      totalProfiles,
      totalMeta,
      totalLogs
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return {
      totalSaves: 0,
      totalProfiles: 0,
      totalMeta: 0,
      totalLogs: 0
    };
  }
}
