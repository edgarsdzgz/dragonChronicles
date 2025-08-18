import type { GameState } from '$lib/types';

declare global {
	namespace App {
		interface Error {}
		interface Locals {}
		interface PageData {}
		interface PageState {}
		interface Platform {}
	}
}

export {};