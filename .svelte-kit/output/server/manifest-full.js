export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["distance-config.json","favicon.png","steak.svg","ui_mockups/Dragon_Idler_UI_Mockup_Forge_A11y_CB_v01.png","ui_mockups/Dragon_Idler_UI_Mockup_Forge_Dark_v02.png","ui_mockups/Dragon_Idler_UI_Mockup_Mobile_Forge_Dark_v01.png","ui_mockups/Dragon_Idler_UI_Mockup_v01.png","ui_mockups/enchant_example.png","ui_mockups/manual_mockup_v1.png","ui_mockups/manual_mockup_v1_noCrossouts.png","ui_mockups/screenshot_mvp.png","ui_mockups/screenshot_mvp2.png"]),
	mimeTypes: {".json":"application/json",".png":"image/png",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.BUZswGMP.js",app:"_app/immutable/entry/app.CWzaBvLa.js",imports:["_app/immutable/entry/start.BUZswGMP.js","_app/immutable/chunks/BvsX69cf.js","_app/immutable/chunks/CdgRmt9C.js","_app/immutable/entry/app.CWzaBvLa.js","_app/immutable/chunks/CdgRmt9C.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/DdHE955u.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
