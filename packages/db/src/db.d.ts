/**
 * Core Dexie database instance and table types
 *
 * Defines the database schema and provides the main database instance
 * for Draconia Chronicles persistence layer.
 */
import { Dexie, type Table } from 'dexie';
import type { SaveRowV1, MetaRow, LogRow } from './schema.v1.js';
/**
 * Draconia Chronicles Database
 *
 * Main database instance with versioned schema and table definitions.
 * Uses Dexie for IndexedDB abstraction with TypeScript support.
 */
export declare class DraconiaDB extends Dexie {
    saves: Table<SaveRowV1>;
    meta: Table<MetaRow>;
    logs: Table<LogRow>;
    constructor();
}
/**
 * Global database instance
 *
 * Single instance shared across the application for consistent
 * database access and connection management.
 */
export declare const db: DraconiaDB;
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
export declare function initializeDatabase(): Promise<void>;
/**
 * Database cleanup helper
 *
 * Properly closes database connections and cleans up resources.
 */
export declare function closeDatabase(): Promise<void>;
//# sourceMappingURL=db.d.ts.map