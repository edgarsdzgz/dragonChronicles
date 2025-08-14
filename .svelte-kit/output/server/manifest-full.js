export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","steak.svg","ui_mockups/Dragon_Idler_UI_Mockup_Forge_A11y_CB_v01.png","ui_mockups/Dragon_Idler_UI_Mockup_Forge_Dark_v02.png","ui_mockups/Dragon_Idler_UI_Mockup_Mobile_Forge_Dark_v01.png","ui_mockups/Dragon_Idler_UI_Mockup_v01.png","ui_mockups/screenshot_mvp.png","ui_mockups/screenshot_mvp2.png"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.DCjxSCCJ.js",app:"_app/immutable/entry/app.DR6SglKF.js",imports:["_app/immutable/entry/start.DCjxSCCJ.js","_app/immutable/chunks/Idvu_ijB.js","_app/immutable/chunks/CXVaydMT.js","_app/immutable/chunks/CnnOm75q.js","_app/immutable/entry/app.DR6SglKF.js","_app/immutable/chunks/CnnOm75q.js","_app/immutable/chunks/CXVaydMT.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/BtnN6u7Q.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
