import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.7f227423.js","_app/immutable/chunks/store.91a1798f.js","_app/immutable/chunks/index.5c643c0a.js","_app/immutable/chunks/scheduler.2520d29c.js","_app/immutable/chunks/index.0ed762bc.js","_app/immutable/chunks/index.422b0410.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/_commonjsHelpers.725317a4.js","_app/immutable/chunks/navigation.af100e9b.js","_app/immutable/chunks/singletons.d8260ed3.js"];
export const stylesheets = ["_app/immutable/assets/0.53f37b7e.css"];
export const fonts = [];
