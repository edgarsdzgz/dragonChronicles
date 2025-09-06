

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.1e438626.js","_app/immutable/chunks/scheduler.2520d29c.js","_app/immutable/chunks/index.0ed762bc.js","_app/immutable/chunks/store.91a1798f.js","_app/immutable/chunks/index.5c643c0a.js"];
export const stylesheets = [];
export const fonts = [];
