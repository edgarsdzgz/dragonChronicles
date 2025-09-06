

export const index = 5;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dev/pool/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/5.4a2ffb66.js","_app/immutable/chunks/scheduler.2520d29c.js","_app/immutable/chunks/index.0ed762bc.js","_app/immutable/chunks/index.422b0410.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/_commonjsHelpers.725317a4.js"];
export const stylesheets = [];
export const fonts = [];
