import { initializeDatabase, closeDatabase } from './packages/db/dist/db.js';
import { exportAllProfilesToBlob, importFromBlob } from './packages/db/dist/export.js';
import { putSaveAtomic } from './packages/db/dist/repo.js';
import { generateChecksumSync } from './packages/db/dist/codec.js';

async function testManualExport() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    // Create test data
    const testProfile = {
      id: 'test-profile',
      name: 'Test Dragon',
      createdAt: Date.now(),
      lastActive: Date.now(),
      progress: { land: 1, ward: 5, distanceM: 1000 },
      currencies: { arcana: 100, gold: 500 },
      enchants: { firepower: 2, scales: 1, tier: 1 },
      stats: { playtimeS: 3600, deaths: 3, totalDistanceM: 5000 },
      leaderboard: { highestWard: 10, fastestBossS: 120 },
      sim: { lastSimWallClock: Date.now(), bgCoveredMs: 0 }
    };
    
    const testSave = {
      version: 1,
      profiles: [testProfile],
      settings: { a11yReducedMotion: false }
    };
    
    // Store data
    const checksum = generateChecksumSync(JSON.stringify(testSave));
    await putSaveAtomic('test-profile', testSave, 3, checksum);
    console.log('✅ Test data stored');
    
    // Export
    const exportBlob = await exportAllProfilesToBlob();
    console.log('✅ Export created, size:', exportBlob.size);
    
    // Clear database
    await closeDatabase();
    await initializeDatabase();
    console.log('✅ Database cleared and reinitialized');
    
    // Import
    const importResult = await importFromBlob(exportBlob);
    console.log('✅ Import result:', importResult);
    
    // Verify data integrity
    if (importResult.success && importResult.importedProfiles === 1) {
      console.log('🎉 Manual test PASSED - Export/Import working correctly!');
    } else {
      console.log('❌ Manual test FAILED - Check import result');
    }
    
  } catch (error) {
    console.error('❌ Manual test error:', error);
  } finally {
    await closeDatabase();
  }
}

testManualExport();