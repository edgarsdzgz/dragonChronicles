// Gear Sets System Tests - Phase 2.4
import { describe, it, expect } from 'vitest';

// Mock the core set bonus calculation functions
function createGearSets() {
  return [
    {
      id: 'dragonfire_set',
      name: 'Dragonfire Regalia',
      description: 'Ancient armor forged in dragonflame, enhances offensive capabilities.',
      pieces: ['helm', 'chest', 'claws', 'breathFocus'],
      bonuses: [
        {
          pieces: 2,
          stats: { damage: 5, fireRate: 0.1 },
          description: 'Dragon\'s Fury: +5 Damage, +0.1 Fire Rate'
        },
        {
          pieces: 4,
          stats: { damage: 15, fireRate: 0.3, critChance: 0.1 },
          description: 'Infernal Might: +15 Damage, +0.3 Fire Rate, +10% Crit Chance'
        }
      ]
    },
    {
      id: 'stormguard_set',
      name: 'Stormguard Armor',
      description: 'Lightning-infused protection that amplifies defensive power.',
      pieces: ['helm', 'chest', 'wingGuards', 'tailSpike'],
      bonuses: [
        {
          pieces: 2,
          stats: { health: 20, fireRate: 0.05 },
          description: 'Storm Shield: +20 Health, +0.05 Fire Rate'
        },
        {
          pieces: 4,
          stats: { health: 50, damage: 8, fireRate: 0.15 },
          description: 'Tempest Guard: +50 Health, +8 Damage, +0.15 Fire Rate'
        }
      ]
    },
    {
      id: 'shadowweave_set',
      name: 'Shadowweave Collection',
      description: 'Mystical accessories that enhance critical strike power.',
      pieces: ['charm', 'ring', 'breathFocus', 'wingGuards'],
      bonuses: [
        {
          pieces: 2,
          stats: { critChance: 0.08, critDamage: 0.2 },
          description: 'Shadow Strike: +8% Crit Chance, +20% Crit Damage'
        },
        {
          pieces: 4,
          stats: { critChance: 0.2, critDamage: 0.6, damage: 10 },
          description: 'Void Mastery: +20% Crit Chance, +60% Crit Damage, +10 Damage'
        }
      ]
    }
  ];
}

function getActiveSetBonuses(equippedGear: Record<string, any>, availableSets: any[]) {
  const setPieceCounts: Record<string, number> = {};
  const activeSets: { setId: string; activePieces: number; bonuses: any[] }[] = [];
  
  // Count equipped pieces for each set
  Object.values(equippedGear).forEach(gear => {
    if (gear && gear.setId) {
      setPieceCounts[gear.setId] = (setPieceCounts[gear.setId] || 0) + 1;
    }
  });
  
  // Check which set bonuses are active
  Object.entries(setPieceCounts).forEach(([setId, count]) => {
    const gearSet = availableSets.find(s => s.id === setId);
    if (gearSet) {
      const activeBonuses = gearSet.bonuses.filter(bonus => count >= bonus.pieces);
      if (activeBonuses.length > 0) {
        activeSets.push({
          setId,
          activePieces: count,
          bonuses: activeBonuses
        });
      }
    }
  });
  
  return activeSets;
}

function calculateSetBonuses(equippedGear: Record<string, any>, availableSets: any[]) {
  const setBonuses = {
    damage: 0,
    health: 0,
    fireRate: 0,
    critChance: 0,
    critDamage: 0
  };
  
  const activeSets = getActiveSetBonuses(equippedGear, availableSets);
  
  activeSets.forEach(activeSet => {
    // Apply the highest tier bonus (sets don't stack multiple tiers)
    const highestBonus = activeSet.bonuses[activeSet.bonuses.length - 1];
    if (highestBonus && highestBonus.stats) {
      setBonuses.damage += highestBonus.stats.damage || 0;
      setBonuses.health += highestBonus.stats.health || 0;
      setBonuses.fireRate += highestBonus.stats.fireRate || 0;
      setBonuses.critChance += highestBonus.stats.critChance || 0;
      setBonuses.critDamage += highestBonus.stats.critDamage || 0;
    }
  });
  
  return setBonuses;
}

function generateSetChance(rarity: string): number {
  const setChances = {
    'Common': 0.05,
    'Rare': 0.15,
    'Epic': 0.25,
    'Legendary': 0.40,
    'Mythic': 0.60
  };
  return setChances[rarity] || 0;
}

describe('Gear Sets System', () => {
  const availableSets = createGearSets();

  describe('Set Definition Validation', () => {
    it('should have correct number of sets defined', () => {
      expect(availableSets).toHaveLength(3);
    });

    it('should have all required set properties', () => {
      availableSets.forEach(set => {
        expect(set).toHaveProperty('id');
        expect(set).toHaveProperty('name');
        expect(set).toHaveProperty('description');
        expect(set).toHaveProperty('pieces');
        expect(set).toHaveProperty('bonuses');
        
        expect(set.pieces).toBeInstanceOf(Array);
        expect(set.pieces.length).toBeGreaterThan(0);
        expect(set.bonuses).toBeInstanceOf(Array);
        expect(set.bonuses.length).toBeGreaterThan(0);
      });
    });

    it('should have progressive bonus tiers', () => {
      availableSets.forEach(set => {
        expect(set.bonuses.length).toBeGreaterThanOrEqual(2); // At least 2-piece and 4-piece
        
        // Bonuses should be in ascending order of pieces required
        for (let i = 1; i < set.bonuses.length; i++) {
          expect(set.bonuses[i].pieces).toBeGreaterThan(set.bonuses[i-1].pieces);
        }
      });
    });

    it('should have valid gear slots for each set', () => {
      const validSlots = ['helm', 'chest', 'claws', 'tailSpike', 'wingGuards', 'charm', 'ring', 'breathFocus'];
      
      availableSets.forEach(set => {
        set.pieces.forEach(piece => {
          expect(validSlots).toContain(piece);
        });
      });
    });
  });

  describe('Set Bonus Detection', () => {
    it('should detect no bonuses with empty equipment', () => {
      const equippedGear = {};
      const activeSets = getActiveSetBonuses(equippedGear, availableSets);
      
      expect(activeSets).toHaveLength(0);
    });

    it('should detect no bonuses with single piece', () => {
      const equippedGear = {
        helm: { setId: 'dragonfire_set' }
      };
      const activeSets = getActiveSetBonuses(equippedGear, availableSets);
      
      expect(activeSets).toHaveLength(0);
    });

    it('should detect 2-piece bonus correctly', () => {
      const equippedGear = {
        helm: { setId: 'dragonfire_set' },
        chest: { setId: 'dragonfire_set' }
      };
      const activeSets = getActiveSetBonuses(equippedGear, availableSets);
      
      expect(activeSets).toHaveLength(1);
      expect(activeSets[0].setId).toBe('dragonfire_set');
      expect(activeSets[0].activePieces).toBe(2);
      expect(activeSets[0].bonuses).toHaveLength(1); // Only 2-piece bonus
    });

    it('should detect 4-piece bonus correctly', () => {
      const equippedGear = {
        helm: { setId: 'dragonfire_set' },
        chest: { setId: 'dragonfire_set' },
        claws: { setId: 'dragonfire_set' },
        breathFocus: { setId: 'dragonfire_set' }
      };
      const activeSets = getActiveSetBonuses(equippedGear, availableSets);
      
      expect(activeSets).toHaveLength(1);
      expect(activeSets[0].setId).toBe('dragonfire_set');
      expect(activeSets[0].activePieces).toBe(4);
      expect(activeSets[0].bonuses).toHaveLength(2); // Both 2-piece and 4-piece bonuses
    });

    it('should handle multiple different sets', () => {
      const equippedGear = {
        helm: { setId: 'dragonfire_set' },
        chest: { setId: 'dragonfire_set' },
        wingGuards: { setId: 'stormguard_set' },
        tailSpike: { setId: 'stormguard_set' }
      };
      const activeSets = getActiveSetBonuses(equippedGear, availableSets);
      
      expect(activeSets).toHaveLength(2);
      
      const dragonfireSet = activeSets.find(s => s.setId === 'dragonfire_set');
      const stormguardSet = activeSets.find(s => s.setId === 'stormguard_set');
      
      expect(dragonfireSet?.activePieces).toBe(2);
      expect(stormguardSet?.activePieces).toBe(2);
    });

    it('should ignore non-set gear', () => {
      const equippedGear = {
        helm: { setId: 'dragonfire_set' },
        chest: { setId: 'dragonfire_set' },
        claws: { /* no setId */ },
        ring: { setId: null }
      };
      const activeSets = getActiveSetBonuses(equippedGear, availableSets);
      
      expect(activeSets).toHaveLength(1);
      expect(activeSets[0].activePieces).toBe(2);
    });
  });

  describe('Set Bonus Calculation', () => {
    it('should calculate correct 2-piece Dragonfire bonuses', () => {
      const equippedGear = {
        helm: { setId: 'dragonfire_set' },
        chest: { setId: 'dragonfire_set' }
      };
      const bonuses = calculateSetBonuses(equippedGear, availableSets);
      
      expect(bonuses.damage).toBe(5);
      expect(bonuses.fireRate).toBeCloseTo(0.1, 2);
      expect(bonuses.health).toBe(0);
      expect(bonuses.critChance).toBe(0);
    });

    it('should apply highest tier bonus only (no stacking)', () => {
      const equippedGear = {
        helm: { setId: 'dragonfire_set' },
        chest: { setId: 'dragonfire_set' },
        claws: { setId: 'dragonfire_set' },
        breathFocus: { setId: 'dragonfire_set' }
      };
      const bonuses = calculateSetBonuses(equippedGear, availableSets);
      
      // Should get 4-piece bonus (15 damage), not 2-piece + 4-piece (5 + 15)
      expect(bonuses.damage).toBe(15);
      expect(bonuses.fireRate).toBeCloseTo(0.3, 2);
      expect(bonuses.critChance).toBeCloseTo(0.1, 2);
    });

    it('should calculate multiple set bonuses correctly', () => {
      const equippedGear = {
        helm: { setId: 'dragonfire_set' },
        chest: { setId: 'dragonfire_set' },
        charm: { setId: 'shadowweave_set' },
        ring: { setId: 'shadowweave_set' }
      };
      const bonuses = calculateSetBonuses(equippedGear, availableSets);
      
      // Dragonfire 2-piece: +5 damage, +0.1 fire rate
      // Shadowweave 2-piece: +0.08 crit chance, +0.2 crit damage
      expect(bonuses.damage).toBe(5);
      expect(bonuses.fireRate).toBeCloseTo(0.1, 2);
      expect(bonuses.critChance).toBeCloseTo(0.08, 2);
      expect(bonuses.critDamage).toBeCloseTo(0.2, 2);
    });

    it('should handle empty equipment', () => {
      const equippedGear = {};
      const bonuses = calculateSetBonuses(equippedGear, availableSets);
      
      expect(bonuses.damage).toBe(0);
      expect(bonuses.health).toBe(0);
      expect(bonuses.fireRate).toBe(0);
      expect(bonuses.critChance).toBe(0);
      expect(bonuses.critDamage).toBe(0);
    });
  });

  describe('Set Generation Chances', () => {
    it('should have increasing set chances by rarity', () => {
      const commonChance = generateSetChance('Common');
      const rareChance = generateSetChance('Rare');
      const epicChance = generateSetChance('Epic');
      const legendaryChance = generateSetChance('Legendary');
      const mythicChance = generateSetChance('Mythic');
      
      expect(commonChance).toBeLessThan(rareChance);
      expect(rareChance).toBeLessThan(epicChance);
      expect(epicChance).toBeLessThan(legendaryChance);
      expect(legendaryChance).toBeLessThan(mythicChance);
    });

    it('should have reasonable chance ranges', () => {
      expect(generateSetChance('Common')).toBe(0.05);  // 5%
      expect(generateSetChance('Mythic')).toBe(0.60);   // 60%
      
      // All chances should be between 0 and 1
      ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'].forEach(rarity => {
        const chance = generateSetChance(rarity);
        expect(chance).toBeGreaterThanOrEqual(0);
        expect(chance).toBeLessThanOrEqual(1);
      });
    });

    it('should handle unknown rarities', () => {
      expect(generateSetChance('Unknown')).toBe(0);
      expect(generateSetChance('')).toBe(0);
    });
  });

  describe('Performance Requirements', () => {
    it('should handle set bonus calculation efficiently', () => {
      const start = performance.now();
      
      // Simulate many set bonus calculations
      for (let i = 0; i < 1000; i++) {
        const equippedGear = {
          helm: { setId: 'dragonfire_set' },
          chest: { setId: 'dragonfire_set' },
          wingGuards: { setId: 'stormguard_set' },
          tailSpike: { setId: 'stormguard_set' },
          charm: { setId: 'shadowweave_set' },
          ring: { setId: 'shadowweave_set' }
        };
        calculateSetBonuses(equippedGear, availableSets);
      }
      
      const end = performance.now();
      
      // Should handle 1000 calculations in under 50ms
      expect(end - start).toBeLessThan(50);
    });

    it('should handle large equipment sets', () => {
      const start = performance.now();
      
      // Create equipment with many pieces (simulate full inventory equipped)
      const equippedGear = {};
      for (let i = 0; i < 50; i++) {
        equippedGear[`item_${i}`] = { setId: 'dragonfire_set' };
      }
      
      // Run calculation many times
      for (let i = 0; i < 100; i++) {
        calculateSetBonuses(equippedGear, availableSets);
      }
      
      const end = performance.now();
      
      // Should still be fast with large equipment sets
      expect(end - start).toBeLessThan(20);
    });
  });
});

describe('Set Balance Validation', () => {
  const availableSets = createGearSets();

  it('should provide meaningful power progression', () => {
    // Test that 4-piece bonuses are significantly stronger than 2-piece
    availableSets.forEach(set => {
      if (set.bonuses.length >= 2) {
        const twoPiece = set.bonuses[0];
        const fourPiece = set.bonuses[1];
        
        // 4-piece should provide at least 2x the benefit of 2-piece in primary stats
        if (twoPiece.stats.damage && fourPiece.stats.damage) {
          expect(fourPiece.stats.damage).toBeGreaterThanOrEqual(twoPiece.stats.damage * 2);
        }
        if (twoPiece.stats.health && fourPiece.stats.health) {
          expect(fourPiece.stats.health).toBeGreaterThanOrEqual(twoPiece.stats.health * 2);
        }
      }
    });
  });

  it('should have distinct set identities', () => {
    const dragonfire = availableSets.find(s => s.id === 'dragonfire_set');
    const stormguard = availableSets.find(s => s.id === 'stormguard_set');
    const shadowweave = availableSets.find(s => s.id === 'shadowweave_set');
    
    // Dragonfire should focus on damage
    expect(dragonfire?.bonuses[1].stats.damage).toBeGreaterThan(10);
    
    // Stormguard should focus on health
    expect(stormguard?.bonuses[1].stats.health).toBeGreaterThan(30);
    
    // Shadowweave should focus on crit
    expect(shadowweave?.bonuses[1].stats.critChance).toBeGreaterThan(0.1);
  });

  it('should not have overpowered bonuses', () => {
    availableSets.forEach(set => {
      set.bonuses.forEach(bonus => {
        // Sanity checks on bonus magnitudes
        if (bonus.stats.damage) {
          expect(bonus.stats.damage).toBeLessThan(100); // Max +99 damage
        }
        if (bonus.stats.health) {
          expect(bonus.stats.health).toBeLessThan(500); // Max +499 health
        }
        if (bonus.stats.critChance) {
          expect(bonus.stats.critChance).toBeLessThan(1.0); // Max +100% crit
        }
        if (bonus.stats.fireRate) {
          expect(bonus.stats.fireRate).toBeLessThan(2.0); // Max +200% fire rate
        }
      });
    });
  });
});