/**
 * Core Dexie database instance and table types
 *
 * Defines the database schema and provides the main database instance
 * for Draconia Chronicles persistence layer.
 */

import Dexie, { type Table } from 'dexie';
import type { SaveRowV1, MetaRow, LogRow } from './schema.v1.js';

/**
 * Draconia Chronicles Database
 *
 * Main database instance with versioned schema and table definitions.
 * Uses Dexie for IndexedDB abstraction with TypeScript support.
 */
export class DraconiaDB extends Dexie {
  // Table definitions with proper typing
  saves!: Table<SaveRowV1>;
  meta!: Table<MetaRow>;
  logs!: Table<LogRow>;

  constructor() {
    super('draconia_v1');

    // Define database schema version 1
    this.version(1).stores({
      saves: '++id, profileId, version, createdAt',
      meta: 'key',
      logs: '++id, timestamp, level, source',
    });
  }
}

/**
 * Global database instance
 *
 * Single instance shared across the application for consistent
 * database access and connection management.
 */
export const db = new DraconiaDB();

/**
 * Database table types for external use
 */
export type { SaveRowV1, MetaRow, LogRow };

/**
 * Database initialization helper
 *
 * Ensures database is ready for use and handles any initialization
 * errors gracefully.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Open database connection
    await db.open();

    // Verify tables are accessible
    await db.saves.count();
    await db.meta.count();
    await db.logs.count();

    console.log('DraconiaDB initialized successfully');
  } catch (error) {
    console.error('Failed to initialize DraconiaDB:', error);
    throw new Error(
      `Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Database cleanup helper
 *
 * Properly closes database connections and cleans up resources.
 */
export async function closeDatabase(): Promise<void> {
  try {
    await db.close();
    console.log('DraconiaDB closed successfully');
  } catch (error) {
    console.error('Failed to close DraconiaDB:', error);
    // Don't throw on close errors - they're not critical
  }
}
