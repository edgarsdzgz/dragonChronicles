// Simple test script to debug export function
import { exportAllProfiles } from './packages/db/src/export.js';
import { initializeDatabase, closeDatabase } from './packages/db/src/db.js';

async function testExport() {
  try {
    console.log('🔍 Testing export function...');
    
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    // Try to export
    console.log('📤 Attempting export...');
    const result = await exportAllProfiles();
    console.log('✅ Export successful:', result);
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await closeDatabase();
    console.log('🔒 Database closed');
  }
}

testExport();
