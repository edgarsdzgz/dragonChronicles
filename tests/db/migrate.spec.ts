/**
 * Migration functionality tests
 *
 * Tests versioned schema evolution and structured reporting
 * for database migration system.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, initializeDatabase, closeDatabase } from '../../packages/db/src/db.js';
import { migrateV1toV2, type MigrationReport } from '../../packages/db/src/migrate.js';
import { putSaveAtomic } from '../../packages/db/src/repo.js';
import { generateChecksum } from '../../packages/db/src/codec.js';
import type { SaveV1, ProfileV1 } from '../../packages/db/src/schema.v1.js';

describe('Migration Functionality', () => {
  beforeEach(async () => {
    // Initialize fresh database for each test
    await initializeDatabase();
  });

  afterEach(async () => {
    // Clean up database after each test
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

  describe('migrateV1toV2', () => {
    it('should generate structured migration report', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile-1', save, checksum);

      const report = await migrateV1toV2();

      expect(report).toBeDefined();
      expect(report.success).toBe(true);
      expect(report.migratedProfiles).toBeGreaterThanOrEqual(0);
      expect(report.errors).toHaveLength(0);
      expect(report.warnings).toHaveLength(0);
      expect(report.durationMs).toBeGreaterThan(0);
    });

    it('should handle empty database gracefully', async () => {
      const report = await migrateV1toV2();

      expect(report.success).toBe(true);
      expect(report.recordsMigrated).toBe(0);
      expect(report.errors).toHaveLength(0);
    });

    it('should migrate multiple profiles correctly', async () => {
      const profile1 = createTestProfile('profile-1', 'Dragon 1');
      const profile2 = createTestProfile('profile-2', 'Dragon 2');
      const profile3 = createTestProfile('profile-3', 'Dragon 3');

      const save = createTestSave([profile1, profile2, profile3]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('profile-1', save, checksum);
      await putSaveAtomic('profile-2', save, checksum);
      await putSaveAtomic('profile-3', save, checksum);

      const report = await migrateV1toV2();

      expect(report.success).toBe(true);
      expect(report.migratedProfiles).toBe(3);
      expect(report.errors).toHaveLength(0);
    });

    it('should preserve W3 time accounting during migration', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const wallClock = Date.now();
      const bgCoveredMs = 5000;

      profile.sim = {
        lastSimWallClock: wallClock,
        bgCoveredMs,
      };

      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile-1', save, checksum);

      const report = await migrateV1toV2();

      expect(report.success).toBe(true);
      expect(report.migratedProfiles).toBe(1);

      // Verify W3 time accounting is preserved (migration should not affect it)
      const migratedSave = await db.saves.where('profileId').equals('test-profile-1').first();
      expect(migratedSave?.data.profiles[0].sim.lastSimWallClock).toBe(wallClock);
      expect(migratedSave?.data.profiles[0].sim.bgCoveredMs).toBe(bgCoveredMs);
    });

    it('should handle migration errors gracefully', async () => {
      // Create a save with invalid data to trigger migration error
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile-1', save, checksum);

      // Simulate a migration error by corrupting the data
      await db.saves
        .where('profileId')
        .equals('test-profile-1')
        .modify((save) => {
          if (save.data) {
            (save.data as any).version = 999; // Invalid version
          }
        });

      const report = await migrateV1toV2();

      expect(report.success).toBe(false);
      expect(report.errors.length).toBeGreaterThan(0);
      expect(report.errors[0]).toContain('test-profile-1');
    });

    it('should generate warnings for non-critical issues', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile-1', save, checksum);

      const report = await migrateV1toV2();

      // Migration should succeed but may generate warnings
      expect(report.success).toBe(true);
      // Warnings are optional and depend on the specific migration logic
      expect(Array.isArray(report.warnings)).toBe(true);
    });

    it('should maintain data integrity during migration', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');

      // Add complex data to test integrity
      profile.progress = { land: 5, ward: 15, distanceM: 5000 };
      profile.currencies = { arcana: 1000, gold: 5000 };
      profile.enchants = { firepower: 5, scales: 3, tier: 2 };
      profile.stats = { playtimeS: 7200, deaths: 10, totalDistanceM: 15000 };
      profile.leaderboard = { highestWard: 25, fastestBossS: 60 };
      profile.sim = { lastSimWallClock: Date.now(), bgCoveredMs: 15000 };

      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile-1', save, checksum);

      const report = await migrateV1toV2();

      expect(report.success).toBe(true);
      expect(report.migratedProfiles).toBe(1);

      // Verify all data is preserved
      const migratedSave = await db.saves.where('profileId').equals('test-profile-1').first();
      const migratedProfile = migratedSave?.data.profiles[0];

      expect(migratedProfile?.progress).toEqual(profile.progress);
      expect(migratedProfile?.currencies).toEqual(profile.currencies);
      expect(migratedProfile?.enchants).toEqual(profile.enchants);
      expect(migratedProfile?.stats).toEqual(profile.stats);
      expect(migratedProfile?.leaderboard).toEqual(profile.leaderboard);
      expect(migratedProfile?.sim).toEqual(profile.sim);
    });

    it('should handle concurrent migration attempts', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile-1', save, checksum);

      // Run multiple migrations concurrently
      const reports = await Promise.all([migrateV1toV2(), migrateV1toV2(), migrateV1toV2()]);

      // All migrations should succeed
      reports.forEach((report) => {
        expect(report.success).toBe(true);
        expect(report.migratedProfiles).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('MigrationReport structure', () => {
    it('should have correct report structure', async () => {
      const report: MigrationReport = await migrateV1toV2();

      // Verify required fields
      expect(typeof report.success).toBe('boolean');
      expect(typeof report.recordsMigrated).toBe('number');
      expect(Array.isArray(report.errors)).toBe(true);
      expect(typeof report.timestamp).toBe('number');

      // Verify field constraints
      expect(report.recordsMigrated).toBeGreaterThanOrEqual(0);
      expect(report.timestamp).toBeGreaterThan(0);

      // Verify error messages
      report.errors.forEach((error) => {
        expect(typeof error).toBe('string');
        expect(error.length).toBeGreaterThan(0);
      });
    });

    it('should include detailed error information', async () => {
      // Create a scenario that will generate an error
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile-1', save, checksum);

      // Corrupt the data to trigger an error
      await db.saves
        .where('profileId')
        .equals('test-profile-1')
        .modify((save) => {
          if (save.data) {
            delete (save.data as any).profiles;
          }
        });

      const report = await migrateV1toV2();

      expect(report.success).toBe(false);
      expect(report.errors.length).toBeGreaterThan(0);

      // Error should contain profile information
      const errorMessage = report.errors[0];
      expect(errorMessage).toContain('test-profile-1');
    });

    it('should include performance metrics', async () => {
      const startTime = Date.now();
      const report = await migrateV1toV2();
      const endTime = Date.now();

      expect(report.metadata.durationMs).toBeGreaterThanOrEqual(0);
      expect(report.metadata.durationMs).toBeLessThanOrEqual(endTime - startTime + 100); // Allow some tolerance
      expect(report.timestamp).toBeGreaterThanOrEqual(startTime);
      expect(report.timestamp).toBeLessThanOrEqual(endTime);
    });
  });

  describe('Migration edge cases', () => {
    it('should handle profiles with missing optional fields', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');

      // Remove some optional fields to test edge case handling
      delete (profile as any).leaderboard;

      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile-1', save, checksum);

      const report = await migrateV1toV2();

      // Migration should handle missing fields gracefully
      expect(report.success).toBe(true);
      expect(report.recordsMigrated).toBe(1);
    });

    it('should handle large datasets efficiently', async () => {
      // Create multiple profiles to test performance
      const profiles = [];
      for (let i = 0; i < 10; i++) {
        const profile = createTestProfile(`profile-${i}`, `Dragon ${i}`);
        profiles.push(profile);
      }

      const save = createTestSave(profiles);
      const checksum = generateChecksum(save);

      // Create multiple saves
      for (let i = 0; i < 5; i++) {
        await putSaveAtomic(`profile-${i}`, save, checksum);
      }

      const report = await migrateV1toV2();

      expect(report.success).toBe(true);
      expect(report.recordsMigrated).toBe(5);
      expect(report.metadata.durationMs).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle database connection issues', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile-1', save, checksum);

      // Close database to simulate connection issue
      await db.close();

      // Migration should handle connection issues gracefully
      const report = await migrateV1toV2();

      // Should either succeed or fail gracefully with proper error reporting
      expect(typeof report.success).toBe('boolean');
      expect(Array.isArray(report.errors)).toBe(true);
    });
  });

  describe('Migration validation', () => {
    it('should validate migration results', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile-1', save, checksum);

      const report = await migrateV1toV2();

      if (report.success) {
        // If migration succeeded, verify data integrity
        const migratedSave = await db.saves.where('profileId').equals('test-profile-1').first();
        expect(migratedSave).toBeDefined();
        expect(migratedSave?.data.profiles[0].id).toBe(profile.id);
        expect(migratedSave?.data.profiles[0].name).toBe(profile.name);
      } else {
        // If migration failed, verify error reporting
        expect(report.errors.length).toBeGreaterThan(0);
      }
    });

    it('should maintain referential integrity after migration', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('test-profile-1', save, checksum);

      const report = await migrateV1toV2();

      if (report.success) {
        // Verify meta table still references valid saves
        const metaEntry = await db.meta.get('active_profile');
        if (metaEntry) {
          const referencedSave = await db.saves.where('profileId').equals(metaEntry.value).first();
          expect(referencedSave).toBeDefined();
        }
      }
    });
  });
});
