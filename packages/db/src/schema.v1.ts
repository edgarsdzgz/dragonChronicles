/**
 * Schema v1 types and Zod validators
 * 
 * Defines the data structures for save data, profiles, and export formats
 * with comprehensive Zod validation for runtime type safety.
 */

import { z } from 'zod';

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * W3-compatible time accounting fields
 * 
 * Critical for preventing double-counting of background simulation time
 * when offline simulation is applied.
 */
export interface W3TimeAccounting {
  /** Last known wall-clock time when simulation advanced */
  lastSimWallClock: number;
  /** Background-covered interval to subtract during offline simulation */
  bgCoveredMs: number;
}

/**
 * Profile data structure with W3 time accounting
 */
export interface ProfileV1 {
  id: string;
  name: string;
  createdAt: number;
  lastActive: number;
  progress: {
    land: number;
    ward: number;
    distanceM: number;
  };
  currencies: {
    arcana: number;
    gold: number;
  };
  enchants: {
    firepower: number;
    scales: number;
    tier: number;
  };
  stats: {
    playtimeS: number;
    deaths: number;
    totalDistanceM: number;
  };
  leaderboard: {
    highestWard: number;
    fastestBossS: number;
  };
  sim: W3TimeAccounting;
}

/**
 * Complete save data structure
 */
export interface SaveV1 {
  version: 1;
  profiles: ProfileV1[];
  settings: {
    a11yReducedMotion: boolean;
  };
}

// ============================================================================
// Database Row Types
// ============================================================================

/**
 * Save data row in database
 */
export interface SaveRowV1 {
  id?: number | undefined;
  profileId: string;
  version: 1;
  data: SaveV1;
  createdAt: number;
  checksum: string;
}

/**
 * Metadata row for key-value storage
 */
export interface MetaRow {
  key: string;
  value: string;
  updatedAt: number;
}

/**
 * Log entry row for structured logging
 */
export interface LogRow {
  id?: number | undefined;
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: 'ui' | 'worker' | 'render' | 'net';
  message: string;
  data?: Record<string, unknown> | undefined;
  profileId?: string | undefined;
}

// ============================================================================
// Export Format Types
// ============================================================================

/**
 * Versioned export file format
 */
export interface ExportFileV1 {
  fileVersion: 1;
  exportedAt: number;
  checksum: string;
  data: SaveV1;
}

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

/**
 * W3 time accounting schema
 */
export const W3TimeAccountingSchema = z.object({
  lastSimWallClock: z.number().int().min(0),
  bgCoveredMs: z.number().int().min(0)
});

/**
 * Profile progress schema
 */
export const ProfileProgressSchema = z.object({
  land: z.number().int().min(0),
  ward: z.number().int().min(0),
  distanceM: z.number().int().min(0)
});

/**
 * Profile currencies schema
 */
export const ProfileCurrenciesSchema = z.object({
  arcana: z.number().int().min(0),
  gold: z.number().int().min(0)
});

/**
 * Profile enchants schema
 */
export const ProfileEnchantsSchema = z.object({
  firepower: z.number().int().min(0),
  scales: z.number().int().min(0),
  tier: z.number().int().min(0)
});

/**
 * Profile stats schema
 */
export const ProfileStatsSchema = z.object({
  playtimeS: z.number().int().min(0),
  deaths: z.number().int().min(0),
  totalDistanceM: z.number().int().min(0)
});

/**
 * Profile leaderboard schema
 */
export const ProfileLeaderboardSchema = z.object({
  highestWard: z.number().int().min(0),
  fastestBossS: z.number().int().min(0)
});

/**
 * Complete profile schema with W3 time accounting
 */
export const ProfileV1Schema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  createdAt: z.number().int().min(0),
  lastActive: z.number().int().min(0),
  progress: ProfileProgressSchema,
  currencies: ProfileCurrenciesSchema,
  enchants: ProfileEnchantsSchema,
  stats: ProfileStatsSchema,
  leaderboard: ProfileLeaderboardSchema,
  sim: W3TimeAccountingSchema
});

/**
 * Settings schema
 */
export const SettingsSchema = z.object({
  a11yReducedMotion: z.boolean()
});

/**
 * Complete save data schema
 */
export const SaveV1Schema = z.object({
  version: z.literal(1),
  profiles: z.array(ProfileV1Schema).min(1).max(6),
  settings: SettingsSchema
});

/**
 * Save row schema
 */
export const SaveRowV1Schema = z.object({
  id: z.number().int().positive().optional(),
  profileId: z.string().min(1),
  version: z.literal(1),
  data: SaveV1Schema,
  createdAt: z.number().int().min(0),
  checksum: z.string().min(1)
});

/**
 * Meta row schema
 */
export const MetaRowSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  updatedAt: z.number().int().min(0)
});

/**
 * Log row schema
 */
export const LogRowSchema = z.object({
  id: z.number().int().positive().optional(),
  timestamp: z.number().int().min(0),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  source: z.enum(['ui', 'worker', 'render', 'net']),
  message: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
  profileId: z.string().min(1).optional()
});

/**
 * Export file schema
 */
export const ExportFileV1Schema = z.object({
  fileVersion: z.literal(1),
  exportedAt: z.number().int().min(0),
  checksum: z.string().min(1),
  data: SaveV1Schema
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a complete save data object
 */
export function validateSaveV1(data: unknown): SaveV1 {
  return SaveV1Schema.parse(data);
}

/**
 * Validates a profile object
 */
export function validateProfileV1(data: unknown): ProfileV1 {
  return ProfileV1Schema.parse(data);
}

/**
 * Validates an export file
 */
export function validateExportFileV1(data: unknown): ExportFileV1 {
  return ExportFileV1Schema.parse(data);
}

/**
 * Validates a save row
 */
export function validateSaveRowV1(data: unknown): SaveRowV1 {
  const parsed = SaveRowV1Schema.parse(data);
  return {
    ...parsed,
    id: parsed.id || undefined
  };
}

/**
 * Validates a meta row
 */
export function validateMetaRow(data: unknown): MetaRow {
  return MetaRowSchema.parse(data);
}

/**
 * Validates a log row
 */
export function validateLogRow(data: unknown): LogRow {
  const parsed = LogRowSchema.parse(data);
  return {
    ...parsed,
    id: parsed.id || undefined
  };
}
