/**
 * Export/Import APIs
 *
 * Provides functionality to export all profiles to JSON and import from
 * JSON with validation and atomic writes.
 */
import type { ExportFileV1 } from './schema.v1.js';
/**
 * Exports all profiles to a versioned JSON format
 *
 * @returns ExportFileV1 with all profile data and checksum validation
 */
export declare function exportAllProfiles(): Promise<ExportFileV1>;
/**
 * Exports all profiles to a downloadable Blob
 *
 * @returns Blob containing the export file
 */
export declare function exportAllProfilesToBlob(): Promise<Blob>;
/**
 * Exports a specific profile to JSON format
 *
 * @param profileId - Profile ID to export
 * @returns ExportFileV1 with single profile data
 */
export declare function exportProfile(profileId: string): Promise<ExportFileV1>;
/**
 * Imports save data from a Blob with validation and atomic writes
 *
 * @param blob - Blob containing export file data
 * @returns Object with import results and statistics
 */
export declare function importFromBlob(blob: Blob): Promise<{
    success: boolean;
    importedProfiles: number;
    errors: string[];
    details: {
        totalProfiles: number;
        validProfiles: number;
        invalidProfiles: string[];
    };
}>;
/**
 * Imports save data from JSON string
 *
 * @param jsonString - JSON string containing export file data
 * @returns Object with import results and statistics
 */
export declare function importFromJson(jsonString: string): Promise<{
    success: boolean;
    importedProfiles: number;
    errors: string[];
    details: {
        totalProfiles: number;
        validProfiles: number;
        invalidProfiles: string[];
    };
}>;
/**
 * Validates an export file without importing it
 *
 * @param blob - Blob containing export file data
 * @returns Validation result with details
 */
export declare function validateExportBlob(blob: Blob): Promise<{
    isValid: boolean;
    errors: string[];
    details: {
        fileVersion: number | null;
        exportedAt: number | null;
        totalProfiles: number;
        profileIds: string[];
    };
}>;
/**
 * Gets export file information without full validation
 *
 * @param blob - Blob containing export file data
 * @returns Basic file information
 */
export declare function getExportFileInfo(blob: Blob): Promise<{
    fileSize: number;
    fileName?: string;
    mimeType: string;
    lastModified?: number;
}>;
//# sourceMappingURL=export.d.ts.map