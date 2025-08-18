// MVP-focused types for simplified architecture

export interface MVPGameState {
	// Distance & Level Progression
	currentLevel: number;
	totalDistance: number;
	levelDistance: number;
	levelDistanceTarget: number;
	
	// Single Currency System
	arcanaAmount: number;
	
	// Temporary Enchant System (resets on journey abandon)
	enchants: {
		firepower: {
			currentLevel: number;
			unlockedTier: 1 | 2 | 3;
			selectedTier: 1 | 2 | 3;
		};
		scales: {
			currentLevel: number;
			unlockedTier: 1 | 2 | 3;
			selectedTier: 1 | 2 | 3;
		};
	};
	
	// Dragon Combat State
	dragonHp: number;
	dragonMaxHp: number;
	travelState: 'HOVERING' | 'ADVANCING' | 'RETREATING' | 'GATE';
	
	// Enemy Management
	activeEnemies: Enemy[];
	enemiesDefeated: number;
	waveEnemyCount: number;    // 6-14 based on level
}

export interface Enemy {
	id: number;
	hp: number;
	maxHp: number;
	x: number;      // Arc formation position
	y: number;      // Arc formation position
	level: number;
}

export interface DistanceState {
	currentLevel: number;
	levelProgress: number;      // 0-1 percentage
	totalDistance: number;
	levelDistanceTarget: number;
}

export interface EnchantState {
	firepower: number;          // 0-100
	scales: number;            // 0-100
}

// Worker Messages for MVP
export type MVPToWorkerMessage =
	| { type: 'start-travel' }
	| { type: 'stop-travel' }
	| { type: 'reverse-travel' }
	| { type: 'abandon-journey' }
	| { type: 'purchase-level'; enchantType: 'firepower' | 'scales'; cost: number }
	| { type: 'tier-up'; enchantType: 'firepower' | 'scales'; cost: number }
	| { type: 'select-tier'; enchantType: 'firepower' | 'scales'; tier: 1 | 2 | 3 };

export type MVPFromWorkerMessage =
	| { type: 'state-update'; state: MVPGameState }
	| { type: 'level-complete'; newLevel: number; arcanaReward: number }
	| { type: 'enemy-spawn'; enemy: Enemy }
	| { type: 'enemy-defeat'; enemyId: number; arcanaReward: number };