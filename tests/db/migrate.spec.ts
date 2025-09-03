/**
 * Migration system tests
 *
 * Tests database schema migration functionality including version tracking,
 * data transformation, and backup/restore capabilities.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, initializeDatabase, closeDatabase } from '../../packages/db/src/db.js';
import {
  getDatabaseVersion,
  getMigrationStatus,
  runMigrations,
  validateMigrationState,
  createMigrationBackup,
} from '../../packages/db/src/migrate.js';
import { putSaveAtomic } from '../../packages/db/src/repo.js';
import { generateChecksum } from '../../packages/db/src/codec.js';
import type { SaveV1, ProfileV1 } from '../../packages/db/src/schema.v1.js';
import { clearDatabase } from './setup.js';

describe('Migration System', () => {
  beforeEach(async () => {
    // Initialize fresh database for each test
    await initializeDatabase();
    // Clear all data for proper test isolation
    await clearDatabase();
  });

  afterEach(async () => {
    // Clean up database after each test
    await clearDatabase();
    await closeDatabase();
  });

  const createTestProfile = (id: string, name: string): ProfileV1 => ({
    id,
    name,
    createdAt: Date.now(),
    lastActive: Date.now(),
    progress: { land: 1, ward: 5, distanceM: 1000 },
    currencies: { arcana: 100, gold: 500 },
    enchants: { firepower: 2, scales: 1, tier: 1 },
    stats: { playtimeS: 3600, deaths: 3, totalDistanceM: 5000 },
    leaderboard: { highestWard: 10, fastestBossS: 120 },
    sim: { lastSimWallClock: Date.now(), bgCoveredMs: 0 },
  });

  const createTestSave = (profiles: ProfileV1[]): SaveV1 => ({
    version: 1,
    profiles,
    settings: { a11yReducedMotion: false },
  });

  describe('Database Version Management', () => {
    it('should return version 1 for new database', async () => {
      const version = await getDatabaseVersion();
      expect(version).toBe(1);
    });

    it('should track database version in meta table', async () => {
      // Set a specific version
      await db.meta.put({
        key: 'schema_version',
        value: '2',
        updatedAt: Date.now(),
      });

      const version = await getDatabaseVersion();
      expect(version).toBe(2);
    });

    it('should handle missing version gracefully', async () => {
      // Clear meta table
      await db.meta.clear();

      const version = await getDatabaseVersion();
      expect(version).toBe(1); // Should default to 1
    });
  });

  describe('Migration Status', () => {
    it('should return correct migration status for fresh database', async () => {
      const status = await getMigrationStatus();

      expect(status.currentVersion).toBe(1);
      expect(status.availableMigrations).toEqual([]);
      expect(status.lastMigration).toBeNull();
    });

    it('should handle database with version set', async () => {
      await db.meta.put({
        key: 'schema_version',
        value: '2',
        updatedAt: Date.now(),
      });

      const status = await getMigrationStatus();
      expect(status.currentVersion).toBe(2);
    });
  });

  describe('Migration Execution', () => {
    it('should handle no migrations needed', async () => {
      const result = await runMigrations();

      expect(result.success).toBe(true);
      expect(result.version).toBe(1);
      expect(result.recordsMigrated).toBe(0);
      expect(result.errors).toEqual([]);
      expect(result.timeMs).toBeGreaterThan(0);
    });

    it('should complete successfully when no data exists', async () => {
      const result = await runMigrations();

      expect(result.success).toBe(true);
      expect(result.recordsMigrated).toBe(0);
    });

    it('should handle migration with existing data', async () => {
      // Add some test data
      const profile = createTestProfile('test-profile', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile', save, checksum);

      const result = await runMigrations();

      expect(result.success).toBe(true);
      expect(result.version).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Migration Validation', () => {
    it('should validate empty database successfully', async () => {
      const validation = await validateMigrationState();

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toEqual([]);
      expect(validation.totalRecords).toBe(0);
      expect(validation.validRecords).toBe(0);
    });

    it('should validate valid save data', async () => {
      const profile = createTestProfile('test-profile', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile', save, checksum);

      const validation = await validateMigrationState();

      expect(validation.isValid).toBe(true);
      expect(validation.totalRecords).toBe(1);
      expect(validation.validRecords).toBe(1);
      expect(validation.issues).toEqual([]);
    });

    it('should detect invalid save data structure', async () => {
      // Insert invalid data directly
      await db.saves.add({
        profileId: 'invalid-profile',
        version: 1,
        data: null as any, // Invalid data
        createdAt: Date.now(),
        checksum: 'invalid',
      });

      const validation = await validateMigrationState();

      expect(validation.isValid).toBe(false);
      expect(validation.totalRecords).toBe(1);
      expect(validation.validRecords).toBe(0);
      expect(validation.issues.length).toBeGreaterThan(0);
    });

    it('should detect missing required fields', async () => {
      // Insert save with missing fields
      await db.saves.add({
        profileId: 'incomplete-profile',
        version: 1,
        data: { version: 1 } as any, // Missing profiles array
        createdAt: Date.now(),
        checksum: 'invalid',
      });

      const validation = await validateMigrationState();

      expect(validation.isValid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.issues[0]).toContain('Missing required fields');
    });
  });

  describe('Migration Backup', () => {
    it('should create backup successfully for empty database', async () => {
      const backup = await createMigrationBackup();

      expect(backup.success).toBe(true);
      expect(backup.backupId).toMatch(/^migration_backup_\d+$/);
      expect(backup.recordCount).toBe(0);
      expect(backup.error).toBeUndefined();
    });

    it('should create backup with save data', async () => {
      const profile = createTestProfile('test-profile', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile', save, checksum);

      const backup = await createMigrationBackup();

      expect(backup.success).toBe(true);
      expect(backup.recordCount).toBe(1);
      expect(backup.backupId).toBeDefined();
    });

    it('should store backup in meta table', async () => {
      const profile = createTestProfile('test-profile', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile', save, checksum);

      const backup = await createMigrationBackup();
      expect(backup.success).toBe(true);

      // Verify backup was stored
      const backupMeta = await db.meta.get(`backup_${backup.backupId}`);
      expect(backupMeta).toBeDefined();
      expect(backupMeta!.value).toContain('saves');
    });

    it('should not backup other backups', async () => {
      // Create a backup first
      const firstBackup = await createMigrationBackup();
      expect(firstBackup.success).toBe(true);

      // Create second backup
      const secondBackup = await createMigrationBackup();
      expect(secondBackup.success).toBe(true);

      // Verify second backup doesn't contain the first backup
      const backupMeta = await db.meta.get(`backup_${secondBackup.backupId}`);
      expect(backupMeta).toBeDefined();

      const backupData = JSON.parse(backupMeta!.value);
      const backupMetaEntries = backupData.meta || [];
      const hasBackupInBackup = backupMetaEntries.some((m: any) => m.key.startsWith('backup_'));

      expect(hasBackupInBackup).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete migration workflow', async () => {
      // 1. Add test data
      const profile = createTestProfile('test-profile', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile', save, checksum);

      // 2. Validate current state
      const initialValidation = await validateMigrationState();
      expect(initialValidation.isValid).toBe(true);

      // 3. Create backup
      const backup = await createMigrationBackup();
      expect(backup.success).toBe(true);

      // 4. Run migrations
      const migrationResult = await runMigrations();
      expect(migrationResult.success).toBe(true);

      // 5. Validate post-migration state
      const finalValidation = await validateMigrationState();
      expect(finalValidation.isValid).toBe(true);
    });

    it('should maintain data integrity through migration process', async () => {
      const profile = createTestProfile('test-profile', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile', save, checksum);

      // Record initial data
      const initialSaves = await db.saves.toArray();
      expect(initialSaves).toHaveLength(1);

      // Run migration
      const result = await runMigrations();
      expect(result.success).toBe(true);

      // Verify data still exists and is intact
      const finalSaves = await db.saves.toArray();
      expect(finalSaves).toHaveLength(1);
      expect(finalSaves[0].profileId).toBe('test-profile');
      expect(finalSaves[0].data.profiles[0].name).toBe('Test Dragon');
    });
  });
});
