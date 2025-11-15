
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
		RouteId(): "/" | "/api" | "/api/dev" | "/api/dev/logs" | "/dev" | "/dev/boom" | "/dev/currency-topbar" | "/dev/dragon-animated" | "/dev/dragon-debug" | "/dev/dragon-final" | "/dev/dragon-simple" | "/dev/dragon-working" | "/dev/dragon" | "/dev/logo-spinner" | "/dev/logs" | "/dev/pool" | "/dev/profile-shapes" | "/dev/protoprofile";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/api": Record<string, never>;
			"/api/dev": Record<string, never>;
			"/api/dev/logs": Record<string, never>;
			"/dev": Record<string, never>;
			"/dev/boom": Record<string, never>;
			"/dev/currency-topbar": Record<string, never>;
			"/dev/dragon-animated": Record<string, never>;
			"/dev/dragon-debug": Record<string, never>;
			"/dev/dragon-final": Record<string, never>;
			"/dev/dragon-simple": Record<string, never>;
			"/dev/dragon-working": Record<string, never>;
			"/dev/dragon": Record<string, never>;
			"/dev/logo-spinner": Record<string, never>;
			"/dev/logs": Record<string, never>;
			"/dev/pool": Record<string, never>;
			"/dev/profile-shapes": Record<string, never>;
			"/dev/protoprofile": Record<string, never>
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/dev" | "/api/dev/" | "/api/dev/logs" | "/api/dev/logs/" | "/dev" | "/dev/" | "/dev/boom" | "/dev/boom/" | "/dev/currency-topbar" | "/dev/currency-topbar/" | "/dev/dragon-animated" | "/dev/dragon-animated/" | "/dev/dragon-debug" | "/dev/dragon-debug/" | "/dev/dragon-final" | "/dev/dragon-final/" | "/dev/dragon-simple" | "/dev/dragon-simple/" | "/dev/dragon-working" | "/dev/dragon-working/" | "/dev/dragon" | "/dev/dragon/" | "/dev/logo-spinner" | "/dev/logo-spinner/" | "/dev/logs" | "/dev/logs/" | "/dev/pool" | "/dev/pool/" | "/dev/profile-shapes" | "/dev/profile-shapes/" | "/dev/protoprofile" | "/dev/protoprofile/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/backgrounds/README.md" | "/backgrounds/land1_steppe/foreground/grasslandLayer_steppe.png" | "/backgrounds/land1_steppe/parallax/lonelyMountain-clouds-2.png" | "/backgrounds/land1_steppe/parallax/lonelyMountain-clouds-badShading.png" | "/backgrounds/land1_steppe/parallax/steppe_clouds-1.png" | "/backgrounds/land1_steppe/parallax/steppe_hills-1.png" | "/backgrounds/land1_steppe/static/lonelyMountain-3.png" | "/backgrounds/land1_steppe/static/lonelyMountain-4.png" | "/backgrounds/land1_steppe/static/steppe_background_2-1.png" | "/backgrounds/land1_steppe/static/steppe_background_grassless.png" | "/dialogues/opening-cutscene.json" | "/favicon.svg" | "/icons/icon-128.png" | "/icons/icon-144.png" | "/icons/icon-152.png" | "/icons/icon-192-maskable.png" | "/icons/icon-192.png" | "/icons/icon-384.png" | "/icons/icon-512-maskable.png" | "/icons/icon-512.png" | "/icons/icon-72.png" | "/icons/icon-96.png" | "/locales/en/buildings.json" | "/locales/en/common.json" | "/locales/en/dialogues.json" | "/locales/en/items.json" | "/locales/en/npcs.json" | "/locales/en/ui.json" | "/manifest.json" | "/robots.txt" | "/sprites/dragon_fly_128_sheet.png" | "/sprites/protagonist_dragon_attack.png" | "/sprites/wsn_mantairCorsair_attack.png" | "/sprites/wsn_mantairCorsair_sprite.png" | "/sprites/wsn_swarmAttack_sprite.png" | "/sprites/wsn_swarm_sprite.png" | "/sw.js" | "/sw.js.backup" | "/ui/BUTTON_COLOR_IMPLEMENTATION.md" | "/ui/PIXEL_ART_COLOR_GUIDE.md" | "/ui/README.md" | "/ui/buttons/action/backwardJourney_hover.png" | "/ui/buttons/action/backwardJourney_neutral.png" | "/ui/buttons/action/backwardJourney_selected.png" | "/ui/buttons/action/forwardJourney_hover.png" | "/ui/buttons/action/forwardJourney_neutral.png" | "/ui/buttons/action/forwardJourney_selected.png" | "/ui/buttons/action/pauseJourney_hover.png" | "/ui/buttons/action/pauseJourney_neutral.png" | "/ui/buttons/action/pauseJourney_selected.png" | "/ui/buttons/menu/decorations/draconia_sillouette_v1.webp" | "/ui/buttons/menu/decorations/draconia_sillouette_v2-1.png" | "/ui/buttons/menu/logo/draconia_logo_v1.png" | "/ui/buttons/menu/logo/draconia_logo_v2.png" | "/ui/buttons/menu/splash/draconia_splash_5.png" | "/ui/buttons/movement/README.md" | "/ui/icons/arcana_icon.png" | string & {};
	}
}