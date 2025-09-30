/**
 * Repository API and atomic write operations
 *
 * Provides high-level CRUD operations for save data with atomic writes,
 * double-buffer strategy, and kill-tab recovery consistency.
 */
import type { SaveV1, SaveRowV1 } from './schema.v1.js';
/**
 * Gets the active save row for a profile
 *
 * @param profileId - Profile ID to get save row for
 * @returns Save row or null if not found
 */
export declare function getActiveSave(profileId: string): Promise<SaveRowV1 | null>;
/**
 * Stores save data atomically with double-buffer strategy
 *
 * @param profileId - Profile ID to save data for
 * @param saveData - Save data to store
 * @param keepBackups - Number of backups to keep (default: 3)
 * @returns ID of the created save row
 */
export declare function putSaveAtomic(
  profileId: string,
  saveData: SaveV1,
  keepBackups?: number,
  providedChecksum?: string,
): Promise<number>;
/**
 * Gets all save data for a profile (including backups)
 *
 * @param profileId - Profile ID to get saves for
 * @returns Array of save rows, sorted by creation time (newest first)
 */
export declare function getAllSaves(profileId: string): Promise<SaveRowV1[]>;
/**
 * Deletes a specific save row
 *
 * @param saveId - ID of the save row to delete
 * @returns true if deleted, false if not found
 */
export declare function deleteSave(saveId: number): Promise<boolean>;
/**
 * Gets all profile IDs that have save data
 *
 * @returns Array of profile IDs
 */
export declare function getAllProfileIds(): Promise<string[]>;
/**
 * Gets the active save ID for a profile
 *
 * @param profileId - Profile ID
 * @returns Save ID or null if not found
 */
export declare function getActiveSaveId(profileId: string): Promise<number | null>;
/**
 * Clears all data for a specific profile
 *
 * @param profileId - Profile ID to clear data for
 * @returns true if cleared, false if error
 */
export declare function clearProfileData(profileId: string): Promise<boolean>;
/**
 * Gets database statistics
 *
 * @returns Object with database statistics
 */
export declare function getDatabaseStats(): Promise<{
  totalSaves: number;
  totalProfiles: number;
  totalMeta: number;
  totalLogs: number;
}>;
