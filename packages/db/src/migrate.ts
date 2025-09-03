/**
 * Database migration system
 *
 * Provides schema evolution and data migration capabilities
 * for the Draconia Chronicles database.
 */

import { db } from './db.js';
import type { SaveV1 } from './schema.v1.js';

// ============================================================================
// Migration Types
// ============================================================================

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

// ============================================================================
// Migration Registry
// ============================================================================

type MigrationFunction = (data: any) => Promise<any>;

const migrations: Record<number, MigrationFunction> = {
  // Future migrations will be added here
  // Example: 2: migrateSaveV1ToV2,
};

// ============================================================================
// Core Migration API
// ============================================================================

/**
 * Gets the current database schema version
 */
export async function getDatabaseVersion(): Promise<number> {
  try {
    const versionMeta = await db.meta.get('schema_version');
    return versionMeta ? parseInt(versionMeta.value) : 1;
  } catch (error) {
    console.warn('Failed to get database version, defaulting to 1:', error);
    return 1;
  }
}

/**
 * Sets the database schema version
 */
async function setDatabaseVersion(version: number): Promise<void> {
  await db.meta.put({
    key: 'schema_version',
    value: version.toString(),
    updatedAt: Date.now(),
  });
}

/**
 * Gets migration status information
 */
export async function getMigrationStatus(): Promise<MigrationStatus> {
  const currentVersion = await getDatabaseVersion();
  const availableMigrations = Object.keys(migrations).map(Number).sort();
  const lastMigration = availableMigrations.length > 0 ? Math.max(...availableMigrations) : null;

  return {
    currentVersion,
    availableMigrations,
    lastMigration,
  };
}

/**
 * Runs all pending migrations to bring database up to latest version
 */
export async function runMigrations(): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    success: false,
    version: 1,
    recordsMigrated: 0,
    errors: [],
    timeMs: 0,
  };

  try {
    const currentVersion = await getDatabaseVersion();
    const targetVersion = Math.max(...Object.keys(migrations).map(Number), currentVersion);

    // If we're already at the latest version, no migration needed
    if (currentVersion >= targetVersion) {
      result.success = true;
      result.version = currentVersion;
      result.timeMs = Math.max(1, Date.now() - startTime);
      return result;
    }

    // Run migrations in sequence
    let migratedRecords = 0;
    for (const version of Object.keys(migrations).map(Number).sort()) {
      if (version > currentVersion) {
        const migrationResult = await runSingleMigration(version);
        migratedRecords += migrationResult.recordsMigrated;

        if (!migrationResult.success) {
          result.errors.push(...migrationResult.errors);
          result.timeMs = Math.max(1, Date.now() - startTime);
          return result;
        }
      }
    }

    // Update database version
    await setDatabaseVersion(targetVersion);

    result.success = true;
    result.version = targetVersion;
    result.recordsMigrated = migratedRecords;
    result.timeMs = Math.max(1, Date.now() - startTime);
  } catch (error) {
    result.errors.push(
      `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  result.timeMs = Math.max(1, Date.now() - startTime);
  return result;
}

/**
 * Runs a single migration
 */
async function runSingleMigration(version: number): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    success: false,
    version,
    recordsMigrated: 0,
    errors: [],
    timeMs: 0,
  };

  try {
    const migrationFn = migrations[version];
    if (!migrationFn) {
      throw new Error(`Migration ${version} not found`);
    }

    // Get all save records that need migration
    const saves = await db.saves.toArray();
    let migratedCount = 0;

    // Migrate each save record
    for (const save of saves) {
      try {
        const migratedData = await migrationFn(save.data);

        // Update the save record with migrated data
        await db.saves.update(save.id!, { data: migratedData });
        migratedCount++;
      } catch (saveError) {
        result.errors.push(
          `Failed to migrate save ${save.id}: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`,
        );
      }
    }

    result.success = result.errors.length === 0;
    result.recordsMigrated = migratedCount;
  } catch (error) {
    result.errors.push(
      `Migration ${version} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  result.timeMs = Math.max(1, Date.now() - startTime);
  return result;
}

// ============================================================================
// Migration Utilities
// ============================================================================

/**
 * Validates that all save data is compatible with current schema
 */
export async function validateMigrationState(): Promise<{
  isValid: boolean;
  issues: string[];
  totalRecords: number;
  validRecords: number;
}> {
  const result = {
    isValid: true,
    issues: [] as string[],
    totalRecords: 0,
    validRecords: 0,
  };

  try {
    const saves = await db.saves.toArray();
    result.totalRecords = saves.length;

    for (const save of saves) {
      try {
        // Basic validation - check if data structure looks correct
        if (!save.data || typeof save.data !== 'object') {
          result.issues.push(`Save ${save.id}: Invalid data structure`);
          continue;
        }

        if (!save.data.version || !Array.isArray(save.data.profiles)) {
          result.issues.push(`Save ${save.id}: Missing required fields`);
          continue;
        }

        result.validRecords++;
      } catch (error) {
        result.issues.push(
          `Save ${save.id}: Validation error - ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    result.isValid = result.issues.length === 0;
  } catch (error) {
    result.issues.push(
      `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    result.isValid = false;
  }

  return result;
}

/**
 * Creates a backup of all data before migration
 */
export async function createMigrationBackup(): Promise<{
  success: boolean;
  backupId: string;
  recordCount: number;
  error?: string;
}> {
  try {
    const backupId = `migration_backup_${Date.now()}`;
    const saves = await db.saves.toArray();
    const meta = await db.meta.toArray();

    // Store backup in meta table with special key
    await db.meta.put({
      key: `backup_${backupId}`,
      value: JSON.stringify({
        saves,
        meta: meta.filter((m) => !m.key.startsWith('backup_')), // Don't backup other backups
        createdAt: Date.now(),
      }),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      backupId,
      recordCount: saves.length,
    };
  } catch (error) {
    return {
      success: false,
      backupId: '',
      recordCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
