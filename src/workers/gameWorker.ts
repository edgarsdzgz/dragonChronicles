import type { GameState, ToWorkerMessage, FromWorkerMessage, UpgradeType, DragonUpgrades, DragonStats, WorldMapState, LevelEncounter, Reward, LevelReward, LevelState, Enemy, EnemyType, DragonGear, GearPiece, GearSlot, MaterialType, Material, CraftingRecipe, GearSet, Rune, RuneType, RuneRarity, RuneSocket, TravelState } from '$lib/types';

let state: GameState;
let timer: number | undefined;

function defaultState(): GameState {
	return {
		schemaVersion: 4, // Currency migration: copper→steak, forgegold→gold
		lastTickMs: Date.now(),
		playtimeSec: 0,
		
		// Distance-based level progression system
		currentLevel: 1,              // Start at level 1
		totalDistance: 0,             // No distance traveled yet
		levelDistance: 0,             // No progress in current level
		levelDistanceTarget: 15000,   // Level 1: 0-15km (15,000 meters)
		
		// Travel State Machine
		travelState: 'HOVERING',      // Start in hovering state
		enemiesDefeated: 0,           // No enemies killed yet
		bossesDefeated: 0,           // No bosses killed yet
		worldMap: {
			unlockedLevels: [1],      // Only level 1 unlocked
			completedLevels: [],      // No levels completed
			currentRegion: "Dragonspire Mountains", // Starting region
			bossTimers: {}            // No boss timers
		},
		currentLevelState: {
			totalEnemies: 0,          // Will be set when level starts
			enemiesSpawned: 0,        // None spawned yet
			enemiesDefeated: 0,       // None defeated yet
			isComplete: false,        // Level not complete
			isBossLevel: false        // Level 1 is not boss level
		},
		
		currencies: {
			arcana: { key: 'arcana', amount: 0, unlocked: true }
		},
		upgrades: {
			damage: 0,
			fireRate: 0,
			health: 0,
			extraDragons: 0
		},
		dragonStats: {
			maxHp: 10,    // Increased from 5 for survivability
			currentHp: 10,
			damage: 2,    // Increased from 1 for faster kills
			fireRateMultiplier: 1.0, // Base fire rate
			dragonCount: 1 // Single dragon
		},
		
		// Gear System
		equippedGear: {},                    // No gear equipped initially
		inventory: createStarterGear(),      // Start with basic gear
		
		// Crafting System
		materials: {
			// Elemental materials (common drops)
			emberdust: 0,
			frostshards: 0,
			stormmotes: 0,
			venomglobules: 0,
			// Rare crafting materials (boss/rare drops)
			emberore: 0,
			frostmetal: 0,
			stormsteel: 0,
			shadowessence: 0
		},
		recipes: createBasicCraftingRecipes(), // Basic recipes available from start
		
		// Gear Sets & Rune System
		availableSets: createGearSets(),         // Available gear sets
		runeInventory: []                        // No runes initially
	};
}

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

// Forgefire Mine - Passive Material Generation
function generateMaterials(dtSec: number): void {
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
	const levelMultiplier = 1 + (state.currentLevel - 1) * 0.05; // +5% per level above 1
	
	// Generate materials based on time passed
	const dtHours = dtSec / 3600; // Convert seconds to hours
	
	Object.entries(baseRatesPerHour).forEach(([materialType, ratePerHour]) => {
		const expectedAmount = ratePerHour * levelMultiplier * dtHours;
		const actualAmount = Math.floor(expectedAmount + Math.random());
		
		if (actualAmount > 0) {
			state.materials[materialType as MaterialType] += actualAmount;
		}
	});
}

// Currency management functions
function addSteak(amount: number): void {
	state.currencies.steak.amount += amount;
}

// Distance-based Level Progression System
function calculateLevelDistanceTarget(level: number): number {
	// Each level spans a progressively larger distance
	// Level 1: 0-15km (15,000m)
	// Level 2: 0-18km (18,000m)
	// Level 3: 0-21km (21,000m)
	// Formula: 15km + (level-1) * 3km
	return 15000 + (level - 1) * 3000;
}

function calculateEnemyStatBonus(level: number, levelDistance: number): number {
	// Every 5 meters within a level, enemies get stronger
	// This creates granular difficulty progression within each level
	const baseBonus = (level - 1) * 0.5; // Base 50% boost per level
	const distanceBonus = Math.floor(levelDistance / 5) * 0.001; // 0.1% per 5 meters
	return 1 + baseBonus + distanceBonus;
}

function updateDistanceProgress(dtSec: number): void {
	// Only advance distance when in ADVANCING state
	if (state.travelState !== 'ADVANCING') {
		return;
	}
	
	// Dragon flies forward at a base speed based on current stats
	// Speed is affected by fire rate (faster attacks = faster movement)
	const baseSpeed = 10; // 10 meters per second base
	const speedMultiplier = 1 + state.dragonStats.fireRateMultiplier * 0.1;
	const distancePerSecond = baseSpeed * speedMultiplier;
	
	// Calculate distance traveled this tick
	const distanceTraveled = distancePerSecond * dtSec;
	
	// Update distances
	state.levelDistance += distanceTraveled;
	state.totalDistance += distanceTraveled;
	
	// Check if level is complete
	if (state.levelDistance >= state.levelDistanceTarget) {
		advanceLevel();
	}
}

// Travel State Machine Functions
function isValidStateTransition(from: TravelState, to: TravelState): boolean {
	const validTransitions: Record<TravelState, TravelState[]> = {
		'HOVERING': ['ADVANCING', 'TRAVEL_TO_TARGET'],
		'ADVANCING': ['HOVERING', 'RETREATING', 'GATE'],
		'RETREATING': ['HOVERING', 'ADVANCING'],
		'GATE': ['HOVERING', 'ADVANCING'],
		'TRAVEL_TO_TARGET': ['HOVERING', 'ADVANCING']
	};
	
	return validTransitions[from].includes(to);
}

function setTravelState(newState: TravelState): boolean {
	if (!isValidStateTransition(state.travelState, newState)) {
		return false;
	}
	
	state.travelState = newState;
	return true;
}

function startTravel(): boolean {
	return setTravelState('ADVANCING');
}

function stopTravel(): boolean {
	return setTravelState('HOVERING');
}

function advanceLevel(): void {
	// Complete current level and advance to next
	const completedLevel = state.currentLevel;
	const excessDistance = state.levelDistance - state.levelDistanceTarget;
	
	// Mark level as completed
	if (!state.worldMap.completedLevels.includes(completedLevel)) {
		state.worldMap.completedLevels.push(completedLevel);
	}
	
	// Advance to next level
	state.currentLevel++;
	
	// Unlock next level
	if (!state.worldMap.unlockedLevels.includes(state.currentLevel)) {
		state.worldMap.unlockedLevels.push(state.currentLevel);
	}
	
	// Reset level distance, carrying over excess
	state.levelDistance = excessDistance;
	state.levelDistanceTarget = calculateLevelDistanceTarget(state.currentLevel);
	
	// Generate level completion rewards
	const rewards = generateLevelRewards(completedLevel);
	
	// Apply rewards
	rewards.forEach(reward => {
		if (reward.type === 'currency' && reward.currencyType) {
			state.currencies[reward.currencyType].amount += reward.amount || 0;
		}
	});
	
	// Reset level state
	initializeLevelState();
	
	// Unlock new recipes
	unlockCraftingRecipes();
	
	// Send level complete message
	const levelMsg: FromWorkerMessage = { 
		type: 'level:complete', 
		newLevel: state.currentLevel, 
		rewards 
	};
	postMessage(levelMsg);
}

function generateLevelRewards(level: number): LevelReward[] {
	const rewards: LevelReward[] = [];
	
	// Base steak reward scaled by level
	const steakAmount = Math.floor(50 + level * 25);
	rewards.push({
		type: 'currency',
		currencyType: 'steak',
		amount: steakAmount
	});
	
	// Special rewards at milestone levels
	if (level === 5) {
		state.currencies.gold.unlocked = true;
		rewards.push({
			type: 'currency',
			currencyType: 'gold', 
			amount: 100
		});
	}
	
	if (level === 10) {
		state.currencies.dragonscales.unlocked = true;
		rewards.push({
			type: 'currency',
			currencyType: 'dragonscales',
			amount: 10
		});
	}
	
	if (level === 20) {
		state.currencies.gems.unlocked = true;
		rewards.push({
			type: 'currency',
			currencyType: 'gems',
			amount: 5
		});
	}
	
	return rewards;
}

function initializeLevelState(): void {
	// Reset level state for new level
	state.currentLevelState = {
		totalEnemies: Math.floor(20 + state.currentLevel * 5), // More enemies at higher levels
		enemiesSpawned: 0,
		enemiesDefeated: 0,
		isComplete: false,
		isBossLevel: state.currentLevel % 10 === 0 // Every 10th level is a boss level
	};
}



function addCopper(amount: number): void {
	state.currencies.copper.amount += amount;
}

// Level progression functions
function getLevelEncounter(level: number): LevelEncounter {
	const isBossLevel = level % 10 === 0; // Boss every 10 levels
	const enemyCount = isBossLevel ? 1 : Math.floor(3 + level * 0.2); // 3-5 enemies normally, 1 boss
	
	const rewards: LevelReward[] = [];
	
	if (isBossLevel) {
		// Boss rewards - more dragonscales
		rewards.push({ 
			type: 'currency', 
			currencyType: 'dragonscales', 
			amount: Math.floor(2 + level / 10) 
		});
	}
	
	// Standard level rewards - gold
	rewards.push({ 
		type: 'currency', 
		currencyType: 'gold', 
		amount: Math.floor(10 * Math.pow(1.08, level)) 
	});
	
	return {
		level,
		enemyCount,
		isBossLevel,
		completionRewards: rewards
	};
}

function calculateEnemyStats(level: number, isBoss: boolean = false) {
	// Balanced for idle gameplay: ~5-15 seconds per enemy
	const baseHP = isBoss ? 25 : 5;  // Reduced from 500/100 for faster kills
	const baseDamage = isBoss ? 4 : 2;  // Reduced proportionally
	const hpGrowth = isBoss ? 1.15 : 1.12;  // Slightly slower boss growth
	const damageGrowth = isBoss ? 1.12 : 1.08;  // Gentler damage scaling
	
	return {
		hp: Math.floor(baseHP * Math.pow(hpGrowth, level)),
		damage: Math.floor(baseDamage * Math.pow(damageGrowth, level))
	};
}

function completeLevel(): boolean {
	const encounter = getLevelEncounter(state.currentLevel);
	
	// Award completion rewards
	encounter.completionRewards.forEach(reward => {
		if (reward.type === 'currency' && reward.currencyType && reward.amount) {
			state.currencies[reward.currencyType].amount += reward.amount;
			
			// Unlock currency if first time earning it
			if (!state.currencies[reward.currencyType].unlocked) {
				state.currencies[reward.currencyType].unlocked = true;
			}
		}
	});
	
	// Mark level as completed
	if (!state.worldMap.completedLevels.includes(state.currentLevel)) {
		state.worldMap.completedLevels.push(state.currentLevel);
	}
	
	// Unlock next level
	const nextLevel = state.currentLevel + 1;
	if (!state.worldMap.unlockedLevels.includes(nextLevel)) {
		state.worldMap.unlockedLevels.push(nextLevel);
	}
	
	// Track boss defeats
	if (encounter.isBossLevel) {
		state.bossesDefeated++;
	}
	
	// Advance to next level
	state.currentLevel = nextLevel;
	state.levelProgress = 0;
	state.enemiesDefeated = 0; // Reset for new level
	
	// Unlock new crafting recipes based on level
	unlockCraftingRecipes();
	
	// Initialize new level state
	initializeLevelState();
	
	// Send completion message
	const msg: FromWorkerMessage = { 
		type: encounter.isBossLevel ? 'boss:defeated' : 'level:complete', 
		newLevel: nextLevel,
		bossLevel: encounter.isBossLevel ? state.currentLevel - 1 : undefined,
		rewards: encounter.completionRewards 
	} as any;
	postMessage(msg);
	
	return true;
}

// Initialize level state when starting/restarting a level

// Generate an enemy for the current level
function generateEnemy(): Enemy {
	let nextEnemyId = (state.currentLevelState.enemiesSpawned || 0) + 1;
	const level = state.currentLevel;
	const isBoss = state.currentLevelState.isBossLevel && 
		state.currentLevelState.enemiesSpawned === 0; // First enemy is boss

	const enemyStats = calculateEnemyStats(level, isBoss);
	
	// Determine enemy type
	let enemyType: EnemyType = 'normal';
	if (isBoss) {
		enemyType = 'boss';
	}

	const enemy: Enemy = {
		id: nextEnemyId,
		level: level,
		type: enemyType,
		hp: enemyStats.hp,
		maxHp: enemyStats.hp,
		damage: enemyStats.damage,
		abilities: isBoss ? ['charge', 'firebreath'] : [],
		lootTable: generateEnemyLoot(level, enemyType)
	};

	// Update spawn count
	state.currentLevelState.enemiesSpawned++;

	return enemy;
}

// Generate loot for an enemy based on level and type
function generateEnemyLoot(level: number, enemyType: EnemyType): Reward[] {
	const rewards: Reward[] = [];
	
	// Basic steak for all enemies
	const steakAmount = enemyType === 'boss' ? 5 : 1;
	rewards.push({
		type: 'currency',
		currencyType: 'steak',
		amount: steakAmount
	});

	// Boss enemies drop extra rewards
	if (enemyType === 'boss') {
		rewards.push({
			type: 'currency',
			currencyType: 'dragonscales',
			amount: Math.floor(1 + level / 10)
		});
		
		// Bosses always drop gear
		rewards.push({
			type: 'gear',
			gear: generateRandomGear(level, enemyType)
		});
		
		// Bosses drop rare materials
		rewards.push({
			type: 'material',
			material: generateMaterialDrop(level, enemyType)
		});
		
		// Bosses have a chance to drop runes
		if (Math.random() < 0.25) { // 25% chance
			rewards.push({
				type: 'rune',
				rune: generateRandomRune(level, enemyType)
			});
		}
	} else {
		// Normal enemies have a chance to drop gear
		const gearDropChance = Math.min(0.05 + level * 0.002, 0.15); // 5% to 15% based on level
		if (Math.random() < gearDropChance) {
			rewards.push({
				type: 'gear',
				gear: generateRandomGear(level, enemyType)
			});
		}
		
		// All enemies drop materials (common chance)
		const materialDropChance = Math.min(0.3 + level * 0.01, 0.7); // 30% to 70% based on level
		if (Math.random() < materialDropChance) {
			rewards.push({
				type: 'material',
				material: generateMaterialDrop(level, enemyType)
			});
		}
	}

	return rewards;
}

// Check if we can spawn more enemies for this level
function canSpawnEnemy(): boolean {
	return !state.currentLevelState.isComplete && 
		   state.currentLevelState.enemiesSpawned < state.currentLevelState.totalEnemies;
}

// Handle enemy defeat
function defeatEnemy(enemyId: number): Reward[] {
	state.currentLevelState.enemiesDefeated++;
	
	// Generate and apply enemy loot
	const level = state.currentLevel;
	const isBoss = state.currentLevelState.isBossLevel && 
		state.currentLevelState.enemiesDefeated === 1; // First enemy defeated is boss
	const enemyType: EnemyType = isBoss ? 'boss' : 'normal';
	
	const loot = generateEnemyLoot(level, enemyType);
	
	// Apply loot rewards
	loot.forEach(reward => {
		if (reward.type === 'currency' && reward.currencyType && reward.amount) {
			// Safety check: ensure currency exists before accessing
			if (state.currencies[reward.currencyType]) {
				state.currencies[reward.currencyType].amount += reward.amount;
				
				// Unlock currency if first time earning it
				if (!state.currencies[reward.currencyType].unlocked) {
					state.currencies[reward.currencyType].unlocked = true;
				}
			}
		} else if (reward.type === 'gear' && reward.gear) {
			// Add gear to inventory
			state.inventory.push(reward.gear);
		} else if (reward.type === 'material' && reward.material) {
			// Add materials to inventory
			state.materials[reward.material.type] += reward.material.amount;
		} else if (reward.type === 'rune' && reward.rune) {
			// Add runes to inventory
			state.runeInventory.push(reward.rune);
		}
	});

	// Check if level is complete (after applying rewards)
	if (state.currentLevelState.enemiesDefeated >= state.currentLevelState.totalEnemies) {
		state.currentLevelState.isComplete = true;
		console.log(`Level ${state.currentLevel} completed! ${state.currentLevelState.enemiesDefeated}/${state.currentLevelState.totalEnemies} enemies defeated`);
		
		// Auto-advance to next level immediately (no setTimeout in worker)
		completeLevel();
	}

	return loot;
}


// Gear System Functions
function equipGear(gearId: string, slot: GearSlot): boolean {
	// Find gear in inventory
	const gearIndex = state.inventory.findIndex(gear => gear.id === gearId);
	if (gearIndex === -1) return false;
	
	const gearPiece = state.inventory[gearIndex];
	
	// Check if gear matches slot
	if (gearPiece.slot !== slot) return false;
	
	// Unequip current gear in slot if any
	if (state.equippedGear && state.equippedGear[slot]) {
		state.inventory.push(state.equippedGear[slot]!);
	}
	
	// Equip new gear
	state.equippedGear[slot] = gearPiece;
	
	// Remove from inventory
	state.inventory.splice(gearIndex, 1);
	
	// Recalculate dragon stats
	updateDragonStats();
	
	return true;
}

function unequipGear(slot: GearSlot): boolean {
	// Check if gear is equipped in slot
	if (!state.equippedGear || !state.equippedGear[slot]) return false;
	
	// Move to inventory
	state.inventory.push(state.equippedGear[slot]!);
	
	// Remove from equipment
	delete state.equippedGear[slot];
	
	// Recalculate dragon stats
	updateDragonStats();
	
	return true;
}

function calculateGearStats(): {
	damage: number,
	health: number,
	fireRate: number,
	critChance: number,
	critDamage: number
} {
	let totalStats = {
		damage: 0,
		health: 0,
		fireRate: 0,
		critChance: 0,
		critDamage: 0
	};
	
	// Sum stats from all equipped gear (safely handle null/undefined)
	if (state.equippedGear) {
		Object.values(state.equippedGear).forEach(gear => {
			if (gear) {
				// Apply enhancement bonus (10% per enhancement level)
				const enhancementMultiplier = 1 + (gear.enhancement * 0.1);
				
				totalStats.damage += Math.floor((gear.stats.damage || 0) * enhancementMultiplier);
				totalStats.health += Math.floor((gear.stats.health || 0) * enhancementMultiplier);
				totalStats.fireRate += (gear.stats.fireRate || 0) * enhancementMultiplier;
				totalStats.critChance += (gear.stats.critChance || 0) * enhancementMultiplier;
				totalStats.critDamage += (gear.stats.critDamage || 0) * enhancementMultiplier;
				
				// Apply rune bonuses from socketed runes
				if (gear.sockets) {
					gear.sockets.forEach(socket => {
						if (socket.runeId) {
							const rune = state.runeInventory.find(r => r.id === socket.runeId);
							if (rune) {
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
	}
	
	// Add set bonuses
	const setBonuses = calculateSetBonuses();
	totalStats.damage += setBonuses.damage || 0;
	totalStats.health += setBonuses.health || 0;
	totalStats.fireRate += setBonuses.fireRate || 0;
	totalStats.critChance += setBonuses.critChance || 0;
	totalStats.critDamage += setBonuses.critDamage || 0;
	
	return totalStats;
}

// Gear Generation Functions
function generateGearId(): string {
	return 'gear_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function createStarterGear(): GearPiece[] {
	const starterGear: GearPiece[] = [];
	
	// Basic Claws (weapon)
	starterGear.push({
		id: generateGearId(),
		name: 'Iron Talons',
		rarity: 'Common',
		slot: 'claws',
		level: 1,
		enhancement: 0,
		stats: { damage: 2 },
		sockets: [],
		description: 'Basic iron claws for a young dragon.'
	});
	
	// Basic Helm
	starterGear.push({
		id: generateGearId(),
		name: 'Leather Crown',
		rarity: 'Common',
		slot: 'helm',
		level: 1,
		enhancement: 0,
		stats: { health: 5 },
		sockets: [],
		description: 'A simple leather headpiece.'
	});
	
	return starterGear;
}

// Gear Generation for Drops
function generateRandomGear(level: number, enemyType: EnemyType): GearPiece {
	const slots: GearSlot[] = ['helm', 'chest', 'claws', 'tailSpike', 'wingGuards', 'charm', 'ring', 'breathFocus'];
	const rarities: GearRarity[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];
	
	// Choose random slot
	const slot = slots[Math.floor(Math.random() * slots.length)];
	
	// Rarity chances based on level and enemy type
	let rarityWeights = [70, 20, 8, 1.5, 0.5]; // Common, Rare, Epic, Legendary, Mythic
	
	if (enemyType === 'boss') {
		rarityWeights = [30, 40, 20, 8, 2]; // Better odds for bosses
	}
	
	// Higher level enemies have slightly better drops
	const levelBonus = Math.min(level * 0.5, 20); // Max +20% to rare+ chances
	rarityWeights[0] -= levelBonus; // Reduce common chance
	rarityWeights[1] += levelBonus * 0.6; // Increase rare chance
	rarityWeights[2] += levelBonus * 0.3; // Increase epic chance
	rarityWeights[3] += levelBonus * 0.1; // Increase legendary chance
	
	// Select rarity based on weights
	const totalWeight = rarityWeights.reduce((sum, weight) => sum + weight, 0);
	const random = Math.random() * totalWeight;
	let currentWeight = 0;
	let rarity: GearRarity = 'Common';
	
	for (let i = 0; i < rarityWeights.length; i++) {
		currentWeight += rarityWeights[i];
		if (random <= currentWeight) {
			rarity = rarities[i];
			break;
		}
	}
	
	// Generate gear name
	const gearNames = {
		helm: ['Crown', 'Helm', 'Circlet', 'Diadem', 'Cap'],
		chest: ['Plate', 'Mail', 'Armor', 'Cuirass', 'Vest'],
		claws: ['Talons', 'Claws', 'Blades', 'Rippers', 'Hooks'],
		tailSpike: ['Spike', 'Barb', 'Point', 'Thorn', 'Stinger'],
		wingGuards: ['Guards', 'Shields', 'Plates', 'Covers', 'Mantles'],
		charm: ['Charm', 'Amulet', 'Pendant', 'Talisman', 'Ward'],
		ring: ['Ring', 'Band', 'Loop', 'Circle', 'Signet'],
		breathFocus: ['Focus', 'Orb', 'Crystal', 'Stone', 'Lens']
	};
	
	const rarityPrefixes = {
		'Common': ['Crude', 'Simple', 'Basic', 'Plain', 'Worn'],
		'Rare': ['Fine', 'Quality', 'Polished', 'Sturdy', 'Sharp'],
		'Epic': ['Masterwork', 'Superior', 'Gleaming', 'Powerful', 'Enchanted'],
		'Legendary': ['Ancient', 'Legendary', 'Mythical', 'Celestial', 'Divine'],
		'Mythic': ['Godlike', 'Primordial', 'Eternal', 'Transcendent', 'Ultimate']
	};
	
	const baseName = gearNames[slot][Math.floor(Math.random() * gearNames[slot].length)];
	const prefix = rarityPrefixes[rarity][Math.floor(Math.random() * rarityPrefixes[rarity].length)];
	
	// Generate base stats based on slot and rarity
	const stats: GearStats = {};
	const rarityMultiplier = {
		'Common': 1,
		'Rare': 1.5,
		'Epic': 2.5,
		'Legendary': 4,
		'Mythic': 6
	}[rarity];
	
	// Assign primary stats based on slot
	if (['claws', 'tailSpike'].includes(slot)) {
		stats.damage = Math.floor((2 + level * 0.3) * rarityMultiplier);
	}
	if (['helm', 'chest', 'wingGuards'].includes(slot)) {
		stats.health = Math.floor((3 + level * 0.5) * rarityMultiplier);
	}
	if (['ring', 'charm', 'breathFocus'].includes(slot)) {
		stats.fireRate = (0.1 + level * 0.01) * rarityMultiplier;
	}
	
	// Rare+ gear gets bonus stats
	if (rarity !== 'Common') {
		const bonusChance = { 'Rare': 0.3, 'Epic': 0.5, 'Legendary': 0.7, 'Mythic': 0.9 }[rarity] || 0;
		if (Math.random() < bonusChance && !stats.damage) {
			stats.damage = Math.floor((1 + level * 0.1) * rarityMultiplier * 0.5);
		}
		if (Math.random() < bonusChance && !stats.health) {
			stats.health = Math.floor((2 + level * 0.2) * rarityMultiplier * 0.5);
		}
	}
	
	// Chance for gear to be part of a set (higher chance for rare+ gear)
	let setId: string | undefined;
	const setChance = {
		'Common': 0.05,
		'Rare': 0.15,
		'Epic': 0.25,
		'Legendary': 0.40,
		'Mythic': 0.60
	}[rarity] || 0;
	
	if (Math.random() < setChance) {
		// Find sets that include this slot
		const compatibleSets = state.availableSets.filter(set => set.pieces.includes(slot));
		if (compatibleSets.length > 0) {
			setId = compatibleSets[Math.floor(Math.random() * compatibleSets.length)].id;
		}
	}
	
	// Generate sockets (higher rarity = more sockets)
	const maxSockets = { 'Common': 0, 'Rare': 1, 'Epic': 2, 'Legendary': 3, 'Mythic': 4 }[rarity] || 0;
	const socketChance = 0.3 + (level * 0.01); // 30% base + 1% per level
	const sockets: RuneSocket[] = [];
	
	for (let i = 0; i < maxSockets; i++) {
		if (Math.random() < socketChance) {
			const socketTypes: ('damage' | 'defense' | 'utility')[] = ['damage', 'defense', 'utility'];
			sockets.push({
				id: `socket_${i}`,
				socketType: socketTypes[Math.floor(Math.random() * socketTypes.length)]
			});
		}
	}

	return {
		id: generateGearId(),
		name: `${prefix} ${baseName}`,
		rarity,
		slot,
		level: Math.max(1, level + Math.floor((Math.random() - 0.5) * 4)), // ±2 levels
		enhancement: 0,
		stats,
		setId,
		sockets,
		description: `Level ${level} ${rarity} equipment found in combat.`
	};
}

// Material Generation for Drops
function generateMaterialDrop(level: number, enemyType: EnemyType): Material {
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

// Gear Enhancement System
function calculateEnhancementCost(gear: GearPiece): number {
	const rarityMultipliers = {
		'Common': 1.0,
		'Rare': 1.5,
		'Epic': 2.0,
		'Legendary': 3.0,
		'Mythic': 5.0
	};
	
	const baseCost = 100;
	const multiplier = rarityMultipliers[gear.rarity] || 1.0;
	
	// Cost grows exponentially with enhancement level
	return Math.floor(baseCost * multiplier * Math.pow(1.25, gear.enhancement));
}

function canAffordEnhancement(gear: GearPiece): boolean {
	if (gear.enhancement >= 25) return false; // Max enhancement level
	
	const cost = calculateEnhancementCost(gear);
	return state.currencies.forgegold.amount >= cost;
}

function enhanceGear(gearId: string, slot?: GearSlot): boolean {
	let gear: GearPiece | undefined;
	let isEquipped = false;
	
	// Find gear in equipped items first
	if (slot && state.equippedGear[slot]?.id === gearId) {
		gear = state.equippedGear[slot];
		isEquipped = true;
	} else {
		// Find in inventory
		gear = state.inventory.find(g => g.id === gearId);
		isEquipped = false;
	}
	
	if (!gear) return false;
	if (!canAffordEnhancement(gear)) return false;
	
	const cost = calculateEnhancementCost(gear);
	
	// Deduct cost
	state.currencies.forgegold.amount -= cost;
	
	// Enhance the gear
	gear.enhancement++;
	
	// Update dragon stats if gear is equipped
	if (isEquipped) {
		updateDragonStats();
	}
	
	return true;
}

// Crafting Recipe System
function createBasicCraftingRecipes(): CraftingRecipe[] {
	return [
		{
			id: 'iron_helm',
			name: 'Iron Crown',
			slot: 'helm',
			targetRarity: 'Common',
			requiredLevel: 1,
			materials: [
				{ type: 'emberdust', amount: 3 },
				{ type: 'frostshards', amount: 2 }
			],
			baseStats: { health: 8 },
			unlocked: true
		},
		{
			id: 'iron_claws',
			name: 'Iron Talons',
			slot: 'claws',
			targetRarity: 'Common',
			requiredLevel: 1,
			materials: [
				{ type: 'emberdust', amount: 2 },
				{ type: 'stormmotes', amount: 2 }
			],
			baseStats: { damage: 4 },
			unlocked: true
		},
		{
			id: 'steel_chest',
			name: 'Steel Plate',
			slot: 'chest',
			targetRarity: 'Rare',
			requiredLevel: 5,
			materials: [
				{ type: 'emberore', amount: 1 },
				{ type: 'frostmetal', amount: 1 },
				{ type: 'emberdust', amount: 10 }
			],
			baseStats: { health: 15, damage: 2 },
			unlocked: false
		},
		{
			id: 'storm_ring',
			name: 'Storm Band',
			slot: 'ring',
			targetRarity: 'Rare',
			requiredLevel: 8,
			materials: [
				{ type: 'stormsteel', amount: 1 },
				{ type: 'stormmotes', amount: 8 },
				{ type: 'frostshards', amount: 5 }
			],
			baseStats: { fireRate: 0.8, damage: 3 },
			unlocked: false
		},
		{
			id: 'shadow_focus',
			name: 'Shadow Orb',
			slot: 'breathFocus',
			targetRarity: 'Epic',
			requiredLevel: 12,
			materials: [
				{ type: 'shadowessence', amount: 2 },
				{ type: 'emberore', amount: 2 },
				{ type: 'stormsteel', amount: 1 }
			],
			baseStats: { fireRate: 1.2, damage: 8 },
			unlocked: false
		}
	];
}

function unlockCraftingRecipes(): void {
	// Unlock recipes based on level progression
	state.recipes.forEach(recipe => {
		if (!recipe.unlocked && state.currentLevel >= recipe.requiredLevel) {
			recipe.unlocked = true;
		}
	});
}

function canCraftRecipe(recipe: CraftingRecipe): boolean {
	// Check level requirement
	if (state.currentLevel < recipe.requiredLevel) return false;
	
	// Check material requirements
	return recipe.materials.every(requirement => 
		state.materials[requirement.type] >= requirement.amount
	);
}

function craftGear(recipeId: string): boolean {
	const recipe = state.recipes.find(r => r.id === recipeId);
	if (!recipe || !recipe.unlocked) return false;
	
	if (!canCraftRecipe(recipe)) return false;
	
	// Consume materials
	recipe.materials.forEach(requirement => {
		state.materials[requirement.type] -= requirement.amount;
	});
	
	// Create the gear piece
	const craftedGear: GearPiece = {
		id: generateGearId(),
		name: recipe.name,
		rarity: recipe.targetRarity,
		slot: recipe.slot,
		level: state.currentLevel, // Crafted at current player level
		enhancement: 0,
		stats: { ...recipe.baseStats }, // Copy base stats
		sockets: [],
		description: `Crafted ${recipe.targetRarity} equipment made with precision.`
	};
	
	// Add to inventory
	state.inventory.push(craftedGear);
	
	return true;
}

// Gear Sets & Rune System
function createGearSets(): GearSet[] {
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

// Check which set bonuses are currently active
function getActiveSetBonuses(): { setId: string; activePieces: number; bonuses: any[] }[] {
	const setPieceCounts: Record<string, number> = {};
	const activeSets: { setId: string; activePieces: number; bonuses: any[] }[] = [];
	
	// Count equipped pieces for each set
	if (state.equippedGear) {
		Object.values(state.equippedGear).forEach(gear => {
			if (gear && gear.setId) {
				setPieceCounts[gear.setId] = (setPieceCounts[gear.setId] || 0) + 1;
			}
		});
	}
	
	// Check which set bonuses are active
	Object.entries(setPieceCounts).forEach(([setId, count]) => {
		const gearSet = state.availableSets.find(s => s.id === setId);
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

// Calculate total set bonuses
function calculateSetBonuses(): GearStats {
	const setBonuses: GearStats = {
		damage: 0,
		health: 0,
		fireRate: 0,
		critChance: 0,
		critDamage: 0
	};
	
	const activeSets = getActiveSetBonuses();
	
	activeSets.forEach(activeSet => {
		// Apply the highest tier bonus (sets don't stack multiple tiers)
		const highestBonus = activeSet.bonuses[activeSet.bonuses.length - 1];
		if (highestBonus && highestBonus.stats) {
			setBonuses.damage! += highestBonus.stats.damage || 0;
			setBonuses.health! += highestBonus.stats.health || 0;
			setBonuses.fireRate! += highestBonus.stats.fireRate || 0;
			setBonuses.critChance! += highestBonus.stats.critChance || 0;
			setBonuses.critDamage! += highestBonus.stats.critDamage || 0;
		}
	});
	
	return setBonuses;
}

// Generate random runes for drops
function generateRandomRune(level: number, enemyType: EnemyType): Rune {
	const runeTypes: RuneType[] = ['strength', 'vitality', 'agility', 'focus', 'fortune'];
	const rarities: RuneRarity[] = ['Lesser', 'Greater', 'Perfect'];
	
	// Rarity chances based on level and enemy type
	let rarityWeights = [70, 25, 5]; // Lesser, Greater, Perfect
	
	if (enemyType === 'boss') {
		rarityWeights = [40, 45, 15]; // Better odds for bosses
	}
	
	// Select rarity based on weights
	const totalWeight = rarityWeights.reduce((sum, weight) => sum + weight, 0);
	const random = Math.random() * totalWeight;
	let currentWeight = 0;
	let rarity: RuneRarity = 'Lesser';
	
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
	const stats: GearStats = {};
	
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
	const socketTypes: ('damage' | 'defense' | 'utility')[] = [];
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

// Rune Socketing System
function socketRune(gearId: string, runeId: string, socketIndex: number): boolean {
	// Find the gear piece
	let gear: GearPiece | undefined;
	let isEquipped = false;
	
	// Check equipped gear first
	if (state.equippedGear) {
		for (const [slot, equippedGear] of Object.entries(state.equippedGear)) {
			if (equippedGear && equippedGear.id === gearId) {
				gear = equippedGear;
				isEquipped = true;
				break;
			}
		}
	}
	
	// If not equipped, check inventory
	if (!gear) {
		gear = state.inventory.find(g => g.id === gearId);
		isEquipped = false;
	}
	
	if (!gear || !gear.sockets || socketIndex >= gear.sockets.length) {
		return false;
	}
	
	// Find the rune
	const runeIndex = state.runeInventory.findIndex(r => r.id === runeId);
	if (runeIndex === -1) {
		return false;
	}
	
	const rune = state.runeInventory[runeIndex];
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
	socket.runeId = runeId;
	
	// Remove rune from inventory (it's now socketed)
	state.runeInventory.splice(runeIndex, 1);
	
	// Update dragon stats if gear is equipped
	if (isEquipped) {
		updateDragonStats();
	}
	
	return true;
}

function unsocketRune(gearId: string, socketIndex: number): boolean {
	// Find the gear piece
	let gear: GearPiece | undefined;
	let isEquipped = false;
	
	// Check equipped gear first
	if (state.equippedGear) {
		for (const [slot, equippedGear] of Object.entries(state.equippedGear)) {
			if (equippedGear && equippedGear.id === gearId) {
				gear = equippedGear;
				isEquipped = true;
				break;
			}
		}
	}
	
	// If not equipped, check inventory
	if (!gear) {
		gear = state.inventory.find(g => g.id === gearId);
		isEquipped = false;
	}
	
	if (!gear || !gear.sockets || socketIndex >= gear.sockets.length) {
		return false;
	}
	
	const socket = gear.sockets[socketIndex];
	
	// Check if socket has a rune
	if (!socket.runeId) {
		return false;
	}
	
	// Find the socketed rune and return it to inventory
	// Since we don't store the actual rune object in the socket, we need to recreate it
	// This is a limitation of the current design - in a real implementation, we'd store rune references
	
	// For now, we'll just remove the rune reference (this destroys the rune)
	// In a production system, we'd want to return the rune to inventory
	socket.runeId = undefined;
	
	// Update dragon stats if gear is equipped
	if (isEquipped) {
		updateDragonStats();
	}
	
	return true;
}

// Logarithmic cost progression: cost = baseCost * (level + 1)^1.5
// This is between linear (^1) and exponential (^2) for balanced progression
function calculateUpgradeCost(upgradeType: UpgradeType, currentLevel: number): number {
	// Reduced base costs for early game accessibility
	const baseCosts = {
		damage: 5,      // Reduced from 10
		fireRate: 8,    // Reduced from 15
		health: 12,     // Reduced from 20
		extraDragons: 500  // Reduced from 1000
	};
	
	const baseCost = baseCosts[upgradeType];
	
	if (upgradeType === 'extraDragons') {
		// Special case: each extra dragon costs more significantly
		return baseCost * Math.pow(currentLevel + 1, 2);
	}
	
	// Logarithmic progression: level^1.5 for balanced growth
	return Math.floor(baseCost * Math.pow(currentLevel + 1, 1.5));
}

function canAffordUpgrade(upgradeType: UpgradeType): boolean {
	const currentLevel = state.upgrades[upgradeType];
	const cost = calculateUpgradeCost(upgradeType, currentLevel);
	return state.currencies.copper.amount >= cost;
}

function purchaseUpgrade(upgradeType: UpgradeType): boolean {
	if (!canAffordUpgrade(upgradeType)) {
		return false;
	}
	
	const currentLevel = state.upgrades[upgradeType];
	const cost = calculateUpgradeCost(upgradeType, currentLevel);
	
	// Deduct cost
	state.currencies.copper.amount -= cost;
	
	// Increase upgrade level
	state.upgrades[upgradeType]++;
	
	// Update dragon stats
	updateDragonStats();
	
	return true;
}

function updateDragonStats(): void {
	const upgrades = state.upgrades;
	
	// Base stats - improved for better balance
	const baseDamage = 2;  // Increased from 1
	const baseHp = 10;     // Increased from 5
	const baseFireRate = 1.0;
	
	// Get gear bonuses
	const gearStats = calculateGearStats();
	
	// Calculate new stats - base + upgrades + gear
	state.dragonStats.damage = baseDamage + (upgrades.damage * 2) + gearStats.damage;
	state.dragonStats.maxHp = baseHp + (upgrades.health * 8) + gearStats.health;
	state.dragonStats.fireRateMultiplier = baseFireRate + (upgrades.fireRate * 0.3) + (gearStats.fireRate * 0.1);
	state.dragonStats.dragonCount = 1 + upgrades.extraDragons;
	
	// Heal to full if HP increased
	if (state.dragonStats.currentHp > state.dragonStats.maxHp) {
		state.dragonStats.currentHp = state.dragonStats.maxHp;
	} else if (upgrades.health > 0) {
		// Restore HP when upgrading health
		state.dragonStats.currentHp = state.dragonStats.maxHp;
	}
}


function postState(): void {
	const msg: FromWorkerMessage = { type: 'state:update', state };
	postMessage(msg);
}

// Main game simulation function
function simulate(elapsedSec: number): void {
	// Update playtime
	state.playtimeSec += elapsedSec;
	
	// Generate passive materials from Forgefire Mine
	generateMaterials(elapsedSec);
	
	// Update distance progression - dragon flies forward over time
	updateDistanceProgress(elapsedSec);
}

// Game loop function
function startLoop(): void {
	if (timer) return; // Already running
	
	// Run simulation every second
	timer = setInterval(() => {
		const now = Date.now();
		const dtMs = now - state.lastTickMs;
		const dtSec = dtMs / 1000;
		
		if (dtSec > 0) {
			simulate(dtSec);
			state.lastTickMs = now;
			postState();
		}
	}, 1000) as unknown as number;
}

self.onmessage = (e: MessageEvent<ToWorkerMessage>) => {
	const msg = e.data;
	
	if (msg.type === 'init') {
		state = msg.state ?? defaultState();
		
		// Migration for older saves (schema version 1 → 3)
		if (!state.schemaVersion || state.schemaVersion < 3) {
			// Add level system to existing saves
			state.currentLevel = state.currentLevel ?? 1;
			// Convert old levelProgress to distance (if it existed)
			const oldProgress = (state as any).levelProgress ?? 0;
			state.totalDistance = state.totalDistance ?? 0;
			state.levelDistance = state.levelDistance ?? Math.floor(oldProgress * 15000); // Convert progress to meters
			state.levelDistanceTarget = state.levelDistanceTarget ?? calculateLevelDistanceTarget(state.currentLevel);
			state.enemiesDefeated = state.enemiesDefeated ?? 0;
			state.bossesDefeated = state.bossesDefeated ?? 0;
			state.worldMap = state.worldMap ?? {
				unlockedLevels: [1],
				completedLevels: [],
				currentRegion: "Dragonspire Mountains",
				bossTimers: {}
			};
			state.currentLevelState = state.currentLevelState ?? {
				totalEnemies: 0,
				enemiesSpawned: 0,
				enemiesDefeated: 0,
				isComplete: false,
				isBossLevel: false
			};
			
			// Add new currencies if they don't exist
			if (!state.currencies.forgegold) {
				state.currencies.forgegold = { key: 'forgegold', amount: 0, unlocked: false };
			}
			if (!state.currencies.dragonscales) {
				state.currencies.dragonscales = { key: 'dragonscales', amount: 0, unlocked: false };
			}
			if (!state.currencies.gems) {
				state.currencies.gems = { key: 'gems', amount: 0, unlocked: false };
			}
			
			// Add gear system if it doesn't exist  
			state.equippedGear = state.equippedGear ?? {};
			state.inventory = state.inventory ?? [];
			
			// Give existing players starter gear if they don't have any
			if (state.inventory.length === 0 && Object.keys(state.equippedGear).length === 0) {
				state.inventory = createStarterGear();
			}
			
			// Add crafting system if it doesn't exist
			state.materials = state.materials ?? {
				emberdust: 0,
				frostshards: 0,
				stormmotes: 0,
				venomglobules: 0,
				emberore: 0,
				frostmetal: 0,
				stormsteel: 0,
				shadowessence: 0
			};
			state.recipes = state.recipes ?? createBasicCraftingRecipes();
			
			// Add gear sets & rune system if it doesn't exist
			state.availableSets = state.availableSets ?? createGearSets();
			state.runeInventory = state.runeInventory ?? [];
			
			state.schemaVersion = 3;
		}
		
		// Ensure upgrade/stats exist for older saves
		if (!state.upgrades) {
			state.upgrades = {
				damage: 0,
				fireRate: 0,
				health: 0,
				extraDragons: 0
			};
		}
		if (!state.dragonStats) {
			state.dragonStats = {
				maxHp: 10,    // Updated base stats
				currentHp: 10,
				damage: 2,
				fireRateMultiplier: 1.0,
				dragonCount: 1
			};
		}
		
		// Ensure gear system exists for all saves (including older ones)
		if (!state.equippedGear) {
			state.equippedGear = {};
		}
		if (!state.inventory) {
			state.inventory = [];
		}
		
		// Ensure current level state exists
		if (!state.currentLevelState) {
			state.currentLevelState = {
				totalEnemies: 0,
				enemiesSpawned: 0,
				enemiesDefeated: 0,
				isComplete: false,
				isBossLevel: false
			};
		}
		
		// Schema migration: Version 3 → 4 (Currency rename)
		if (state.schemaVersion === 3) {
			// Migrate copper → steak, forgegold → gold
			const oldCurrencies = state.currencies as any;
			
			state.currencies = {
				steak: { 
					key: 'steak', 
					amount: oldCurrencies.copper?.amount || 0, 
					unlocked: oldCurrencies.copper?.unlocked || true 
				},
				gold: { 
					key: 'gold', 
					amount: oldCurrencies.forgegold?.amount || 0, 
					unlocked: oldCurrencies.forgegold?.unlocked || false 
				},
				dragonscales: oldCurrencies.dragonscales || { key: 'dragonscales', amount: 0, unlocked: false },
				gems: oldCurrencies.gems || { key: 'gems', amount: 0, unlocked: false }
			};
			
			state.schemaVersion = 4;
		}
		
		// Ensure travelState exists for all saves
		if (!state.travelState) {
			state.travelState = 'HOVERING';
		}
		
		// Update stats based on upgrades
		updateDragonStats();
		
		// Unlock appropriate crafting recipes for current level
		unlockCraftingRecipes();
		
		// Initialize level state if needed
		if (!state.currentLevelState || state.currentLevelState.totalEnemies === 0) {
			initializeLevelState();
		}
		
		// Offline catch-up calculation
		const elapsedMs = Date.now() - state.lastTickMs;
		const elapsedSec = clamp(Math.floor(elapsedMs / 1000), 0, 24 * 60 * 60); // cap at 24 hours
		
		if (elapsedSec > 0) {
			simulate(elapsedSec);
			state.lastTickMs = Date.now();
		}
		
		postState();
		startLoop();
	}
	
	if (msg.type === 'request-save') {
		// UI will persist using Dexie; worker just re-posts current state
		postState();
	}
	
	if (msg.type === 'ping') {
		postMessage({ type: 'pong' } as FromWorkerMessage);
	}
	
	if (msg.type === 'add-steak') {
		addSteak(msg.amount);
		state.lastTickMs = Date.now();
		postState();
	}
	
	if (msg.type === 'purchase-upgrade') {
		const success = purchaseUpgrade(msg.upgradeType);
		if (success) {
			state.lastTickMs = Date.now();
			postState();
		}
	}
	
	if (msg.type === 'advance-level') {
		advanceLevel();
		state.lastTickMs = Date.now();
		postState();
	}
	
	if (msg.type === 'complete-level') {
		// This is now handled automatically by distance progression
		// But we can trigger advancement manually if needed
		advanceLevel();
		state.lastTickMs = Date.now();
		postState();
	}
	
	if (msg.type === 'spawn-enemy') {
		if (canSpawnEnemy()) {
			const enemy = generateEnemy();
			const spawnMsg: FromWorkerMessage = { type: 'enemy:spawn', enemy };
			postMessage(spawnMsg);
		}
		state.lastTickMs = Date.now();
		postState();
	}
	
	if (msg.type === 'enemy-defeated') {
		const rewards = defeatEnemy(msg.enemyId);
		const defeatMsg: FromWorkerMessage = { type: 'enemy:defeated', rewards };
		postMessage(defeatMsg);
		state.lastTickMs = Date.now();
		postState();
	}
	
	if (msg.type === 'select-level') {
		// Only allow selection of unlocked levels
		if (state.worldMap.unlockedLevels.includes(msg.level)) {
			state.currentLevel = msg.level;
			// Reset level state when selecting a new level
			initializeLevelState();
		}
		state.lastTickMs = Date.now();
		postState();
	}
	
	if (msg.type === 'equip-gear') {
		const success = equipGear(msg.gearId, msg.slot);
		if (success) {
			state.lastTickMs = Date.now();
			postState();
		}
	}
	
	if (msg.type === 'unequip-gear') {
		const success = unequipGear(msg.slot);
		if (success) {
			state.lastTickMs = Date.now();
			postState();
		}
	}
	
	if (msg.type === 'enhance-gear') {
		const success = enhanceGear(msg.gearId, msg.slot);
		if (success) {
			state.lastTickMs = Date.now();
			postState();
		}
	}

	if (msg.type === 'craft-gear') {
		const success = craftGear(msg.recipeId);
		if (success) {
			state.lastTickMs = Date.now();
			postState();
		}
	}
	
	if (msg.type === 'socket-rune') {
		const success = socketRune(msg.gearId, msg.runeId, msg.socketIndex);
		if (success) {
			state.lastTickMs = Date.now();
			postState();
		}
	}
	
	if (msg.type === 'unsocket-rune') {
		const success = unsocketRune(msg.gearId, msg.socketIndex);
		if (success) {
			state.lastTickMs = Date.now();
			postState();
		}
	}
	
	if (msg.type === 'start-travel') {
		const success = startTravel();
		if (success) {
			state.lastTickMs = Date.now();
			postState();
		}
	}
	
	if (msg.type === 'stop-travel') {
		const success = stopTravel();
		if (success) {
			state.lastTickMs = Date.now();
			postState();
		}
	}
};