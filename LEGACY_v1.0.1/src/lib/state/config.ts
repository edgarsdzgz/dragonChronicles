import { writable } from 'svelte/store';

export const enemyConfigLoaded = writable<boolean>(false);
export const setEnemyConfigLoaded = (v: boolean) => enemyConfigLoaded.set(v);