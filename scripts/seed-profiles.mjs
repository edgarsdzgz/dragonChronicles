#!/usr/bin/env node

/**
 * Seed profiles utility script
 * 
 * Creates sample profile data in the Draconia Chronicles IndexedDB
 * for testing and development purposes.
 */

import { db, initializeDatabase, closeDatabase } from '../packages/db/src/db.js';
import { putSaveAtomic } from '../packages/db/src/repo.js';
import { generateChecksum } from '../packages/db/src/codec.js';
import type { SaveV1, ProfileV1 } from '../packages/db/src/schema.v1.js';

/**
 * Create a sample profile with realistic game data
 */
function createSampleProfile(id: string, name: string, progress: number): ProfileV1 {
  const now = Date.now();
  const playtimeHours = Math.floor(Math.random() * 50) + 10; // 10-60 hours
  const deaths = Math.floor(Math.random() * 20) + 1; // 1-20 deaths
  
  return {
    id,
    name,
    createdAt: now - (playtimeHours * 3600 * 1000), // Created playtime hours ago
    lastActive: now,
    progress: {
      land: progress,
      ward: Math.floor(progress * 1.5) + 1,
      distanceM: progress * 1000
    },
    currencies: {
      arcana: Math.floor(Math.random() * 1000) + 100,
      gold: Math.floor(Math.random() * 5000) + 500
    },
    enchants: {
      firepower: Math.floor(progress / 2) + 1,
      scales: Math.floor(progress / 3) + 1,
      tier: Math.floor(progress / 5) + 1
    },
    stats: {
      playtimeS: playtimeHours * 3600,
      deaths,
      totalDistanceM: progress * 2000
    },
    leaderboard: {
      highestWard: Math.floor(progress * 1.5) + 5,
      fastestBossS: Math.floor(Math.random() * 300) + 60
    },
    sim: {
      lastSimWallClock: now,
      bgCoveredMs: Math.floor(Math.random() * 10000) + 1000
    }
  };
}

/**
 * Create sample save data with multiple profiles
 */
function createSampleSave(profiles: ProfileV1[]): SaveV1 {
  return {
    version: 1,
    profiles,
    settings: {
      a11yReducedMotion: Math.random() > 0.8 // 20% chance of being enabled
    }
  };
}

async function seedProfiles() {
  console.log('🌱 Seeding Draconia Chronicles database with sample profiles...');
  
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Create sample profiles with different progress levels
    const sampleProfiles = [
      createSampleProfile('newbie-dragon', 'Newbie Dragon', 1),
      createSampleProfile('experienced-dragon', 'Experienced Dragon', 10),
      createSampleProfile('veteran-dragon', 'Veteran Dragon', 25),
      createSampleProfile('legendary-dragon', 'Legendary Dragon', 50),
      createSampleProfile('ancient-dragon', 'Ancient Dragon', 100)
    ];
    
    // Create save data with all profiles
    const save = createSampleSave(sampleProfiles);
    const checksum = generateChecksum(save);
    
    // Save each profile individually to test multiple profile support
    for (const profile of sampleProfiles) {
      const profileSave = createSampleSave([profile]);
      const profileChecksum = generateChecksum(profileSave);
      
      console.log(`  Creating profile: ${profile.name} (${profile.id})`);
      await putSaveAtomic(profile.id, profileSave, profileChecksum);
    }
    
    // Also create a combined save with all profiles
    console.log('  Creating combined save with all profiles...');
    await putSaveAtomic('combined-save', save, checksum);
    
    // Close database connection
    await closeDatabase();
    
    console.log('✅ Database successfully seeded!');
    console.log(`   Created ${sampleProfiles.length} sample profiles:`);
    sampleProfiles.forEach(profile => {
      console.log(`   - ${profile.name} (Land ${profile.progress.land}, Ward ${profile.progress.ward})`);
    });
    console.log('   You can now test with realistic sample data.');
    
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
}

// Run the seed operation
seedProfiles().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
