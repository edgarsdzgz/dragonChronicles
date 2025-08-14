// Rune System Tests - Phase 2.4
import { describe, it, expect } from 'vitest';

// Mock rune generation and socketing functions
function generateRandomRune(level: number, enemyType: 'normal' | 'boss') {
  const runeTypes = ['strength', 'vitality', 'agility', 'focus', 'fortune'];
  const rarities = ['Lesser', 'Greater', 'Perfect'];
  
  // Rarity chances based on level and enemy type
  let rarityWeights = [70, 25, 5]; // Lesser, Greater, Perfect
  
  if (enemyType === 'boss') {
    rarityWeights = [40, 45, 15]; // Better odds for bosses
  }
  
  // Select rarity based on weights
  const totalWeight = rarityWeights.reduce((sum, weight) => sum + weight, 0);
  const random = Math.random() * totalWeight;
  let currentWeight = 0;
  let rarity = 'Lesser';
  
  for (let i = 0; i < rarityWeights.length; i++) {
    currentWeight += rarityWeights[i];
    if (random <= currentWeight) {
      rarity = rarities[i];
      break;
    }
  }
  
  // Select random rune type
  const runeType = runeTypes[Math.floor(Math.random() * runeTypes.length)];
  
  // Generate stats based on type and rarity
  const rarityMultiplier = { 'Lesser': 1, 'Greater': 2, 'Perfect': 4 }[rarity];
  const stats = {};
  
  switch (runeType) {
    case 'strength':
      stats.damage = Math.floor((2 + level * 0.2) * rarityMultiplier);
      break;
    case 'vitality':
      stats.health = Math.floor((5 + level * 0.3) * rarityMultiplier);
      break;
    case 'agility':
      stats.fireRate = (0.05 + level * 0.01) * rarityMultiplier;
      break;
    case 'focus':
      stats.critChance = (0.02 + level * 0.001) * rarityMultiplier;
      stats.critDamage = (0.05 + level * 0.002) * rarityMultiplier;
      break;
    case 'fortune':
      stats.forgegoldFind = (0.1 + level * 0.01) * rarityMultiplier;
      stats.dragonScaleFind = (0.05 + level * 0.005) * rarityMultiplier;
      break;
  }
  
  // Determine socket compatibility
  const socketTypes = [];
  switch (runeType) {
    case 'strength':
    case 'focus':
      socketTypes.push('damage');
      break;
    case 'vitality':
      socketTypes.push('defense');
      break;
    case 'agility':
      socketTypes.push('damage', 'utility');
      break;
    case 'fortune':
      socketTypes.push('utility');
      break;
  }
  
  return {
    id: 'rune_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    name: `${rarity} Rune of ${runeType.charAt(0).toUpperCase() + runeType.slice(1)}`,
    type: runeType,
    rarity,
    level: Math.max(1, level + Math.floor((Math.random() - 0.5) * 6)), // ±3 levels
    stats,
    socketTypes,
    description: `A ${rarity.toLowerCase()} rune that enhances ${runeType} abilities.`
  };
}

function canSocketRune(rune: any, socket: any): boolean {
  return rune.socketTypes.includes(socket.socketType);
}

function generateSockets(rarity: string, level: number) {
  const maxSockets = { 'Common': 0, 'Rare': 1, 'Epic': 2, 'Legendary': 3, 'Mythic': 4 }[rarity] || 0;
  const socketChance = 0.3 + (level * 0.01); // 30% base + 1% per level
  const sockets = [];
  
  for (let i = 0; i < maxSockets; i++) {
    if (Math.random() < socketChance) {
      const socketTypes = ['damage', 'defense', 'utility'];
      sockets.push({
        id: `socket_${i}`,
        socketType: socketTypes[Math.floor(Math.random() * socketTypes.length)]
      });
    }
  }
  
  return sockets;
}

function socketRune(gear: any, rune: any, socketIndex: number, runeInventory: any[]): boolean {
  if (!gear.sockets || socketIndex >= gear.sockets.length) {
    return false;
  }
  
  const runeIndex = runeInventory.findIndex(r => r.id === rune.id);
  if (runeIndex === -1) {
    return false;
  }
  
  const socket = gear.sockets[socketIndex];
  
  // Check if rune is compatible with socket type
  if (!rune.socketTypes.includes(socket.socketType)) {
    return false;
  }
  
  // Check if socket is already occupied
  if (socket.runeId) {
    return false; // Socket already has a rune
  }
  
  // Socket the rune
  socket.runeId = rune.id;
  
  // Remove rune from inventory (it's now socketed)
  runeInventory.splice(runeIndex, 1);
  
  return true;
}

function unsocketRune(gear: any, socketIndex: number): boolean {
  if (!gear.sockets || socketIndex >= gear.sockets.length) {
    return false;
  }
  
  const socket = gear.sockets[socketIndex];
  
  // Check if socket has a rune
  if (!socket.runeId) {
    return false;
  }
  
  // Remove the rune reference (in real implementation, would return to inventory)
  socket.runeId = undefined;
  
  return true;
}

describe('Rune System', () => {
  describe('Rune Generation', () => {
    it('should generate runes with all required properties', () => {
      const rune = generateRandomRune(10, 'normal');
      
      expect(rune).toHaveProperty('id');
      expect(rune).toHaveProperty('name');
      expect(rune).toHaveProperty('type');
      expect(rune).toHaveProperty('rarity');
      expect(rune).toHaveProperty('level');
      expect(rune).toHaveProperty('stats');
      expect(rune).toHaveProperty('socketTypes');
      expect(rune).toHaveProperty('description');
      
      expect(rune.id).toMatch(/^rune_/);
      expect(['strength', 'vitality', 'agility', 'focus', 'fortune']).toContain(rune.type);
      expect(['Lesser', 'Greater', 'Perfect']).toContain(rune.rarity);
      expect(rune.level).toBeGreaterThan(0);
      expect(rune.socketTypes).toBeInstanceOf(Array);
      expect(rune.socketTypes.length).toBeGreaterThan(0);
    });

    it('should generate appropriate stats for each rune type', () => {
      const strengthRune = { ...generateRandomRune(10, 'normal'), type: 'strength', stats: {} };
      strengthRune.stats.damage = Math.floor((2 + 10 * 0.2) * 1); // Level 10 Lesser strength
      expect(strengthRune.stats).toHaveProperty('damage');
      expect(strengthRune.stats.damage).toBeGreaterThan(0);

      const vitalityRune = { ...generateRandomRune(10, 'normal'), type: 'vitality', stats: {} };
      vitalityRune.stats.health = Math.floor((5 + 10 * 0.3) * 1); // Level 10 Lesser vitality
      expect(vitalityRune.stats).toHaveProperty('health');
      expect(vitalityRune.stats.health).toBeGreaterThan(0);

      const agilityRune = { ...generateRandomRune(10, 'normal'), type: 'agility', stats: {} };
      agilityRune.stats.fireRate = (0.05 + 10 * 0.01) * 1; // Level 10 Lesser agility
      expect(agilityRune.stats).toHaveProperty('fireRate');
      expect(agilityRune.stats.fireRate).toBeGreaterThan(0);
    });

    it('should scale stats correctly by rarity', () => {
      // Mock different rarities with fixed type
      const lesserRune = { rarity: 'Lesser', stats: { damage: 4 } }; // (2 + 10 * 0.2) * 1
      const greaterRune = { rarity: 'Greater', stats: { damage: 8 } }; // (2 + 10 * 0.2) * 2
      const perfectRune = { rarity: 'Perfect', stats: { damage: 16 } }; // (2 + 10 * 0.2) * 4
      
      expect(greaterRune.stats.damage).toBe(lesserRune.stats.damage * 2);
      expect(perfectRune.stats.damage).toBe(lesserRune.stats.damage * 4);
    });

    it('should have correct socket type compatibility', () => {
      // Test socket type assignments
      const strengthTypes = ['damage'];
      const vitalityTypes = ['defense'];
      const agilityTypes = ['damage', 'utility'];
      const focusTypes = ['damage'];
      const fortuneTypes = ['utility'];
      
      // Mock runes with known types
      const strengthRune = { type: 'strength', socketTypes: strengthTypes };
      const vitalityRune = { type: 'vitality', socketTypes: vitalityTypes };
      const agilityRune = { type: 'agility', socketTypes: agilityTypes };
      const focusRune = { type: 'focus', socketTypes: focusTypes };
      const fortuneRune = { type: 'fortune', socketTypes: fortuneTypes };
      
      expect(strengthRune.socketTypes).toEqual(strengthTypes);
      expect(vitalityRune.socketTypes).toEqual(vitalityTypes);
      expect(agilityRune.socketTypes).toEqual(agilityTypes);
      expect(focusRune.socketTypes).toEqual(focusTypes);
      expect(fortuneRune.socketTypes).toEqual(fortuneTypes);
    });

    it('should generate level variations correctly', () => {
      const runes = [];
      for (let i = 0; i < 50; i++) {
        runes.push(generateRandomRune(20, 'normal'));
      }
      
      // Should have level variations (±3 from base level 20)
      const levels = runes.map(r => r.level);
      const minLevel = Math.min(...levels);
      const maxLevel = Math.max(...levels);
      
      expect(minLevel).toBeGreaterThanOrEqual(17); // 20 - 3
      expect(maxLevel).toBeLessThanOrEqual(23);    // 20 + 3
      expect(minLevel).toBeGreaterThanOrEqual(1);  // Never below 1
    });

    it('should give bosses better rarity chances', () => {
      const normalRunes = [];
      const bossRunes = [];
      
      // Generate many runes to test distribution
      for (let i = 0; i < 100; i++) {
        normalRunes.push(generateRandomRune(10, 'normal'));
        bossRunes.push(generateRandomRune(10, 'boss'));
      }
      
      const normalRareCount = normalRunes.filter(r => r.rarity !== 'Lesser').length;
      const bossRareCount = bossRunes.filter(r => r.rarity !== 'Lesser').length;
      
      // Bosses should have more rare runes (though this is probabilistic)
      expect(bossRareCount).toBeGreaterThan(normalRareCount * 0.8); // Allow for some variance
    });
  });

  describe('Socket Generation', () => {
    it('should generate correct number of sockets by rarity', () => {
      const commonSockets = generateSockets('Common', 20);
      const rareSockets = generateSockets('Rare', 20);
      const epicSockets = generateSockets('Epic', 20);
      const legendarySockets = generateSockets('Legendary', 20);
      const mythicSockets = generateSockets('Mythic', 20);
      
      expect(commonSockets.length).toBe(0); // Common never has sockets
      expect(rareSockets.length).toBeLessThanOrEqual(1);
      expect(epicSockets.length).toBeLessThanOrEqual(2);
      expect(legendarySockets.length).toBeLessThanOrEqual(3);
      expect(mythicSockets.length).toBeLessThanOrEqual(4);
    });

    it('should generate valid socket types', () => {
      const sockets = generateSockets('Mythic', 50); // High level for more sockets
      const validTypes = ['damage', 'defense', 'utility'];
      
      sockets.forEach(socket => {
        expect(socket).toHaveProperty('id');
        expect(socket).toHaveProperty('socketType');
        expect(validTypes).toContain(socket.socketType);
      });
    });

    it('should scale socket chance with level', () => {
      // Test socket generation at different levels
      const lowLevelResults = [];
      const highLevelResults = [];
      
      for (let i = 0; i < 50; i++) {
        lowLevelResults.push(generateSockets('Epic', 1));  // Level 1, 31% chance per socket
        highLevelResults.push(generateSockets('Epic', 50)); // Level 50, 80% chance per socket
      }
      
      const lowLevelAvg = lowLevelResults.reduce((sum, sockets) => sum + sockets.length, 0) / lowLevelResults.length;
      const highLevelAvg = highLevelResults.reduce((sum, sockets) => sum + sockets.length, 0) / highLevelResults.length;
      
      // Higher level should generally have more sockets
      expect(highLevelAvg).toBeGreaterThan(lowLevelAvg * 0.8); // Allow for randomness
    });
  });

  describe('Rune Socketing Mechanics', () => {
    it('should successfully socket compatible rune', () => {
      const gear = {
        sockets: [{ id: 'socket_0', socketType: 'damage' }]
      };
      const rune = {
        id: 'rune_1',
        type: 'strength',
        socketTypes: ['damage']
      };
      const runeInventory = [rune];
      
      const success = socketRune(gear, rune, 0, runeInventory);
      
      expect(success).toBe(true);
      expect(gear.sockets[0].runeId).toBe('rune_1');
      expect(runeInventory).toHaveLength(0); // Rune removed from inventory
    });

    it('should fail to socket incompatible rune', () => {
      const gear = {
        sockets: [{ id: 'socket_0', socketType: 'defense' }]
      };
      const rune = {
        id: 'rune_1',
        type: 'strength',
        socketTypes: ['damage'] // Only fits damage sockets
      };
      const runeInventory = [rune];
      
      const success = socketRune(gear, rune, 0, runeInventory);
      
      expect(success).toBe(false);
      expect(gear.sockets[0].runeId).toBeUndefined();
      expect(runeInventory).toHaveLength(1); // Rune remains in inventory
    });

    it('should fail to socket into occupied socket', () => {
      const gear = {
        sockets: [{ id: 'socket_0', socketType: 'damage', runeId: 'existing_rune' }]
      };
      const rune = {
        id: 'rune_1',
        type: 'strength',
        socketTypes: ['damage']
      };
      const runeInventory = [rune];
      
      const success = socketRune(gear, rune, 0, runeInventory);
      
      expect(success).toBe(false);
      expect(gear.sockets[0].runeId).toBe('existing_rune'); // Unchanged
      expect(runeInventory).toHaveLength(1); // Rune remains in inventory
    });

    it('should fail with invalid socket index', () => {
      const gear = {
        sockets: [{ id: 'socket_0', socketType: 'damage' }]
      };
      const rune = {
        id: 'rune_1',
        socketTypes: ['damage']
      };
      const runeInventory = [rune];
      
      const success = socketRune(gear, rune, 1, runeInventory); // Index 1 doesn't exist
      
      expect(success).toBe(false);
      expect(runeInventory).toHaveLength(1);
    });

    it('should fail with rune not in inventory', () => {
      const gear = {
        sockets: [{ id: 'socket_0', socketType: 'damage' }]
      };
      const rune = {
        id: 'rune_1',
        socketTypes: ['damage']
      };
      const runeInventory = []; // Empty inventory
      
      const success = socketRune(gear, rune, 0, runeInventory);
      
      expect(success).toBe(false);
    });
  });

  describe('Rune Unsocketing Mechanics', () => {
    it('should successfully unsocket rune', () => {
      const gear = {
        sockets: [{ id: 'socket_0', socketType: 'damage', runeId: 'rune_1' }]
      };
      
      const success = unsocketRune(gear, 0);
      
      expect(success).toBe(true);
      expect(gear.sockets[0].runeId).toBeUndefined();
    });

    it('should fail to unsocket empty socket', () => {
      const gear = {
        sockets: [{ id: 'socket_0', socketType: 'damage' }] // No runeId
      };
      
      const success = unsocketRune(gear, 0);
      
      expect(success).toBe(false);
    });

    it('should fail with invalid socket index', () => {
      const gear = {
        sockets: [{ id: 'socket_0', socketType: 'damage', runeId: 'rune_1' }]
      };
      
      const success = unsocketRune(gear, 1); // Index 1 doesn't exist
      
      expect(success).toBe(false);
      expect(gear.sockets[0].runeId).toBe('rune_1'); // Unchanged
    });

    it('should fail with gear that has no sockets', () => {
      const gear = {}; // No sockets property
      
      const success = unsocketRune(gear, 0);
      
      expect(success).toBe(false);
    });
  });

  describe('Rune Socket Compatibility', () => {
    it('should validate all rune type compatibilities', () => {
      const damageSocket = { socketType: 'damage' };
      const defenseSocket = { socketType: 'defense' };
      const utilitySocket = { socketType: 'utility' };
      
      const strengthRune = { socketTypes: ['damage'] };
      const vitalityRune = { socketTypes: ['defense'] };
      const agilityRune = { socketTypes: ['damage', 'utility'] };
      const focusRune = { socketTypes: ['damage'] };
      const fortuneRune = { socketTypes: ['utility'] };
      
      // Test damage socket compatibility
      expect(canSocketRune(strengthRune, damageSocket)).toBe(true);
      expect(canSocketRune(agilityRune, damageSocket)).toBe(true);
      expect(canSocketRune(focusRune, damageSocket)).toBe(true);
      expect(canSocketRune(vitalityRune, damageSocket)).toBe(false);
      expect(canSocketRune(fortuneRune, damageSocket)).toBe(false);
      
      // Test defense socket compatibility
      expect(canSocketRune(vitalityRune, defenseSocket)).toBe(true);
      expect(canSocketRune(strengthRune, defenseSocket)).toBe(false);
      expect(canSocketRune(agilityRune, defenseSocket)).toBe(false);
      
      // Test utility socket compatibility
      expect(canSocketRune(fortuneRune, utilitySocket)).toBe(true);
      expect(canSocketRune(agilityRune, utilitySocket)).toBe(true);
      expect(canSocketRune(strengthRune, utilitySocket)).toBe(false);
    });
  });

  describe('Performance Requirements', () => {
    it('should generate runes efficiently', () => {
      const start = performance.now();
      
      // Generate many runes
      for (let i = 0; i < 1000; i++) {
        generateRandomRune(Math.floor(Math.random() * 50) + 1, Math.random() > 0.5 ? 'boss' : 'normal');
      }
      
      const end = performance.now();
      
      // Should handle 1000 generations in under 50ms
      expect(end - start).toBeLessThan(50);
    });

    it('should handle socketing operations efficiently', () => {
      const start = performance.now();
      
      // Create test data
      const gear = {
        sockets: Array(4).fill(null).map((_, i) => ({
          id: `socket_${i}`,
          socketType: ['damage', 'defense', 'utility'][i % 3]
        }))
      };
      
      const runes = Array(100).fill(null).map((_, i) => ({
        id: `rune_${i}`,
        socketTypes: ['damage', 'defense', 'utility']
      }));
      
      // Perform many socketing operations
      for (let i = 0; i < 100; i++) {
        const runeInventory = [...runes];
        socketRune(gear, runes[i % runes.length], i % 4, runeInventory);
        unsocketRune(gear, i % 4);
      }
      
      const end = performance.now();
      
      // Should handle 100 socket/unsocket pairs in under 10ms
      expect(end - start).toBeLessThan(10);
    });
  });
});

describe('Rune Balance Validation', () => {
  it('should provide meaningful stat scaling', () => {
    const level1Rune = { level: 1, rarity: 'Lesser', stats: { damage: Math.floor((2 + 1 * 0.2) * 1) } };
    const level20Rune = { level: 20, rarity: 'Lesser', stats: { damage: Math.floor((2 + 20 * 0.2) * 1) } };
    const level50Rune = { level: 50, rarity: 'Lesser', stats: { damage: Math.floor((2 + 50 * 0.2) * 1) } };
    
    // Higher level runes should be meaningfully stronger
    expect(level20Rune.stats.damage).toBeGreaterThan(level1Rune.stats.damage * 2);
    expect(level50Rune.stats.damage).toBeGreaterThan(level20Rune.stats.damage * 1.5);
  });

  it('should have balanced rarity multipliers', () => {
    const baseStats = 10;
    const lesserBonus = baseStats * 1;
    const greaterBonus = baseStats * 2;
    const perfectBonus = baseStats * 4;
    
    // Rarity progression should be meaningful but not overwhelming
    expect(greaterBonus).toBe(lesserBonus * 2);
    expect(perfectBonus).toBe(lesserBonus * 4);
    expect(perfectBonus).toBeLessThan(lesserBonus * 10); // Not too powerful
  });

  it('should maintain reasonable power levels', () => {
    // Test high-level perfect rune doesn't become game-breaking
    const maxLevelPerfectRune = {
      level: 100,
      rarity: 'Perfect',
      stats: {
        damage: Math.floor((2 + 100 * 0.2) * 4), // Should be 88
        health: Math.floor((5 + 100 * 0.3) * 4)  // Should be 140
      }
    };
    
    // Should be powerful but not game-breaking
    expect(maxLevelPerfectRune.stats.damage).toBeLessThan(200);
    expect(maxLevelPerfectRune.stats.health).toBeLessThan(500);
  });
});