import * as universal from '../entries/pages/dev/boom/_page.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dev/boom/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/dev/boom/+page.ts";
export const imports = ["_app/immutable/nodes/3.ee1dc576.js","_app/immutable/chunks/scheduler.2520d29c.js","_app/immutable/chunks/index.0ed762bc.js","_app/immutable/chunks/navigation.af100e9b.js","_app/immutable/chunks/singletons.d8260ed3.js","_app/immutable/chunks/index.5c643c0a.js"];
export const stylesheets = ["_app/immutable/assets/3.2957edbd.css"];
export const fonts = [];
