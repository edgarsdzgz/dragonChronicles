

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.66558809.js","_app/immutable/chunks/scheduler.86f77edc.js","_app/immutable/chunks/index.e78d2784.js","_app/immutable/chunks/singletons.5ab518cc.js","_app/immutable/chunks/index.045e0b2e.js","_app/immutable/chunks/logger.b2ea7501.js","_app/immutable/chunks/preload-helper.a4192956.js"];
export const stylesheets = ["_app/immutable/assets/1.71a4d092.css"];
export const fonts = [];
