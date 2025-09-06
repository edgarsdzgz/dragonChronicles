

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.ca673ab4.js","_app/immutable/chunks/scheduler.fce5cbda.js","_app/immutable/chunks/index.f66cbd13.js","_app/immutable/chunks/singletons.b45939fa.js","_app/immutable/chunks/index.128141f4.js"];
export const stylesheets = [];
export const fonts = [];
