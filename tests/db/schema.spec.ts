/**
 * Schema validation tests
 *
 * Tests Zod schemas for runtime type safety and validation
 * of save data, profiles, and export formats.
 */

import { describe, it, expect } from 'vitest';
import {
  validateSaveV1,
  validateProfileV1,
  validateExportFileV1,
  validateSaveRowV1,
  validateMetaRow,
  validateLogRow,
  type SaveV1,
  type ProfileV1,
  type ExportFileV1,
  type SaveRowV1,
  type MetaRow,
  type LogRow,
} from '../../packages/db/src/schema.v1.js';

describe('Schema Validation', () => {
  describe('ProfileV1 validation', () => {
    const validProfile: ProfileV1 = {
      id: 'test-profile-1',
      name: 'Test Dragon',
      createdAt: 1700000000000,
      lastActive: 1700000001000,
      progress: {
        land: 1,
        ward: 5,
        distanceM: 1000,
      },
      currencies: {
        arcana: 100,
        gold: 500,
      },
      enchants: {
        firepower: 2,
        scales: 1,
        tier: 1,
      },
      stats: {
        playtimeS: 3600,
        deaths: 3,
        totalDistanceM: 5000,
      },
      leaderboard: {
        highestWard: 10,
        fastestBossS: 120,
      },
      sim: {
        lastSimWallClock: 1700000000000,
        bgCoveredMs: 0,
      },
    };

    it('should validate a complete valid profile', () => {
      const result = validateProfileV1(validProfile);
      expect(result).toEqual(validProfile);
    });

    it('should reject profile with missing W3 time accounting fields', () => {
      const invalidProfile = { ...validProfile };
      delete (invalidProfile as any).sim;

      expect(() => validateProfileV1(invalidProfile)).toThrow();
    });

    it('should reject profile with invalid W3 time accounting', () => {
      const invalidProfile = {
        ...validProfile,
        sim: {
          lastSimWallClock: -1, // Invalid negative value
          bgCoveredMs: 0,
        },
      };

      expect(() => validateProfileV1(invalidProfile)).toThrow();
    });

    it('should reject profile with invalid name length', () => {
      const invalidProfile = {
        ...validProfile,
        name: '', // Empty name
      };

      expect(() => validateProfileV1(invalidProfile)).toThrow();
    });

    it('should reject profile with negative progress values', () => {
      const invalidProfile = {
        ...validProfile,
        progress: {
          land: -1,
          ward: 5,
          distanceM: 1000,
        },
      };

      expect(() => validateProfileV1(invalidProfile)).toThrow();
    });

    it('should reject profile with non-integer values', () => {
      const invalidProfile = {
        ...validProfile,
        progress: {
          land: 1.5, // Non-integer
          ward: 5,
          distanceM: 1000,
        },
      };

      expect(() => validateProfileV1(invalidProfile)).toThrow();
    });
  });

  describe('SaveV1 validation', () => {
    const validSave: SaveV1 = {
      version: 1,
      profiles: [
        {
          id: 'profile-1',
          name: 'Dragon 1',
          createdAt: 1700000000000,
          lastActive: 1700000001000,
          progress: { land: 1, ward: 5, distanceM: 1000 },
          currencies: { arcana: 100, gold: 500 },
          enchants: { firepower: 2, scales: 1, tier: 1 },
          stats: { playtimeS: 3600, deaths: 3, totalDistanceM: 5000 },
          leaderboard: { highestWard: 10, fastestBossS: 120 },
          sim: { lastSimWallClock: 1700000000000, bgCoveredMs: 0 },
        },
      ],
      settings: {
        a11yReducedMotion: false,
      },
    };

    it('should validate a complete valid save', () => {
      const result = validateSaveV1(validSave);
      expect(result).toEqual(validSave);
    });

    it('should reject save with wrong version', () => {
      const invalidSave = {
        ...validSave,
        version: 2, // Wrong version
      };

      expect(() => validateSaveV1(invalidSave)).toThrow();
    });

    it('should reject save with no profiles', () => {
      const invalidSave = {
        ...validSave,
        profiles: [], // Empty profiles array
      };

      expect(() => validateSaveV1(invalidSave)).toThrow();
    });

    it('should reject save with too many profiles', () => {
      const invalidSave = {
        ...validSave,
        profiles: Array(7).fill(validSave.profiles[0]), // 7 profiles (max is 6)
      };

      expect(() => validateSaveV1(invalidSave)).toThrow();
    });

    it('should reject save with invalid profile', () => {
      const invalidSave = {
        ...validSave,
        profiles: [
          {
            ...validSave.profiles[0],
            name: '', // Invalid profile name
          },
        ],
      };

      expect(() => validateSaveV1(invalidSave)).toThrow();
    });
  });

  describe('ExportFileV1 validation', () => {
    const validExport: ExportFileV1 = {
      fileVersion: 1,
      exportedAt: 1700000000000,
      checksum: 'abc123def456',
      data: {
        version: 1,
        profiles: [
          {
            id: 'profile-1',
            name: 'Dragon 1',
            createdAt: 1700000000000,
            lastActive: 1700000001000,
            progress: { land: 1, ward: 5, distanceM: 1000 },
            currencies: { arcana: 100, gold: 500 },
            enchants: { firepower: 2, scales: 1, tier: 1 },
            stats: { playtimeS: 3600, deaths: 3, totalDistanceM: 5000 },
            leaderboard: { highestWard: 10, fastestBossS: 120 },
            sim: { lastSimWallClock: 1700000000000, bgCoveredMs: 0 },
          },
        ],
        settings: {
          a11yReducedMotion: false,
        },
      },
    };

    it('should validate a complete valid export file', () => {
      const result = validateExportFileV1(validExport);
      expect(result).toEqual(validExport);
    });

    it('should reject export with wrong file version', () => {
      const invalidExport = {
        ...validExport,
        fileVersion: 2, // Wrong file version
      };

      expect(() => validateExportFileV1(invalidExport)).toThrow();
    });

    it('should reject export with empty checksum', () => {
      const invalidExport = {
        ...validExport,
        checksum: '', // Empty checksum
      };

      expect(() => validateExportFileV1(invalidExport)).toThrow();
    });

    it('should reject export with invalid data', () => {
      const invalidExport = {
        ...validExport,
        data: {
          ...validExport.data,
          version: 2, // Invalid save version
        },
      };

      expect(() => validateExportFileV1(invalidExport)).toThrow();
    });
  });

  describe('Database row validation', () => {
    const validSaveRow: SaveRowV1 = {
      profileId: 'test-profile',
      version: 1,
      data: {
        version: 1,
        profiles: [
          {
            id: 'profile-1',
            name: 'Dragon 1',
            createdAt: 1700000000000,
            lastActive: 1700000001000,
            progress: { land: 1, ward: 5, distanceM: 1000 },
            currencies: { arcana: 100, gold: 500 },
            enchants: { firepower: 2, scales: 1, tier: 1 },
            stats: { playtimeS: 3600, deaths: 3, totalDistanceM: 5000 },
            leaderboard: { highestWard: 10, fastestBossS: 120 },
            sim: { lastSimWallClock: 1700000000000, bgCoveredMs: 0 },
          },
        ],
        settings: {
          a11yReducedMotion: false,
        },
      },
      createdAt: 1700000000000,
      checksum: 'abc123def456',
    };

    const validMetaRow: MetaRow = {
      key: 'active_profile',
      value: 'profile-1',
      updatedAt: 1700000000000,
    };

    const validLogRow: LogRow = {
      timestamp: 1700000000000,
      level: 'info',
      source: 'ui',
      message: 'Test log message',
      profileId: 'profile-1',
    };

    it('should validate a complete valid save row', () => {
      const result = validateSaveRowV1(validSaveRow);
      expect(result).toEqual(validSaveRow);
    });

    it('should validate save row with optional id', () => {
      const saveRowWithId = { ...validSaveRow, id: 1 };
      const result = validateSaveRowV1(saveRowWithId);
      expect(result).toEqual(saveRowWithId);
    });

    it('should reject save row with invalid profile id', () => {
      const invalidSaveRow = {
        ...validSaveRow,
        profileId: '', // Empty profile id
      };

      expect(() => validateSaveRowV1(invalidSaveRow)).toThrow();
    });

    it('should validate a complete valid meta row', () => {
      const result = validateMetaRow(validMetaRow);
      expect(result).toEqual(validMetaRow);
    });

    it('should reject meta row with empty key', () => {
      const invalidMetaRow = {
        ...validMetaRow,
        key: '', // Empty key
      };

      expect(() => validateMetaRow(invalidMetaRow)).toThrow();
    });

    it('should validate a complete valid log row', () => {
      const result = validateLogRow(validLogRow);
      expect(result).toEqual(validLogRow);
    });

    it('should validate log row with optional id', () => {
      const logRowWithId = { ...validLogRow, id: 1 };
      const result = validateLogRow(logRowWithId);
      expect(result).toEqual(logRowWithId);
    });

    it('should validate log row with optional data', () => {
      const logRowWithData = {
        ...validLogRow,
        data: { userId: 'user123', action: 'login' },
      };
      const result = validateLogRow(logRowWithData);
      expect(result).toEqual(logRowWithData);
    });

    it('should reject log row with invalid level', () => {
      const invalidLogRow = {
        ...validLogRow,
        level: 'invalid' as any, // Invalid level
      };

      expect(() => validateLogRow(invalidLogRow)).toThrow();
    });

    it('should reject log row with invalid source', () => {
      const invalidLogRow = {
        ...validLogRow,
        source: 'invalid' as any, // Invalid source
      };

      expect(() => validateLogRow(invalidLogRow)).toThrow();
    });

    it('should reject log row with empty message', () => {
      const invalidLogRow = {
        ...validLogRow,
        message: '', // Empty message
      };

      expect(() => validateLogRow(invalidLogRow)).toThrow();
    });
  });
});
