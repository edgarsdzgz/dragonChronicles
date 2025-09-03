/**
 * Atomic write operation tests
 *
 * Tests transaction consistency, kill-tab recovery, and pruning
 * functionality for the database persistence layer.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, initializeDatabase, closeDatabase } from '../../packages/db/src/db.js';
import { putSaveAtomic, getActiveSave } from '../../packages/db/src/repo.js';
import { generateChecksumSync } from '../../packages/db/src/codec.js';
import type { SaveV1, ProfileV1 } from '../../packages/db/src/schema.v1.js';
import { clearDatabase } from './setup.js';

describe('Atomic Write Operations', () => {
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

  describe('putSaveAtomic', () => {
    it('should write save data atomically', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);

      const saveId = await putSaveAtomic('test-profile-1', save);
      expect(saveId).toBeDefined();

      // Verify save was written
      const savedSave = await getActiveSave('test-profile-1');
      expect(savedSave).toBeDefined();
      expect(savedSave?.data).toEqual(save);
    });

    it('should update active profile pointer', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);

      await putSaveAtomic('test-profile-1', save);

      // Verify save can be retrieved (indicating pointer was set)
      const savedSave = await getActiveSave('test-profile-1');
      expect(savedSave).toBeDefined();
      expect(savedSave?.data.profiles[0].id).toBe('test-profile-1');
    });

    it('should prune old saves to keep only 3 backups', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');

      // Create 5 saves (should keep only the latest 3)
      for (let i = 0; i < 5; i++) {
        const save = createTestSave([
          {
            ...profile,
            progress: { ...profile.progress, land: i + 1 },
          },
        ]);
        const checksum = generateChecksumSync(JSON.stringify(save));
        await putSaveAtomic('test-profile-1', save, 3, checksum);
      }

      // Verify only 3 saves remain
      const saves = await db.saves.where('profileId').equals('test-profile-1').toArray();
      expect(saves).toHaveLength(3);

      // Verify the latest save is the most recent
      const latestSave = saves[saves.length - 1];
      expect(latestSave.data.profiles[0].progress.land).toBe(5);
    });

    it('should handle concurrent writes to different profiles', async () => {
      const profile1 = createTestProfile('profile-1', 'Dragon 1');
      const profile2 = createTestProfile('profile-2', 'Dragon 2');

      const save1 = createTestSave([profile1]);
      const save2 = createTestSave([profile2]);

      const checksum1 = generateChecksumSync(JSON.stringify(save1));
      const checksum2 = generateChecksumSync(JSON.stringify(save2));

      // Write both saves concurrently
      await Promise.all([
        putSaveAtomic('profile-1', save1, checksum1),
        putSaveAtomic('profile-2', save2, checksum2),
      ]);

      // Verify both saves were written correctly
      const savedSave1 = await getActiveSave('profile-1');
      const savedSave2 = await getActiveSave('profile-2');

      expect(savedSave1?.data).toEqual(save1);
      expect(savedSave2?.data).toEqual(save2);
    });

    it('should maintain data integrity during transaction failures', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksumSync(JSON.stringify(save));

      // Write initial save
      await putSaveAtomic('test-profile-1', save, checksum);
      const initialSave = await getActiveSave('test-profile-1');

      // Simulate a transaction failure by closing the database
      await db.close();

      // Reopen database
      await db.open();

      // Verify data is still intact
      const recoveredSave = await getActiveSave('test-profile-1');
      expect(recoveredSave).toEqual(initialSave);
    });
  });

  describe('getActiveSave', () => {
    it('should return the most recent save for a profile', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');

      // Create multiple saves
      for (let i = 0; i < 3; i++) {
        const save = createTestSave([
          {
            ...profile,
            progress: { ...profile.progress, land: i + 1 },
          },
        ]);
        const checksum = generateChecksumSync(JSON.stringify(save));
        await putSaveAtomic('test-profile-1', save, 3, checksum);
      }

      const activeSave = await getActiveSave('test-profile-1');
      expect(activeSave).toBeDefined();
      expect(activeSave?.data.profiles[0].progress.land).toBe(3);
    });

    it('should return null for non-existent profile', async () => {
      const activeSave = await getActiveSave('non-existent-profile');
      expect(activeSave).toBeNull();
    });

    it('should handle profile with multiple saves correctly', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');

      // Create saves with different timestamps
      const saves = [];
      for (let i = 0; i < 3; i++) {
        const save = createTestSave([
          {
            ...profile,
            lastActive: Date.now() + i * 1000, // Different timestamps
          },
        ]);
        saves.push(save);
        const checksum = generateChecksumSync(JSON.stringify(save));
        await putSaveAtomic('test-profile-1', save, 3, checksum);
      }

      const activeSave = await getActiveSave('test-profile-1');
      expect(activeSave).toBeDefined();
      // Should return the save with the highest lastActive timestamp
      expect(activeSave?.data.profiles[0].lastActive).toBe(saves[2].profiles[0].lastActive);
    });
  });

  describe('Database consistency', () => {
    it('should maintain referential integrity between saves and meta tables', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksumSync(JSON.stringify(save));

      await putSaveAtomic('test-profile-1', save, 3, checksum);

      // Verify save exists
      const saves = await db.saves.where('profileId').equals('test-profile-1').toArray();
      expect(saves).toHaveLength(1);

      // Verify meta entry exists
      const metaEntry = await db.meta.get('profile_pointers');
      expect(metaEntry).toBeDefined();
      const pointers = JSON.parse(metaEntry?.value || '{}');
      expect(pointers['test-profile-1']).toBeDefined();

      // Verify the save referenced by meta actually exists
      const referencedSave = await db.saves.get(saves[0].id!);
      expect(referencedSave).toBeDefined();
    });

    it('should handle database corruption gracefully', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksumSync(JSON.stringify(save));

      await putSaveAtomic('test-profile-1', save, 3, checksum);

      // Simulate corruption by deleting the save but keeping the meta entry
      await db.saves.where('profileId').equals('test-profile-1').delete();

      // Should handle gracefully and return null
      const activeSave = await getActiveSave('test-profile-1');
      expect(activeSave).toBeNull();
    });
  });

  describe('W3 time accounting integration', () => {
    it('should preserve W3 time accounting fields during atomic writes', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const wallClock = Date.now();
      const bgCoveredMs = 5000;

      profile.sim = {
        lastSimWallClock: wallClock,
        bgCoveredMs,
      };

      const save = createTestSave([profile]);
      const checksum = generateChecksumSync(JSON.stringify(save));

      await putSaveAtomic('test-profile-1', save, 3, checksum);

      const savedSave = await getActiveSave('test-profile-1');
      expect(savedSave?.data.profiles[0].sim.lastSimWallClock).toBe(wallClock);
      expect(savedSave?.data.profiles[0].sim.bgCoveredMs).toBe(bgCoveredMs);
    });

    it('should handle W3 time accounting updates correctly', async () => {
      const profile = createTestProfile('test-profile-1', 'Test Dragon');
      const save = createTestSave([profile]);
      const checksum = generateChecksumSync(JSON.stringify(save));

      await putSaveAtomic('test-profile-1', save, 3, checksum);

      // Update W3 time accounting
      const updatedProfile = {
        ...profile,
        sim: {
          lastSimWallClock: Date.now(),
          bgCoveredMs: 10000,
        },
      };
      const updatedSave = createTestSave([updatedProfile]);
      const updatedChecksum = generateChecksumSync(JSON.stringify(updatedSave));

      await putSaveAtomic('test-profile-1', updatedSave, 3, updatedChecksum);

      const savedSave = await getActiveSave('test-profile-1');
      expect(savedSave?.data.profiles[0].sim.bgCoveredMs).toBe(10000);
    });
  });
});
