

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.0c01c843.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/scheduler.86f77edc.js","_app/immutable/chunks/index.e78d2784.js","_app/immutable/chunks/store.3b89edcb.js","_app/immutable/chunks/index.045e0b2e.js"];
export const stylesheets = [];
export const fonts = [];
