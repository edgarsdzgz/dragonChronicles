import { writable } from 'svelte/store';

export interface EnemyState {
  active: number;
  cap: number;
  inRange: number;
}

export const enemyStore = writable<EnemyState>({
  active: 0,
  cap: 48,
  inRange: 0
});