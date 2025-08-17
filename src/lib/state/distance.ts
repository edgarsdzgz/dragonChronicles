import { writable } from 'svelte/store';

export interface DistanceState {
  km: number;
}

export const distanceUI = writable<DistanceState>({
  km: 0.0
});

export const distanceWorker = writable<DistanceState>({
  km: 0.0
});