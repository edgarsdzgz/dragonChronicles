/**
 * Core Dexie database instance and table types
 *
 * Defines the database schema and provides the main database instance
 * for Draconia Chronicles persistence layer.
 */
import { Dexie } from 'dexie';
/**
 * Draconia Chronicles Database
 *
 * Main database instance with versioned schema and table definitions.
 * Uses Dexie for IndexedDB abstraction with TypeScript support.
 */
export class DraconiaDB extends Dexie {
    // Table definitions with proper typing
    saves;
    meta;
    logs;
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
 * Database initialization helper
 *
 * Ensures database is ready for use and handles any initialization
 * errors gracefully.
 */
export async function initializeDatabase() {
    try {
        // Open database connection
        await db.open();
        // Verify tables are accessible
        await db.saves.count();
        await db.meta.count();
        await db.logs.count();
        console.log('DraconiaDB initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize DraconiaDB:', error);
        throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Database cleanup helper
 *
 * Properly closes database connections and cleans up resources.
 */
export async function closeDatabase() {
    try {
        await db.close();
        console.log('DraconiaDB closed successfully');
    }
    catch (error) {
        console.error('Failed to close DraconiaDB:', error);
        // Don't throw on close errors - they're not critical
    }
}
