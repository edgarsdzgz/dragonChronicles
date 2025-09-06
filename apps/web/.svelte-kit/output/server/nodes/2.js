

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.d8b4037d.js","_app/immutable/chunks/scheduler.fce5cbda.js","_app/immutable/chunks/index.f66cbd13.js","_app/immutable/chunks/store.11ce8278.js","_app/immutable/chunks/index.128141f4.js"];
export const stylesheets = [];
export const fonts = [];
