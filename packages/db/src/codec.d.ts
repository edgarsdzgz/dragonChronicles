/**
 * Codec and checksum helpers
 *
 * Provides encoding/decoding functions and SHA-256 checksum generation
 * for export/import functionality with tamper detection.
 */
import type { SaveV1, ExportDataV1, ExportFileV1 } from './schema.v1.js';
/**
 * Generates SHA-256 checksum for data integrity validation
 *
 * @param data - Data to generate checksum for
 * @returns SHA-256 hash as hex string
 */
export declare function generateChecksum(data: string): Promise<string>;
/**
 * Generates a simple synchronous checksum for testing
 * This is not cryptographically secure but works for testing
 *
 * @param data - Data to generate checksum for
 * @returns Simple hash as hex string
 */
export declare function generateChecksumSync(data: string): string;
/**
 * Validates checksum against data
 *
 * @param data - Data to validate
 * @param expectedChecksum - Expected checksum to compare against
 * @returns true if checksum matches, false otherwise
 */
export declare function validateChecksum(data: string, expectedChecksum: string): Promise<boolean>;
/**
 * Encodes save data into versioned export format
 *
 * @param saveData - Save data to encode
 * @returns ExportFileV1 with checksum validation
 */
export declare function encodeExportV1(saveData: SaveV1 | ExportDataV1): Promise<ExportFileV1>;
/**
 * Validates and decodes export file
 *
 * @param exportData - Export file data to validate and decode
 * @returns Validated save data
 * @throws Error if validation fails or checksum doesn't match
 */
export declare function validateExportV1(exportData: unknown): Promise<SaveV1>;
/**
 * Serializes save data to JSON string
 *
 * @param saveData - Save data to serialize
 * @returns JSON string representation
 */
export declare function serializeSaveData(saveData: SaveV1): string;
/**
 * Deserializes JSON string to save data
 *
 * @param jsonString - JSON string to deserialize
 * @returns Parsed and validated save data
 */
export declare function deserializeSaveData(jsonString: string): SaveV1;
/**
 * Serializes export file to JSON string
 *
 * @param exportData - Export file to serialize
 * @returns JSON string representation
 */
export declare function serializeExportFile(exportData: ExportFileV1): string;
/**
 * Deserializes JSON string to export file
 *
 * @param jsonString - JSON string to deserialize
 * @returns Parsed and validated export file
 */
export declare function deserializeExportFile(jsonString: string): ExportFileV1;
/**
 * Converts export file to Blob for download
 *
 * @param exportData - Export file to convert
 * @returns Blob with JSON content and appropriate MIME type
 */
export declare function exportFileToBlob(exportData: ExportFileV1): Blob;
/**
 * Converts Blob to export file
 *
 * @param blob - Blob containing export file data
 * @returns Parsed and validated export file
 */
export declare function blobToExportFile(blob: Blob): Promise<ExportFileV1>;
//# sourceMappingURL=codec.d.ts.map