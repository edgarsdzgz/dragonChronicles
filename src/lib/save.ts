import { browser } from '$app/environment';
import { db } from './db';
import type { GameState } from './types';

export const SCHEMA_VERSION = 1;

export async function loadGame(): Promise<GameState | undefined> {
	if (!browser) return undefined;
	
	try {
		return await db.saves.get('current');
	} catch (error) {
		console.error('Failed to load game:', error);
		return undefined;
	}
}

export async function saveGame(state: GameState): Promise<void> {
	if (!browser) return;
	
	try {
		// Create rolling backup by moving current save to backup slot
		const current = await db.saves.get('current');
		if (current) {
			await db.saves.put(current, 'backup');
		}
		
		// Save new state as current
		await db.saves.put(state, 'current');
	} catch (error) {
		console.error('Failed to save game:', error);
		throw error;
	}
}

export function createDefaultState(): GameState {
	return {
		schemaVersion: SCHEMA_VERSION,
		lastTickMs: Date.now(),
		playtimeSec: 0,
		currencies: {
			steak: {
				key: 'steak',
				amount: 0,
				unlocked: true
			},
			gold: {
				key: 'gold',
				amount: 0,
				unlocked: true
			},
			dragonscales: {
				key: 'dragonscales',
				amount: 0,
				unlocked: false
			},
			gems: {
				key: 'gems',
				amount: 0,
				unlocked: false
			}
		}
	};
}

export function migrateState(state: GameState): GameState {
	// Future migrations will go here
	// For now, just ensure we have the latest schema version
	return {
		...state,
		schemaVersion: SCHEMA_VERSION
	};
}