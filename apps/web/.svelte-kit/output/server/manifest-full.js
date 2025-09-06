export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg","icons/icon-128.png","icons/icon-144.png","icons/icon-152.png","icons/icon-192-maskable.png","icons/icon-192.png","icons/icon-384.png","icons/icon-512-maskable.png","icons/icon-512.png","icons/icon-72.png","icons/icon-96.png","manifest.json","robots.txt","sw.js"]),
	mimeTypes: {".svg":"image/svg+xml",".png":"image/png",".json":"application/json",".txt":"text/plain",".js":"application/javascript"},
	_: {
		client: {"start":"_app/immutable/entry/start.e48bfa0e.js","app":"_app/immutable/entry/app.a301a537.js","imports":["_app/immutable/entry/start.e48bfa0e.js","_app/immutable/chunks/scheduler.fce5cbda.js","_app/immutable/chunks/singletons.b45939fa.js","_app/immutable/chunks/index.128141f4.js","_app/immutable/entry/app.a301a537.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.fce5cbda.js","_app/immutable/chunks/index.f66cbd13.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
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
				id: "/dev/logs",
				pattern: /^\/dev\/logs\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/dev/pool",
				pattern: /^\/dev\/pool\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();
