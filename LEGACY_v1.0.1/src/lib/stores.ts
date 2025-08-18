import { readable, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { loadGame, saveGame } from './save';
import type { GameState, FromWorkerMessage, ToWorkerMessage, UpgradeType, GearSlot } from './types';

let worker: Worker | undefined;
let lastState: GameState | null = null;

// Store for worker messages (enemy spawns, defeats, etc.)
export const workerMessages = writable<FromWorkerMessage | null>(null);

export const gameState = readable<GameState | null>(null, (set) => {
	if (!browser) {
		return () => {};
	}

	// Create worker using dynamic import for proper bundling
	worker = new Worker(new URL('../workers/gameWorker.ts', import.meta.url), { 
		type: 'module' 
	});

	let autosaveTimer: number | undefined;

	// Initialize the worker with saved state
	(async () => {
		try {
			const saved = await loadGame();
			worker!.postMessage({ type: 'init', state: saved } as ToWorkerMessage);
		} catch (error) {
			console.error('Failed to load game:', error);
			worker!.postMessage({ type: 'init' } as ToWorkerMessage);
		}
	})();

	// Listen for state updates from worker
	worker.onmessage = async (e: MessageEvent<FromWorkerMessage>) => {
		const msg = e.data;
		
		// Publish message to subscribers
		workerMessages.set(msg);
		
		if (msg.type === 'state:update') {
			lastState = msg.state;
			set(msg.state);
		}
		
		if (msg.type === 'level:complete') {
			console.log(`🎉 Level ${msg.newLevel - 1} completed! Advancing to Level ${msg.newLevel}`);
			console.log('Rewards:', msg.rewards);
		}
		
		if (msg.type === 'boss:defeated') {
			console.log(`🐉 Boss defeated at Level ${msg.bossLevel}! Epic victory!`);
			console.log('Boss rewards:', msg.rewards);
		}
		
		if (msg.type === 'enemy:spawn') {
			console.log('Enemy spawned:', msg.enemy.type, 'Level', msg.enemy.level);
		}
		
		if (msg.type === 'enemy:defeated') {
			console.log('Enemy defeated! Rewards:', msg.rewards);
		}
	};

	// Auto-save every 10 seconds
	autosaveTimer = setInterval(async () => {
		if (lastState) {
			try {
				await saveGame(lastState);
			} catch (error) {
				console.error('Auto-save failed:', error);
			}
		}
	}, 10_000) as unknown as number;

	// Save on page unload
	const handleBeforeUnload = async () => {
		if (lastState) {
			try {
				await saveGame(lastState);
			} catch (error) {
				console.error('Save on unload failed:', error);
			}
		}
	};

	// Save on visibility change (when tab becomes hidden)
	const handleVisibilityChange = async () => {
		if (document.visibilityState === 'hidden' && lastState) {
			try {
				await saveGame(lastState);
			} catch (error) {
				console.error('Save on visibility change failed:', error);
			}
		}
	};

	window.addEventListener('beforeunload', handleBeforeUnload);
	document.addEventListener('visibilitychange', handleVisibilityChange);

	// Cleanup function
	return () => {
		if (autosaveTimer) {
			clearInterval(autosaveTimer);
		}
		
		window.removeEventListener('beforeunload', handleBeforeUnload);
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		
		worker?.terminate();
		worker = undefined;
	};
});

export function requestSave(): void {
	if (worker) {
		worker.postMessage({ type: 'request-save' } as ToWorkerMessage);
	}
}

export function addSteakReward(amount: number): void {
	if (worker) {
		worker.postMessage({ type: 'add-steak', amount } as ToWorkerMessage);
	}
}

export function purchaseUpgrade(upgradeType: UpgradeType): void {
	if (worker) {
		worker.postMessage({ type: 'purchase-upgrade', upgradeType } as ToWorkerMessage);
	}
}

export function advanceLevel(): void {
	if (worker) {
		worker.postMessage({ type: 'advance-level' } as ToWorkerMessage);
	}
}

export function completeLevel(level: number): void {
	if (worker) {
		worker.postMessage({ type: 'complete-level', level } as ToWorkerMessage);
	}
}

export function spawnEnemy(): void {
	if (worker) {
		worker.postMessage({ type: 'spawn-enemy' } as ToWorkerMessage);
	}
}

export function defeatEnemy(enemyId: number): void {
	if (worker) {
		worker.postMessage({ type: 'enemy-defeated', enemyId } as ToWorkerMessage);
	}
}

export function selectLevel(level: number): void {
	if (worker) {
		worker.postMessage({ type: 'select-level', level } as ToWorkerMessage);
	}
}

export function equipGear(gearId: string, slot: GearSlot): void {
	if (worker) {
		worker.postMessage({ type: 'equip-gear', gearId, slot } as ToWorkerMessage);
	}
}

export function unequipGear(slot: GearSlot): void {
	if (worker) {
		worker.postMessage({ type: 'unequip-gear', slot } as ToWorkerMessage);
	}
}

export function enhanceGear(gearId: string, slot?: GearSlot): void {
	if (worker) {
		worker.postMessage({ type: 'enhance-gear', gearId, slot } as ToWorkerMessage);
	}
}

// Calculate enhancement cost (mirrors worker logic for UI display)
export function calculateEnhancementCost(gear: { rarity: string; enhancement: number }): number {
	const rarityMultipliers: Record<string, number> = {
		'Common': 1.0,
		'Rare': 1.5,
		'Epic': 2.0,
		'Legendary': 3.0,
		'Mythic': 5.0
	};
	
	const baseCost = 100;
	const multiplier = rarityMultipliers[gear.rarity] || 1.0;
	
	return Math.floor(baseCost * multiplier * Math.pow(1.25, gear.enhancement));
}

// Calculate upgrade cost (mirrors worker logic for UI display)
export function calculateUpgradeCost(upgradeType: UpgradeType, currentLevel: number): number {
	const baseCosts = {
		damage: 5,      // Reduced from 10
		fireRate: 8,    // Reduced from 15
		health: 12,     // Reduced from 20
		extraDragons: 500  // Reduced from 1000
	};
	
	const baseCost = baseCosts[upgradeType];
	
	if (upgradeType === 'extraDragons') {
		return baseCost * Math.pow(currentLevel + 1, 2);
	}
	
	return Math.floor(baseCost * Math.pow(currentLevel + 1, 1.5));
}

// Crafting functions
export function craftGear(recipeId: string): void {
	if (worker) {
		worker.postMessage({ type: 'craft-gear', recipeId } as ToWorkerMessage);
	}
}

// Rune socketing functions  
export function socketRune(gearId: string, runeId: string, socketIndex: number): void {
	if (worker) {
		worker.postMessage({ type: 'socket-rune', gearId, runeId, socketIndex } as ToWorkerMessage);
	}
}

export function unsocketRune(gearId: string, socketIndex: number): void {
	if (worker) {
		worker.postMessage({ type: 'unsocket-rune', gearId, socketIndex } as ToWorkerMessage);
	}
}

// Travel control functions
export function startTravel(): void {
	if (worker) {
		worker.postMessage({ type: 'start-travel' } as ToWorkerMessage);
	}
}

export function stopTravel(): void {
	if (worker) {
		worker.postMessage({ type: 'stop-travel' } as ToWorkerMessage);
	}
}