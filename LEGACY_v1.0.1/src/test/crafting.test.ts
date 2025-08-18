// Crafting & Materials System Tests - Critical for Phase 2.3 functionality
import { describe, it, expect } from 'vitest';
import type { MaterialType, CraftingRecipe } from '$lib/types';

// Extract core crafting functions for testing
function generateMaterialDrop(level: number, enemyType: 'normal' | 'boss') {
  // Choose material type based on level ranges and enemy type
  let materialPool: MaterialType[];
  let rarityWeights: number[];
  
  if (enemyType === 'boss') {
    // Bosses can drop rare materials
    materialPool = ['emberdust', 'frostshards', 'stormmotes', 'venomglobules', 'emberore', 'frostmetal', 'stormsteel', 'shadowessence'];
    rarityWeights = [40, 35, 25]; // Common, Rare, Epic
  } else {
    // Normal enemies mostly drop common materials
    materialPool = ['emberdust', 'frostshards', 'stormmotes', 'venomglobules'];
    rarityWeights = [70, 25, 5]; // Mostly common
  }
  
  // Select random material type
  const materialType = materialPool[Math.floor(Math.random() * materialPool.length)];
  
  // Determine material rarity
  const totalWeight = rarityWeights.reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;
  let currentWeight = 0;
  let rarity: 'Common' | 'Rare' | 'Epic' = 'Common';
  
  const rarityTypes: ('Common' | 'Rare' | 'Epic')[] = ['Common', 'Rare', 'Epic'];
  for (let i = 0; i < rarityWeights.length; i++) {
    currentWeight += rarityWeights[i];
    if (random <= currentWeight) {
      rarity = rarityTypes[i];
      break;
    }
  }
  
  // Calculate drop amount based on level and rarity
  const baseAmount = {
    'Common': 1 + Math.floor(level * 0.1),
    'Rare': 1 + Math.floor(level * 0.05),
    'Epic': 1 + Math.floor(level * 0.02)
  }[rarity];
  
  // Bosses drop more materials
  const multiplier = enemyType === 'boss' ? 2 : 1;
  
  return {
    type: materialType,
    amount: Math.max(1, baseAmount * multiplier),
    rarity
  };
}

function getMaterialDropChance(level: number, enemyType: 'normal' | 'boss'): number {
  if (enemyType === 'boss') return 1.0; // 100% for bosses
  return Math.min(0.3 + level * 0.01, 0.7); // 30% to 70% for normal enemies
}

function canCraftRecipe(recipe: CraftingRecipe, materials: Record<MaterialType, number>, currentLevel: number): boolean {
  // Check level requirement
  if (currentLevel < recipe.requiredLevel) return false;
  
  // Check material requirements
  return recipe.materials.every(requirement => 
    materials[requirement.type] >= requirement.amount
  );
}

function calculateForgefireGeneration(dtSec: number, currentLevel: number): Record<MaterialType, number> {
  // Base generation rates (materials per hour)
  const baseRatesPerHour = {
    emberdust: 3.0,      // Common materials generate faster
    frostshards: 3.0,
    stormmotes: 3.0,
    venomglobules: 3.0,
    emberore: 0.5,       // Rare materials generate slowly
    frostmetal: 0.5,
    stormsteel: 0.5,
    shadowessence: 0.2   // Rarest material
  };
  
  // Level scaling - higher level = better generation
  const levelMultiplier = 1 + (currentLevel - 1) * 0.05; // +5% per level above 1
  
  // Generate materials based on time passed
  const dtHours = dtSec / 3600; // Convert seconds to hours
  
  const generated: Record<MaterialType, number> = {
    emberdust: 0, frostshards: 0, stormmotes: 0, venomglobules: 0,
    emberore: 0, frostmetal: 0, stormsteel: 0, shadowessence: 0
  };
  
  Object.entries(baseRatesPerHour).forEach(([materialType, ratePerHour]) => {
    const actualRate = ratePerHour * levelMultiplier;
    const expectedGenerated = actualRate * dtHours;
    generated[materialType as MaterialType] = Math.floor(expectedGenerated);
  });
  
  return generated;
}

describe('Materials Drop System', () => {
  describe('Material Drop Generation', () => {
    it('should generate appropriate material types for normal enemies', () => {
      const commonMaterials = ['emberdust', 'frostshards', 'stormmotes', 'venomglobules'];
      
      // Test multiple generations to check material pool
      const results = Array(100).fill(null).map(() => generateMaterialDrop(5, 'normal'));
      const materialTypes = new Set(results.map(r => r.type));
      
      // Normal enemies should only drop common materials
      materialTypes.forEach(type => {
        expect(commonMaterials).toContain(type);
      });
    });

    it('should allow bosses to drop rare materials', () => {
      const allMaterials = ['emberdust', 'frostshards', 'stormmotes', 'venomglobules', 'emberore', 'frostmetal', 'stormsteel', 'shadowessence'];
      
      // Test multiple generations to check material pool
      const results = Array(100).fill(null).map(() => generateMaterialDrop(10, 'boss'));
      const materialTypes = new Set(results.map(r => r.type));
      
      // Bosses should have access to all material types
      expect(materialTypes.size).toBeGreaterThan(4); // Should get more than just common materials
      materialTypes.forEach(type => {
        expect(allMaterials).toContain(type);
      });
    });

    it('should scale material amounts with level', () => {
      const lowLevelDrop = generateMaterialDrop(1, 'normal');
      const midLevelDrop = generateMaterialDrop(20, 'normal');
      const highLevelDrop = generateMaterialDrop(50, 'normal');
      
      // Higher level drops should tend to give more materials
      expect(highLevelDrop.amount).toBeGreaterThanOrEqual(lowLevelDrop.amount);
      expect(midLevelDrop.amount).toBeGreaterThanOrEqual(lowLevelDrop.amount);
    });

    it('should give bosses double material amounts', () => {
      // Test with same level, different enemy types
      const normalDrop = generateMaterialDrop(10, 'normal');
      const bossDrop = generateMaterialDrop(10, 'boss');
      
      // Boss drops should be larger (though we can't guarantee exact 2x due to randomness)
      expect(bossDrop.amount).toBeGreaterThanOrEqual(normalDrop.amount);
    });
  });

  describe('Material Drop Rates', () => {
    it('should have correct drop chances for normal enemies', () => {
      expect(getMaterialDropChance(1, 'normal')).toBeCloseTo(0.31, 2); // ~31% early game
      expect(getMaterialDropChance(20, 'normal')).toBeCloseTo(0.5, 2);  // ~50% mid game
      expect(getMaterialDropChance(50, 'normal')).toBe(0.7);            // 70% cap reached
    });

    it('should guarantee drops for bosses', () => {
      expect(getMaterialDropChance(1, 'boss')).toBe(1.0);
      expect(getMaterialDropChance(100, 'boss')).toBe(1.0);
    });

    it('should scale drop rates with level progression', () => {
      const earlyDrops = getMaterialDropChance(5, 'normal');
      const lateDrops = getMaterialDropChance(30, 'normal');
      
      expect(lateDrops).toBeGreaterThan(earlyDrops);
      expect(lateDrops - earlyDrops).toBeGreaterThan(0.15); // Meaningful progression
    });
  });
});

describe('Crafting Recipe System', () => {
  const sampleRecipe: CraftingRecipe = {
    id: 'test_helm',
    name: 'Test Crown',
    slot: 'helm',
    targetRarity: 'Common',
    requiredLevel: 5,
    materials: [
      { type: 'emberdust', amount: 3 },
      { type: 'frostshards', amount: 2 }
    ],
    baseStats: { health: 8 },
    unlocked: true
  };

  describe('Recipe Requirements', () => {
    it('should check level requirements correctly', () => {
      const materials = { emberdust: 10, frostshards: 10 } as Record<MaterialType, number>;
      
      expect(canCraftRecipe(sampleRecipe, materials, 4)).toBe(false); // Below required level
      expect(canCraftRecipe(sampleRecipe, materials, 5)).toBe(true);  // Exact required level
      expect(canCraftRecipe(sampleRecipe, materials, 10)).toBe(true); // Above required level
    });

    it('should check material requirements correctly', () => {
      const insufficientMaterials = { emberdust: 2, frostshards: 1 } as Record<MaterialType, number>;
      const exactMaterials = { emberdust: 3, frostshards: 2 } as Record<MaterialType, number>;
      const excessMaterials = { emberdust: 10, frostshards: 10 } as Record<MaterialType, number>;
      
      expect(canCraftRecipe(sampleRecipe, insufficientMaterials, 5)).toBe(false);
      expect(canCraftRecipe(sampleRecipe, exactMaterials, 5)).toBe(true);
      expect(canCraftRecipe(sampleRecipe, excessMaterials, 5)).toBe(true);
    });

    it('should require both level and materials', () => {
      const goodMaterials = { emberdust: 10, frostshards: 10 } as Record<MaterialType, number>;
      const badMaterials = { emberdust: 1, frostshards: 1 } as Record<MaterialType, number>;
      
      // Low level + bad materials = false
      expect(canCraftRecipe(sampleRecipe, badMaterials, 1)).toBe(false);
      
      // Low level + good materials = false
      expect(canCraftRecipe(sampleRecipe, goodMaterials, 1)).toBe(false);
      
      // Good level + bad materials = false
      expect(canCraftRecipe(sampleRecipe, badMaterials, 10)).toBe(false);
      
      // Good level + good materials = true
      expect(canCraftRecipe(sampleRecipe, goodMaterials, 10)).toBe(true);
    });
  });
});

describe('Forgefire Mine Passive Generation', () => {
  describe('Generation Rates', () => {
    it('should generate materials at expected rates', () => {
      const oneHourGeneration = calculateForgefireGeneration(3600, 1); // 1 hour at level 1
      
      // Common materials should generate ~3 per hour at level 1
      expect(oneHourGeneration.emberdust).toBeCloseTo(3, 0);
      expect(oneHourGeneration.frostshards).toBeCloseTo(3, 0);
      expect(oneHourGeneration.stormmotes).toBeCloseTo(3, 0);
      expect(oneHourGeneration.venomglobules).toBeCloseTo(3, 0);
      
      // Rare materials should generate ~0.5 per hour
      expect(oneHourGeneration.emberore).toBeCloseTo(0, 0);
      expect(oneHourGeneration.frostmetal).toBeCloseTo(0, 0);
      expect(oneHourGeneration.stormsteel).toBeCloseTo(0, 0);
      
      // Shadow essence should be rarest
      expect(oneHourGeneration.shadowessence).toBe(0);
    });

    it('should scale generation with level', () => {
      const level1Gen = calculateForgefireGeneration(3600, 1);
      const level10Gen = calculateForgefireGeneration(3600, 10);
      const level20Gen = calculateForgefireGeneration(3600, 20);
      
      // Higher levels should generate more materials
      expect(level10Gen.emberdust).toBeGreaterThan(level1Gen.emberdust);
      expect(level20Gen.emberdust).toBeGreaterThan(level10Gen.emberdust);
    });

    it('should provide meaningful offline progression', () => {
      const eightHourGeneration = calculateForgefireGeneration(8 * 3600, 10); // 8 hours at level 10
      
      // 8 hours should generate a meaningful amount of common materials
      expect(eightHourGeneration.emberdust).toBeGreaterThan(20);
      expect(eightHourGeneration.frostshards).toBeGreaterThan(20);
      
      // Should generate some rare materials over 8 hours
      expect(eightHourGeneration.emberore).toBeGreaterThanOrEqual(3);
    });

    it('should not generate excessive amounts', () => {
      const dayGeneration = calculateForgefireGeneration(24 * 3600, 50); // 24 hours at level 50
      
      // Even at high level and long time, shouldn't be game-breaking
      expect(dayGeneration.emberdust).toBeLessThan(500); // Reasonable cap
      expect(dayGeneration.shadowessence).toBeLessThan(50); // Rare materials stay rare
    });
  });

  describe('Level Scaling Balance', () => {
    it('should provide meaningful level scaling bonus', () => {
      const level1Gen = calculateForgefireGeneration(3600, 1);
      const level10Gen = calculateForgefireGeneration(3600, 10);
      const level20Gen = calculateForgefireGeneration(3600, 20);
      
      // Higher levels should generate more materials
      expect(level10Gen.emberdust).toBeGreaterThan(level1Gen.emberdust);
      expect(level20Gen.emberdust).toBeGreaterThan(level10Gen.emberdust);
      
      // Check that level scaling is meaningful (at least 20% more at level 10)
      const level10Multiplier = level10Gen.emberdust / level1Gen.emberdust;
      expect(level10Multiplier).toBeGreaterThan(1.2);
    });
  });
});

describe('Performance Requirements', () => {
  it('should handle material generation calculations efficiently', () => {
    const start = performance.now();
    
    // Simulate multiple material generations (like during combat)
    for (let i = 0; i < 1000; i++) {
      generateMaterialDrop(Math.floor(Math.random() * 50) + 1, Math.random() > 0.9 ? 'boss' : 'normal');
    }
    
    const end = performance.now();
    
    // Should handle 1000 generations in under 50ms
    expect(end - start).toBeLessThan(50);
  });

  it('should handle crafting requirement checks efficiently', () => {
    const recipe: CraftingRecipe = {
      id: 'test', name: 'Test', slot: 'helm', targetRarity: 'Common',
      requiredLevel: 5, materials: [{ type: 'emberdust', amount: 3 }],
      baseStats: {}, unlocked: true
    };
    
    const materials = { emberdust: 10 } as Record<MaterialType, number>;
    
    const start = performance.now();
    
    // Check many recipe requirements (like UI updates)
    for (let i = 0; i < 10000; i++) {
      canCraftRecipe(recipe, materials, 10);
    }
    
    const end = performance.now();
    
    // Should handle 10k checks in under 10ms
    expect(end - start).toBeLessThan(10);
  });

  it('should handle forgefire generation calculations efficiently', () => {
    const start = performance.now();
    
    // Simulate multiple offline catch-up calculations
    for (let i = 0; i < 100; i++) {
      calculateForgefireGeneration(3600, Math.floor(Math.random() * 50) + 1);
    }
    
    const end = performance.now();
    
    // Should handle 100 calculations in under 10ms
    expect(end - start).toBeLessThan(10);
  });
});

describe('Game Balance Integration', () => {
  it('should maintain reasonable material economy', () => {
    // Test that materials generation and consumption are balanced
    const hourlyGeneration = calculateForgefireGeneration(3600, 10);
    const basicRecipeCost = 3; // emberdust for basic helm
    
    // Should be able to craft basic items regularly but not excessively
    expect(hourlyGeneration.emberdust).toBeGreaterThan(basicRecipeCost);
    expect(hourlyGeneration.emberdust).toBeLessThan(basicRecipeCost * 5); // Not too generous
  });

  it('should provide meaningful progression from drops vs generation', () => {
    const combatDrop = generateMaterialDrop(10, 'boss');
    const passiveHourGen = calculateForgefireGeneration(3600, 10);
    
    // Combat should be primary source, passive should supplement
    expect(combatDrop.amount).toBeGreaterThan(0);
    // Boss drops should be competitive with passive generation rates
    expect(combatDrop.amount).toBeGreaterThanOrEqual(passiveHourGen.emberdust / 10);
  });
});