import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.16be2009.js","_app/immutable/chunks/store.11ce8278.js","_app/immutable/chunks/index.128141f4.js","_app/immutable/chunks/scheduler.fce5cbda.js","_app/immutable/chunks/index.f66cbd13.js","_app/immutable/chunks/index.422b0410.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/_commonjsHelpers.725317a4.js"];
export const stylesheets = ["_app/immutable/assets/0.fc62fd5e.css"];
export const fonts = [];
