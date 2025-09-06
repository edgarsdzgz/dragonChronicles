

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dev/logs/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/3.462ecd74.js","_app/immutable/chunks/scheduler.fce5cbda.js","_app/immutable/chunks/index.f66cbd13.js","_app/immutable/chunks/_commonjsHelpers.725317a4.js"];
export const stylesheets = [];
export const fonts = [];
