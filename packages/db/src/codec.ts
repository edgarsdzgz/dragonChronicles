/**
 * Codec and checksum helpers
 *
 * Provides encoding/decoding functions and SHA-256 checksum generation
 * for export/import functionality with tamper detection.
 */

import type { SaveV1, ExportDataV1, ExportFileV1 } from './schema.v1.js';
import { validateSaveV1, validateExportDataV1, validateExportFileV1 } from './schema.v1.js';

// Import Node.js crypto for server-side environments
import { createHash } from 'crypto';

// ============================================================================
// Checksum Generation
// ============================================================================

/**
 * Generates SHA-256 checksum for data integrity validation
 *
 * @param data - Data to generate checksum for
 * @returns SHA-256 hash as hex string
 */
export async function generateChecksum(data: string): Promise<string> {
  try {
    // Check if we're in a Node.js environment
    if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
      // Use Node.js crypto
      const hash = createHash('sha256');
      hash.update(data);
      return hash.digest('hex');
    } else {
      // Use Web Crypto API
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', dataBuffer);

      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    throw new Error(
      `Failed to generate checksum: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Generates a simple synchronous checksum for testing
 * This is not cryptographically secure but works for testing
 *
 * @param data - Data to generate checksum for
 * @returns Simple hash as hex string
 */
export function generateChecksumSync(data: string): string {
  try {
    // Simple hash implementation for testing
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  } catch (error) {
    throw new Error(
      `Failed to generate checksum: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Validates checksum against data
 *
 * @param data - Data to validate
 * @param expectedChecksum - Expected checksum to compare against
 * @returns true if checksum matches, false otherwise
 */
export async function validateChecksum(data: string, expectedChecksum: string): Promise<boolean> {
  try {
    const actualChecksum = await generateChecksum(data);
    return actualChecksum === expectedChecksum;
  } catch (error) {
    console.error('Checksum validation failed:', error);
    return false;
  }
}

// ============================================================================
// Export Encoding
// ============================================================================

/**
 * Encodes save data into versioned export format
 *
 * @param saveData - Save data to encode
 * @returns ExportFileV1 with checksum validation
 */
export async function encodeExportV1(saveData: SaveV1 | ExportDataV1): Promise<ExportFileV1> {
  try {
    // Validate save data (use ExportDataV1 validation for empty profiles)
    const validatedData =
      saveData.profiles.length === 0 ? validateExportDataV1(saveData) : validateSaveV1(saveData);

    // Create export structure
    const exportData: Omit<ExportFileV1, 'checksum'> = {
      fileVersion: 1,
      exportedAt: Date.now(),
      data: validatedData,
    };

    // Generate checksum from JSON string
    const jsonString = JSON.stringify(exportData, null, 0);
    const checksum = await generateChecksum(jsonString);

    return {
      ...exportData,
      checksum,
    };
  } catch (error) {
    throw new Error(
      `Failed to encode export: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Validates and decodes export file
 *
 * @param exportData - Export file data to validate and decode
 * @returns Validated save data
 * @throws Error if validation fails or checksum doesn't match
 */
export async function validateExportV1(exportData: unknown): Promise<SaveV1> {
  try {
    // Validate export file structure
    const validatedExport = validateExportFileV1(exportData);

    // Recreate the data that was checksummed (without checksum field)
    const dataToCheck: Omit<ExportFileV1, 'checksum'> = {
      fileVersion: validatedExport.fileVersion,
      exportedAt: validatedExport.exportedAt,
      data: validatedExport.data,
    };

    const jsonString = JSON.stringify(dataToCheck, null, 0);
    const isValid = await validateChecksum(jsonString, validatedExport.checksum);

    if (!isValid) {
      throw new Error('Export file checksum validation failed - data may be corrupted or tampered');
    }

    return validatedExport.data;
  } catch (error) {
    throw new Error(
      `Failed to validate export: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ============================================================================
// JSON Serialization Helpers
// ============================================================================

/**
 * Serializes save data to JSON string
 *
 * @param saveData - Save data to serialize
 * @returns JSON string representation
 */
export function serializeSaveData(saveData: SaveV1): string {
  try {
    return JSON.stringify(saveData, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to serialize save data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Deserializes JSON string to save data
 *
 * @param jsonString - JSON string to deserialize
 * @returns Parsed and validated save data
 */
export function deserializeSaveData(jsonString: string): SaveV1 {
  try {
    const parsed = JSON.parse(jsonString);
    return validateSaveV1(parsed);
  } catch (error) {
    throw new Error(
      `Failed to deserialize save data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Serializes export file to JSON string
 *
 * @param exportData - Export file to serialize
 * @returns JSON string representation
 */
export function serializeExportFile(exportData: ExportFileV1): string {
  try {
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to serialize export file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Deserializes JSON string to export file
 *
 * @param jsonString - JSON string to deserialize
 * @returns Parsed and validated export file
 */
export function deserializeExportFile(jsonString: string): ExportFileV1 {
  try {
    const parsed = JSON.parse(jsonString);
    return validateExportFileV1(parsed);
  } catch (error) {
    throw new Error(
      `Failed to deserialize export file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ============================================================================
// Blob Conversion Helpers
// ============================================================================

/**
 * Converts export file to Blob for download
 *
 * @param exportData - Export file to convert
 * @returns Blob with JSON content and appropriate MIME type
 */
export function exportFileToBlob(exportData: ExportFileV1): Blob {
  try {
    const jsonString = serializeExportFile(exportData);
    return new Blob([jsonString], { type: 'application/json' });
  } catch (error) {
    throw new Error(
      `Failed to create export blob: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Converts Blob to export file
 *
 * @param blob - Blob containing export file data
 * @returns Parsed and validated export file
 */
export async function blobToExportFile(blob: Blob): Promise<ExportFileV1> {
  try {
    const text = await blob.text();
    return deserializeExportFile(text);
  } catch (error) {
    throw new Error(
      `Failed to parse export blob: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
