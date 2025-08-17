import { readable } from 'svelte/store';

// DEV only overlay; always false in prod builds.
export const debugOverlayEnabled = readable<boolean>(import.meta.env.DEV);