

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dev/logs/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/10.31f3d6a2.js","_app/immutable/chunks/scheduler.86f77edc.js","_app/immutable/chunks/index.e78d2784.js","_app/immutable/chunks/logger.b2ea7501.js","_app/immutable/chunks/preload-helper.a4192956.js"];
export const stylesheets = [];
export const fonts = [];
