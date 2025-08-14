// Performance Benchmarks for Critical Game Functions
import { bench, describe } from 'vitest';

// Mock critical game functions for benchmarking
function mockCalculateGearStats(equippedGear: Record<string, any>) {
  let totalStats = { damage: 0, health: 0, fireRate: 0 };
  
  Object.values(equippedGear).forEach(gear => {
    if (gear) {
      const enhancementMultiplier = 1 + (gear.enhancement * 0.1);
      totalStats.damage += Math.floor((gear.stats.damage || 0) * enhancementMultiplier);
      totalStats.health += Math.floor((gear.stats.health || 0) * enhancementMultiplier);
      totalStats.fireRate += (gear.stats.fireRate || 0) * enhancementMultiplier;
    }
  });
  
  return totalStats;
}

function mockGenerateRandomGear(level: number, enemyType: string) {
  const slots = ['helm', 'chest', 'claws', 'tailSpike', 'wingGuards', 'charm', 'ring', 'breathFocus'];
  const rarities = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
  const rarityWeights = enemyType === 'boss' ? [30, 40, 20, 8, 2] : [70, 20, 8, 1.5, 0.5];
  
  // Weighted rarity selection
  const totalWeight = rarityWeights.reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;
  let currentWeight = 0;
  let rarity = 'Common';
  
  for (let i = 0; i < rarityWeights.length; i++) {
    currentWeight += rarityWeights[i];
    if (random <= currentWeight) {
      rarity = rarities[i];
      break;
    }
  }
  
  return {
    id: 'gear_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    name: `${rarity} ${slots[Math.floor(Math.random() * slots.length)]}`,
    rarity,
    slot: slots[Math.floor(Math.random() * slots.length)],
    level: level,
    enhancement: 0,
    stats: { damage: level * 2, health: level * 3 }
  };
}

// Create test data
const sampleGear = {
  helm: { enhancement: 5, stats: { health: 10 } },
  chest: { enhancement: 3, stats: { health: 15, damage: 2 } },
  claws: { enhancement: 8, stats: { damage: 12 } },
  ring: { enhancement: 2, stats: { fireRate: 0.5 } }
};

describe('Critical Game Function Performance', () => {
  // This function runs frequently (every stat update)
  bench('Calculate Gear Stats (8 equipment slots)', () => {
    mockCalculateGearStats(sampleGear);
  }, { iterations: 10000 });

  // This runs during combat (enemy death rewards)
  bench('Generate Random Gear Drop', () => {
    mockGenerateRandomGear(Math.floor(Math.random() * 50) + 1, 'normal');
  }, { iterations: 1000 });

  // This runs frequently for boss drops
  bench('Generate Boss Gear Drop', () => {
    mockGenerateRandomGear(Math.floor(Math.random() * 50) + 1, 'boss');
  }, { iterations: 1000 });

  // Batch operations that might happen during level transitions
  bench('Batch Gear Stats Calculation', () => {
    for (let i = 0; i < 100; i++) {
      mockCalculateGearStats(sampleGear);
    }
  }, { iterations: 100 });

  // Simulate inventory management operations
  bench('Generate Multiple Gear Drops', () => {
    for (let i = 0; i < 10; i++) {
      mockGenerateRandomGear(20, Math.random() > 0.9 ? 'boss' : 'normal');
    }
  }, { iterations: 100 });
});

describe('Memory Usage Patterns', () => {
  bench('Create and Discard Gear Objects', () => {
    // Simulate creating gear that might be discarded (common in loot systems)
    const gearList = [];
    for (let i = 0; i < 50; i++) {
      gearList.push(mockGenerateRandomGear(i + 1, 'normal'));
    }
    // Clear the list (simulate inventory management)
    gearList.length = 0;
  }, { iterations: 200 });

  bench('Large Gear Collection Processing', () => {
    // Simulate a player with lots of gear
    const largeInventory = Array(100).fill(null).map((_, i) => 
      mockGenerateRandomGear(i % 50 + 1, i % 10 === 0 ? 'boss' : 'normal')
    );
    
    // Process all gear (like sorting or filtering)
    largeInventory.filter(gear => gear.rarity !== 'Common').length;
  }, { iterations: 50 });
});

describe('Browser-Specific Performance', () => {
  bench('JSON Serialization (Save Game)', () => {
    const gameState = {
      level: 25,
      currencies: { copper: 1500, forgegold: 300, dragonscales: 12 },
      inventory: Array(30).fill(null).map((_, i) => mockGenerateRandomGear(i + 1, 'normal')),
      equippedGear: sampleGear
    };
    
    const serialized = JSON.stringify(gameState);
    JSON.parse(serialized);
  }, { iterations: 100 });

  bench('Math Operations (Game Calculations)', () => {
    // Typical calculations done frequently in game
    let result = 0;
    for (let i = 1; i <= 50; i++) {
      result += Math.floor(100 * Math.pow(1.25, i)); // Enhancement costs
      result += Math.floor(10 * Math.pow(1.08, i));  // Currency rewards
      result += Math.floor(5 * Math.pow(1.12, i));   // Enemy HP
    }
  }, { iterations: 1000 });
});