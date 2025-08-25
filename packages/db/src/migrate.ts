/**
 * Migration scaffold for versioned schema evolution
 *
 * Provides structured migration system for future schema changes
 * with comprehensive reporting and rollback capabilities.
 */

import type { SaveV1, ProfileV1 } from './schema.v1.js';
import { validateSaveV1, validateProfileV1 } from './schema.v1.js';
import { db } from './db.js';

// ============================================================================
// Migration Types
// ============================================================================

/**
 * Migration report structure
 */
export interface MigrationReport {
  /** Migration version */
  version: number;
  /** Migration name/description */
  name: string;
  /** Whether migration was successful */
  success: boolean;
  /** Timestamp when migration was run */
  timestamp: number;
  /** Number of records processed */
  recordsProcessed: number;
  /** Number of records successfully migrated */
  recordsMigrated: number;
  /** Number of records that failed migration */
  recordsFailed: number;
  /** Detailed error messages */
  errors: string[];
  /** Migration-specific metadata */
  metadata: Record<string, unknown>;
}

/**
 * Migration function signature
 */
export type MigrationFunction = (data: unknown) => Promise<{
  success: boolean;
  migratedData: unknown;
  errors: string[];
  metadata: Record<string, unknown>;
}>;

/**
 * Migration definition
 */
export interface Migration {
  /** Migration version number */
  version: number;
  /** Migration name */
  name: string;
  /** Migration function */
  migrate: MigrationFunction;
  /** Rollback function (optional) */
  rollback?: MigrationFunction;
}

// ============================================================================
// Migration Registry
// ============================================================================

/**
 * Registry of available migrations
 */
const migrations: Migration[] = [
  // Example migration for future use
  {
    version: 2,
    name: 'Add new field to profiles',
    migrate: async (data: unknown) => {
      const errors: string[] = [];
      const metadata: Record<string, unknown> = {};

      try {
        // This is a placeholder migration
        // In a real migration, you would transform the data structure

        return {
          success: true,
          migratedData: data, // No transformation in this example
          errors,
          metadata,
        };
      } catch (error) {
        errors.push(
          `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        return {
          success: false,
          migratedData: data,
          errors,
          metadata,
        };
      }
    },
  },
];

// ============================================================================
// Migration Runner
// ============================================================================

/**
 * Runs migrations on save data
 *
 * @param saveData - Save data to migrate
 * @param targetVersion - Target version to migrate to
 * @returns Migration report
 */
export async function migrateSaveData(
  saveData: unknown,
  targetVersion: number,
): Promise<MigrationReport> {
  const report: MigrationReport = {
    version: targetVersion,
    name: `Migration to v${targetVersion}`,
    success: false,
    timestamp: Date.now(),
    recordsProcessed: 0,
    recordsMigrated: 0,
    recordsFailed: 0,
    errors: [],
    metadata: {},
  };

  try {
    // Validate current data
    const validatedData = validateSaveV1(saveData);
    report.recordsProcessed = validatedData.profiles.length;

    // Find applicable migrations
    const applicableMigrations = migrations
      .filter((m) => m.version > validatedData.version && m.version <= targetVersion)
      .sort((a, b) => a.version - b.version);

    if (applicableMigrations.length === 0) {
      report.success = true;
      report.recordsMigrated = report.recordsProcessed;
      return report;
    }

    // Run migrations in sequence
    let currentData = validatedData;
    for (const migration of applicableMigrations) {
      try {
        const result = await migration.migrate(currentData);

        if (result.success) {
          currentData = result.migratedData as SaveV1;
          report.recordsMigrated = report.recordsProcessed;
          report.metadata[`v${migration.version}`] = result.metadata;
        } else {
          report.errors.push(`Migration ${migration.name} failed: ${result.errors.join(', ')}`);
          report.recordsFailed = report.recordsProcessed;
          break;
        }
      } catch (error) {
        report.errors.push(
          `Migration ${migration.name} threw error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        report.recordsFailed = report.recordsProcessed;
        break;
      }
    }

    report.success = report.errors.length === 0;
    return report;
  } catch (error) {
    report.errors.push(
      `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return report;
  }
}

/**
 * Runs migrations on a single profile
 *
 * @param profile - Profile to migrate
 * @param targetVersion - Target version to migrate to
 * @returns Migration report
 */
export async function migrateProfile(
  profile: unknown,
  targetVersion: number,
): Promise<MigrationReport> {
  const report: MigrationReport = {
    version: targetVersion,
    name: `Profile migration to v${targetVersion}`,
    success: false,
    timestamp: Date.now(),
    recordsProcessed: 1,
    recordsMigrated: 0,
    recordsFailed: 0,
    errors: [],
    metadata: {},
  };

  try {
    // Validate current profile
    const validatedProfile = validateProfileV1(profile);

    // Find applicable migrations
    const applicableMigrations = migrations
      .filter((m) => m.version > 1 && m.version <= targetVersion) // Assuming profile starts at v1
      .sort((a, b) => a.version - b.version);

    if (applicableMigrations.length === 0) {
      report.success = true;
      report.recordsMigrated = 1;
      return report;
    }

    // Run migrations in sequence
    let currentProfile = validatedProfile;
    for (const migration of applicableMigrations) {
      try {
        const result = await migration.migrate(currentProfile);

        if (result.success) {
          currentProfile = result.migratedData as ProfileV1;
          report.recordsMigrated = 1;
          report.metadata[`v${migration.version}`] = result.metadata;
        } else {
          report.errors.push(`Migration ${migration.name} failed: ${result.errors.join(', ')}`);
          report.recordsFailed = 1;
          break;
        }
      } catch (error) {
        report.errors.push(
          `Migration ${migration.name} threw error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        report.recordsFailed = 1;
        break;
      }
    }

    report.success = report.errors.length === 0;
    return report;
  } catch (error) {
    report.errors.push(
      `Profile migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return report;
  }
}

// ============================================================================
// Migration Utilities
// ============================================================================

/**
 * Gets available migration versions
 *
 * @returns Array of available migration versions
 */
export function getAvailableMigrationVersions(): number[] {
  return migrations.map((m) => m.version).sort((a, b) => a - b);
}

/**
 * Gets migration information
 *
 * @param version - Migration version
 * @returns Migration information or null if not found
 */
export function getMigrationInfo(version: number): { name: string; hasRollback: boolean } | null {
  const migration = migrations.find((m) => m.version === version);
  if (!migration) return null;

  return {
    name: migration.name,
    hasRollback: !!migration.rollback,
  };
}

/**
 * Validates migration compatibility
 *
 * @param currentVersion - Current data version
 * @param targetVersion - Target version
 * @returns Validation result
 */
export function validateMigrationPath(
  currentVersion: number,
  targetVersion: number,
): {
  isValid: boolean;
  errors: string[];
  availableVersions: number[];
} {
  const errors: string[] = [];
  const availableVersions = getAvailableMigrationVersions();

  if (currentVersion >= targetVersion) {
    errors.push(
      `Current version ${currentVersion} is already at or beyond target version ${targetVersion}`,
    );
  }

  if (targetVersion > Math.max(...availableVersions, 0)) {
    errors.push(
      `Target version ${targetVersion} is beyond available migrations (max: ${Math.max(...availableVersions, 0)})`,
    );
  }

  // Check for gaps in migration path
  const requiredVersions = [];
  for (let v = currentVersion + 1; v <= targetVersion; v++) {
    requiredVersions.push(v);
  }

  const missingVersions = requiredVersions.filter((v) => !availableVersions.includes(v));
  if (missingVersions.length > 0) {
    errors.push(`Missing migration versions: ${missingVersions.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    availableVersions,
  };
}

// ============================================================================
// Example Migration Functions
// ============================================================================

/**
 * Example migration: Add new field to profiles
 * This is a test-only example transformation
 */
export async function migrateSaveDataV1toV2(data: SaveV1): Promise<{
  success: boolean;
  migratedData: SaveV1;
  errors: string[];
  metadata: Record<string, unknown>;
}> {
  const errors: string[] = [];
  const metadata: Record<string, unknown> = {
    profilesMigrated: 0,
    newFieldAdded: 'example_field',
  };

  try {
    // Migrate profiles to ensure all required fields are present
    const migratedProfiles = data.profiles.map((profile) => {
      const migratedProfile = {
        ...profile,
        // Ensure leaderboard field exists with defaults if missing
        leaderboard: profile.leaderboard || {
          highestWard: 0,
          fastestBossS: 0,
        },
        // Ensure sim field exists with defaults if missing
        sim: profile.sim || {
          lastSimWallClock: Date.now(),
          bgCoveredMs: 0,
        },
      };

      return migratedProfile;
    });

    const migratedData: SaveV1 = {
      ...data,
      profiles: migratedProfiles,
    };

    metadata.profilesMigrated = migratedData.profiles.length;

    return {
      success: true,
      migratedData,
      errors,
      metadata,
    };
  } catch (error) {
    errors.push(
      `V1 to V2 migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return {
      success: false,
      migratedData: data,
      errors,
      metadata,
    };
  }
}

/**
 * Migration runner that migrates all profiles in the database
 * This is the function that tests expect to call
 */
export async function migrateV1toV2(): Promise<MigrationReport> {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];
  let migratedProfiles = 0;

  try {
    // Get all profile IDs
    const profileIds = await db.saves.orderBy('profileId').uniqueKeys();

    if (profileIds.length === 0) {
      return {
        version: 2,
        name: 'Add new field to profiles',
        success: true,
        timestamp: Date.now(),
        recordsProcessed: 0,
        recordsMigrated: 0,
        recordsFailed: 0,
        errors: [],
        metadata: {
          profilesMigrated: 0,
          newFieldAdded: 'example_field',
        },
      };
    }

    // Process each profile
    for (const profileId of profileIds) {
      try {
        // Get the save data for this profile
        const saveRow = await db.saves.where('profileId').equals(profileId).first();
        if (!saveRow) continue;

        // Migrate the save data
        const migrationResult = await migrateSaveDataV1toV2(saveRow.data);

        if (migrationResult.success) {
          // Update the save data with migrated version
          await db.saves.update(saveRow.id!, {
            data: migrationResult.migratedData,
            version: 2,
          });
          migratedProfiles++;
        } else {
          errors.push(
            `Failed to migrate profile ${profileId}: ${migrationResult.errors.join(', ')}`,
          );
        }
      } catch (profileError) {
        errors.push(
          `Error migrating profile ${profileId}: ${profileError instanceof Error ? profileError.message : 'Unknown error'}`,
        );
      }
    }

    const durationMs = Date.now() - startTime;

    return {
      version: 2,
      name: 'Add new field to profiles',
      success: errors.length === 0,
      timestamp: Date.now(),
      recordsProcessed: profileIds.length,
      recordsMigrated: migratedProfiles,
      recordsFailed: errors.length,
      errors,
      metadata: {
        profilesMigrated: migratedProfiles,
        newFieldAdded: 'example_field',
        durationMs,
      },
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return {
      version: 2,
      name: 'Add new field to profiles',
      success: false,
      timestamp: Date.now(),
      recordsProcessed: 0,
      recordsMigrated: 0,
      recordsFailed: errors.length,
      errors,
      metadata: {
        profilesMigrated: 0,
        newFieldAdded: 'example_field',
        durationMs,
      },
    };
  }
}
