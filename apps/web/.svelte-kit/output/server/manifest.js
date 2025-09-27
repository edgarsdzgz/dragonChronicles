export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg","icons/icon-128.png","icons/icon-144.png","icons/icon-152.png","icons/icon-192-maskable.png","icons/icon-192.png","icons/icon-384.png","icons/icon-512-maskable.png","icons/icon-512.png","icons/icon-72.png","icons/icon-96.png","manifest.json","robots.txt","sprites/dragon_fly_128_sheet.svg","sprites/horizon_steppe_background.svg","sprites/protagonist_dragon_attack.svg","sprites/wsn_mantairCorsair_attack.svg","sprites/wsn_mantairCorsair_sprite.svg","sprites/wsn_swarm_attack.svg","sprites/wsn_swarm_sprite.svg","sw.js"]),
	mimeTypes: {".svg":"image/svg+xml",".png":"image/png",".json":"application/json",".txt":"text/plain",".js":"application/javascript"},
	_: {
		client: {"start":"_app/immutable/entry/start.c38630e3.js","app":"_app/immutable/entry/app.6de27eea.js","imports":["_app/immutable/entry/start.c38630e3.js","_app/immutable/chunks/scheduler.86f77edc.js","_app/immutable/chunks/singletons.5ab518cc.js","_app/immutable/chunks/index.045e0b2e.js","_app/immutable/entry/app.6de27eea.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.86f77edc.js","_app/immutable/chunks/index.e78d2784.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/dev/boom",
				pattern: /^\/dev\/boom\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/dev/dragon-animated",
				pattern: /^\/dev\/dragon-animated\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/dev/dragon-debug",
				pattern: /^\/dev\/dragon-debug\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/dev/dragon-final",
				pattern: /^\/dev\/dragon-final\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/dev/dragon-simple",
				pattern: /^\/dev\/dragon-simple\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/dev/dragon-working",
				pattern: /^\/dev\/dragon-working\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/dev/dragon",
				pattern: /^\/dev\/dragon\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/dev/logs",
				pattern: /^\/dev\/logs\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/dev/pool",
				pattern: /^\/dev\/pool\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
