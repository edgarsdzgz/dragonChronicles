// Phase 2.4 Integration Tests - Gear Sets + Rune System Combined
import { describe, it, expect } from 'vitest';

// Mock combined stat calculation with sets and runes
function calculateCombinedStats(equippedGear: any, availableSets: any[], runeInventory: any[]) {
  let totalStats = {
    damage: 0,
    health: 0,
    fireRate: 0,
    critChance: 0,
    critDamage: 0
  };
  
  // Calculate base gear stats with enhancement bonuses
  Object.values(equippedGear).forEach((gear: any) => {
    if (gear) {
      // Apply enhancement bonus (10% per enhancement level)
      const enhancementMultiplier = 1 + (gear.enhancement || 0) * 0.1;
      
      totalStats.damage += Math.floor((gear.stats.damage || 0) * enhancementMultiplier);
      totalStats.health += Math.floor((gear.stats.health || 0) * enhancementMultiplier);
      totalStats.fireRate += (gear.stats.fireRate || 0) * enhancementMultiplier;
      totalStats.critChance += (gear.stats.critChance || 0) * enhancementMultiplier;
      totalStats.critDamage += (gear.stats.critDamage || 0) * enhancementMultiplier;
      
      // Apply rune bonuses from socketed runes
      if (gear.sockets) {
        gear.sockets.forEach((socket: any) => {
          if (socket.runeId) {
            const rune = runeInventory.find(r => r.id === socket.runeId);
            if (rune && rune.stats) {
              totalStats.damage += rune.stats.damage || 0;
              totalStats.health += rune.stats.health || 0;
              totalStats.fireRate += rune.stats.fireRate || 0;
              totalStats.critChance += rune.stats.critChance || 0;
              totalStats.critDamage += rune.stats.critDamage || 0;
            }
          }
        });
      }
    }
  });
  
  // Add set bonuses
  const setBonuses = calculateSetBonuses(equippedGear, availableSets);
  totalStats.damage += setBonuses.damage || 0;
  totalStats.health += setBonuses.health || 0;
  totalStats.fireRate += setBonuses.fireRate || 0;
  totalStats.critChance += setBonuses.critChance || 0;
  totalStats.critDamage += setBonuses.critDamage || 0;
  
  return totalStats;
}

// Helper functions from previous tests
function calculateSetBonuses(equippedGear: any, availableSets: any[]) {
  const setBonuses = {
    damage: 0,
    health: 0,
    fireRate: 0,
    critChance: 0,
    critDamage: 0
  };
  
  const setPieceCounts: Record<string, number> = {};
  
  // Count equipped pieces for each set
  Object.values(equippedGear).forEach((gear: any) => {
    if (gear && gear.setId) {
      setPieceCounts[gear.setId] = (setPieceCounts[gear.setId] || 0) + 1;
    }
  });
  
  // Calculate active set bonuses
  Object.entries(setPieceCounts).forEach(([setId, count]) => {
    const gearSet = availableSets.find(s => s.id === setId);
    if (gearSet) {
      const activeBonuses = gearSet.bonuses.filter(bonus => count >= bonus.pieces);
      if (activeBonuses.length > 0) {
        // Apply highest tier bonus only
        const highestBonus = activeBonuses[activeBonuses.length - 1];
        setBonuses.damage += highestBonus.stats.damage || 0;
        setBonuses.health += highestBonus.stats.health || 0;
        setBonuses.fireRate += highestBonus.stats.fireRate || 0;
        setBonuses.critChance += highestBonus.stats.critChance || 0;
        setBonuses.critDamage += highestBonus.stats.critDamage || 0;
      }
    }
  });
  
  return setBonuses;
}

function createMockGearSets() {
  return [
    {
      id: 'dragonfire_set',
      name: 'Dragonfire Regalia',
      pieces: ['helm', 'chest', 'claws', 'breathFocus'],
      bonuses: [
        { pieces: 2, stats: { damage: 5, fireRate: 0.1 } },
        { pieces: 4, stats: { damage: 15, fireRate: 0.3, critChance: 0.1 } }
      ]
    }
  ];
}

describe('Phase 2.4 Integration Tests', () => {
  const availableSets = createMockGearSets();

  describe('Combined Stat Calculation', () => {
    it('should calculate base gear stats correctly', () => {
      const equippedGear = {
        helm: {
          stats: { damage: 10, health: 20 },
          enhancement: 0,
          sockets: []
        },
        chest: {
          stats: { damage: 5, health: 30 },
          enhancement: 0,
          sockets: []
        }
      };
      const runeInventory: any[] = [];
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      expect(totalStats.damage).toBe(15); // 10 + 5
      expect(totalStats.health).toBe(50); // 20 + 30
      expect(totalStats.fireRate).toBe(0);
      expect(totalStats.critChance).toBe(0);
      expect(totalStats.critDamage).toBe(0);
    });

    it('should apply enhancement bonuses correctly', () => {
      const equippedGear = {
        helm: {
          stats: { damage: 10 },
          enhancement: 5, // +50% bonus
          sockets: []
        }
      };
      const runeInventory: any[] = [];
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      expect(totalStats.damage).toBe(15); // 10 * 1.5 = 15
    });

    it('should apply rune bonuses correctly', () => {
      const rune = {
        id: 'rune_1',
        stats: { damage: 8, health: 12 }
      };
      
      const equippedGear = {
        helm: {
          stats: { damage: 10 },
          enhancement: 0,
          sockets: [{ id: 'socket_0', runeId: 'rune_1' }]
        }
      };
      const runeInventory = [rune];
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      expect(totalStats.damage).toBe(18); // 10 + 8 from rune
      expect(totalStats.health).toBe(12); // 0 + 12 from rune
    });

    it('should apply set bonuses correctly', () => {
      const equippedGear = {
        helm: {
          stats: { damage: 10 },
          setId: 'dragonfire_set',
          enhancement: 0,
          sockets: []
        },
        chest: {
          stats: { damage: 5 },
          setId: 'dragonfire_set',
          enhancement: 0,
          sockets: []
        }
      };
      const runeInventory: any[] = [];
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      // Base: 10 + 5 = 15
      // Set bonus: +5 damage, +0.1 fireRate (2-piece Dragonfire)
      expect(totalStats.damage).toBe(20); // 15 + 5
      expect(totalStats.fireRate).toBeCloseTo(0.1, 2);
    });

    it('should combine all bonus types correctly', () => {
      const rune = {
        id: 'rune_1',
        stats: { damage: 8, critChance: 0.05 }
      };
      
      const equippedGear = {
        helm: {
          stats: { damage: 10, health: 20 },
          setId: 'dragonfire_set',
          enhancement: 2, // +20% bonus
          sockets: [{ id: 'socket_0', runeId: 'rune_1' }]
        },
        chest: {
          stats: { damage: 5, health: 15 },
          setId: 'dragonfire_set',
          enhancement: 0,
          sockets: []
        }
      };
      const runeInventory = [rune];
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      // Base calculations:
      // Helm: damage 10 * 1.2 = 12, health 20 * 1.2 = 24
      // Chest: damage 5, health 15
      // Rune: damage +8, critChance +0.05
      // Set (2-piece): damage +5, fireRate +0.1
      
      expect(totalStats.damage).toBe(30); // 12 + 5 + 8 + 5
      expect(totalStats.health).toBe(39);  // 24 + 15
      expect(totalStats.critChance).toBeCloseTo(0.05, 2);
      expect(totalStats.fireRate).toBeCloseTo(0.1, 2);
    });
  });

  describe('Complex Build Scenarios', () => {
    it('should handle full 4-piece set with multiple runes', () => {
      const rune1 = { id: 'rune_1', stats: { damage: 10 } };
      const rune2 = { id: 'rune_2', stats: { health: 25 } };
      const rune3 = { id: 'rune_3', stats: { fireRate: 0.2 } };
      
      const equippedGear = {
        helm: {
          stats: { damage: 15 },
          setId: 'dragonfire_set',
          enhancement: 0,
          sockets: [{ id: 'socket_0', runeId: 'rune_1' }]
        },
        chest: {
          stats: { health: 40 },
          setId: 'dragonfire_set',
          enhancement: 0,
          sockets: [{ id: 'socket_0', runeId: 'rune_2' }]
        },
        claws: {
          stats: { damage: 12 },
          setId: 'dragonfire_set',
          enhancement: 0,
          sockets: []
        },
        breathFocus: {
          stats: { fireRate: 0.15 },
          setId: 'dragonfire_set',
          enhancement: 0,
          sockets: [{ id: 'socket_0', runeId: 'rune_3' }]
        }
      };
      const runeInventory = [rune1, rune2, rune3];
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      // Base: damage 27, health 40, fireRate 0.15
      // Runes: damage +10, health +25, fireRate +0.2
      // 4-piece set: damage +15, fireRate +0.3, critChance +0.1
      
      expect(totalStats.damage).toBe(52);    // 27 + 10 + 15
      expect(totalStats.health).toBe(65);    // 40 + 25
      expect(totalStats.fireRate).toBeCloseTo(0.65, 2); // 0.15 + 0.2 + 0.3
      expect(totalStats.critChance).toBeCloseTo(0.1, 2);
    });

    it('should handle mixed sets with partial bonuses', () => {
      const equippedGear = {
        helm: {
          stats: { damage: 10 },
          setId: 'dragonfire_set',
          enhancement: 0,
          sockets: []
        },
        chest: {
          stats: { health: 30 },
          setId: 'dragonfire_set',
          enhancement: 0,
          sockets: []
        },
        wingGuards: {
          stats: { damage: 5 },
          setId: 'stormguard_set', // Different set, only 1 piece
          enhancement: 0,
          sockets: []
        }
      };
      const runeInventory: any[] = [];
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      // Only Dragonfire 2-piece bonus should be active
      expect(totalStats.damage).toBe(20); // 10 + 5 + 5 (set bonus)
      expect(totalStats.health).toBe(30);
      expect(totalStats.fireRate).toBeCloseTo(0.1, 2); // From 2-piece bonus
    });

    it('should handle high enhancement levels with runes', () => {
      const perfectRune = {
        id: 'perfect_rune',
        stats: { damage: 32, critChance: 0.08 } // Perfect rune stats
      };
      
      const equippedGear = {
        claws: {
          stats: { damage: 20 },
          enhancement: 10, // +100% bonus
          sockets: [{ id: 'socket_0', runeId: 'perfect_rune' }]
        }
      };
      const runeInventory = [perfectRune];
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      // Base: 20 * 2.0 (100% enhancement) = 40
      // Rune: +32 damage, +0.08 crit
      expect(totalStats.damage).toBe(72);
      expect(totalStats.critChance).toBeCloseTo(0.08, 2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing runes gracefully', () => {
      const equippedGear = {
        helm: {
          stats: { damage: 10 },
          sockets: [{ id: 'socket_0', runeId: 'missing_rune' }] // Rune not in inventory
        }
      };
      const runeInventory: any[] = []; // Empty inventory
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      // Should not crash, just ignore missing rune
      expect(totalStats.damage).toBe(10);
    });

    it('should handle gear without sockets', () => {
      const equippedGear = {
        helm: {
          stats: { damage: 10 }
          // No sockets property
        }
      };
      const runeInventory: any[] = [];
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      expect(totalStats.damage).toBe(10);
    });

    it('should handle empty socketed runes', () => {
      const equippedGear = {
        helm: {
          stats: { damage: 10 },
          sockets: [
            { id: 'socket_0' }, // No runeId
            { id: 'socket_1', runeId: undefined }, // Explicitly undefined
            { id: 'socket_2', runeId: null } // Explicitly null
          ]
        }
      };
      const runeInventory: any[] = [];
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      expect(totalStats.damage).toBe(10); // No crashes
    });

    it('should handle runes with missing stat properties', () => {
      const incompleteRune = {
        id: 'incomplete_rune'
        // Missing stats property
      };
      
      const equippedGear = {
        helm: {
          stats: { damage: 10 },
          sockets: [{ id: 'socket_0', runeId: 'incomplete_rune' }]
        }
      };
      const runeInventory = [incompleteRune];
      
      const totalStats = calculateCombinedStats(equippedGear, availableSets, runeInventory);
      
      expect(totalStats.damage).toBe(10); // Should not crash
    });
  });

  describe('Performance with Complex Builds', () => {
    it('should handle complex builds efficiently', () => {
      const start = performance.now();
      
      // Create a complex build with many pieces, runes, and calculations
      const runes = Array(20).fill(null).map((_, i) => ({
        id: `rune_${i}`,
        stats: { damage: i + 1, health: (i + 1) * 2 }
      }));
      
      const equippedGear = {};
      const slots = ['helm', 'chest', 'claws', 'tailSpike', 'wingGuards', 'charm', 'ring', 'breathFocus'];
      
      slots.forEach((slot, index) => {
        equippedGear[slot] = {
          stats: { damage: 10 + index, health: 20 + index * 2 },
          setId: 'dragonfire_set',
          enhancement: index,
          sockets: [
            { id: `socket_0`, runeId: `rune_${index}` },
            { id: `socket_1`, runeId: `rune_${index + 8}` }
          ].filter((_, i) => i < 2) // Up to 2 sockets per piece
        };
      });
      
      // Run calculation many times
      for (let i = 0; i < 100; i++) {
        calculateCombinedStats(equippedGear, availableSets, runes);
      }
      
      const end = performance.now();
      
      // Should handle 100 complex calculations in under 50ms
      expect(end - start).toBeLessThan(50);
    });
  });
});

describe('Reward System Integration', () => {
  it('should handle new reward types in loot generation', () => {
    // Mock function to test reward type handling
    function processReward(reward: any) {
      switch (reward.type) {
        case 'currency':
          return { currencies: { [reward.currencyType]: reward.amount } };
        case 'gear':
          return { inventory: [reward.gear] };
        case 'material':
          return { materials: { [reward.material.type]: reward.material.amount } };
        case 'rune':
          return { runeInventory: [reward.rune] };
        default:
          return {};
      }
    }
    
    const rewards = [
      { type: 'currency', currencyType: 'copper', amount: 10 },
      { type: 'gear', gear: { id: 'gear_1', name: 'Test Sword' } },
      { type: 'material', material: { type: 'emberdust', amount: 5 } },
      { type: 'rune', rune: { id: 'rune_1', name: 'Test Rune' } }
    ];
    
    rewards.forEach(reward => {
      const result = processReward(reward);
      expect(result).toBeDefined();
      
      if (reward.type === 'rune') {
        expect(result).toHaveProperty('runeInventory');
        expect(result.runeInventory).toHaveLength(1);
      }
    });
  });

  it('should handle boss rune drop rates', () => {
    const BOSS_RUNE_CHANCE = 0.25; // 25%
    
    function simulateRuneDrops(enemyType: string, iterations: number): number {
      let runeDrops = 0;
      for (let i = 0; i < iterations; i++) {
        if (enemyType === 'boss' && Math.random() < BOSS_RUNE_CHANCE) {
          runeDrops++;
        }
      }
      return runeDrops;
    }
    
    const bossDrops = simulateRuneDrops('boss', 1000);
    const normalDrops = simulateRuneDrops('normal', 1000);
    
    // Bosses should drop runes around 25% of the time
    expect(bossDrops).toBeGreaterThan(200); // Allow for variance
    expect(bossDrops).toBeLessThan(300);
    
    // Normal enemies should never drop runes
    expect(normalDrops).toBe(0);
  });
});

describe('Schema Migration Integration', () => {
  it('should migrate existing saves with new Phase 2.4 fields', () => {
    // Mock old save without Phase 2.4 fields
    const oldSave = {
      schemaVersion: 2,
      currentLevel: 15,
      currencies: { copper: { amount: 1000 } },
      equippedGear: {
        helm: { stats: { damage: 10 } }
      },
      inventory: [],
      materials: { emberdust: 50 },
      recipes: []
      // Missing: availableSets, runeInventory
    };
    
    // Mock migration function
    function migrateSave(state: any) {
      // Add gear sets & rune system if it doesn't exist
      state.availableSets = state.availableSets ?? createMockGearSets();
      state.runeInventory = state.runeInventory ?? [];
      return state;
    }
    
    const migratedSave = migrateSave(oldSave);
    
    expect(migratedSave).toHaveProperty('availableSets');
    expect(migratedSave).toHaveProperty('runeInventory');
    expect(migratedSave.availableSets).toHaveLength(1);
    expect(migratedSave.runeInventory).toHaveLength(0);
    
    // Should preserve existing data
    expect(migratedSave.currentLevel).toBe(15);
    expect(migratedSave.currencies.copper.amount).toBe(1000);
  });
});