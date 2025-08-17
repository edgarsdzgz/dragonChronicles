import type { MVPGameState, MVPToWorkerMessage, MVPFromWorkerMessage, Enemy } from '$lib/mvpTypes';

let state: MVPGameState;
let timer: number | undefined;

function defaultMVPState(): MVPGameState {
	return {
		// Distance & Level Progression (your specs)
		currentLevel: 1,
		totalDistance: 0,
		levelDistance: 0,
		levelDistanceTarget: 1500, // 1.5km for Level 1
		
		// Single Currency
		arcanaAmount: 1000, // Start with some Arcana for testing
		
		// Temporary Enchants (reset on abandon)
		enchants: {
			firepower: {
				currentLevel: 1,
				unlockedTier: 1,
				selectedTier: 1
			},
			scales: {
				currentLevel: 1,
				unlockedTier: 1,
				selectedTier: 1
			}
		},
		
		// Dragon Combat
		dragonHp: 100,
		dragonMaxHp: 100,
		travelState: 'HOVERING',
		
		// Enemy Management
		activeEnemies: [],
		enemiesDefeated: 0,
		waveEnemyCount: 6 // Level 1 starts with 6 enemies
	};
}

// Calculate level distance using exponential formula: 1.5 * (1.4^(level-1)) km
function calculateLevelDistance(level: number): number {
	return Math.floor(1500 * Math.pow(1.4, level - 1));
}

// Calculate wave enemy count: Linear 6-14 for levels 1-9, repeat pattern
function calculateWaveEnemyCount(level: number): number {
	const cycleLevel = ((level - 1) % 10) + 1; // 1-10 cycle
	if (cycleLevel === 10) return 0; // Boss level, no wave
	return Math.min(6 + (cycleLevel - 1), 14); // 6-14 linear
}

function gameLoop(): void {
	const now = Date.now();
	const dtSec = 0.016; // ~60fps
	
	if (state.travelState === 'ADVANCING') {
		// Travel at 44 m/s base speed
		const distanceThisTick = 44 * dtSec;
		state.levelDistance += distanceThisTick;
		state.totalDistance += distanceThisTick;
		
		// Check level completion
		if (state.levelDistance >= state.levelDistanceTarget) {
			const excess = state.levelDistance - state.levelDistanceTarget;
			completeLevel();
			state.levelDistance = excess; // Carry over
		}
	} else if (state.travelState === 'RETREATING') {
		// Travel backward at 44 m/s base speed
		const distanceThisTick = 44 * dtSec;
		state.levelDistance -= distanceThisTick;
		state.totalDistance -= distanceThisTick;
		
		// Check level boundaries - can't go below 0
		if (state.totalDistance <= 0) {
			state.totalDistance = 0;
			state.levelDistance = 0;
			state.currentLevel = 1;
			state.levelDistanceTarget = calculateLevelDistance(1);
			state.travelState = 'HOVERING'; // Stop at beginning
		} else if (state.levelDistance < 0 && state.currentLevel > 1) {
			// Retreat to previous level
			state.currentLevel--;
			state.levelDistanceTarget = calculateLevelDistance(state.currentLevel);
			state.levelDistance = state.levelDistanceTarget + state.levelDistance; // Carry over negative
			state.waveEnemyCount = calculateWaveEnemyCount(state.currentLevel);
		}
	}
	
	// Send state update
	postMessage({
		type: 'state-update',
		state: { ...state }
	} as MVPFromWorkerMessage);
}

function completeLevel(): void {
	const completedLevel = state.currentLevel;
	state.currentLevel++;
	
	// Update level target distance for new level
	state.levelDistanceTarget = calculateLevelDistance(state.currentLevel);
	state.waveEnemyCount = calculateWaveEnemyCount(state.currentLevel);
	
	// Award Arcana (level-based reward)
	const arcanaReward = 50 + (completedLevel * 25);
	state.arcanaAmount += arcanaReward;
	
	// Send level complete message
	postMessage({
		type: 'level-complete',
		newLevel: state.currentLevel,
		arcanaReward
	} as MVPFromWorkerMessage);
}

// Message handling
self.onmessage = (e: MessageEvent<MVPToWorkerMessage>) => {
	const msg = e.data;
	
	switch (msg.type) {
		case 'init':
			state = defaultMVPState();
			if (!timer) {
				timer = setInterval(gameLoop, 16) as unknown as number; // ~60fps
			}
			break;
			
		case 'start-travel':
			state.travelState = 'ADVANCING';
			break;
			
		case 'stop-travel':
			state.travelState = 'HOVERING';
			break;
			
		case 'reverse-travel':
			state.travelState = 'RETREATING';
			break;
			
		case 'abandon-journey':
			// Reset distance and enchants, keep Arcana
			state.totalDistance = 0;
			state.levelDistance = 0;
			state.currentLevel = 1;
			state.levelDistanceTarget = calculateLevelDistance(1);
			state.waveEnemyCount = calculateWaveEnemyCount(1);
			state.enchants.firepower = { currentLevel: 1, unlockedTier: 1, selectedTier: 1 };
			state.enchants.scales = { currentLevel: 1, unlockedTier: 1, selectedTier: 1 };
			state.travelState = 'HOVERING';
			state.activeEnemies = [];
			state.enemiesDefeated = 0;
			break;
			
		case 'purchase-level':
			if (state.arcanaAmount >= msg.cost) {
				state.arcanaAmount -= msg.cost;
				const enchant = state.enchants[msg.enchantType];
				enchant.currentLevel++;
			}
			break;
			
		case 'tier-up':
			if (state.arcanaAmount >= msg.cost) {
				state.arcanaAmount -= msg.cost;
				const enchant = state.enchants[msg.enchantType];
				enchant.unlockedTier = Math.min(3, enchant.unlockedTier + 1) as 1 | 2 | 3;
				enchant.selectedTier = enchant.unlockedTier;
			}
			break;
			
		case 'select-tier':
			const enchant = state.enchants[msg.enchantType];
			if (msg.tier <= enchant.unlockedTier) {
				enchant.selectedTier = msg.tier;
			}
			break;
	}
};