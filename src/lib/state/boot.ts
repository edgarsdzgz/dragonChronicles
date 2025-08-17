import { writable } from 'svelte/store';

export interface BootFlags {
  decOK: boolean;
  rendererSubscribed: boolean;
  workerActive: boolean;
}

export const bootFlags = writable<BootFlags>({ 
  decOK: false, 
  rendererSubscribed: false, 
  workerActive: false 
});

export const setBootFlags = (f: Partial<BootFlags>) =>
  bootFlags.update(s => ({ ...s, ...f }));