/**
 * Export/Import APIs
 *
 * Provides functionality to export all profiles to JSON and import from
 * JSON with validation and atomic writes.
 */

import type { SaveV1, ExportDataV1, ExportFileV1 } from './schema.v1.js';
import { validateExportFileV1 } from './schema.v1.js';
import {
  encodeExportV1,
  exportFileToBlob,
  blobToExportFile,
  generateChecksumSync,
  validateExportV1,
} from './codec.js';
import { putSaveAtomic, getAllProfileIds, getActiveSave } from './repo.js';
import { db } from './db.js';

// ============================================================================
// Export APIs
// ============================================================================

/**
 * Exports all profiles to a versioned JSON format
 *
 * @returns ExportFileV1 with all profile data and checksum validation
 */
export async function exportAllProfiles(): Promise<ExportFileV1> {
  try {
    // Get all profile IDs
    const profileIds = await getAllProfileIds();

    if (profileIds.length === 0) {
      // Return empty export for empty database
      const exportData: ExportDataV1 = {
        version: 1,
        profiles: [],
        settings: {
          a11yReducedMotion: false, // Default setting
        },
      };

      return await encodeExportV1(exportData);
    }

    // Collect all active save data
    const profiles: SaveV1['profiles'] = [];
    for (const profileId of profileIds) {
      const saveRow = await getActiveSave(profileId);
      if (saveRow && saveRow.data.profiles.length > 0) {
        // Find the profile with matching ID
        const profile = saveRow.data.profiles.find((p) => p.id === profileId);
        if (profile) {
          profiles.push(profile);
        }
      }
    }

    // Handle empty database case gracefully
    if (profiles.length === 0) {
      // Return empty export data instead of throwing
      const exportData: ExportDataV1 = {
        version: 1,
        profiles: [],
        settings: {
          a11yReducedMotion: false, // Default setting
        },
      };

      return await encodeExportV1(exportData);
    }

    // Create export data structure
    const exportData: SaveV1 = {
      version: 1,
      profiles,
      settings: {
        a11yReducedMotion: false, // Default setting
      },
    };

    // Encode with checksum
    return await encodeExportV1(exportData);
  } catch (error) {
    throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Exports all profiles to a downloadable Blob
 *
 * @returns Blob containing the export file
 */
export async function exportAllProfilesToBlob(): Promise<Blob> {
  try {
    const exportData = await exportAllProfiles();
    return exportFileToBlob(exportData);
  } catch (error) {
    throw new Error(
      `Export to blob failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Exports a specific profile to JSON format
 *
 * @param profileId - Profile ID to export
 * @returns ExportFileV1 with single profile data
 */
export async function exportProfile(profileId: string): Promise<ExportFileV1> {
  try {
    const saveRow = await getActiveSave(profileId);
    if (!saveRow) {
      throw new Error(`Profile ${profileId} not found`);
    }

    // Find the specific profile
    const profile = saveRow.data.profiles.find((p) => p.id === profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found in save data`);
    }

    // Create export data with single profile
    const exportData: SaveV1 = {
      version: 1,
      profiles: [profile],
      settings: saveRow.data.settings,
    };

    return await encodeExportV1(exportData);
  } catch (error) {
    throw new Error(
      `Profile export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ============================================================================
// Import APIs
// ============================================================================

/**
 * Imports save data from a Blob with validation and atomic writes
 *
 * @param blob - Blob containing export file data
 * @returns Object with import results and statistics
 */
export async function importFromBlob(blob: Blob): Promise<{
  success: boolean;
  importedProfiles: number;
  errors: string[];
  details: {
    totalProfiles: number;
    validProfiles: number;
    invalidProfiles: string[];
  };
}> {
  const result = {
    success: false,
    importedProfiles: 0,
    errors: [] as string[],
    details: {
      totalProfiles: 0,
      validProfiles: 0,
      invalidProfiles: [] as string[],
    },
  };

  try {
    // Parse and validate export file (including checksum validation)
    const exportData = await blobToExportFile(blob);
    const validatedData = await validateExportV1(exportData);

    result.details.totalProfiles = validatedData.profiles.length;

    // Handle empty profiles case
    if (validatedData.profiles.length === 0) {
      result.success = true;
      return result;
    }

    // Import profiles sequentially to avoid transaction conflicts
    const validProfileIds: string[] = [];

    for (const profile of validatedData.profiles) {
      try {
        // Basic validation
        if (!profile.id || !profile.name) {
          result.details.invalidProfiles.push(profile.id || 'unknown');
          continue;
        }

        // Create save data with complete multi-profile structure
        // This preserves the original export structure in each profile save
        const multiProfileSaveData: SaveV1 = {
          version: 1,
          profiles: validatedData.profiles, // All profiles in each save
          settings: validatedData.settings,
        };

        // Store atomically with proper error handling
        const checksum = generateChecksumSync(JSON.stringify(multiProfileSaveData));

        const saveId = await putSaveAtomic(profile.id, multiProfileSaveData, 3, checksum);

        // Verify the save was actually stored
        const verificationSave = await db.saves.get(saveId);
        if (!verificationSave) {
          throw new Error(`Save verification failed for profile ${profile.id}`);
        }

        validProfileIds.push(profile.id);
        result.importedProfiles++;
      } catch (profileError) {
        const errorMsg = `Failed to import profile ${profile.id}: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
        result.details.invalidProfiles.push(profile.id);
      }
    }

    result.details.validProfiles = validProfileIds.length;
    result.success = result.importedProfiles > 0;

    if (result.importedProfiles === 0) {
      result.errors.push('No profiles were successfully imported');
    }

    return result;
  } catch (error) {
    result.errors.push(
      `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return result;
  }
}

/**
 * Imports save data from JSON string
 *
 * @param jsonString - JSON string containing export file data
 * @returns Object with import results and statistics
 */
export async function importFromJson(jsonString: string): Promise<{
  success: boolean;
  importedProfiles: number;
  errors: string[];
  details: {
    totalProfiles: number;
    validProfiles: number;
    invalidProfiles: string[];
  };
}> {
  try {
    // Create blob from JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    return await importFromBlob(blob);
  } catch (error) {
    return {
      success: false,
      importedProfiles: 0,
      errors: [`JSON import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      details: {
        totalProfiles: 0,
        validProfiles: 0,
        invalidProfiles: [],
      },
    };
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates an export file without importing it
 *
 * @param blob - Blob containing export file data
 * @returns Validation result with details
 */
export async function validateExportBlob(blob: Blob): Promise<{
  isValid: boolean;
  errors: string[];
  details: {
    fileVersion: number | null;
    exportedAt: number | null;
    totalProfiles: number;
    profileIds: string[];
  };
}> {
  const result = {
    isValid: false,
    errors: [] as string[],
    details: {
      fileVersion: null as number | null,
      exportedAt: null as number | null,
      totalProfiles: 0,
      profileIds: [] as string[],
    },
  };

  try {
    const exportData = await blobToExportFile(blob);
    const saveData = await validateExportFileV1(exportData);

    result.isValid = true;
    result.details.fileVersion = exportData.fileVersion;
    result.details.exportedAt = exportData.exportedAt;
    result.details.totalProfiles = saveData.data.profiles.length;
    result.details.profileIds = saveData.data.profiles.map((p: any) => p.id);
  } catch (error) {
    result.errors.push(
      `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  return result;
}

/**
 * Gets export file information without full validation
 *
 * @param blob - Blob containing export file data
 * @returns Basic file information
 */
export async function getExportFileInfo(blob: Blob): Promise<{
  fileSize: number;
  fileName?: string;
  mimeType: string;
  lastModified?: number;
}> {
  return {
    fileSize: blob.size,
    fileName: (blob as File).name,
    mimeType: blob.type,
    lastModified: (blob as File).lastModified,
  };
}
