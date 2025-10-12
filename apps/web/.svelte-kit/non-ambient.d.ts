
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/dev" | "/dev/boom" | "/dev/dragon-animated" | "/dev/dragon-debug" | "/dev/dragon-final" | "/dev/dragon-simple" | "/dev/dragon-working" | "/dev/dragon" | "/dev/logs" | "/dev/pool" | "/dev/svg-test";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/dev": Record<string, never>;
			"/dev/boom": Record<string, never>;
			"/dev/dragon-animated": Record<string, never>;
			"/dev/dragon-debug": Record<string, never>;
			"/dev/dragon-final": Record<string, never>;
			"/dev/dragon-simple": Record<string, never>;
			"/dev/dragon-working": Record<string, never>;
			"/dev/dragon": Record<string, never>;
			"/dev/logs": Record<string, never>;
			"/dev/pool": Record<string, never>;
			"/dev/svg-test": Record<string, never>
		};
		Pathname(): "/" | "/dev" | "/dev/" | "/dev/boom" | "/dev/boom/" | "/dev/dragon-animated" | "/dev/dragon-animated/" | "/dev/dragon-debug" | "/dev/dragon-debug/" | "/dev/dragon-final" | "/dev/dragon-final/" | "/dev/dragon-simple" | "/dev/dragon-simple/" | "/dev/dragon-working" | "/dev/dragon-working/" | "/dev/dragon" | "/dev/dragon/" | "/dev/logs" | "/dev/logs/" | "/dev/pool" | "/dev/pool/" | "/dev/svg-test" | "/dev/svg-test/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/backgrounds/steppe_background_2-1.png" | "/favicon.svg" | "/icons/icon-128.png" | "/icons/icon-144.png" | "/icons/icon-152.png" | "/icons/icon-192-maskable.png" | "/icons/icon-192.png" | "/icons/icon-384.png" | "/icons/icon-512-maskable.png" | "/icons/icon-512.png" | "/icons/icon-72.png" | "/icons/icon-96.png" | "/manifest.json" | "/robots.txt" | "/sprites/dragon_fly_128_sheet.png" | "/sprites/protagonist_dragon_attack.png" | "/sprites/wsn_mantairCorsair_attack.png" | "/sprites/wsn_mantairCorsair_sprite.png" | "/sprites/wsn_swarmAttack_sprite.png" | "/sprites/wsn_swarm_sprite.png" | "/sw.js.backup" | string & {};
	}
}