import * as universal from '../entries/pages/dev/boom/_page.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dev/boom/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/dev/boom/+page.ts";
export const imports = ["_app/immutable/nodes/3.0e009615.js","_app/immutable/chunks/scheduler.86f77edc.js","_app/immutable/chunks/index.e78d2784.js","_app/immutable/chunks/navigation.ea798918.js","_app/immutable/chunks/singletons.5ab518cc.js","_app/immutable/chunks/index.045e0b2e.js"];
export const stylesheets = ["_app/immutable/assets/3.2957edbd.css"];
export const fonts = [];
