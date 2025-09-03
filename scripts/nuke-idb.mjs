#!/usr/bin/env node

/**
 * Nuke IndexedDB utility script
 * 
 * Manually clears the Draconia Chronicles IndexedDB database
 * for testing purposes. Use with caution!
 */

import { db, initializeDatabase, closeDatabase } from '../packages/db/dist/db.js';

async function nukeIndexedDB() {
  console.log('🗑️  Nuking Draconia Chronicles IndexedDB...');
  
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Clear all tables
    console.log('  Clearing saves table...');
    await db.saves.clear();
    
    console.log('  Clearing meta table...');
    await db.meta.clear();
    
    console.log('  Clearing logs table...');
    await db.logs.clear();
    
    // Close database connection
    await closeDatabase();
    
    console.log('✅ IndexedDB successfully nuked!');
    console.log('   All save data has been cleared.');
    console.log('   You can now test with a fresh database.');
    
  } catch (error) {
    console.error('❌ Failed to nuke IndexedDB:', error);
    process.exit(1);
  }
}

// Run the nuke operation
nukeIndexedDB().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
