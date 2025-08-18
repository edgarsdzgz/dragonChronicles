import { writable } from 'svelte/store';

export interface ProjectileState {
  active: number;
  cap: number;
}

export const projectileStore = writable<ProjectileState>({
  active: 0,
  cap: 160
});