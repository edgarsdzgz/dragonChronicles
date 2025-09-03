/**
 * Database layer for Draconia Chronicles
 *
 * Provides persistence functionality including:
 * - Dexie database with versioned schema
 * - Zod validation for save data
 * - Atomic write operations
 * - Export/import capabilities
 */

// Export core database functionality
export * from './db.js';
export * from './schema.v1.js';
export * from './repo.js';
export * from './export.js';
export * from './errors.js';
export * from './profile.js';
