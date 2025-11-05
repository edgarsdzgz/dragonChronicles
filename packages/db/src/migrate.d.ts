/**
 * Database migration system
 *
 * Provides schema evolution and data migration capabilities
 * for the Draconia Chronicles database.
 */
export interface MigrationResult {
    success: boolean;
    version: number;
    recordsMigrated: number;
    errors: string[];
    timeMs: number;
}
export interface MigrationStatus {
    currentVersion: number;
    availableMigrations: number[];
    lastMigration: number | null;
}
/**
 * Gets the current database schema version
 */
export declare function getDatabaseVersion(): Promise<number>;
/**
 * Gets migration status information
 */
export declare function getMigrationStatus(): Promise<MigrationStatus>;
/**
 * Runs all pending migrations to bring database up to latest version
 */
export declare function runMigrations(): Promise<MigrationResult>;
/**
 * Validates that all save data is compatible with current schema
 */
export declare function validateMigrationState(): Promise<{
    isValid: boolean;
    issues: string[];
    totalRecords: number;
    validRecords: number;
}>;
/**
 * Creates a backup of all data before migration
 */
export declare function createMigrationBackup(): Promise<{
    success: boolean;
    backupId: string;
    recordCount: number;
    error?: string;
}>;
//# sourceMappingURL=migrate.d.ts.map