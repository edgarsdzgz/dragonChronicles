import Dexie, { type Table } from 'dexie';
import type { GameState } from './types';

export class GameDB extends Dexie {
	saves!: Table<GameState, string>;

	constructor() {
		super('dragon-idler');
		this.version(1).stores({
			saves: '' // simple key-value where key is string (primary key is custom)
		});
	}
}

export const db = new GameDB();