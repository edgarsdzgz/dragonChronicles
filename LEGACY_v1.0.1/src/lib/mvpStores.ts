import { readable, writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { MVPGameState, MVPToWorkerMessage, MVPFromWorkerMessage, DistanceState, EnchantState } from './mvpTypes';

let mvpWorker: Worker | undefined;
let lastState: MVPGameState | null = null;

// Core MVP game state store
export const mvpGameState = readable<MVPGameState | null>(null, (set) => {
	if (!browser) {
		return () => {};
	}

	// Create worker for MVP system
	mvpWorker = new Worker(new URL('../workers/mvpWorker.ts', import.meta.url), { 
		type: 'module' 
	});

	// Initialize worker
	mvpWorker.postMessage({ type: 'init' });

	// Listen for state updates
	mvpWorker.onmessage = (e: MessageEvent<MVPFromWorkerMessage>) => {
		const msg = e.data;
		
		if (msg.type === 'state-update') {
			lastState = msg.state;
			set(msg.state);
		}
		
		if (msg.type === 'level-complete') {
			console.log(`🎉 Level ${msg.newLevel - 1} completed! +${msg.arcanaReward} Arcana`);
		}
		
		if (msg.type === 'enemy-spawn') {
			console.log('Enemy spawned:', msg.enemy);
		}
		
		if (msg.type === 'enemy-defeat') {
			console.log(`Enemy defeated! +${msg.arcanaReward} Arcana`);
		}
	};

	// Cleanup
	return () => {
		mvpWorker?.terminate();
		mvpWorker = undefined;
	};
});

// Derived stores for specific UI components
export const distanceState = derived(
	mvpGameState,
	($state): DistanceState | null => {
		if (!$state) return null;
		
		return {
			currentLevel: $state.currentLevel,
			levelProgress: $state.levelDistance / $state.levelDistanceTarget,
			totalDistance: $state.totalDistance,
			levelDistanceTarget: $state.levelDistanceTarget
		};
	}
);

export const enchantState = derived(
	mvpGameState,
	($state): EnchantState | null => {
		if (!$state) return null;
		
		return {
			firepower: $state.enchants.firepower,
			scales: $state.enchants.scales
		};
	}
);

export const arcanaAmount = derived(
	mvpGameState,
	($state) => $state?.arcanaAmount ?? 0
);

// Actions to send messages to worker
export function startTravel(): void {
	mvpWorker?.postMessage({ type: 'start-travel' } as MVPToWorkerMessage);
}

export function stopTravel(): void {
	mvpWorker?.postMessage({ type: 'stop-travel' } as MVPToWorkerMessage);
}

export function reverseTravel(): void {
	mvpWorker?.postMessage({ type: 'reverse-travel' } as MVPToWorkerMessage);
}

export function abandonJourney(): void {
	mvpWorker?.postMessage({ type: 'abandon-journey' } as MVPToWorkerMessage);
}

export function purchaseLevel(enchantType: 'firepower' | 'scales', cost: number): void {
	mvpWorker?.postMessage({ 
		type: 'purchase-level', 
		enchantType, 
		cost 
	} as MVPToWorkerMessage);
}

export function tierUp(enchantType: 'firepower' | 'scales', cost: number): void {
	mvpWorker?.postMessage({ 
		type: 'tier-up', 
		enchantType, 
		cost 
	} as MVPToWorkerMessage);
}

export function selectTier(enchantType: 'firepower' | 'scales', tier: 1 | 2 | 3): void {
	mvpWorker?.postMessage({ 
		type: 'select-tier', 
		enchantType, 
		tier 
	} as MVPToWorkerMessage);
}