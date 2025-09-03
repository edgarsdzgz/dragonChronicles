/**
 * Export/Import functionality tests
 *
 * Tests round-trip data integrity, checksum validation, and tamper detection
 * for the database export/import system.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, initializeDatabase, closeDatabase } from '../../packages/db/src/db.js';
import {
  exportAllProfiles,
  exportAllProfilesToBlob,
  importFromBlob,
} from '../../packages/db/src/export.js';
import { putSaveAtomic } from '../../packages/db/src/repo.js';
import {
  generateChecksum,
  generateChecksumSync,
  encodeExportV1,
  validateExportV1,
} from '../../packages/db/src/codec.js';
import type { SaveV1, ProfileV1, ExportFileV1 } from '../../packages/db/src/schema.v1.js';
// Database clearing handled by global setup

describe('Export/Import Functionality', () => {
  beforeEach(async () => {
    // Initialize fresh database for each test
    await initializeDatabase();
    // Clear all data for proper test isolation
    await db.saves.clear();
    await db.meta.clear();
    await db.logs.clear();
  });

  afterEach(async () => {
    // Clean up database after each test
    await db.saves.clear();
    await db.meta.clear();
    await db.logs.clear();
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

  describe('exportAllProfiles', () => {
    it('should export all profiles with correct format', async () => {
      const profile1 = createTestProfile('profile-1', 'Dragon 1');
      const profile2 = createTestProfile('profile-2', 'Dragon 2');

      const save1 = createTestSave([profile1]);
      const save2 = createTestSave([profile2]);

      const checksum1 = generateChecksumSync(JSON.stringify(save1));
      const checksum2 = generateChecksumSync(JSON.stringify(save2));

      await putSaveAtomic('profile-1', save1, 3, checksum1);
      await putSaveAtomic('profile-2', save2, 3, checksum2);

      const exportBlob = await exportAllProfilesToBlob();
      expect(exportBlob).toBeInstanceOf(Blob);
      expect(exportBlob.type).toBe('application/json');

      const exportText = await exportBlob.text();
      const exportData = JSON.parse(exportText);

      expect(exportData.fileVersion).toBe(1);
      expect(exportData.exportedAt).toBeGreaterThan(0);
      expect(exportData.checksum).toBeDefined();
      expect(exportData.data.version).toBe(1);
      expect(exportData.data.profiles).toHaveLength(2);
    });

    it('should include W3 time accounting fields in export', async () => {
      const profile = createTestProfile('profile-1', 'Dragon 1');
      const wallClock = Date.now();
      const bgCoveredMs = 5000;

      profile.sim = {
        lastSimWallClock: wallClock,
        bgCoveredMs,
      };

      const save = createTestSave([profile]);
      const checksum = generateChecksumSync(JSON.stringify(save));

      await putSaveAtomic('profile-1', save, 3, checksum);

      const exportBlob = await exportAllProfilesToBlob();
      const exportText = await exportBlob.text();
      const exportData = JSON.parse(exportText);

      const exportedProfile = exportData.data.profiles[0];
      expect(exportedProfile.sim.lastSimWallClock).toBe(wallClock);
      expect(exportedProfile.sim.bgCoveredMs).toBe(bgCoveredMs);
    });

    it('should generate valid checksum for export data', async () => {
      const profile = createTestProfile('profile-1', 'Dragon 1');
      const save = createTestSave([profile]);
      const checksum = generateChecksumSync(JSON.stringify(save));

      await putSaveAtomic('profile-1', save, 3, checksum);

      const exportBlob = await exportAllProfilesToBlob();
      const exportText = await exportBlob.text();
      const exportData = JSON.parse(exportText);

      // Verify checksum is valid (validateExportV1 returns the validated data)
      const validatedData = await validateExportV1(exportData);
      expect(validatedData).toBeDefined();
      expect(validatedData.profiles).toHaveLength(1);
      expect(validatedData.profiles[0].id).toBe('profile-1');
    });

    it('should handle empty database gracefully', async () => {
      const exportBlob = await exportAllProfilesToBlob();
      const exportText = await exportBlob.text();
      const exportData = JSON.parse(exportText);

      expect(exportData.fileVersion).toBe(1);
      expect(exportData.data.profiles).toHaveLength(0);
      expect(exportData.data.settings).toBeDefined();
    });
  });

  describe('importFromBlob', () => {
    it('should import valid export data correctly', async () => {
      const profile1 = createTestProfile('profile-1', 'Dragon 1');
      const profile2 = createTestProfile('profile-2', 'Dragon 2');

      const save = createTestSave([profile1, profile2]);
      const checksum = generateChecksumSync(JSON.stringify(save));

      // Store the data first
      await putSaveAtomic('profile-1', save, 3, checksum);
      await putSaveAtomic('profile-2', save, 3, checksum);

      // Use the proper export function instead of manual creation
      const exportBlob = await exportAllProfilesToBlob();

      // Clear database to test import
      await db.saves.clear();
      await db.meta.clear();

      await importFromBlob(exportBlob);

      // Verify profiles were imported
      const importedSave1 = await db.saves.where('profileId').equals('profile-1').first();
      const importedSave2 = await db.saves.where('profileId').equals('profile-2').first();

      expect(importedSave1).toBeDefined();
      expect(importedSave2).toBeDefined();
      expect(importedSave1?.data.profiles).toHaveLength(2);
    });

    it('should validate checksum during import', async () => {
      const profile = createTestProfile('profile-1', 'Dragon 1');
      const save = createTestSave([profile]);

      // Create export data with invalid checksum
      const exportData: ExportFileV1 = {
        fileVersion: 1,
        exportedAt: Date.now(),
        checksum: 'invalid-checksum',
        data: save,
      };

      const exportBlob = new Blob([JSON.stringify(exportData)], {
        type: 'application/json',
      });

      const result = await importFromBlob(exportBlob);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject import with wrong file version', async () => {
      const profile = createTestProfile('profile-1', 'Dragon 1');
      const save = createTestSave([profile]);

      // Create export data with wrong version
      const exportData = {
        fileVersion: 2, // Wrong version
        exportedAt: Date.now(),
        checksum: generateChecksumSync(JSON.stringify(save)),
        data: save,
      };

      const exportBlob = new Blob([JSON.stringify(exportData)], {
        type: 'application/json',
      });

      const result = await importFromBlob(exportBlob);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle corrupted export data gracefully', async () => {
      const corruptedData = '{"invalid": "json"';
      const exportBlob = new Blob([corruptedData], {
        type: 'application/json',
      });

      const result = await importFromBlob(exportBlob);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should preserve W3 time accounting during import', async () => {
      const profile = createTestProfile('profile-1', 'Dragon 1');
      const wallClock = Date.now();
      const bgCoveredMs = 10000;

      profile.sim = {
        lastSimWallClock: wallClock,
        bgCoveredMs,
      };

      const save = createTestSave([profile]);
      const checksum = generateChecksumSync(JSON.stringify(save));

      await putSaveAtomic('profile-1', save, 3, checksum);

      // Export and import
      const exportBlob = await exportAllProfilesToBlob();
      await db.saves.clear();
      await db.meta.clear();
      await importFromBlob(exportBlob);

      const importedSave = await db.saves.where('profileId').equals('profile-1').first();
      expect(importedSave?.data.profiles[0].sim.lastSimWallClock).toBe(wallClock);
      expect(importedSave?.data.profiles[0].sim.bgCoveredMs).toBe(bgCoveredMs);
    });
  });

  describe('Round-trip data integrity', () => {
    it('should maintain data integrity through export-import cycle', async () => {
      const profile1 = createTestProfile('profile-1', 'Dragon 1');
      const profile2 = createTestProfile('profile-2', 'Dragon 2');

      const save = createTestSave([profile1, profile2]);
      const checksum = generateChecksumSync(JSON.stringify(save));

      await putSaveAtomic('profile-1', save, 3, checksum);
      await putSaveAtomic('profile-2', save, 3, checksum);

      // Export
      const exportBlob = await exportAllProfilesToBlob();

      // Clear database
      await db.saves.clear();
      await db.meta.clear();

      // Import
      await importFromBlob(exportBlob);

      // Verify data integrity
      const importedSave1 = await db.saves.where('profileId').equals('profile-1').first();
      const importedSave2 = await db.saves.where('profileId').equals('profile-2').first();

      expect(importedSave1?.data).toEqual(save);
      expect(importedSave2?.data).toEqual(save);
    });

    it('should preserve all profile data during round-trip', async () => {
      const profile = createTestProfile('profile-1', 'Dragon 1');

      // Add some complex data
      profile.progress = { land: 5, ward: 15, distanceM: 5000 };
      profile.currencies = { arcana: 1000, gold: 5000 };
      profile.enchants = { firepower: 5, scales: 3, tier: 2 };
      profile.stats = { playtimeS: 7200, deaths: 10, totalDistanceM: 15000 };
      profile.leaderboard = { highestWard: 25, fastestBossS: 60 };
      profile.sim = { lastSimWallClock: Date.now(), bgCoveredMs: 15000 };

      const save = createTestSave([profile]);
      const checksum = generateChecksumSync(JSON.stringify(save));

      await putSaveAtomic('profile-1', save, 3, checksum);

      // Export and import
      const exportBlob = await exportAllProfilesToBlob();
      await db.saves.clear();
      await db.meta.clear();
      await importFromBlob(exportBlob);

      // Verify all data is preserved
      const importedSave = await db.saves.where('profileId').equals('profile-1').first();
      const importedProfile = importedSave?.data.profiles[0];

      expect(importedProfile?.progress).toEqual(profile.progress);
      expect(importedProfile?.currencies).toEqual(profile.currencies);
      expect(importedProfile?.enchants).toEqual(profile.enchants);
      expect(importedProfile?.stats).toEqual(profile.stats);
      expect(importedProfile?.leaderboard).toEqual(profile.leaderboard);
      expect(importedProfile?.sim).toEqual(profile.sim);
    });
  });

  describe('Codec functions', () => {
    it('should encode and validate export data correctly', async () => {
      const profile = createTestProfile('profile-1', 'Dragon 1');
      const save = createTestSave([profile]);

      const encoded = await encodeExportV1(save);
      expect(encoded.fileVersion).toBe(1);
      expect(encoded.exportedAt).toBeGreaterThan(0);
      expect(encoded.checksum).toBeDefined();
      expect(encoded.data).toEqual(save);

      const isValid = await validateExportV1(encoded);
      expect(isValid).toBeDefined();
    });

    it('should detect tampered export data', async () => {
      const profile = createTestProfile('profile-1', 'Dragon 1');
      const save = createTestSave([profile]);

      const encoded = await encodeExportV1(save);

      // Tamper with the data
      encoded.data.profiles[0].name = 'Tampered Dragon';

      await expect(validateExportV1(encoded)).rejects.toThrow();
    });

    it('should handle checksum generation consistently', async () => {
      const profile = createTestProfile('profile-1', 'Dragon 1');
      const save = createTestSave([profile]);

      const checksum1 = await generateChecksum(JSON.stringify(save));
      const checksum2 = await generateChecksum(JSON.stringify(save));

      expect(checksum1).toBe(checksum2);
      expect(checksum1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 format
    });
  });

  describe('Multiple profile handling', () => {
    it('should handle multiple profile pointers correctly', async () => {
      const profile1 = createTestProfile('profile-1', 'Dragon 1');
      const profile2 = createTestProfile('profile-2', 'Dragon 2');
      const profile3 = createTestProfile('profile-3', 'Dragon 3');

      const save = createTestSave([profile1, profile2, profile3]);
      const checksum = generateChecksum(save);

      await putSaveAtomic('profile-1', save, checksum);
      await putSaveAtomic('profile-2', save, checksum);
      await putSaveAtomic('profile-3', save, checksum);

      const exportBlob = await exportAllProfilesToBlob();
      await db.saves.clear();
      await db.meta.clear();
      await importFromBlob(exportBlob);

      // Verify all profiles were imported
      const importedSaves = await db.saves.toArray();
      expect(importedSaves).toHaveLength(3);

      const profileIds = importedSaves.map((save) => save.profileId);
      expect(profileIds).toContain('profile-1');
      expect(profileIds).toContain('profile-2');
      expect(profileIds).toContain('profile-3');
    });

    it('should maintain profile independence during import', async () => {
      const profile1 = createTestProfile('profile-1', 'Dragon 1');
      const profile2 = createTestProfile('profile-2', 'Dragon 2');

      const save1 = createTestSave([profile1]);
      const save2 = createTestSave([profile2]);

      const checksum1 = generateChecksumSync(JSON.stringify(save1));
      const checksum2 = generateChecksumSync(JSON.stringify(save2));

      await putSaveAtomic('profile-1', save1, 3, checksum1);
      await putSaveAtomic('profile-2', save2, 3, checksum2);

      const exportBlob = await exportAllProfilesToBlob();
      await db.saves.clear();
      await db.meta.clear();
      await importFromBlob(exportBlob);

      // Verify profiles are imported correctly
      const importedSave1 = await db.saves.where('profileId').equals('profile-1').first();
      const importedSave2 = await db.saves.where('profileId').equals('profile-2').first();

      // Each save contains all profiles from the export, but we can find the specific profile by ID
      const importedProfile1 = importedSave1?.data.profiles.find((p) => p.id === 'profile-1');
      const importedProfile2 = importedSave2?.data.profiles.find((p) => p.id === 'profile-2');

      expect(importedProfile1?.name).toBe('Dragon 1');
      expect(importedProfile2?.name).toBe('Dragon 2');
    });
  });
});
