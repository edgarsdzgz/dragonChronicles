import { writable } from 'svelte/store';

export interface MetricsState {
  spawnsEWMA: number;
  cullCount: number;
}

export const metrics = writable<MetricsState>({
  spawnsEWMA: 0.0,
  cullCount: 0
});