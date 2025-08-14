export type CurrencyKey = 'steak' | 'gold' | 'dragonscales' | 'gems';

export interface Currency {
	key: CurrencyKey;
	amount: number;
	unlocked: boolean;
}

export interface DragonUpgrades {
	damage: number;      // Damage level (starts at 0)
	fireRate: number;    // Fire rate level (starts at 0) 
	health: number;      // Health level (starts at 0)
	extraDragons: number; // Number of additional dragons (starts at 0)
}

export interface DragonStats {
	maxHp: number;
	currentHp: number;
	damage: number;
	fireRateMultiplier: number; // Multiplier for fire rate (1.0 = base)
	dragonCount: number;
}

export interface WorldMapState {
	unlockedLevels: number[];        // Available level selection
	completedLevels: number[];       // Finished levels  
	currentRegion: string;           // Current world region
	bossTimers: Record<number, number>; // Boss cooldowns by level
}

export interface LevelEncounter {
	level: number;                   // Level number (1, 2, 3...)
	enemyCount: number;             // Number of enemies to spawn
	isBossLevel: boolean;           // Every 10 levels
	completionRewards: LevelReward[];    // Level clear bonuses
}

export interface LevelReward {
	type: 'currency' | 'unlock';
	currencyType?: CurrencyKey;
	amount?: number;
	unlockType?: string;
}

export type EnemyType = 'normal' | 'elite' | 'boss';
export type ElementType = 'fire' | 'ice' | 'lightning' | 'poison';

export interface Enemy {
	id: number;
	level: number;              // Determines stats
	type: EnemyType;           // Normal, Elite, Boss
	element?: ElementType;      // Fire, Ice, Lightning, Poison
	hp: number;
	maxHp: number;
	damage: number;
	abilities: string[];        // Special attacks
	lootTable: Reward[];       // Drop rewards (gear, materials, runes)
}

export interface LevelState {
	totalEnemies: number;       // Total enemies in this level
	enemiesSpawned: number;     // How many have spawned
	enemiesDefeated: number;    // How many have been killed
	isComplete: boolean;        // All enemies defeated
	isBossLevel: boolean;       // Every 10th level
}

// Gear System Types
export type GearSlot = 'helm' | 'chest' | 'claws' | 'tailSpike' | 'wingGuards' | 'charm' | 'ring' | 'breathFocus';
export type GearRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface GearStats {
	damage?: number;            // Weapon damage bonus
	health?: number;            // Health bonus
	fireRate?: number;          // Fire rate multiplier bonus
	critChance?: number;        // Critical hit chance (0-1)
	critDamage?: number;        // Critical damage multiplier
	dragonScaleFind?: number;   // Bonus dragonscale drops
	goldFind?: number;          // Bonus gold drops
}

export interface RuneSocket {
	id: string;
	runeId?: string;           // ID of socketed rune (if any)
	socketType: 'damage' | 'defense' | 'utility';
}

export interface GearPiece {
	id: string;
	name: string;
	rarity: GearRarity;
	slot: GearSlot;
	level: number;              // Gear level (1-50+)
	enhancement: number;        // Enhancement level (+0 to +25)
	stats: GearStats;
	setId?: string;             // Set bonuses (Phase 3)
	sockets: RuneSocket[];      // Rune system (Phase 3)
	description?: string;       // Flavor text
}

export interface DragonGear {
	helm?: GearPiece;           // Crown of power
	chest?: GearPiece;          // Battle armor
	claws?: GearPiece;          // Talon weapons
	tailSpike?: GearPiece;      // Tail blade
	wingGuards?: GearPiece;     // Wing protection
	charm?: GearPiece;          // Mystical talisman
	ring?: GearPiece;           // Power ring
	breathFocus?: GearPiece;    // Breath enhancement
}

// Material System Types
export type MaterialType = 
	| 'emberdust' | 'frostshards' | 'stormmotes' | 'venomglobules'  // Elemental materials
	| 'emberore' | 'frostmetal' | 'stormsteel' | 'shadowessence';   // Rare crafting materials

export interface Material {
	type: MaterialType;
	amount: number;
	rarity: 'Common' | 'Rare' | 'Epic';  // Material quality affects crafting outcomes
}

// Crafting System Types
export interface CraftingRecipe {
	id: string;
	name: string;
	slot: GearSlot;
	targetRarity: GearRarity;
	requiredLevel: number;
	materials: { type: MaterialType; amount: number }[];
	baseStats: GearStats;
	unlocked: boolean;
}

// Gear Sets & Rune System Types
export interface GearSet {
	id: string;
	name: string;
	description: string;
	pieces: GearSlot[];
	bonuses: {
		pieces: number;          // Number of pieces needed (2, 4, 6, 8)
		stats: GearStats;        // Stat bonuses provided
		description: string;     // Bonus description
	}[];
}

export type RuneType = 'strength' | 'vitality' | 'agility' | 'focus' | 'fortune';
export type RuneRarity = 'Lesser' | 'Greater' | 'Perfect';

// Travel State Machine
export type TravelState = 'ADVANCING' | 'HOVERING' | 'RETREATING' | 'GATE' | 'TRAVEL_TO_TARGET';

export interface Rune {
	id: string;
	name: string;
	type: RuneType;
	rarity: RuneRarity;
	level: number;
	stats: GearStats;
	socketTypes: ('damage' | 'defense' | 'utility')[];  // Which socket types this rune fits
	description?: string;
}

// Reward System Types  
export interface Reward {
	type: 'currency' | 'gear' | 'material' | 'rune';
	currencyType?: CurrencyKey;   // For currency rewards
	amount?: number;              // Currency amount
	gear?: GearPiece;            // For gear rewards
	material?: Material;          // For material rewards
	rune?: Rune;                 // For rune rewards
}

export interface GameState {
	schemaVersion: number;
	lastTickMs: number;
	playtimeSec: number;
	
	// Distance-based level progression system
	currentLevel: number;            // Player's current level (starts at 1)
	totalDistance: number;           // Total distance traveled (in meters)
	levelDistance: number;           // Distance traveled in current level (in meters)
	levelDistanceTarget: number;     // Distance needed to complete current level
	
	// Travel State Machine
	travelState: TravelState;        // Current travel state
	enemiesDefeated: number;         // Total enemies killed this level
	bossesDefeated: number;          // Total bosses killed
	worldMap: WorldMapState;         // Level unlock status
	currentLevelState: LevelState;   // Active level combat state
	
	currencies: Record<CurrencyKey, Currency>;
	upgrades: DragonUpgrades;
	dragonStats: DragonStats;
	
	// Gear System
	equippedGear: DragonGear;    // Currently equipped gear
	inventory: GearPiece[];      // Unequipped gear items
	
	// Crafting System
	materials: Record<MaterialType, number>;  // Material inventory
	recipes: CraftingRecipe[];               // Unlocked crafting recipes
	
	// Gear Sets & Rune System
	availableSets: GearSet[];                // Available gear sets
	runeInventory: Rune[];                   // Collected runes
}

export type UpgradeType = 'damage' | 'fireRate' | 'health' | 'extraDragons';

export type ToWorkerMessage =
	| { type: 'init'; state?: GameState }
	| { type: 'request-save' }
	| { type: 'ping' }
	| { type: 'add-steak'; amount: number }
	| { type: 'purchase-upgrade'; upgradeType: UpgradeType }
	| { type: 'advance-level' }
	| { type: 'complete-level'; level: number }
	| { type: 'spawn-enemy' }
	| { type: 'enemy-defeated'; enemyId: number }
	| { type: 'select-level'; level: number }
	| { type: 'equip-gear'; gearId: string; slot: GearSlot }
	| { type: 'unequip-gear'; slot: GearSlot }
	| { type: 'enhance-gear'; gearId: string; slot?: GearSlot }
	| { type: 'craft-gear'; recipeId: string }
	| { type: 'socket-rune'; gearId: string; runeId: string; socketIndex: number }
	| { type: 'unsocket-rune'; gearId: string; socketIndex: number }
	| { type: 'start-travel' }
	| { type: 'stop-travel' };

export type FromWorkerMessage =
	| { type: 'state:update'; state: GameState }
	| { type: 'save:ok' | 'save:error'; error?: string }
	| { type: 'pong' }
	| { type: 'level:complete'; newLevel: number; rewards: LevelReward[] }
	| { type: 'boss:defeated'; bossLevel: number; rewards: LevelReward[] }
	| { type: 'enemy:spawn'; enemy: Enemy }
	| { type: 'enemy:defeated'; rewards: Reward[] };