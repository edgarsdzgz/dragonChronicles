import { writable } from 'svelte/store';

export interface CombatState {
  tracking: boolean;
}

export const combatState = writable<CombatState>({
  tracking: false
});